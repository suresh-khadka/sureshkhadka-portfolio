import { test, expect } from '@playwright/test';

test('notebook outputs render', async ({ page }) => {
  // Assuming dev server is running at localhost:5173
  await page.goto('/blogs/');
  
  // 1. Verify text output appears
  // From our simulation, we know "1.006638570722407" is a result in that notebook
  const textOutput = page.locator('text=1.006638570722407');
  await expect(textOutput).toBeVisible();
  
  // 2. Verify image output appears
  const imgOutput = page.locator('img[alt="Plot output"]');
  await expect(imgOutput).toBeVisible();
  
  console.log('SUCCESS: Verified text and image outputs are visible on the page for blog ');
});
