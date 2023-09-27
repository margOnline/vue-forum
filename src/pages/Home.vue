<template>
  <h1 class="push-top">Welcome to the Masterclass Board</h1>
  <CategoryList :categories="categories"/>
</template>

<script>
import { collection, getDocs } from 'firebase/firestore'
import CategoryList from '@/components/CategoryList'
import db from '@/config/firebase'
import { upsert } from '@/helpers'

export default {
  computed: {
    categories () {
      return this.$store.state.categories
    }
  },
  components: { CategoryList },
  async created () {
    console.log('in created lifecycle hook')
    const collectionRef = collection(db, 'categories')
    const collectionSnap = await getDocs(collectionRef)
    return collectionSnap.docs.map((doc) => {
      const item = { id: doc.id, ...doc.data() }
      upsert(this.categories, item)
    })
  }
}
</script>
