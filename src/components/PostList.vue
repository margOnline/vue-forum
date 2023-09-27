<template>
  <post-list-item
    v-for="post in posts"
    :post="post"
    :key="post.id"
  />

</template>

<script>
import PostListItem from '@/components/PostListItem'

export default {
  props: {
    posts: {
      type: Array,
      required: true
    }
  },
  components: {
    PostListItem
  }
}
</script>
