<template>
  <div class="col-full">
    <div class="forum-list">
      <div class="forum-listing">
        <forum-list-item
          v-for="forum in forums"
          :forum="forum"
          :key="forum.id"
        />
      </div>
    </div>
  </div>
</template>

<script>
import ForumListItem from '@/components/ForumListItem'

export default {
  components: { ForumListItem },
  props: {
    forums: {
      type: Array,
      required: true
    },
    title: {
      type: String,
      default: 'Forums'
    }
  }
}
</script>
