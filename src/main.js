import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import store from '@/store'
import FontAwesome from '@/plugins/fontAwesome'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

const forumApp = createApp(App)
forumApp.use(router)
forumApp.use(store)
forumApp.use(FontAwesome)

const auth = getAuth()
onAuthStateChanged(auth, user => {
  store.dispatch('unsubscribeAuthUserSnapshot')
  if (user) {
    store.dispatch('fetchAuthUser')
  }
})

const requireComponent = require.context('./components', true, /App[A-Z]\w+\.(vue|js)$/)
requireComponent.keys().forEach(function (filename) {
  let baseComponentConfig = requireComponent(filename)
  baseComponentConfig = baseComponentConfig.default || baseComponentConfig
  const baseComponentName = baseComponentConfig.name || (
    filename
      .replace(/^.+\//, '')
      .replace(/\.\w+$/, '')
  )
  forumApp.component(baseComponentName, baseComponentConfig)
})

forumApp.mount('#app')
