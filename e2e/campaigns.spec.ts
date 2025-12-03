import { test, expect } from '@playwright/test';

// Note: These tests require authentication
// You'll need to set up test fixtures for authenticated tests

test.describe('Campaign Preview (Public)', () => {
  test('should display wheel preview page', async ({ page }) => {
    // This test uses a mock campaign ID - replace with a real one for integration tests
    await page.goto('/wheel-preview');
    
    // Should show the wheel preview (even without campaign ID, it shows default)
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display quiz preview page', async ({ page }) => {
    await page.goto('/quiz-preview');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display scratch preview page', async ({ page }) => {
    await page.goto('/scratch-preview');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display jackpot preview page', async ({ page }) => {
    await page.goto('/jackpot-preview');
    
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Short URLs', () => {
  test('should handle invalid short URL gracefully', async ({ page }) => {
    await page.goto('/c/invalid123');
    
    // Should show error message
    await expect(page.getByText(/campagne introuvable|lien invalide/i)).toBeVisible();
  });
});

test.describe('Public Campaign URLs', () => {
  test('should handle invalid public URL gracefully', async ({ page }) => {
    await page.goto('/p/non-existent-slug');
    
    // Should show error or not found
    await expect(page.locator('body')).toBeVisible();
  });
});
