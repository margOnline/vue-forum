<template>
  <CategoryListItem :category="category" />
</template>

<script>
import CategoryListItem from '@/components/CategoryListItem'

export default {
  components: { CategoryListItem },
  name: 'Category',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  computed: {
    category () {
      return this.$store.state.categories.find(category => category.id === this.id)
    }
  }
}
</script>
