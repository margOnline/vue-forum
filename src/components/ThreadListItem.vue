<template>
  <div class="thread">
    <div>
      <p>
        <router-link
          :to="{ name: 'ThreadShow', params: { id: thread.id } }"
        >
          {{ thread.title }}
        </router-link>
      </p>
      <p class="text-faded text-xsmall">
        By <a href="#">{{ user.name }}</a>, <AppDate :timestamp="thread.publishedAt"/>.
      </p>
    </div>

    <div class="activity">
      <p class="replies-count">
        {{ thread.repliesCount }}
        {{ thread.repliesCount === 1 ? "reply" : "replies" }}
      </p>
      <AppAvatarImage
        :src="user.avatar"
        :alt="user.name"
        class="avatar-medium"
      />
      <div>
        <p class="text-xsmall">
          <a href="#">{{ user.name }}</a>
        </p>
        <p class="text-xsmall text-faded"><AppDate :timestamp="thread.publishedAt"/></p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    thread: {
      type: Object,
      required: true
    },
    user: {
      type: Object,
      required: true
    }
  }
}
</script>
