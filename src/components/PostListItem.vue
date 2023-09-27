<template>
  <div class="post">
    <div v-if="userById(post.userId)" class="user-info">
      <a href="#" class="user-name">
        {{userById(post.userId).name}}
      </a>
      <a href="#">
        <img class="avatar-large" :src="userById(post.userId).avatar" alt="">
      </a>
      <p class="desktop-only text-small">{{ userById(post.userId).postsCount }} posts</p>
      <p class="desktop-only text-small">{{ userById(post.userId).threadsCount }} threads</p>
    </div>

    <div class="post-content">
      <div class="col-full">
        <p>{{post.text}}</p>
      </div>
    </div>
    <div class="post-date text-faded">
      <AppDate :timestamp="post.publishedAt"></AppDate>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    post: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      users: this.$store.state.users
    }
  },
  methods: {
    userById (userId) {
      return this.$store.getters.user(userId)
    }
  }
}
</script>

<style scoped>
.post {
  background-color: white;
  padding: 20px;
  margin: 10px;
}
</style>
