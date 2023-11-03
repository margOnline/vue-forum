import { Form, Field, ErrorMessage, defineRule, configure } from 'vee-validate'
import { required, email, min, url } from '@vee-validate/rules'
import { localize } from '@vee-validate/i18n'
import { collection, getDocs, query, where } from 'firebase/firestore'
import db from '@/config/firebase'

export default (app) => {
  defineRule('required', required)
  defineRule('email', email)
  defineRule('min', min)
  defineRule('url', url)
  defineRule('unique', async (value, args) => {
    let dbCollection, field, excluding
    if (Array.isArray(args)) {
      [dbCollection, field, excluding] = args
    } else {
      ({ dbCollection, field, excluding } = args)
    }
    if (value === excluding) return true
    const q = query(collection(db, dbCollection), where(field, '==', value))
    const querySnapshot = await getDocs(q)
    return querySnapshot.empty
  })
  configure({
    generateMessage: localize('en', {
      messages: {
        required: '{field} is required',
        email: '{field} must be a valid email',
        min: '{field} must be at least 0:{min} characters long',
        unique: '{field} is already taken',
        url: '{field} must be a valid URL'
      }
    })
  })

  app.component('VeeForm', Form)
  app.component('VeeField', Field)
  app.component('VeeErrorMessage', ErrorMessage)
}
