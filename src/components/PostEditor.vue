<template>
  <VeeForm @submit="save" :key="formKey">
    <AppFormField
      as="textarea"
      v-model="postCopy.text"
      name="text"
      label="Text"
      cols="30"
      rows="10"
      modelValue="text"
      rules="required"
    />

    <div class="form-a">
      <button class="btn-blue">{{ post.id ? 'Update post' : 'Submit post'}}</button>
    </div>
  </VeeForm>
</template>

<script>

export default {
  props: {
    post: { type: Object, default: () => ({ text: null }) }
  },
  data () {
    return {
      postCopy: { ...this.post },
      formKey: Math.random()
    }
  },
  methods: {
    save () {
      this.$emit('save', { post: this.postCopy })
      this.postCopy.text = ''
      this.formKey = Math.random()
    }
  }
}
</script>
