<template>
  <div class="flex-grid justify-center">
    <div class="col-2">
      <form @submit.prevent="register" class="card card-form">
        <h1 class="text-center">Register</h1>

        <div class="form-group">
          <label for="name">Full Name</label>
          <input v-model="form.name" type="text" id="name" class="form-input" />
        </div>

        <div class="form-group">
          <label for="name">Username</label>
          <input v-model="form.username" type="text" id="username" class="form-input" />
        </div>

        <div class="form-group">
          <label for="name">Email</label>
          <input v-model="form.email" type="email" id="email" class="form-input" />
        </div>

        <div class="form-group">
          <label for="name">Password</label>
          <input v-model="form.password" type="password" id="password" class="form-input" />
        </div>

        <div class="form-group">
          <label for="name">Avatar</label>
          <input v-model="form.avatar" type="text" id="avatar" class="form-input" />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-blue btn-block">Register</button>
        </div>
      </form>

      <div class="push-top text-center">
        <button @click="registerWithGoogle" class="btn-red btn-xsmall">
          <i class="fa fa-google fa-btn"></i>Sign up with Google
        </button>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      form: {
        name: '',
        username: '',
        email: '',
        password: '',
        avatar: ''
      }
    }
  },
  methods: {
    async register () {
      await this.$store.dispatch('auth/registerUserWithEmailAndPassword', this.form)
      this.$router.push('/')
    },
    async registerWithGoogle () {
      await this.$store.dispatch('auth/signInWithGoogle')
      this.$router.push('/')
    }
  },
  created () {
    this.$emit('ready')
  }
}
</script>
