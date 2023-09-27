<template>
  <div class="forum-details">
    <router-link
      class="text-xlarge"
      :to="{ name: 'Forum', params: { id: forum.id } }"
    >
      {{ forum.name }}
    </router-link>
    <p>{{ forum.description }}</p>
  </div>

  <div class="threads-count">
    <p>
      <span class="count">
        {{ forum.threads?.length }}
      </span>
      {{ forumThreadsWord() }}
    </p>
  </div>

  <div class="last-thread"></div>
</template>

<script>
export default {
  props: {
    forum: {
      type: Object,
      required: true
    }
  },
  methods: {
    forumThreadsWord () {
      if (this.forum.threads?.length) {
        return this.forum.threads.length > 1 ? 'threads' : 'thread'
      } else {
        return 'no threads'
      }
    }
  }
}
</script>
