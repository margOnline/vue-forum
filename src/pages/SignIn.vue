<template>
  <div class="flex-grid justify-center">
    <div class="col-2">

      <form @submit.prevent="signIn" class="card card-form">
        <h1 class="text-center">Login</h1>

        <div class="form-group">
          <label for="name">Email</label>
          <input v-model="form.email" type="email" id="email" class="form-input" />
        </div>
        <div class="form-group">
          <label for="name">Password</label>
          <input v-model="form.password" type="password" id="password" class="form-input" />
        </div>
        <div class="push-top">
          <button type="submit" class="btn-blue btn-block">Log in</button>
        </div>
        <div class="form-actions text-right">
          <router-link :to="{name: 'Register'}">Create an account?</router-link>
        </div>
      </form>

      <div class="push-top text-center">
        <button @click="signInWithGoogle" class="btn-red btn-xsmall">
          <i class="fa fa-google fa-btn"></i>Sign in with Google
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
        email: '',
        password: ''
      }
    }
  },
  methods: {
    async signIn () {
      try {
        await this.$store.dispatch('signInWithEmailAndPassword', { ...this.form })
        this.$router.push('/')
      } catch (error) {
        alert(error.message)
      }
    },
    async signInWithGoogle () {
      await this.$store.dispatch('signInWithGoogle')
      this.$router.push('/')
    }
  },
  created () {
    this.$emit('ready')
  }
}
</script>
