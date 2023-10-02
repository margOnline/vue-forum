import * as firestore from 'firebase/firestore'
import db from '@/config/firebase'
import { findById } from '@/helpers'

export default {
  async createPost ({ commit, state }, post) {
    post.userId = state.authId
    post.publishedAt = firestore.serverTimestamp()
    const batch = firestore.writeBatch(db)
    const postRef = firestore.doc(firestore.collection(db, 'posts'))
    const threadRef = firestore.doc(db, 'threads', post.threadId)
    batch.set(postRef, post)
    batch.update(threadRef, {
      posts: firestore.arrayUnion(postRef.id),
      contributors: firestore.arrayUnion(state.authId)
    })
    await batch.commit()
    const newPost = await firestore.getDoc(postRef)

    commit('setItem', { resource: 'posts', item: { ...post, id: newPost.id } })
    commit(
      'appendPostToThread', { parentId: post.threadId, childId: newPost.id }
    )
    commit(
      'appendContributorToThread', { parentId: post.threadId, childId: state.authId }
    )
  },
  updateUser ({ commit }, user) {
    commit('setItem', { resource: 'users', item: user })
  },
  async createThread ({ commit, state, dispatch }, { title, text, forumId }) {
    const id = 'ffff' + Math.random()
    const userId = state.authId
    const publishedAt = Math.floor(Date.now() / 1000)
    const thread = { forumId, title, text, publishedAt, userId, id }
    commit('setItem', { resource: 'threads', item: thread })
    commit('appendThreadToForum', { parentId: forumId, childId: id })
    commit('appendThreadToUser', { parentId: userId, childId: id })
    dispatch('createPost', { text, threadId: id })
    return state.threads.find(thread => thread.id === id)
  },
  async updateThread ({ commit, state }, { title, text, id }) {
    const thread = findById(state.threads, id)
    const post = findById(state.posts, thread.posts[0])
    const newThread = { ...thread, title }
    const newPost = { ...post, text }

    commit('setItem', { resource: 'threads', item: newThread })
    commit('setItem', { resource: 'posts', item: newPost })
    return newThread
  },
  fetchCategory: ({ dispatch }, { id }) => dispatch('fetchItem', { resource: 'categories', id, emoji: '🏷' }),
  fetchForum: ({ dispatch }, { id }) => dispatch('fetchItem', { resource: 'forums', id, emoji: '🏁' }),
  fetchThread: ({ dispatch }, { id }) => dispatch('fetchItem', { resource: 'threads', id, emoji: '📄' }),
  fetchPost: ({ dispatch }, { id }) => dispatch('fetchItem', { resource: 'posts', id, emoji: '💬' }),
  fetchUser: ({ dispatch }, { id }) => dispatch('fetchItem', { resource: 'users', id, emoji: '🙋' }),
  fetchAuthUser: ({ dispatch, state }) => dispatch('fetchUser', { id: state.authId }),
  async fetchAllCategories ({ commit }) {
    const collectionRef = firestore.collection(db, 'categories')
    const collectionSnap = await firestore.getDocs(collectionRef)
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
    const itemRef = firestore.doc(db, resource, id)
    const itemSnap = await firestore.getDoc(itemRef)
    const item = { ...itemSnap.data(), id: itemRef.id }
    commit('setItem', { resource, id, item })
    return item
  },
  fetchItems ({ dispatch }, { ids, resource, emoji }) {
    return Promise.all(ids.map(id => dispatch('fetchItem', { id, resource, emoji })))
  }
}
