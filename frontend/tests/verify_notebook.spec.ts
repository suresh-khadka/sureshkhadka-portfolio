import { test, expect } from '@playwright/test';

test('verify blog output rendering', async ({ page }) => {
  // The server starts on various ports, we try the most common ones
  const ports = ['5173', '5174', '5175', '5176'];
  let success = false;

  for (const port of ports) {
    try {
      await page.goto(`http://localhost:${port}/blogs/dsasas`, { timeout: 5000 });
      if (page.url().includes('/blogs/dsasas')) {
        const textOutput = page.locator('text=1.006638570722407');
        if (await textOutput.isVisible()) {
          success = true;
          break;
        }
      }
    } catch (e) {}
  }

  if (!success) {
    throw new Error('Could not load the page or find the expected output text on any port');
  }

  const imgOutput = page.locator('img[alt="Plot output"]');
  await expect(imgOutput).toBeVisible();
  console.log('SUCCESS: Verified text and image outputs are visible on the page for blog dsasas');
});
