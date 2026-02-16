<template>
  <nav class="navbar">
    <div class="nav-brand">
      <router-link to="/dashboard">📚 Book Library</router-link>
    </div>
    <div class="nav-links">
      <router-link to="/dashboard">Dashboard</router-link>
      <router-link to="/books">Browse Books</router-link>
      <router-link to="/my-books">My Books</router-link>
    </div>
    <div class="nav-user">
      <span class="user-name">{{ authStore.user?.fullName || authStore.user?.username }}</span>
      <button class="btn-secondary" @click="handleLogout">Logout</button>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 2rem;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-brand a {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary);
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-links a {
  color: var(--text);
  font-weight: 500;
  padding: 0.5rem 0;
  border-bottom: 2px solid transparent;
  text-decoration: none;
}

.nav-links a.router-link-active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  font-weight: 500;
  color: var(--text-light);
}
</style>
