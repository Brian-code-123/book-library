<template>
  <div class="book-detail container">
    <div v-if="loading" class="loading">Loading book details...</div>

    <div v-else-if="!book" class="not-found">
      <h2>Book Not Found</h2>
      <p>The book you're looking for doesn't exist.</p>
      <router-link to="/books" class="btn-primary">Back to Books</router-link>
    </div>

    <template v-else>
      <div class="back-nav">
        <router-link to="/books">&larr; Back to Books</router-link>
      </div>

      <div class="detail-layout">
        <div class="cover-section">
          <div class="cover-placeholder">📖</div>
        </div>

        <div class="info-section">
          <h1>{{ book.title }}</h1>
          <p class="author">by {{ book.author }}</p>

          <div class="meta">
            <span class="badge" :class="book.availableQuantity > 0 ? 'badge-success' : 'badge-danger'">
              {{ book.availableQuantity > 0 ? 'Available' : 'Unavailable' }}
            </span>
            <span v-if="book.category" class="badge badge-info">{{ book.category }}</span>
            <span v-if="book.publishedYear" class="meta-item">📅 {{ book.publishedYear }}</span>
            <span v-if="book.isbn" class="meta-item">ISBN: {{ book.isbn }}</span>
          </div>

          <div class="availability">
            <p><strong>{{ book.availableQuantity }}</strong> of <strong>{{ book.totalQuantity }}</strong> copies available</p>
          </div>

          <div v-if="book.description" class="description">
            <h3>Description</h3>
            <p>{{ book.description }}</p>
          </div>

          <div class="actions">
            <button
              v-if="book.availableQuantity > 0"
              class="btn-primary btn-lg"
              :disabled="borrowing"
              @click="handleBorrow"
              data-testid="borrow-button"
            >
              {{ borrowing ? 'Borrowing...' : '📚 Borrow This Book' }}
            </button>
            <button v-else class="btn-secondary btn-lg" disabled>
              Currently Unavailable
            </button>
          </div>

          <div v-if="message" class="message" :class="messageType">{{ message }}</div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBooksStore } from '@/stores/books'
import { useBorrowsStore } from '@/stores/borrows'

const route = useRoute()
const router = useRouter()
const booksStore = useBooksStore()
const borrowsStore = useBorrowsStore()

const book = ref(null)
const loading = ref(true)
const borrowing = ref(false)
const message = ref('')
const messageType = ref('success')

async function handleBorrow() {
  borrowing.value = true
  message.value = ''
  try {
    await borrowsStore.borrowBook(book.value._id)
    message.value = 'Book borrowed successfully! Check your dashboard for due dates.'
    messageType.value = 'success'
    // Refresh book data
    book.value = await booksStore.fetchBook(route.params.id)
  } catch (err) {
    message.value = err.response?.data?.error || 'Failed to borrow this book'
    messageType.value = 'error'
  } finally {
    borrowing.value = false
  }
}

onMounted(async () => {
  try {
    book.value = await booksStore.fetchBook(route.params.id)
  } catch (err) {
    book.value = null
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.book-detail {
  padding: 2rem 1rem;
  max-width: 900px;
}

.back-nav {
  margin-bottom: 1.5rem;
}

.back-nav a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
}

.back-nav a:hover {
  text-decoration: underline;
}

.detail-layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 2rem;
  align-items: start;
}

@media (max-width: 640px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }
}

.cover-placeholder {
  width: 200px;
  height: 300px;
  background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.info-section h1 {
  font-size: 1.75rem;
  margin-bottom: 0.25rem;
}

.author {
  color: var(--text-light);
  font-size: 1.125rem;
  margin-bottom: 1rem;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 1rem;
}

.meta-item {
  font-size: 0.875rem;
  color: var(--text-light);
}

.badge-info {
  background: #dbeafe;
  color: #1e40af;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.availability {
  padding: 1rem;
  background: #f0fdf4;
  border-radius: var(--radius);
  margin-bottom: 1.5rem;
}

.description {
  margin-bottom: 1.5rem;
}

.description h3 {
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.description p {
  color: var(--text-light);
  line-height: 1.7;
}

.actions {
  margin-bottom: 1rem;
}

.btn-lg {
  padding: 0.875rem 2rem;
  font-size: 1.125rem;
}

.message {
  padding: 0.75rem 1rem;
  border-radius: var(--radius);
  font-size: 0.875rem;
}

.message.success {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.message.error {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.not-found {
  text-align: center;
  padding: 4rem;
}

.not-found h2 {
  margin-bottom: 0.5rem;
}

.not-found p {
  color: var(--text-light);
  margin-bottom: 1.5rem;
}

.loading {
  text-align: center;
  padding: 4rem;
  color: var(--text-light);
}
</style>
