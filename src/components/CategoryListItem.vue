<template>
  <div class="category-details">
    <router-link
      class="text-xsmall"
      :to="{ name: 'Category', params: { id: category.id } }"
    >
      <h2 class="list-title">{{ category.name }}</h2>
    </router-link>
    <ForumList :forums="categoryForums()" :title="category.name" />
  </div>
</template>

<script>
import ForumList from '@/components/ForumList'
export default {
  components: { ForumList },
  props: {
    category: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      forums: this.$store.state.forums
    }
  },
  methods: {
    categoryForums () {
      return this.forums.filter(forum => forum.categoryId === this.category.id)
    }
  }
}
</script>
