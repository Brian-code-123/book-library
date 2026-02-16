<template>
  <div class="book-card card" @click="$emit('view', book._id)">
    <div class="book-cover">
      <div class="cover-placeholder">📖</div>
    </div>
    <div class="book-info">
      <h3 class="book-title">{{ book.title }}</h3>
      <p class="book-author">{{ book.author }}</p>
      <p class="book-category">{{ book.category }}</p>
      <div class="book-footer">
        <span :class="['badge', book.availableQuantity > 0 ? 'badge-available' : 'badge-unavailable']">
          {{ book.availableQuantity > 0 ? `${book.availableQuantity} available` : 'Not Available' }}
        </span>
        <div class="book-actions">
          <button
            v-if="book.availableQuantity > 0"
            class="btn-primary"
            data-testid="borrow-button"
            @click.stop="$emit('borrow', book._id)"
          >
            Borrow
          </button>
          <button
            v-else
            class="btn-secondary"
            disabled
          >
            Unavailable
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  book: { type: Object, required: true }
})
defineEmits(['borrow', 'view'])
</script>

<style scoped>
.book-card {
  display: flex;
  gap: 1rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.book-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.book-cover {
  flex-shrink: 0;
  width: 80px;
  height: 120px;
  background: #e2e8f0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-placeholder {
  font-size: 2rem;
}

.book-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.book-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.book-author {
  color: var(--text-light);
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.book-category {
  color: var(--text-light);
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
}

.book-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
