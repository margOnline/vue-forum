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
        <PostEditor v-if="editing" :post="post">Edit mode</PostEditor>
        <p v-else>{{post.text}}</p>
      </div>
      <a
        @click.prevent="toggleEditMode(post.id)"
        href="#"
        style="margin-left: auto; padding-left:10px;"
        class="link-unstyled"
        title="Make a change"
      >
        <fa icon="pencil-alt"></fa>
      </a>
    </div>
    <div class="post-date text-faded">
      <AppDate :timestamp="post.publishedAt"></AppDate>
    </div>
  </div>
</template>

<script>
import PostEditor from '@/components/PostEditor.vue'

export default {
  components: { PostEditor },
  props: {
    post: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      editing: null
    }
  },
  methods: {
    userById (userId) {
      return this.$store.getters.user(userId)
    },
    toggleEditMode (id) {
      this.editing = id === this.editing ? null : id
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
