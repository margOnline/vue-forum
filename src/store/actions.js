import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  serverTimestamp,
  writeBatch
}
from 'firebase/firestore'
import db from '@/config/firebase'
import { findById, docToResource } from '@/helpers'

export default {
  async createPost ({ commit, state }, post) {
    post.userId = state.authId
    post.publishedAt = serverTimestamp()
    const batch = writeBatch(db)
    const postRef = doc(collection(db, 'posts'))
    const threadRef = doc(db, 'threads', post.threadId)
    const userRef = doc(db, 'users', state.authId)
    batch.set(postRef, post)
    batch.update(threadRef, {
      posts: arrayUnion(postRef.id),
      contributors: arrayUnion(state.authId)
    })
    batch.update(userRef, {
      postsCount: increment(1)
    })
    await batch.commit()
    const newPost = await getDoc(postRef)

    commit('setItem', { resource: 'posts', item: { ...post, id: newPost.id } })
    commit(
      'appendPostToThread', { parentId: post.threadId, childId: newPost.id }
    )
    commit(
      'appendContributorToThread', { parentId: post.threadId, childId: state.authId }
    )
    return findById(state.posts, postRef.id)
  },
  async createThread ({ commit, state, dispatch }, { title, text, forumId }) {
    const userId = state.authId
    const publishedAt = serverTimestamp()
    const threadRef = doc(collection(db, 'threads'))
    const userRef = doc(db, 'users', userId)
    const forumRef = doc(db, 'forums', forumId)
    const thread = { forumId, title, text, publishedAt, userId, id: threadRef.id }
    const batch = writeBatch(db)

    batch.set(threadRef, thread)
    batch.update(userRef, { threads: arrayUnion(threadRef.id) })
    batch.update(forumRef, { threads: arrayUnion(threadRef.id) })
    await batch.commit()
    const newThread = await getDoc(threadRef)

    commit('setItem', { resource: 'threads', item: { ...newThread.data, id: newThread.id } })
    commit('appendThreadToForum', { parentId: forumId, childId: threadRef.id })
    commit('appendThreadToUser', { parentId: userId, childId: threadRef.id })
    await dispatch('createPost', { text, threadId: threadRef.id })
    return findById(state.threads, threadRef.id)
  },
  async updateThread ({ commit, state }, { title, text, id }) {
    const thread = findById(state.threads, id)
    const post = findById(state.posts, thread.posts[0])
    let newThread = { ...thread, title }
    let newPost = { ...post, text }
    const threadRef = doc(db, 'threads', id)
    const postRef = doc(db, 'posts', post.id)
    const batch = writeBatch(db)
    batch.update(threadRef, newThread)
    batch.update(postRef, newPost)
    newThread = await getDoc(threadRef)
    newPost = await getDoc(postRef)
    await batch.commit()

    commit('setItem', { resource: 'threads', item: newThread })
    commit('setItem', { resource: 'posts', item: newPost })
    return docToResource(newThread)
  },
  updateUser ({ commit }, user) {
    commit('setItem', { resource: 'users', item: user })
  },
  fetchCategory: ({ dispatch }, { id }) => dispatch('fetchItem', { resource: 'categories', id, emoji: '🏷' }),
  fetchForum: ({ dispatch }, { id }) => dispatch('fetchItem', { resource: 'forums', id, emoji: '🏁' }),
  fetchThread: ({ dispatch }, { id }) => dispatch('fetchItem', { resource: 'threads', id, emoji: '📄' }),
  fetchPost: ({ dispatch }, { id }) => dispatch('fetchItem', { resource: 'posts', id, emoji: '💬' }),
  fetchUser: ({ dispatch }, { id }) => dispatch('fetchItem', { resource: 'users', id, emoji: '🙋' }),
  fetchAuthUser: ({ dispatch, state }) => dispatch('fetchUser', { id: state.authId }),
  async fetchAllCategories ({ commit }) {
    const collectionRef = collection(db, 'categories')
    const collectionSnap = await getDocs(collectionRef)
    return collectionSnap.docs.map((doc) => {
      const item = { id: doc.id, ...doc.data() }
      commit('setItem', { resource: 'categories', item })
      return item
    })
  },
  fetchCategories: ({ dispatch }, { ids }) => dispatch('fetchItems', { ids, resource: 'categories', emoji: '🏷' }),
  fetchForums: ({ dispatch }, { ids }) => dispatch('fetchItems', { ids, resource: 'forums', emoji: '🏁' }),
  fetchThreads: ({ dispatch }, { ids }) => dispatch('fetchItems', { ids, resource: 'threads', emoji: '📄' }),
  fetchPosts: ({ dispatch }, { ids }) => dispatch('fetchItems', { ids, resource: 'posts', emoji: '💬' }),
  fetchUsers: ({ dispatch }, { ids }) => dispatch('fetchItems', { ids, resource: 'users', emoji: '🙋' }),
  async fetchItem ({ state, commit }, { id, emoji, resource }) {
    const itemRef = doc(db, resource, id)
    const itemSnap = await getDoc(itemRef)
    const item = { ...itemSnap.data(), id: itemRef.id }
    commit('setItem', { resource, id, item })
    return item
  },
  fetchItems ({ dispatch }, { ids, resource, emoji }) {
    return Promise.all(ids.map(id => dispatch('fetchItem', { id, resource, emoji })))
  }
}
