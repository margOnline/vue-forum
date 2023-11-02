import { Form, Field, ErrorMessage, defineRule } from 'vee-validate'

export default (app) => {
  defineRule('required', (value) => {
    if (value && value.trim()) return true
    return 'This is a required field'
  })

  app.component('VeeForm', Form)
  app.component('VeeField', Field)
  app.component('VeeErrorMessage', ErrorMessage)
}
