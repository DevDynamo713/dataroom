import { test, expect } from '@playwright/test';
test('dataroom loads and creates pipeline', async ({ page }) => {
  await page.goto('http://localhost:3000/room/demo');
  await expect(page.locator('h1')).toContainText('DataRoom: demo');
  await page.locator('.name-input').fill('user-sync');
  await page.locator('.source-input').selectOption('api');
  await page.locator('.destination-input').fill('warehouse');
  await page.locator('.add-btn').click();
  await expect(page.locator('.pipeline-list').locator('div').first()).toBeVisible();
});