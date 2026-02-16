<template>
  <div class="book-list container">
    <h1>Browse Books</h1>

    <div class="filters">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by title, author, or ISBN..."
          @input="debouncedSearch"
          data-testid="search-input"
        />
      </div>
      <div class="category-filter">
        <select v-model="selectedCategory" @change="loadBooks" data-testid="category-filter">
          <option value="">All Categories</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>
      <div class="sort-filter">
        <select v-model="sortBy" @change="loadBooks">
          <option value="-createdAt">Newest First</option>
          <option value="title">Title A–Z</option>
          <option value="-title">Title Z–A</option>
          <option value="author">Author A–Z</option>
          <option value="-publishedYear">Year (Newest)</option>
          <option value="publishedYear">Year (Oldest)</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="loading">Loading books...</div>

    <div v-else-if="books.length === 0" class="empty-state">
      <p>No books found{{ searchQuery ? ` for "${searchQuery}"` : '' }}.</p>
    </div>

    <template v-else>
      <p class="results-count">{{ totalBooks }} book{{ totalBooks !== 1 ? 's' : '' }} found</p>

      <div class="books-grid" data-testid="book-grid">
        <BookCard
          v-for="book in books"
          :key="book._id"
          :book="book"
          @borrow="handleBorrow"
          @view="viewBook"
        />
      </div>

      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-change="changePage"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBooksStore } from '@/stores/books'
import { useBorrowsStore } from '@/stores/borrows'
import BookCard from '@/components/BookCard.vue'
import Pagination from '@/components/Pagination.vue'

const router = useRouter()
const route = useRoute()
const booksStore = useBooksStore()
const borrowsStore = useBorrowsStore()

const searchQuery = ref(route.query.q || '')
const selectedCategory = ref(route.query.category || '')
const sortBy = ref(route.query.sort || '-createdAt')
const currentPage = ref(parseInt(route.query.page) || 1)
const limit = 12
const loading = ref(true)

const books = computed(() => booksStore.books)
const categories = computed(() => booksStore.categories)
const totalBooks = computed(() => booksStore.pagination.total)
const totalPages = computed(() => booksStore.pagination.totalPages)

let searchTimeout = null
function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    loadBooks()
  }, 300)
}

async function loadBooks() {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit,
      sort: sortBy.value,
    }
    if (searchQuery.value) params.search = searchQuery.value
    if (selectedCategory.value) params.category = selectedCategory.value

    router.replace({
      query: {
        ...(searchQuery.value && { q: searchQuery.value }),
        ...(selectedCategory.value && { category: selectedCategory.value }),
        ...(sortBy.value !== '-createdAt' && { sort: sortBy.value }),
        ...(currentPage.value > 1 && { page: currentPage.value }),
      },
    })

    await booksStore.fetchBooks(params)
  } finally {
    loading.value = false
  }
}

function changePage(page) {
  currentPage.value = page
  loadBooks()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function handleBorrow(bookId) {
  try {
    await borrowsStore.borrowBook(bookId)
    await loadBooks()
    alert('Book borrowed successfully!')
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to borrow book')
  }
}

function viewBook(id) {
  router.push(`/books/${id}`)
}

onMounted(async () => {
  await booksStore.fetchCategories()
  await loadBooks()
})
</script>

<style scoped>
.book-list {
  padding: 2rem 1rem;
}

.book-list h1 {
  margin-bottom: 1.5rem;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 200px;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 1rem;
  transition: border-color 0.2s;
}

.search-box input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.category-filter select,
.sort-filter select {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 1rem;
  background: white;
  cursor: pointer;
  min-width: 160px;
}

.results-count {
  color: var(--text-light);
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 1rem;
  color: var(--text-light);
  font-size: 1.125rem;
}

.loading {
  text-align: center;
  padding: 4rem;
  color: var(--text-light);
  font-size: 1.125rem;
}
</style>
