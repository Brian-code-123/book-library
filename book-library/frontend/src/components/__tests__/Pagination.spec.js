import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Pagination from '../Pagination.vue'

describe('Pagination', () => {
  it('renders page info correctly', () => {
    const wrapper = mount(Pagination, {
      props: { currentPage: 2, totalPages: 5 },
    })
    expect(wrapper.text()).toContain('Page 2 of 5')
  })

  it('disables previous button on first page', () => {
    const wrapper = mount(Pagination, {
      props: { currentPage: 1, totalPages: 5 },
    })
    const prevBtn = wrapper.findAll('button')[0]
    expect(prevBtn.attributes('disabled')).toBeDefined()
  })

  it('disables next button on last page', () => {
    const wrapper = mount(Pagination, {
      props: { currentPage: 5, totalPages: 5 },
    })
    const buttons = wrapper.findAll('button')
    const nextBtn = buttons[buttons.length - 1]
    expect(nextBtn.attributes('disabled')).toBeDefined()
  })

  it('emits page-change on next click', async () => {
    const wrapper = mount(Pagination, {
      props: { currentPage: 2, totalPages: 5 },
    })
    const buttons = wrapper.findAll('button')
    const nextBtn = buttons[buttons.length - 1]
    await nextBtn.trigger('click')
    expect(wrapper.emitted('page-change')).toBeTruthy()
    expect(wrapper.emitted('page-change')[0]).toEqual([3])
  })

  it('emits page-change on previous click', async () => {
    const wrapper = mount(Pagination, {
      props: { currentPage: 3, totalPages: 5 },
    })
    const prevBtn = wrapper.findAll('button')[0]
    await prevBtn.trigger('click')
    expect(wrapper.emitted('page-change')).toBeTruthy()
    expect(wrapper.emitted('page-change')[0]).toEqual([2])
  })
})
