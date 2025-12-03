import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.getByRole('heading', { name: /connexion/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /se connecter/i })).toBeVisible();
  });

  test('should display signup page', async ({ page }) => {
    await page.goto('/signup');
    
    await expect(page.getByRole('heading', { name: /créer un compte/i })).toBeVisible();
    await expect(page.getByLabel(/nom complet/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('should navigate from login to signup', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByRole('link', { name: /créer un compte/i }).click();
    
    await expect(page).toHaveURL('/signup');
  });

  test('should navigate from signup to login', async ({ page }) => {
    await page.goto('/signup');
    
    await page.getByRole('link', { name: /se connecter/i }).click();
    
    await expect(page).toHaveURL('/login');
  });

  test('should show forgot password page', async ({ page }) => {
    await page.goto('/forgot-password');
    
    await expect(page.getByRole('heading', { name: /mot de passe oublié/i })).toBeVisible();
  });

  test('should redirect to login when accessing protected route', async ({ page }) => {
    await page.goto('/campaigns');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Redirection', () => {
  test('should redirect root to login', async ({ page }) => {
    await page.goto('/');
    
    // La page d'accueil redirige vers login
    await expect(page).toHaveURL('/login');
  });
});
