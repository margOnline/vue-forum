import { collection, getDocs } from 'firebase/firestore'
import db from '@/config/firebase'
import { makeFetchItemsAction } from '@/helpers'
export default {
  namespaced: true,
  state: {
    items: []
  },
  getters: {},
  actions: {
    fetchCategory: ({ dispatch }, { id }) => dispatch('fetchItem',
      { resource: 'categories', id, emoji: '🏷' },
      { root: true }
    ),
    async fetchAllCategories ({ commit }) {
      const collectionRef = collection(db, 'categories')
      const collectionSnap = await getDocs(collectionRef)
      return collectionSnap.docs.map((doc) => {
        const item = { id: doc.id, ...doc.data() }
        commit('setItem', { resource: 'categories', item }, { root: true })
        return item
      })
    },
    fetchCategories: makeFetchItemsAction({ resource: 'categories', emoji: '🏷' })
  },
  mutations: {}
}
