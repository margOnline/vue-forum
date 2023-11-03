<template>
  <VeeForm @submit="save">
    <AppFormField
      v-model="form.title"
      name="title"
      label="Title"
      modelValue="title"
      rules="required"
    />

    <AppFormField
      as="textarea"
      v-model="form.text"
      name="text"
      label="Content"
      modelValue="text"
      rules="required"
      rows="8"
      cols="140"
    />

    <div class="btn-group">
      <button @click.prevent="$emit('cancel')" class="btn btn-ghost">Cancel</button>
      <button
        class="btn btn-blue"
        type="submit"
        name="Publish"
      >
        {{ existing ? 'Update' : 'Publish' }}
      </button>
    </div>
  </VeeForm>
</template>

<script>
export default {
  props: {
    title: { type: String, default: '' },
    text: { type: String, default: '' }
  },
  data () {
    return {
      form: {
        title: this.title,
        text: this.text
      }
    }
  },
  methods: {
    save () {
      this.$emit('clean')
      this.$emit('save', { ...this.form })
    }
  },
  watch: {
    form: {
      handler () {
        if (this.form.title !== this.title || this.form.text !== this.text) {
          this.$emit('dirty')
        } else {
          this.$emit('clean')
        }
      },
      deep: true
    }
  },
  computed: {
    existing () {
      return !!this.text
    }
  }
}
</script>
