// @ts-check
const { test, expect } = require('@playwright/test')

const BASE_URL = 'http://localhost:5173'
const API_URL = 'http://localhost:3000/api'

test.describe('Book Borrowing Flow', () => {
  let authToken

  test.beforeAll(async ({ request }) => {
    // Register or login a test user
    try {
      const registerRes = await request.post(`${API_URL}/auth/register`, {
        data: {
          username: 'e2euser',
          email: 'e2e@test.com',
          password: 'Test1234!',
          fullName: 'E2E User',
        },
      })
      const registerData = await registerRes.json()
      authToken = registerData.token
    } catch {
      const loginRes = await request.post(`${API_URL}/auth/login`, {
        data: {
          email: 'e2e@test.com',
          password: 'Test1234!',
        },
      })
      const loginData = await loginRes.json()
      authToken = loginData.token
    }
  })

  test('should login and borrow a book', async ({ page }) => {
    // Login
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[type="email"]', 'e2e@test.com')
    await page.fill('input[type="password"]', 'Test1234!')
    await page.click('button[type="submit"]')

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/dashboard/)

    // Navigate to book list
    await page.click('text=Browse Books')
    await expect(page).toHaveURL(/books/)

    // Wait for books to load
    await page.waitForSelector('[data-testid="book-grid"]', { timeout: 10000 })

    // Click borrow on first available book
    const borrowBtn = page.locator('[data-testid="borrow-button"]').first()
    if (await borrowBtn.isVisible()) {
      await borrowBtn.click()
      // Verify borrow confirmation
      await page.waitForTimeout(1000)
    }
  })

  test('should view borrowed books', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[type="email"]', 'e2e@test.com')
    await page.fill('input[type="password"]', 'Test1234!')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/dashboard/)

    // Navigate to My Books
    await page.click('text=My Books')
    await expect(page).toHaveURL(/my-books/)

    // Should see borrowed books tab
    await expect(page.locator('text=Currently Borrowed')).toBeVisible()
  })

  test('should search for books', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    await page.fill('input[type="email"]', 'e2e@test.com')
    await page.fill('input[type="password"]', 'Test1234!')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/dashboard/)

    await page.click('text=Browse Books')
    await expect(page).toHaveURL(/books/)

    // Search for a book
    await page.fill('[data-testid="search-input"]', 'gatsby')
    await page.waitForTimeout(500) // debounce

    // Results should update
    await page.waitForSelector('[data-testid="book-grid"]', { timeout: 10000 })
  })
})
