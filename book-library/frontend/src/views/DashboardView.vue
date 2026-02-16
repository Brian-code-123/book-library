<template>
  <div class="dashboard container">
    <div class="welcome-section">
      <h1>Welcome back, {{ authStore.user?.fullName || authStore.user?.username }}! 👋</h1>
      <p>Here's an overview of your library activity.</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card card">
        <h3>📚 Currently Borrowed</h3>
        <p class="stat-number">{{ activeBorrows.length }}</p>
      </div>
      <div class="stat-card card">
        <h3>⚠️ Overdue</h3>
        <p class="stat-number overdue">{{ overdueBorrows.length }}</p>
      </div>
      <div class="stat-card card">
        <h3>✅ Total Returned</h3>
        <p class="stat-number">{{ returnedCount }}</p>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <h2>Currently Borrowed Books</h2>
        <router-link to="/books" class="btn-primary">Browse More Books</router-link>
      </div>

      <div v-if="loading" class="loading">Loading...</div>

      <div v-else-if="activeBorrows.length === 0" class="empty-state">
        <p>No books currently borrowed.</p>
        <router-link to="/books" class="btn-primary">Browse Books</router-link>
      </div>

      <div v-else class="borrow-list">
        <div v-for="borrow in activeBorrows" :key="borrow._id" class="borrow-item card">
          <div class="borrow-cover">📖</div>
          <div class="borrow-info">
            <h3>{{ borrow.bookId?.title || 'Unknown' }}</h3>
            <p class="author">{{ borrow.bookId?.author || '' }}</p>
            <p class="due-date" :class="{ overdue: isOverdue(borrow) }">
              Due: {{ formatDate(borrow.dueDate) }}
              <span v-if="isOverdue(borrow)"> (Overdue!)</span>
              <span v-else> ({{ daysRemaining(borrow) }} days left)</span>
            </p>
          </div>
          <button class="btn-success" @click="handleReturn(borrow._id)">Return</button>
        </div>
      </div>
    </div>

    <div class="section" v-if="recommendedBooks.length">
      <h2>Recommended for You</h2>
      <div class="books-grid">
        <BookCard
          v-for="book in recommendedBooks"
          :key="book._id"
          :book="book"
          @borrow="handleBorrow"
          @view="viewBook"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useBorrowsStore } from '@/stores/borrows'
import { useBooksStore } from '@/stores/books'
import BookCard from '@/components/BookCard.vue'

const router = useRouter()
const authStore = useAuthStore()
const borrowsStore = useBorrowsStore()
const booksStore = useBooksStore()

const loading = ref(true)
const message = ref('')

const activeBorrows = computed(() =>
  borrowsStore.borrows.filter(b => b.status === 'borrowed' || b.status === 'overdue')
)

const overdueBorrows = computed(() =>
  borrowsStore.borrows.filter(b => b.status === 'overdue' || (b.status === 'borrowed' && new Date() > new Date(b.dueDate)))
)

const returnedCount = computed(() =>
  borrowsStore.history.filter(b => b.status === 'returned').length
)

const recommendedBooks = computed(() =>
  booksStore.books.filter(b => b.availableQuantity > 0).slice(0, 4)
)

function isOverdue(borrow) {
  return new Date() > new Date(borrow.dueDate)
}

function daysRemaining(borrow) {
  const diff = new Date(borrow.dueDate) - new Date()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

async function handleReturn(borrowId) {
  try {
    const result = await borrowsStore.returnBook(borrowId)
    message.value = `Book returned successfully${result.fine > 0 ? `. Fine: $${result.fine.toFixed(2)}` : ''}`
    await borrowsStore.fetchBorrows()
  } catch (err) {
    message.value = err.response?.data?.error || 'Return failed'
  }
}

async function handleBorrow(bookId) {
  try {
    await borrowsStore.borrowBook(bookId)
    await borrowsStore.fetchBorrows()
    await booksStore.fetchBooks({ limit: 10 })
  } catch (err) {
    alert(err.response?.data?.error || 'Borrow failed')
  }
}

function viewBook(id) {
  router.push(`/books/${id}`)
}

onMounted(async () => {
  try {
    await Promise.all([
      borrowsStore.fetchBorrows(),
      borrowsStore.fetchHistory(),
      booksStore.fetchBooks({ limit: 10 })
    ])
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.dashboard {
  padding: 2rem 1rem;
}

.welcome-section {
  margin-bottom: 2rem;
}

.welcome-section h1 {
  font-size: 1.75rem;
  margin-bottom: 0.25rem;
}

.welcome-section p {
  color: var(--text-light);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  text-align: center;
}

.stat-card h3 {
  font-size: 0.875rem;
  color: var(--text-light);
  margin-bottom: 0.5rem;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary);
}

.stat-number.overdue {
  color: var(--danger);
}

.section {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.borrow-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.borrow-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.borrow-cover {
  font-size: 2rem;
  width: 60px;
  height: 80px;
  background: #e2e8f0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.borrow-info {
  flex: 1;
}

.borrow-info h3 {
  font-size: 1rem;
  margin-bottom: 0.125rem;
}

.borrow-info .author {
  color: var(--text-light);
  font-size: 0.875rem;
}

.due-date {
  font-size: 0.875rem;
  color: var(--text-light);
}

.due-date.overdue {
  color: var(--danger);
  font-weight: 600;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-light);
}

.empty-state .btn-primary {
  margin-top: 1rem;
  display: inline-block;
  text-decoration: none;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: var(--text-light);
}
</style>
