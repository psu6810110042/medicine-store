import { test, expect, Page } from '@playwright/test';
import * as path from 'path';

const BASE_URL = 'https://wd07.pupasoft.com/';
// __dirname = /workspace/e2e/tests → go up 2 levels to reach /workspace/frontend/...
const SAMPLE_SLIP_PATH = path.resolve(__dirname, '../../frontend/public/prescriptions/sample-prescription.jpg');

test.describe('E2E Shopping Flow', () => {

  test('User should be able to complete the shopping journey', async ({ page }: { page: Page }) => {
    
    await test.step('1. Login', async () => {
      await page.goto(BASE_URL);
      
      const login_button = page.getByRole('button', { name: 'เข้าสู่ระบบ', exact: true }).first();
      await expect(login_button).toBeVisible();
      await login_button.click();
      
      await expect(page.getByText('ยินดีต้อนรับกลับมา')).toBeVisible();
      await page.getByPlaceholder('you@example.com').fill('sorn@test.com');
      await page.getByPlaceholder('••••••••').fill('test123');
      
      const login_submit_button = page.getByTitle("login_button");    
      await login_submit_button.click();
      
      await expect(page.getByText('sorn@test.com')).toBeVisible();
    });

    await test.step('2. Search Product', async () => {
      await expect(page.getByPlaceholder('ค้นหายา...')).toBeVisible();
      await page.getByPlaceholder('ค้นหายา...').fill('500');
      
      const search_button = page.getByRole('button', { name: 'ค้นหา', exact: true });
      await search_button.click();
      
      await expect(page).toHaveURL(/.*search=500/);
      await expect(page.getByText("พาราเซตามอล 500mg")).toBeVisible();
    });

    await test.step('3. Add to Cart', async () => {
      const productCard = page.locator('.cursor-pointer').filter({ hasText: 'พาราเซตามอล 500mg' });
      await productCard.getByRole('button', { name: 'ใส่ตะกร้า' }).click();
      
      await expect(page.getByText(/เพิ่ม.*ลงตะกร้าแล้ว/)).toBeVisible();
    });

    await test.step('4. Check Cart & Confirm Buying', async () => {
      // Open cart sheet
      await page.locator('button:has(svg.lucide-shopping-cart)').first().click();
      
      // Proceed to cart page
      await page.getByRole('button', { name: /ดำเนินการชำระเงิน/ }).click();
      await expect(page).toHaveURL(/.*cart/);
      await expect(page.getByText('พาราเซตามอล 500mg').first()).toBeVisible();      
            
      // Fill address fields
      await page.locator('textarea').first().fill('123 ม.อ. ถนนปุณณกัณฑ์');
      await page.locator('div').filter({ hasText: /^แขวง\/ตำบล$/ }).locator('input').fill('คอหงส์');
      await page.locator('div').filter({ hasText: /^เขต\/อำเภอ$/ }).locator('input').fill('หาดใหญ่');
      await page.locator('div').filter({ hasText: /^จังหวัด$/ }).locator('input').fill('สงขลา');
      await page.locator('div').filter({ hasText: /^รหัสไปรษณีย์$/ }).locator('input').fill('90110');
      
      const checkoutButton = page.getByRole('button', { name: 'ยืนยันการสั่งซื้อ' });
      await checkoutButton.click();   
    });

    await test.step('5. Upload Slip & Confirm Payment', async () => {
      await expect(page).toHaveURL(/\/payment\//);
      
      // Select payment method (default is Bank Transfer)
      await page.getByRole('button', { name: 'โอนธนาคาร' }).click();
      
      // Upload slip
      await page.locator('input[type="file"]').setInputFiles(SAMPLE_SLIP_PATH);
    
      const confirmPaymentButton = page.getByRole('button', { name: 'ยืนยันการชำระเงิน' });
      await confirmPaymentButton.click();
      
      await expect(page.getByText('ส่งหลักฐานเรียบร้อย')).toBeVisible();
    }); 
  });

  test('New User should be able to register, login and shop', async ({ page }: { page: Page }) => {
    // Note: Using a unique email for registration to avoid "email already exists" error
    const timestamp = Date.now();
    const newUserEmail = `testuser_${timestamp}@test.com`;
    const password = 'test123';

    await test.step('1. Register', async () => {
      await page.goto(BASE_URL);
      
      const register_button = page.getByRole('button', { name: 'สมัครสมาชิก', exact: true }).first();
      await expect(register_button).toBeVisible();
      await register_button.click();
      
      await expect(page.getByText('สร้างบัญชีใหม่')).toBeVisible();
      await page.getByPlaceholder('ชื่อจริง นามสกุล').fill('Sorn Test User');
      await page.getByPlaceholder('you@example.com').fill(newUserEmail);
      await page.getByPlaceholder('08X-XXX-XXXX').fill('0812345678');
      await page.getByPlaceholder('••••••••').fill(password);
      
      await page.getByTitle('register_button').click();
      
      // Should switch to login modal
      await expect(page.getByText('ยินดีต้อนรับกลับมา')).toBeVisible();
    });

    await test.step('2. Login', async () => {
      await page.getByPlaceholder('you@example.com').fill(newUserEmail);
      await page.getByPlaceholder('••••••••').fill(password);
      
      await page.getByTitle('login_button').click();
      
      await expect(page.getByText(newUserEmail)).toBeVisible();
    });

    await test.step('3. Shopping Flow', async () => {
      // Search
      await page.getByPlaceholder('ค้นหายา...').fill('500');
      await page.getByRole('button', { name: 'ค้นหา', exact: true }).click();
      
      // Add to Cart
      const productCard = page.locator('.cursor-pointer').filter({ hasText: 'พาราเซตามอล 500mg' });
      await productCard.getByRole('button', { name: 'ใส่ตะกร้า' }).click();
      
      // Checkout
      await page.locator('button:has(svg.lucide-shopping-cart)').first().click();
      await page.getByRole('button', { name: /ดำเนินการชำระเงิน/ }).click();
      
      // Full address
      await page.locator('textarea').first().fill('123 ถนนทดสอบ');
      await page.locator('div').filter({ hasText: /^แขวง\/ตำบล$/ }).locator('input').fill('ตำบลทดสอบ');
      await page.locator('div').filter({ hasText: /^เขต\/อำเภอ$/ }).locator('input').fill('อำเภอทดสอบ');
      await page.locator('div').filter({ hasText: /^จังหวัด$/ }).locator('input').fill('จังหวัดทดสอบ');
      await page.locator('div').filter({ hasText: /^รหัสไปรษณีย์$/ }).locator('input').fill('12345');
      
      await page.getByRole('button', { name: 'ยืนยันการสั่งซื้อ' }).click();
      
      // Payment
      await page.locator('input[type="file"]').setInputFiles(SAMPLE_SLIP_PATH);
      await page.getByRole('button', { name: 'ยืนยันการชำระเงิน' }).click();
      
      await expect(page.getByText('ส่งหลักฐานเรียบร้อย')).toBeVisible();
    });
  });
});