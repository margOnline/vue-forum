<template>
  <div class="container" style="width: 100%">
    <div class="flex-grid">
      <div class="col-3 push-top">
        <UserProfileCard v-if="!edit" :user="user"/>
        <UserProfileCardEditor v-else :user="user"/>
      </div>

      <div class="col-7 push-top">
        <div class="profile-header">
          <span class="text-lead">
            {{ user.username }} recent activity
          </span>
          <a href="#">See only started threads?</a>
        </div>

        <hr>
        <PostList :posts="user.posts"/>
      </div>
    </div>
  </div>
</template>

<script>
import PostList from '@/components/PostList'
import UserProfileCard from '@/components/UserProfileCard.vue'
import UserProfileCardEditor from '@/components/UserProfileCardEditor.vue'
import asyncDataStatus from '@/mixins/asyncDataStatus'
import { mapGetters } from 'vuex'

export default {
  props: {
    edit: { type: Boolean, default: false }
  },
  mixins: [asyncDataStatus],
  computed: {
    ...mapGetters({ user: 'authUser' })
  },
  async created () {
    await this.$store.dispatch('fetchAuthUsersPosts')
    this.asyncDataStatus_fetched()
  },
  components: { PostList, UserProfileCard, UserProfileCardEditor }
}
</script>
