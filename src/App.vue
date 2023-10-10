<template>
  <TheNavbar />
  <div class="container">
    <router-view v-show="showPage" @ready="onPageReady" :key="$route.path"/>
    <AppSpinner v-show="!showPage"></AppSpinner>
  </div>
</template>

<script>
import TheNavbar from '@/components/TheNavbar'
import Nprogress from 'nprogress'

export default {
  name: 'App',
  components: { TheNavbar },
  data () {
    return {
      showPage: false
    }
  },
  methods: {
    onPageReady () {
      this.showPage = true
      Nprogress.done()
    }
  },
  created () {
    Nprogress.configure({
      speed: 200,
      showSpinner: false
    })
    this.$router.beforeEach(() => {
      this.showPage = false
      Nprogress.start()
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
