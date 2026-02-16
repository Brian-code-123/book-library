<template>
  <div id="app">
    <NavBar v-if="authStore.isLoggedIn" />
    <router-view />
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import NavBar from '@/components/NavBar.vue'

const authStore = useAuthStore()
</script>

<style scoped>
#app {
  min-height: 100vh;
}
</style>
