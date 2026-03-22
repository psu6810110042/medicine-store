import { test, expect } from '@playwright/test';

test('pharmacist can switch tabs and use over-500 filter on pharmacy page', async ({ page }) => {
  await page.goto('http://localhost:3000/pharmacy', { waitUntil: 'networkidle' });
  await expect(page).toHaveURL(/\/pharmacy/);

  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByText('ระบบเภสัชกร')).toBeVisible({ timeout: 15000 });

  const pendingTab = page.getByRole('tab', { name: /รอชำระเงิน/i });
  const reviewTab = page.getByRole('tab', { name: /รอเภสัชตรวจสอบอนุมัติ/i });
  const processingTab = page.getByRole('tab', { name: /กำลังดำเนินการ/i });

  await expect(pendingTab).toBeVisible({ timeout: 10000 });
  await expect(reviewTab).toBeVisible({ timeout: 10000 });
  await expect(processingTab).toBeVisible({ timeout: 10000 });

  await reviewTab.click();
  await expect(page.getByText(/รายการ:/).first()).toBeVisible({ timeout: 10000 });

  const over500Filter = page.getByRole('button', { name: /ยอดเกิน 500/i });
  await expect(over500Filter).toBeVisible({ timeout: 10000 });
  await over500Filter.click();

  await expect(over500Filter).toBeVisible();

  const allFilter = page.getByRole('button', { name: /^ทั้งหมด$/i });
  await expect(allFilter).toBeVisible({ timeout: 10000 });
  await allFilter.click();

  await expect(
    page.getByPlaceholder(/ค้นหาเลขออเดอร์|ลูกค้า|ชื่อยา/i)
  ).toBeVisible({ timeout: 10000 });

  await processingTab.click();
  await expect(page.getByText('ระบบเภสัชกร')).toBeVisible();
});