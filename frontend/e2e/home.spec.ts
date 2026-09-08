import { test, expect } from '@playwright/test';

test('Home page loads and displays hero section', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Suresh Khadka/);
  const hero = page.locator('h1');
  await expect(hero).toBeVisible();
});
