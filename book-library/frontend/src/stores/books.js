import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useBooksStore = defineStore('books', () => {
  const books = ref([])
  const currentBook = ref(null)
  const categories = ref([])
  const pagination = ref({ page: 1, limit: 10, total: 0, pages: 0 })
  const loading = ref(false)

  async function fetchBooks(params = {}) {
    loading.value = true
    try {
      const { data } = await api.get('/books', { params })
      books.value = data.data
      pagination.value = data.pagination
    } finally {
      loading.value = false
    }
  }

  async function fetchBook(id) {
    loading.value = true
    try {
      const { data } = await api.get(`/books/${id}`)
      currentBook.value = data
      return data
    } finally {
      loading.value = false
    }
  }

  async function fetchCategories() {
    try {
      const { data } = await api.get('/books/categories')
      categories.value = data
    } catch (err) {
      categories.value = []
    }
  }

  async function createBook(bookData) {
    const { data } = await api.post('/books', bookData)
    books.value.push(data)
    return data
  }

  async function updateBook(id, bookData) {
    const { data } = await api.put(`/books/${id}`, bookData)
    const idx = books.value.findIndex(b => b._id === id)
    if (idx !== -1) books.value[idx] = data
    return data
  }

  async function deleteBook(id) {
    await api.delete(`/books/${id}`)
    books.value = books.value.filter(b => b._id !== id)
  }

  return {
    books, currentBook, categories, pagination, loading,
    fetchBooks, fetchBook, fetchCategories, createBook, updateBook, deleteBook
  }
})
