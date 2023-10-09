import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  serverTimestamp,
  setDoc,
  writeBatch,
  updateDoc
} from 'firebase/firestore'
import * as auth from 'firebase/auth'
import db from '@/config/firebase'
import { findById, docToResource } from '@/helpers'

export default {
  initAuthentication ({ dispatch, commit, state }) {
    if (state.authObserverUnsubscribe) return
    return new Promise((resolve) => {
      const unsubscribe = auth.getAuth().onAuthStateChanged(async (user) => {
        console.log('👣 the user has changed')
        dispatch('unsubscribeAuthUserSnapshot')
        if (user) {
          await dispatch('fetchAuthUser')
          resolve(user)
        } else {
          resolve(null)
        }
      })
      commit('setAuthObserverUnsubscribe', unsubscribe)
    })
  },
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
  async updatePost ({ commit, state }, { id, text }) {
    const post = {
      text,
      edited: {
        by: state.authId,
        at: serverTimestamp(),
        moderated: false
      }
    }
    const postRef = doc(db, 'posts', id)
    await updateDoc(postRef, post)
    const updatedPost = await getDoc(postRef)
    commit('setItem', { resource: 'posts', item: updatedPost })
    // return docToResource(updatedPost)
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
    await batch.commit()
    newThread = await getDoc(threadRef)
    newPost = await getDoc(postRef)

    commit('setItem', { resource: 'threads', item: newThread })
    commit('setItem', { resource: 'posts', item: newPost })
    return docToResource(newThread)
  },
  async registerUserWithEmailAndPassword ({ dispatch }, { email, name, username, password, avatar = null }) {
    const getAuth = auth.getAuth()
    const result = await auth.createUserWithEmailAndPassword(getAuth, email, password)
    await dispatch('createUser', { id: result.user.uid, email, name, username, avatar })
  },
  async signInWithEmailAndPassword (context, { email, password }) {
    const getAuth = auth.getAuth()
    return auth.signInWithEmailAndPassword(getAuth, email, password)
  },
  async signInWithGoogle ({ dispatch }) {
    const getAuth = auth.getAuth()
    const provider = new auth.GoogleAuthProvider()
    const response = await auth.signInWithPopup(getAuth, provider)
    const user = response.user
    const userRef = doc(db, 'users', user.uid)
    const userDoc = await getDoc(userRef)
    if (!userDoc.exists) {
      return dispatch('createUser', { id: user.uid, name: user.displayName, email: user.email, username: user.email, avatar: user.photoURL })
    }
  },
  async signOut ({ commit }) {
    const getAuth = auth.getAuth()
    await auth.signOut(getAuth)
    commit('setAuthId', null)
  },
  async createUser ({ commit }, { id, email, name, username, avatar = null }) {
    const registeredAt = serverTimestamp()
    const usernameLower = username.toLowerCase()
    email = email.toLowerCase()
    const user = { avatar, email, name, username, usernameLower, registeredAt }
    const userRef = doc(db, 'users', id)
    await setDoc(userRef, user)
    const newUser = await getDoc(userRef)
    commit('setItem', { resource: 'users', item: newUser })
    return docToResource(newUser)
  },
  updateUser ({ commit }, user) {
    commit('setItem', { resource: 'users', item: user })
  },
  fetchCategory: ({ dispatch }, { id }) => dispatch('fetchItem', { resource: 'categories', id, emoji: '🏷' }),
  fetchForum: ({ dispatch }, { id }) => dispatch('fetchItem', { resource: 'forums', id, emoji: '🏁' }),
  fetchThread: ({ dispatch }, { id }) => dispatch('fetchItem', { resource: 'threads', id, emoji: '📄' }),
  fetchPost: ({ dispatch }, { id }) => dispatch('fetchItem', { resource: 'posts', id, emoji: '💬' }),
  fetchUser: ({ dispatch }, { id }) => dispatch('fetchItem', { resource: 'users', id, emoji: '🙋' }),

  fetchAuthUser: async ({ dispatch, state, commit }) => {
    const getAuth = auth.getAuth()
    const userId = getAuth.currentUser?.uid

    if (!userId) return
    await dispatch('fetchItem', {
      emoji: '🙋',
      resource: 'users',
      id: userId,
      handleUnsubscribe: (unsubscribe) => {
        commit('setAuthUserUnsubscribe', unsubscribe)
      }
    })
    commit('setAuthId', userId)
  },

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
  async fetchItem ({ state, commit }, { id, emoji, resource, handleUnsubscribe = null }) {
    return new Promise((resolve) => {
      const unsubscribe = onSnapshot(doc(db, resource, id), (doc) => {
        const item = { ...doc.data(), id: doc.id }
        commit('setItem', { resource, item })
        resolve(item)
      })
      if (handleUnsubscribe) {
        handleUnsubscribe(unsubscribe)
      } else {
        commit('appendUnsubscribe', { unsubscribe })
      }
    })
  },
  fetchItems ({ dispatch }, { ids, resource, emoji }) {
    return Promise.all(ids.map(id => dispatch('fetchItem', { id, resource, emoji })))
  },
  async unsubscribeAllSnapshots ({ state, commit }) {
    state.unsubscribes.forEach(unsubscribe => unsubscribe())
    commit('clearAllUnsubscribes')
  },
  async unsubscribeAuthUserSnapshot ({ state, commit }) {
    if (state.authUserUnsubscribe) {
      state.authUserUnsubscribe()
      commit('setAuthUserUnsubscribe', null)
    }
  }
}
