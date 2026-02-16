<template>
  <div class="login-page">
    <div class="login-card card">
      <div class="login-header">
        <span class="logo">📚</span>
        <h1>Create Account</h1>
        <p>Register to start borrowing books</p>
      </div>

      <div v-if="error" class="error-msg">{{ error }}</div>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="fullName">Full Name</label>
          <input id="fullName" v-model="form.fullName" type="text" placeholder="Enter your full name" required />
        </div>

        <div class="form-group">
          <label for="username">Username</label>
          <input id="username" v-model="form.username" type="text" placeholder="Choose a username" required />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" v-model="form.email" type="email" placeholder="Enter your email" required />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" v-model="form.password" type="password" placeholder="Min 8 chars, 1 uppercase, 1 number" required />
          <div class="password-strength" v-if="form.password">
            <div class="strength-bar" :class="strengthClass" :style="{ width: strengthPercent + '%' }"></div>
          </div>
          <small class="strength-text">{{ strengthText }}</small>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input id="confirmPassword" v-model="form.confirmPassword" type="password" placeholder="Confirm your password" required />
        </div>

        <div class="form-group">
          <label for="phone">Phone (optional)</label>
          <input id="phone" v-model="form.phone" type="tel" placeholder="Enter your phone number" />
        </div>

        <div class="form-group checkbox-group">
          <label>
            <input type="checkbox" v-model="form.agreeTerms" required />
            I agree to the Terms and Conditions
          </label>
        </div>

        <button type="submit" class="btn-primary btn-full" :disabled="loading">
          {{ loading ? 'Creating account...' : 'Register' }}
        </button>
      </form>

      <p class="register-link">
        Already have an account? <router-link to="/login">Login</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  fullName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  agreeTerms: false
})
const error = ref('')
const loading = ref(false)

const strengthPercent = computed(() => {
  const p = form.value.password
  if (!p) return 0
  let score = 0
  if (p.length >= 8) score += 25
  if (/[A-Z]/.test(p)) score += 25
  if (/[0-9]/.test(p)) score += 25
  if (/[^A-Za-z0-9]/.test(p)) score += 25
  return score
})

const strengthClass = computed(() => {
  if (strengthPercent.value <= 25) return 'weak'
  if (strengthPercent.value <= 50) return 'fair'
  if (strengthPercent.value <= 75) return 'good'
  return 'strong'
})

const strengthText = computed(() => {
  if (!form.value.password) return ''
  if (strengthPercent.value <= 25) return 'Weak'
  if (strengthPercent.value <= 50) return 'Fair'
  if (strengthPercent.value <= 75) return 'Good'
  return 'Strong'
})

async function handleRegister() {
  error.value = ''

  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Passwords do not match'
    return
  }

  loading.value = true
  try {
    await authStore.register({
      fullName: form.value.fullName,
      username: form.value.username,
      email: form.value.email,
      password: form.value.password,
      phone: form.value.phone
    })
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.error || 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 100%;
  max-width: 450px;
  padding: 2.5rem;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  font-size: 3rem;
  display: block;
  margin-bottom: 0.5rem;
}

.login-header h1 {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}

.login-header p {
  color: var(--text-light);
  font-size: 0.875rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.375rem;
  font-weight: 500;
  font-size: 0.875rem;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: normal;
}

.checkbox-group input[type="checkbox"] {
  width: auto;
}

.btn-full {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
}

.register-link {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: var(--text-light);
}

.password-strength {
  height: 4px;
  background: var(--border);
  border-radius: 2px;
  margin-top: 0.5rem;
  overflow: hidden;
}

.strength-bar {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s, background 0.3s;
}

.strength-bar.weak { background: var(--danger); }
.strength-bar.fair { background: var(--warning); }
.strength-bar.good { background: #3b82f6; }
.strength-bar.strong { background: var(--success); }

.strength-text {
  font-size: 0.75rem;
  color: var(--text-light);
}
</style>
