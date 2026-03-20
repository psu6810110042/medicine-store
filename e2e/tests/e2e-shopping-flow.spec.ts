import { test, expect } from '@playwright/test';

test.describe('E2E Shopping Flow', () => {

  test('User should be able to complete the shopping journey', async ({ page }) => {
    
    await test.step('1. Login', async () => {
      await page.goto('https://wd07.pupasoft.com/');
      
      const login_button = page.getByText("เข้าสู่ระบบ", { exact: true });
      await expect(login_button).toBeVisible();
      await login_button.click();
      
      await expect(page.getByText("ยินดีต้อนรับกลับมา")).toBeVisible();
      await page.getByPlaceholder('you@example.com').fill('sorn@test.com');
      await page.getByPlaceholder('••••••••').fill('test123');
      
      const login_submit_button = page.getByTitle("login_button");    
      await login_submit_button.click();
      
      await expect(page.getByText('sorn@test.com')).toBeVisible();
    });

    await test.step('2. Search Product', async () => {
      await expect(page.getByPlaceholder('ค้นหายา...')).toBeVisible();
      await page.getByPlaceholder('ค้นหายา...').fill('500');
      
      const search_button = page.getByText('ค้นหา', { exact: true });
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
      await page.locator('button:has(svg.lucide-shopping-cart)').first().click();
    
      await page.getByRole('button', { name: /ดำเนินการชำระเงิน/ }).click();
    
      await expect(page).toHaveURL(/.*cart/);
    
      await expect(page.getByText('พาราเซตามอล 500mg').first()).toBeVisible();      
            
      const streetInput = page.locator('div').filter({ hasText: 'รายละเอียดที่อยู่ (บ้านเลขที่, ซอย, ถนน)' }).locator('textarea').first();
      await streetInput.fill('123 ม.อ. ถนนปุณณกัณฑ์');
      
      const subDistrictInput = page.locator('div').filter({ hasText: 'แขวง/ตำบล' }).locator('input').first();
      await subDistrictInput.fill('คอหงส์');
      
      const districtInput = page.locator('div').filter({ hasText: 'เขต/อำเภอ' }).locator('input').first();
      await districtInput.fill('หาดใหญ่');
      
      const provinceInput = page.locator('div').filter({ hasText: 'จังหวัด' }).locator('input').first();
      await provinceInput.fill('สงขลา');
      
      const postalCodeInput = page.locator('div').filter({ hasText: 'รหัสไปรษณีย์' }).locator('input').first();
      await postalCodeInput.fill('90110');
      
      const checkoutButton = page.getByRole('button', { name: 'ยืนยันการสั่งซื้อ' });
      await checkoutButton.click();   
    });

    await test.step('5. Upload Slip & Confirm Payment', async () => {
          
      const sampleSlipPath = '../../frontend/public/prescriptions/sample-prescription.jpg';
          
      await page.locator('input[type="file"]').setInputFiles(sampleSlipPath);
    
      const confirmPaymentButton = page.getByRole('button', { name: /แจ้งชำระเงิน|ยืนยัน/ });
      await confirmPaymentButton.click();
    }); 
  });
});