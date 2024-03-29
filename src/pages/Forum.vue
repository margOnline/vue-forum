<template>
  <div v-if="asyncDataStatus_ready" class="container col-full">
    <div v-if="forum" class="col-full push-top">
      <div class="forum-header">
        <div class="forum-details">
          <h1>{{ forum.name }}</h1>
          <p class="text-lead">{{ forum.description }}</p>
        </div>
        <router-link
          :to="{ name: 'ThreadCreate', params: { forumId: forum.id } }"
          class="btn-green btn-small"
        >
          Start a thread
        </router-link>
      </div>
    </div>
    <div class="col-full push-top">
      <thread-list :threads="threads"/>
      <v-pagination
        v-model="page"
        :pages="totalPages"
        active-color="#57AD8D"
      />
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import ThreadList from '@/components/ThreadList'
import asyncDataStatus from '@/mixins/asyncDataStatus'
import { findById } from '@/helpers'

export default {
  components: { ThreadList },
  mixins: [asyncDataStatus],
  data () {
    return {
      page: parseInt(this.$route.query.page) || 1,
      perPage: 5
    }
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  methods: {
    ...mapActions('forums', ['fetchForum']),
    ...mapActions('threads', ['fetchThreadsByPage']),
    ...mapActions('users', ['fetchUsers'])
  },
  computed: {
    forum () {
      return findById(this.$store.state.forums.items, this.id)
    },
    threads () {
      if (!this.forum) return []
      return this.$store.state.threads.items
        .filter(thread => thread.forumId === this.forum.id)
        .map(thread => this.$store.getters['threads/thread'](thread.id))
    },
    threadCount () {
      return this.forum.threads?.length || 0
    },
    totalPages () {
      return Math.ceil(this.threadCount / this.perPage)
    }
  },
  async created () {
    const forum = await this.fetchForum({ id: this.id })
    const threads = await this.fetchThreadsByPage({ ids: forum.threads, page: this.page, perPage: this.perPage })
    await this.fetchUsers({ ids: threads.map(thread => thread.userId) })
    this.asyncDataStatus_fetched()
  },
  watch: {
    async page (page) {
      this.$router.push({ query: { page: this.page } })
    }
  }
}
</script>
