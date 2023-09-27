import { createStore } from 'vuex'
import { doc, getDoc } from 'firebase/firestore'
import db from '@/config/firebase'
import { findById, upsert } from '@/helpers'

export default createStore({
  state: {
    categories: [],
    forums: [],
    threads: [],
    posts: [],
    users: [],
    authId: 'VXjpr2WHa8Ux4Bnggym8QFLdv5C3'
  },
  getters: {
    authUser: (state, getters) => {
      return getters.user(state.authId)
    },
    user: state => {
      return (id) => {
        const user = findById(state.users, id)
        if (!user) return null

        return {
          ...user,
          get posts () {
            return state.posts.filter(post => post.userId === user.id)
          },
          get postsCount () {
            return this.posts.length
          },
          get threads () {
            return state.threads.filter(thread => thread.userId === user.id)
          },
          get threadsCount () {
            return this.threads.length
          }
        }
      }
    },
    thread: state => {
      return (id) => {
        const thread = findById(state.threads, id)
        return {
          ...thread,
          get author () {
            return findById(state.users, thread.userId)
          },
          get repliesCount () {
            return thread.posts.length - 1
          },
          get contributorsCount () {
            return thread.contributors.length
          }
        }
      }
    }
  },
  actions: {
    createPost ({ commit, state }, post) {
      post.id = 'gggg' + Math.random()
      post.userId = state.authId
      post.publishedAt = Math.floor(Date.now() / 1000)
      commit('setItem', { resource: 'posts', item: post })
      commit(
        'appendPostToThread', { parentId: post.threadId, childId: post.id }
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
    fetchThread ({ dispatch }, { id }) {
      console.log('fetchThread: ', id)
      return dispatch('fetchItem', { resource: 'threads', id, emoji: '📄' })
    },
    fetchUser ({ dispatch }, { id }) {
      console.log('fetchUser: ', id)
      return dispatch('fetchItem', { resource: 'users', id, emoji: '🙋' })
    },
    fetchPost ({ dispatch }, { id }) {
      console.log('fetchPost: ', id)
      return dispatch('fetchItem', { resource: 'posts', id, emoji: '💬' })
    },
    async fetchItem ({ state, commit }, { id, emoji, resource }) {
      console.log('fetchitem', emoji, id)
      const itemRef = doc(db, resource, id)
      const itemSnap = await getDoc(itemRef)
      const item = { ...itemSnap.data(), id: itemRef.id }
      commit('setItem', { resource, id, item })
    }
  },
  mutations: {
    setItem (state, { resource, item }) {
      upsert(state[resource], item)
    },
    setCategory (state, { category }) {
      upsert(state.categories, category)
    },
    setForum (state, { forum }) {
      upsert(state.forums, forum)
    },
    appendPostToThread: makeAppendChildToParentMutation({ parent: 'threads', child: 'posts' }),
    appendThreadToForum: makeAppendChildToParentMutation({ parent: 'forums', child: 'threads' }),
    appendThreadToUser: makeAppendChildToParentMutation({ parent: 'users', child: 'threads' }),
    appendContributorToThread: makeAppendChildToParentMutation({ parent: 'threads', child: 'contributors' })
  }
})

function makeAppendChildToParentMutation ({ parent, child }) {
  return (state, { childId, parentId }) => {
    const resource = findById(state[parent], parentId)
    resource[child] = resource[child] || []
    if (!resource[child].includes(childId)) {
      resource[child].push(childId)
    }
  }
}
