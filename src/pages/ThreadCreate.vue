<template>
  <div v-if="asyncDataStatus_ready" class="col-full push-top">
    <h1>Create new thread in <i>{{ forum.name }}</i></h1>
    <ThreadEditor @save="save" @cancel="cancel" @dirty="formIsDirty = true" @clean="formIsDirty = false"/>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import ThreadEditor from '@/components/ThreadEditor.vue'
import asyncDataStatus from '@/mixins/asyncDataStatus'

export default {
  data () {
    return {
      formIsDirty: false
    }
  },
  components: { ThreadEditor },
  mixins: [asyncDataStatus],
  props: {
    forumId: { type: String, required: true }
  },
  computed: {
    forum () {
      return this.$store.state.forums.items.find(forum => forum.id === this.forumId)
    }
  },
  methods: {
    ...mapActions('threads', ['createThread']),
    ...mapActions('forums', ['fetchForum']),
    async save ({ title, text }) {
      const thread = await this.createThread({
        forumId: this.forum.id,
        title,
        text
      })
      this.$router.push({ name: 'ThreadShow', params: { id: thread.id } })
    },
    cancel () {
      this.$router.push({ name: 'Forum', params: { id: this.forum.id } })
    }
  },
  async created () {
    await this.fetchForum({ id: this.forumId })
    this.asyncDataStatus_fetched()
  },
  beforeRouteLeave () {
    if (this.formIsDirty) {
      const confirmed = window.confirm('Are you sure you want to leave? Unsaved changes will be lost!')
      if (!confirmed) return false
    }
  }
}

</script>
