import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BookCard from '../BookCard.vue'

describe('BookCard', () => {
  const mockBook = {
    _id: '123',
    title: 'Test Book',
    author: 'Test Author',
    category: 'Fiction',
    availableQuantity: 3,
    totalQuantity: 5,
    publishedYear: 2024,
    description: 'A test book description',
  }

  it('renders book information correctly', () => {
    const wrapper = mount(BookCard, {
      props: { book: mockBook },
    })
    expect(wrapper.text()).toContain('Test Book')
    expect(wrapper.text()).toContain('Test Author')
    expect(wrapper.text()).toContain('Fiction')
  })

  it('shows available badge when copies are available', () => {
    const wrapper = mount(BookCard, {
      props: { book: mockBook },
    })
    expect(wrapper.text()).toContain('available')
  })

  it('shows unavailable badge when no copies available', () => {
    const wrapper = mount(BookCard, {
      props: { book: { ...mockBook, availableQuantity: 0 } },
    })
    expect(wrapper.text()).toContain('Unavailable')
  })

  it('emits borrow event when borrow button clicked', async () => {
    const wrapper = mount(BookCard, {
      props: { book: mockBook },
    })
    const borrowBtn = wrapper.find('[data-testid="borrow-button"]')
    await borrowBtn.trigger('click')
    expect(wrapper.emitted('borrow')).toBeTruthy()
    expect(wrapper.emitted('borrow')[0]).toEqual(['123'])
  })

  it('shows unavailable button when no copies available', () => {
    const wrapper = mount(BookCard, {
      props: { book: { ...mockBook, availableQuantity: 0 } },
    })
    // borrow button is not rendered; an 'Unavailable' disabled button is shown instead
    const borrowBtn = wrapper.find('[data-testid="borrow-button"]')
    expect(borrowBtn.exists()).toBe(false)
    expect(wrapper.text()).toContain('Unavailable')
  })

  it('emits view event when title/card is clicked', async () => {
    const wrapper = mount(BookCard, {
      props: { book: mockBook },
    })
    const title = wrapper.find('.book-title')
    await title.trigger('click')
    expect(wrapper.emitted('view')).toBeTruthy()
    expect(wrapper.emitted('view')[0]).toEqual(['123'])
  })
})
