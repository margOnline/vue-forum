<template>
  <div class="text-center">
    <button class="btn-green btn-xsmall" @click.prevent="getRandomImage">
      Random Image
    </button>
    <br>
    <small style="opacity">Powered by <a href="https://pixabay.com">Pixabay</a></small>
  </div>
</template>
<script>
import { arrayRandom } from '@/helpers'
import pixabayConfig from '@/config/pixabay'

export default {
  methods: {
    async getRandomImage () {
      const searchTerms = [
        'cats',
        'dogs',
        'abstract',
        'cars',
        'mountains',
        'beach',
        'landscape',
        'object',
        'food',
        'flowers',
        'architecture',
        'yellow',
        'green',
        'blue',
        'orange',
        'black',
        'white',
        'brown',
        'red',
        'patterns',
        'animal',
        'code',
        'space'
      ]
      const randomWord = arrayRandom(searchTerms)
      const res = await fetch(
        `${pixabayConfig.apiURL}?key=${pixabayConfig.key}&q=${randomWord}`
      )
      const data = await res.json()
      const randomImage = arrayRandom(data.hits)
      this.$emit('hit', randomImage.webformatURL)
    }
  }
}
</script>
