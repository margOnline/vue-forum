import { doc, onSnapshot } from 'firebase/firestore'
import db from '@/config/firebase'
import { findById } from '@/helpers'

export default {
  async fetchItem ({ state, commit }, { id, emoji, resource, handleUnsubscribe = null, once = false, snapshot = null }) {
    return new Promise((resolve) => {
      const unsubscribe = onSnapshot(doc(db, resource, id), (doc) => {
        if (once) unsubscribe()
        if (doc.exists()) {
          const item = { ...doc.data(), id: doc.id }
          let previousItem = findById(state[resource].items, id)
          previousItem = previousItem ? { ...previousItem } : null
          commit('setItem', { resource, item })
          if (typeof snapshot === 'function') {
            const isLocal = doc.metadata.hasPendingWrites
            snapshot({ item: { ...item }, previousItem, isLocal })
          }
          resolve(item)
        } else {
          resolve(null)
        }
      })
      if (handleUnsubscribe) {
        handleUnsubscribe(unsubscribe)
      } else {
        commit('appendUnsubscribe', { unsubscribe })
      }
    })
  },
  fetchItems ({ dispatch }, { ids, resource, emoji, snapshot = null }) {
    return Promise.all(ids.map(id => dispatch('fetchItem', { id, resource, emoji, snapshot })))
  },
  async unsubscribeAllSnapshots ({ state, commit }) {
    state.unsubscribes.forEach(unsubscribe => unsubscribe())
    commit('clearAllUnsubscribes')
  }
}
