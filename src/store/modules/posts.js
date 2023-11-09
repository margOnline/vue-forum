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
import { findById, makeFetchItemAction, makeFetchItemsAction } from '@/helpers'
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
      post.firstInThread = post.firstInThread || false
      const batch = writeBatch(db)
      const postRef = doc(collection(db, 'posts'))
      const threadRef = doc(db, 'threads', post.threadId)
      const userRef = doc(db, 'users', rootState.auth.authId)
      batch.set(postRef, post)

      const threadUpdates = { posts: arrayUnion(postRef.id) }
      if (!post.firstInThread) {
        threadUpdates.contributors = arrayUnion(rootState.auth.authId)
      }
      batch.update(threadRef, threadUpdates)
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
      if (!post.firstInThread) {
        commit('threads/appendContributorToThread',
          { parentId: post.threadId, childId: rootState.auth.authId },
          { root: true }
        )
      }
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
    fetchPost: makeFetchItemAction({ resource: 'posts', emoji: '💬' }),
    fetchPosts: makeFetchItemsAction({ resource: 'posts', emoji: '💬' })
  },
  mutations: {}
}
