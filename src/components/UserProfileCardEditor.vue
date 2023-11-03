<template>
  <div class="profile-card">
    <VeeForm @submit="save">
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
      <UserProfileCardEditorRandomAvatar @hit="activeUser.avatar = $event" />

      <AppFormField
        v-model="activeUser.username"
        name="username"
        label="Username"
        modelValue="username"
        :rules="`required|unique:users,username,${user.username}`"
      />
      <AppFormField
        v-model="activeUser.name"
        name="name"
        label="Full Name"
        rules="required"
      />

      <AppFormField
        v-model="activeUser.bio"
        as="textarea"
        name="bio"
        label="Bio"
        placeholder="Write a few words about yourself."
      />

      <div class="stats">
        <span>{{ user.postsCount }} posts</span>
        <span>{{ user.threadsCount }} threads</span>
      </div>

      <hr>
      <AppFormField
        v-model="activeUser.website"
        name="website"
        label="Website"
        rules="url"
      />

      <AppFormField
        v-model="activeUser.email"
        name="email"
        label="Email"
        :rules="`required|unique:users, email, ${user.email}|email`"
      />

      <AppFormField
        v-model="activeUser.location"
        name="location"
        label="Location"
        list="locations"
        @mouseenter="loadLocationOptions"
      />
      <datalist id="locations">
        <option
          v-for="location in locationOptions"
          :value="location.name.common"
          :key="location.name.common"
        />
      </datalist>

      <div class="btn-group space-between">
        <button @click.prevent="cancel" class="btn-ghost">Cancel</button>
        <button type="submit" class="btn-blue">Save</button>
      </div>
    </VeeForm>
  </div>

</template>

<script>
import { mapActions } from 'vuex'
import UserProfileCardEditorRandomAvatar from '@/components/UserProfileCardEditorRandomAvatar'

export default {
  components: { UserProfileCardEditorRandomAvatar },
  data () {
    return {
      activeUser: { ...this.user },
      uploadingImage: false,
      locationOptions: []
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
    async loadLocationOptions () {
      if (this.locationOptions.lenth) return

      const countries = await fetch('https://restcountries.com/v3.1/all').then(res => res.json())
      this.locationOptions = countries.sort((a, b) => a.name.common.localeCompare(b.name.common))
    },
    async handleAvatarUpload (e) {
      this.uploadingImage = true
      const file = e.target.files[0]
      const uploadedImage = await this.uploadAvatar({ file })
      this.activeUser.avatar = uploadedImage || this.activeUser.avatar
      this.uploadingImage = false
    },
    async handleRandomAvatarUpload () {
      const randomAvatarGenerated = this.activeUser.avatar.startsWith('https://pixabay')
      if (randomAvatarGenerated) {
        const image = await fetch(this.activeUser.avatar)
        const blob = await image.blob()
        this.activeUser.avatar = await this.uploadAvatar({ file: blob, filename: 'random' })
      }
    },
    async save () {
      await this.handleRandomAvatarUpload()
      this.$store.dispatch('users/updateUser', { ...this.activeUser })
      this.$router.push({ name: 'Profile' })
    },
    cancel () {
      this.$router.push({ name: 'Profile' })
    },
    getImagesFromPixabay () {
      console.log('in get images from pixabay')
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
