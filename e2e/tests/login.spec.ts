import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('http://localhost:3000');

    await expect(page).toHaveTitle(/Medicine Store/);
});

test('get started link', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.getByText('เข้าสู่ระบบ').click();

    // Expects page to have a heading with the name of Installation.
    // await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});
