import { createStore } from 'vuex'
import actions from '@/store/actions'
import getters from '@/store/getters'
import mutations from '@/store/mutations'

export default createStore({
  state: {
    categories: [],
    forums: [],
    threads: [],
    posts: [],
    users: [],
    authId: '7uVPJS9GHoftN58Z2MXCYDqmNAh2'
  },
  actions,
  getters,
  mutations
})
