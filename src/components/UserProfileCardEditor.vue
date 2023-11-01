<template>
  <div class="profile-card">
    <form @submit.prevent="save">
      <p class="text-center avatar-edit">
        <label for="avatar">
          <AppAvatarImage
            :src="activeUser.avatar"
            :alt="`${user.name} profile picture`"
            class="avatar-xlarge img-update"
          />
          <div class="avatar-upload-overlay">
            <AppSpinner v-if="uploadingImage" color="white" />
            <fa v-else icon="camera" size="3x" :style="{color: 'white', opacity: '0.8'}" />
          </div>
          <input
            v-show="false"
            type="file"
            id="avatar"
            @change="handleAvatarUpload"
            accept="image/*"
          >
        </label>
      </p>

      <div class="form-group">
        <input v-model="activeUser.username" type="text" placeholder="Username" class="form-input text-lead text-bold">
      </div>

      <div class="form-group">
        <input type="text" v-model="activeUser.name" placeholder="Full Name" class="form-input text-lead">
      </div>

      <div class="form-group">
        <label for="user_bio">Bio</label>
        <textarea v-model="activeUser.bio" class="form-input" id="user_bio" placeholder="Write a few words about yourself."></textarea>
      </div>

      <div class="stats">
        <span>{{ user.postsCount }} posts</span>
        <span>{{ user.threadsCount }} threads</span>
      </div>

      <hr>
      <div class="form-group">
        <label class="form-label" for="user_website">Website</label>
        <input autocomplete="off" v-model="activeUser.website" class="form-input" id="user_website">
      </div>

      <div class="form-group">
        <label class="form-label" for="user_email">Email</label>
        <input autocomplete="off" v-model="activeUser.email" class="form-input" id="user_email">
      </div>

      <div class="form-group">
        <label class="form-label" for="user_location">Location</label>
        <input autocomplete="off" v-model="activeUser.location" class="form-input" id="user_location">
      </div>

      <div class="btn-group space-between">
        <button @click.prevent="cancel" class="btn-ghost">Cancel</button>
        <button type="submit" class="btn-blue">Save</button>
      </div>
    </form>
  </div>

</template>

<script>
import { mapActions } from 'vuex'

export default {
  data () {
    return {
      activeUser: { ...this.user },
      uploadingImage: false
    }
  },
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  methods: {
    ...mapActions('auth', ['uploadAvatar']),
    async handleAvatarUpload (e) {
      this.uploadingImage = true
      const file = e.target.files[0]
      const uploadedImage = await this.uploadAvatar({ file })
      this.activeUser.avatar = uploadedImage || this.activeUser.avatar
      this.uploadingImage = false
    },
    save () {
      this.$store.dispatch('users/updateUser', { ...this.activeUser })
      this.$router.push({ name: 'Profile' })
    },
    cancel () {
      this.$router.push({ name: 'Profile' })
    }
  }
}
</script>
<style>
.avatar-edit {
  position: relative;
}
.avatar-edit .avatar-upload-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
