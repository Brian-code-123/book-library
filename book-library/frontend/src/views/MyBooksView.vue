<template>
  <div class="my-books container">
    <h1>My Books</h1>

    <div class="tabs">
      <button
        :class="['tab', { active: activeTab === 'current' }]"
        @click="activeTab = 'current'"
      >
        Currently Borrowed ({{ activeBorrows.length }})
      </button>
      <button
        :class="['tab', { active: activeTab === 'history' }]"
        @click="activeTab = 'history'"
      >
        History ({{ historyRecords.length }})
      </button>
    </div>

    <div v-if="loading" class="loading">Loading...</div>

    <template v-else>
      <!-- Current Borrows -->
      <div v-if="activeTab === 'current'">
        <div v-if="activeBorrows.length === 0" class="empty-state">
          <p>You don't have any borrowed books.</p>
          <router-link to="/books" class="btn-primary">Browse Books</router-link>
        </div>

        <div v-else class="records-list">
          <div v-for="borrow in activeBorrows" :key="borrow._id" class="record-card card">
            <div class="record-icon">📖</div>
            <div class="record-body">
              <h3
                class="book-title clickable"
                @click="$router.push(`/books/${borrow.bookId?._id}`)"
              >
                {{ borrow.bookId?.title || 'Unknown Book' }}
              </h3>
              <p class="book-author">{{ borrow.bookId?.author || '' }}</p>
              <div class="record-meta">
                <span>Borrowed: {{ formatDate(borrow.borrowDate) }}</span>
                <span :class="{ 'text-danger': isOverdue(borrow) }">
                  Due: {{ formatDate(borrow.dueDate) }}
                  <strong v-if="isOverdue(borrow)"> (OVERDUE)</strong>
                </span>
              </div>
              <p v-if="isOverdue(borrow)" class="fine-warning">
                ⚠️ Estimated fine: ${{ estimateFine(borrow).toFixed(2) }}
              </p>
            </div>
            <div class="record-actions">
              <span class="badge" :class="isOverdue(borrow) ? 'badge-danger' : 'badge-success'">
                {{ isOverdue(borrow) ? 'Overdue' : 'Active' }}
              </span>
              <button class="btn-success" @click="handleReturn(borrow._id)" :disabled="returning === borrow._id">
                {{ returning === borrow._id ? 'Returning...' : 'Return' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- History -->
      <div v-if="activeTab === 'history'">
        <div v-if="historyRecords.length === 0" class="empty-state">
          <p>No borrowing history yet.</p>
        </div>

        <div v-else class="records-list">
          <div v-for="record in historyRecords" :key="record._id" class="record-card card">
            <div class="record-icon">📗</div>
            <div class="record-body">
              <h3
                class="book-title clickable"
                @click="$router.push(`/books/${record.bookId?._id}`)"
              >
                {{ record.bookId?.title || 'Unknown Book' }}
              </h3>
              <p class="book-author">{{ record.bookId?.author || '' }}</p>
              <div class="record-meta">
                <span>Borrowed: {{ formatDate(record.borrowDate) }}</span>
                <span>Returned: {{ record.returnDate ? formatDate(record.returnDate) : 'N/A' }}</span>
              </div>
              <p v-if="record.fine > 0" class="fine-paid">Fine paid: ${{ record.fine.toFixed(2) }}</p>
            </div>
            <div class="record-actions">
              <span class="badge badge-secondary">{{ record.status }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-if="message" class="message-toast" :class="messageType">
      {{ message }}
      <button @click="message = ''" class="close-btn">&times;</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBorrowsStore } from '@/stores/borrows'

const borrowsStore = useBorrowsStore()

const activeTab = ref('current')
const loading = ref(true)
const returning = ref(null)
const message = ref('')
const messageType = ref('success')

const activeBorrows = computed(() =>
  borrowsStore.borrows.filter(b => b.status === 'borrowed' || b.status === 'overdue')
)

const historyRecords = computed(() => borrowsStore.history)

function isOverdue(borrow) {
  return new Date() > new Date(borrow.dueDate)
}

function estimateFine(borrow) {
  const diff = new Date() - new Date(borrow.dueDate)
  const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  return days * 0.50
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

async function handleReturn(borrowId) {
  returning.value = borrowId
  try {
    const result = await borrowsStore.returnBook(borrowId)
    if (result.fine > 0) {
      message.value = `Book returned. Fine charged: $${result.fine.toFixed(2)}`
      messageType.value = 'warning'
    } else {
      message.value = 'Book returned successfully!'
      messageType.value = 'success'
    }
    await Promise.all([borrowsStore.fetchBorrows(), borrowsStore.fetchHistory()])
  } catch (err) {
    message.value = err.response?.data?.error || 'Failed to return book'
    messageType.value = 'error'
  } finally {
    returning.value = null
  }
}

onMounted(async () => {
  try {
    await Promise.all([borrowsStore.fetchBorrows(), borrowsStore.fetchHistory()])
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.my-books {
  padding: 2rem 1rem;
}

.my-books h1 {
  margin-bottom: 1.5rem;
}

.tabs {
  display: flex;
  gap: 0;
  margin-bottom: 2rem;
  border-bottom: 2px solid var(--border);
}

.tab {
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;
  color: var(--text-light);
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
}

.tab.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
  font-weight: 600;
}

.tab:hover {
  color: var(--primary);
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.record-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.record-icon {
  font-size: 2rem;
  width: 50px;
  text-align: center;
  flex-shrink: 0;
}

.record-body {
  flex: 1;
}

.book-title {
  font-size: 1rem;
  margin-bottom: 0.125rem;
}

.book-title.clickable {
  cursor: pointer;
  color: var(--primary);
}

.book-title.clickable:hover {
  text-decoration: underline;
}

.book-author {
  color: var(--text-light);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.record-meta {
  display: flex;
  gap: 1.5rem;
  font-size: 0.8125rem;
  color: var(--text-light);
}

.text-danger {
  color: var(--danger) !important;
  font-weight: 600;
}

.fine-warning {
  color: var(--danger);
  font-size: 0.8125rem;
  margin-top: 0.25rem;
  font-weight: 600;
}

.fine-paid {
  color: #b45309;
  font-size: 0.8125rem;
  margin-top: 0.25rem;
}

.record-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  flex-shrink: 0;
}

.badge-secondary {
  background: #e2e8f0;
  color: #475569;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.empty-state {
  text-align: center;
  padding: 4rem 1rem;
  color: var(--text-light);
}

.empty-state .btn-primary {
  margin-top: 1rem;
  display: inline-block;
  text-decoration: none;
}

.loading {
  text-align: center;
  padding: 4rem;
  color: var(--text-light);
}

.message-toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: var(--radius);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 100;
  animation: slideIn 0.3s ease;
}

.message-toast.success {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.message-toast.warning {
  background: #fffbeb;
  color: #92400e;
  border: 1px solid #fde68a;
}

.message-toast.error {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: inherit;
  padding: 0;
}

@keyframes slideIn {
  from {
    transform: translateY(1rem);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
