import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useBorrowsStore = defineStore('borrows', () => {
  const borrows = ref([])
  const history = ref([])
  const loading = ref(false)

  async function fetchBorrows(status = '') {
    loading.value = true
    try {
      const params = status ? { status } : {}
      const { data } = await api.get('/borrows', { params })
      borrows.value = data
    } finally {
      loading.value = false
    }
  }

  async function fetchHistory() {
    loading.value = true
    try {
      const { data } = await api.get('/borrows/history')
      history.value = data
    } finally {
      loading.value = false
    }
  }

  async function borrowBook(bookId) {
    const { data } = await api.post('/borrows', { bookId })
    return data
  }

  async function returnBook(borrowId) {
    const { data } = await api.put(`/borrows/${borrowId}/return`)
    const idx = borrows.value.findIndex(b => b._id === borrowId)
    if (idx !== -1) {
      borrows.value[idx].status = 'returned'
      borrows.value[idx].returnDate = data.returnDate
    }
    return data
  }

  return { borrows, history, loading, fetchBorrows, fetchHistory, borrowBook, returnBook }
})
