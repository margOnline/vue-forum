<template>
  <div class="notifications">
    <div class="notification" v-for="notification in notifications" :key="notification.id">
      <span>{{ notification.message }}</span>
      <button @click="removeNotification(notification.id)">x</button>
    </div>
  </div>
</template>

<script>
import useNotificatons from '@/composables/useNotifications'

export default {
  setup () {
    const { notifications, removeNotification } = useNotificatons()
    return { notifications, removeNotification }
  }
}
</script>
