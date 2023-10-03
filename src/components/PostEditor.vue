<template>
  <form @submit.prevent="save">
    <div class="form-group">
      <textarea v-model="postCopy.text" name="" id="" cols="30" rows="10" class="form-input"/>
    </div>

    <div class="form-a">
      <button class="btn-blue">{{ post.id ? 'Update post' : 'Submit post'}}</button>
    </div>
  </form>
</template>

<script>

export default {
  props: {
    post: { type: Object, default: () => ({ text: null }) }
  },
  data () {
    return {
      postCopy: { ...this.post }
    }
  },
  methods: {
    save () {
      this.$emit('save', { post: this.postCopy })
      this.postCopy.text = ''
    }
  }
}
</script>
