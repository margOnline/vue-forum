<template>
  <div v-if="asyncDataStatus_ready" class="container col-full">
    <CategoryListItem :category="category" />
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import CategoryListItem from '@/components/CategoryListItem'
import { findById } from '@/helpers'
import asyncDataStatus from '@/mixins/asyncDataStatus'

export default {
  components: { CategoryListItem },
  mixins: [asyncDataStatus],
  name: 'Category',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  methods: {
    ...mapActions(['fetchCategory', 'fetchForums'])
  },
  computed: {
    category () {
      return findById(this.$store.state.categories, this.id) || {}
    }
  },
  async created () {
    const category = await this.fetchCategory({ id: this.id })
    await this.fetchForums({ id: category.forums })
    this.asyncDataStatus_fetched()
  }
}
</script>
