<template>
  <TheNavbar />
  <div class="container">
    <router-view v-show="showPage" @ready="onPageReady" :key="$route.fullPath"/>
    <AppSpinner v-show="!showPage"></AppSpinner>
    <AppNotifications />
  </div>
</template>

<script>
import TheNavbar from '@/components/TheNavbar'
import AppNotifications from '@/components/AppNotifications'
import NProgress from 'nprogress'
import { mapActions } from 'vuex'

export default {
  name: 'App',
  components: { TheNavbar, AppNotifications },
  data () {
    return {
      showPage: false
    }
  },
  methods: {
    ...mapActions('auth', ['fetchAuthUser']),
    onPageReady () {
      this.showPage = true
      NProgress.done()
    }
  },
  created () {
    this.fetchAuthUser()
    NProgress.configure({
      speed: 200,
      showSpinner: false
    })
    this.$router.beforeEach(() => {
      this.showPage = false
      NProgress.start()
    })
  }
}
</script>

<style>
@import "assets/style.css";
@import "~nprogress/nprogress.css";
#nprogress .bar{
  background: #57AD8D !important;
}
</style>
