import { test, expect } from '@playwright/test';
test('dataroom loads and adds dataset', async ({ page }) => {
  await page.goto('http://localhost:3000/room/demo');
  await expect(page.locator('h1')).toContainText('DataRoom: demo');
  await page.locator('.name-input').fill('users');
  await page.locator('.owner-input').fill('team-a');
  await page.locator('.add-btn').click();
  await expect(page.locator('.dataset-list').locator('div').first()).toBeVisible();
});