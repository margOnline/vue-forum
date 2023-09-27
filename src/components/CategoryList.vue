<template>
  <div class="col-full">
    <div class="category-list">
      <CategoryListItem
        v-for="category in categories"
        :key="category.id"
        :category="category"
      />
    </div>
  </div>
</template>

<script>
import CategoryListItem from '@/components/CategoryListItem'

export default {
  components: { CategoryListItem },
  props: {
    categories: {
      type: Array,
      required: true
    }
  }
}
</script>
