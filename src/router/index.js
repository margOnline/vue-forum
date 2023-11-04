import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () =>
      import(/* webpackChunkName: "home" */ '@/pages/Home')
  },
  {
    path: '/me',
    name: 'Profile',
    component: () =>
      import(/* webpackChunkName: "profile" */ '@/pages/Profile'),
    meta: {
      toTop: true,
      smoothScroll: true,
      requiresAuth: true
    }
  },
  {
    path: '/me/edit',
    name: 'ProfileEdit',
    component: () =>
      import(/* webpackChunkName: "profile" */ '@/pages/Profile'),
    props: { edit: true },
    meta: { requiresAuth: true }
  },
  {
    path: '/category/:id',
    name: 'Category',
    component: () =>
      import(/* webpackChunkName: "category" */ '@/pages/Category'),
    props: true
  },
  {
    path: '/forum/:id',
    name: 'Forum',
    component: () =>
      import(/* webpackChunkName: "forum" */ '@/pages/Forum'),
    props: true
  },
  {
    path: '/thread/:id',
    name: 'ThreadShow',
    component: () =>
      import(/* webpackChunkName: "threadShow" */ '@/pages/ThreadShow'),
    props: true,
    async beforeEnter (to, then, next) {
      await store.dispatch('threads/fetchThread', { id: to.params.id, once: true })
      const threadExists = store.state.threads.items.find(thread => thread.id === to.params.id)
      if (threadExists) {
        return next()
      } else {
        next({
          name: 'NotFound',
          params: { pathMatch: to.path.substring(1).split('/') },
          query: to.query,
          hash: to.hash
        })
      }
    }
  },
  {
    path: '/forum/:forumId/thread/create',
    name: 'ThreadCreate',
    component: () =>
      import(/* webpackChunkName: "threadCreate" */ '@/pages/ThreadCreate'),
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/thread/:id/edit',
    name: 'ThreadEdit',
    component: () =>
      import(/* webpackChunkName: "threadEdit" */ '@/pages/ThreadEdit'),
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () =>
      import(/* webpackChunkName: "register" */ '@/pages/Register'),
    meta: { requiresGuest: true }
  },
  {
    path: '/signin',
    name: 'SignIn',
    component: () =>
      import(/* webpackChunkName: "signIn" */ '@/pages/SignIn'),
    meta: { requiresGuest: true }
  },
  {
    path: '/logout',
    name: 'Signout',
    async beforeEnter (to, from) {
      await store.dispatch('auth/signOut')
      return { name: 'Home' }
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () =>
      import(/* webpackChunkName: "notFound" */ '@/pages/NotFound')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior (to) {
    const scroll = {}
    if (to.meta.toTop) scroll.top = 0
    if (to.meta.smoothScroll) scroll.behavior = 'smooth'
    return scroll
  }
})
router.beforeEach(async (to, from) => {
  await store.dispatch('auth/initAuthentication')
  store.dispatch('unsubscribeAllSnapshots')
  if (to.meta.requiresAuth && !store.state.auth.authId) {
    return { name: 'SignIn', query: { redirectTo: to.path } }
  }
  if (to.meta.requiresGuest && store.state.auth.authId) {
    return { name: 'Home' }
  }
})

export default router
