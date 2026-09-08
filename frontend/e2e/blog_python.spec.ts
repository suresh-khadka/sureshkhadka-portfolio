import { test, expect } from '@playwright/test';

test.describe('Blog Python Execution', () => {
  test('should execute python code and display output', async ({ page }) => {
    // Navigate to a blog post known to have python code
    // In a real scenario, we would seed this via API in a beforeAll hook
    await page.goto('/blogs/python-test'); 

    const runButton = page.locator('button:has-text("Run")').first();
    await expect(runButton).toBeVisible();
    
    await runButton.click();

    // Wait for the output to appear (Pyodide takes a moment to load and run)
    const output = page.locator('.bg-black.text-green-400');
    await expect(output).toBeVisible({ timeout: 15000 });
    
    // Check if output contains expected result (assuming 1+1=2 in the test blog)
    await expect(output).toContainText('2');
  });

  test('should render a plot when matplotlib is used', async ({ page }) => {
    await page.goto('/blogs/python-test');
    
    // Assuming the second code cell is a plot
    const runButtons = page.locator('button:has-text("Run")');
    if (await runButtons.count() > 1) {
      await runButtons.nth(1).click();
      
      const plotImage = page.locator('img[alt="Plot output"]');
      await expect(plotImage).toBeVisible({ timeout: 15000 });
    }
  });
});
