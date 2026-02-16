<template>
  <div class="pagination" v-if="totalPages > 1">
    <button
      :disabled="currentPage <= 1"
      @click="$emit('page-change', currentPage - 1)"
    >
      ← Previous
    </button>
    <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
    <button
      :disabled="currentPage >= totalPages"
      @click="$emit('page-change', currentPage + 1)"
    >
      Next →
    </button>
  </div>
</template>

<script setup>
defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true }
})
defineEmits(['page-change'])
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem;
}

.pagination button {
  background: var(--primary);
  color: white;
  padding: 0.5rem 1rem;
}

.pagination button:disabled {
  background: var(--border);
  color: var(--text-light);
  cursor: not-allowed;
}

.page-info {
  color: var(--text-light);
  font-size: 0.875rem;
}
</style>
