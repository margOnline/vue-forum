import * as auth from 'firebase/auth'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where
} from 'firebase/firestore'
import db from '@/config/firebase'

export default {
  namespaced: true,
  state: {
    authId: null,
    authUserUnsubscribe: null,
    authObserverUnsubscribe: null
  },
  getters: {
    authUser: (state, getters, rootState, rootGetters) => {
      return rootGetters['users/user'](state.authId)
    }
  },
  actions: {
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
    async registerUserWithEmailAndPassword ({ dispatch }, { email, name, username, password, avatar = null }) {
      const getAuth = auth.getAuth()
      const result = await auth.createUserWithEmailAndPassword(getAuth, email, password)
      await dispatch('users/createUser',
        { id: result.user.uid, email, name, username, avatar },
        { root: true }
      )
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
      if (!userDoc.exists()) {
        return dispatch('users/createUser',
          { id: user.uid, name: user.displayName, email: user.email, username: user.email, avatar: user.photoURL },
          { root: true }
        )
      }
    },
    async signOut ({ commit }) {
      const getAuth = auth.getAuth()
      await auth.signOut(getAuth)
      commit('setAuthId', null)
    },
    fetchAuthUser: async ({ dispatch, state, commit }) => {
      const getAuth = auth.getAuth()
      const userId = getAuth.currentUser?.uid

      if (!userId) return
      await dispatch('fetchItem',
        {
          emoji: '🙋',
          resource: 'users',
          id: userId,
          handleUnsubscribe: (unsubscribe) => {
            commit('setAuthUserUnsubscribe', unsubscribe)
          }
        },
        { root: true }
      )
      commit('setAuthId', userId)
    },
    async fetchAuthUsersPosts ({ commit, state }, { lastVisible }) {
      let postsQuery
      const commonQueryParams = [
        collection(db, 'posts'),
        where('userId', '==', state.authId),
        orderBy('publishedAt', 'desc'),
        limit(2)
      ]

      if (lastVisible) {
        const lastPost = await getDoc(doc(db, 'posts', lastVisible.id))
        postsQuery = query(...commonQueryParams, startAfter(lastPost))
      } else {
        postsQuery = query(...commonQueryParams)
      }
      const posts = await getDocs(postsQuery)

      posts.forEach(item => {
        commit('setItem', { resource: 'posts', item }, { root: true })
      })
    },
    async unsubscribeAuthUserSnapshot ({ state, commit }) {
      if (state.authUserUnsubscribe) {
        state.authUserUnsubscribe()
        commit('setAuthUserUnsubscribe', null)
      }
    }
  },
  mutations: {
    setAuthId (state, id) {
      state.authId = id
    },
    setAuthUserUnsubscribe (state, unsubscribe) {
      state.authUserUnsubscribe = unsubscribe
    },
    setAuthObserverUnsubscribe (state, unsubscribe) {
      state.authObserverUnsubscribe = unsubscribe
    }
  }
}
