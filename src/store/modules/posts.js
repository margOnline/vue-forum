import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  writeBatch,
  updateDoc
} from 'firebase/firestore'
import db from '@/config/firebase'
import { findById } from '@/helpers'
export default {
  namespaced: true,
  state: {
    items: []
  },
  getters: {},
  actions: {
    async createPost ({ commit, state, rootState }, post) {
      post.userId = rootState.auth.authId
      post.publishedAt = serverTimestamp()
      const batch = writeBatch(db)
      const postRef = doc(collection(db, 'posts'))
      const threadRef = doc(db, 'threads', post.threadId)
      const userRef = doc(db, 'users', rootState.auth.authId)
      batch.set(postRef, post)
      batch.update(threadRef, {
        posts: arrayUnion(postRef.id),
        contributors: arrayUnion(rootState.auth.authId)
      })
      batch.update(userRef, {
        postsCount: increment(1)
      })
      await batch.commit()
      const newPost = await getDoc(postRef)

      commit('setItem',
        { resource: 'posts', item: { ...post, id: newPost.id } },
        { root: true }
      )
      commit(
        'threads/appendPostToThread',
        { parentId: post.threadId, childId: newPost.id },
        { root: true }
      )
      commit('threads/appendContributorToThread',
        { parentId: post.threadId, childId: rootState.auth.authId },
        { root: true }
      )
      return findById(state.items, postRef.id)
    },
    async updatePost ({ commit, state, rootState }, { id, text }) {
      const post = {
        text,
        edited: {
          by: rootState.auth.authId,
          at: serverTimestamp(),
          moderated: false
        }
      }
      const postRef = doc(db, 'posts', id)
      await updateDoc(postRef, post)
      const updatedPost = await getDoc(postRef)
      commit('setItem', { resource: 'posts', item: updatedPost }, { root: true })
      // return docToResource(updatedPost)
    },
    fetchPost: ({ dispatch }, { id }) => dispatch('fetchItem', { resource: 'posts', id, emoji: '💬' }, { root: true }),
    fetchPosts: ({ dispatch }, { ids }) => dispatch('fetchItems', { ids, resource: 'posts', emoji: '💬' }, { root: true })
  },
  mutations: {}
}
