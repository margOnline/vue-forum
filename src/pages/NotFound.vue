<template>
  <div class="col-full text-center">
    <h1>Not Found</h1>
    <p>
      Oops! perhaps you mistyped soemthing,
      <router-link :to="{ name: 'Home' }">visit our forums here</router-link>
    </p>
  </div>
</template>
