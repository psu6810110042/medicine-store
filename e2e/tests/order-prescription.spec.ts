import { test, expect } from "@playwright/test";

test.setTimeout(60000);

test("Order Prescription Medicine Flow", async ({ page }) => {
	const randomEmail = `test_${Math.random().toString(36).substring(7)}@example.com`;
	const randomPhone = `08${Math.floor(10000000 + Math.random() * 90000000)}`;

	await page.goto("https://wd07.pupasoft.com");
	await expect(page).toHaveTitle("MEDS Project");

	const registerResponsePromise = page.waitForResponse(
		(response) =>
			response.url().includes("/auth/register") && response.status() === 201,
		{ timeout: 15000 },
	);
	const register_button = page.getByText("สมัครสมาชิก");
	await expect(register_button).toBeVisible();
	await register_button.click();

	await page.getByPlaceholder("ชื่อจริง นามสกุล").fill("E2E Test User");
	await page.getByPlaceholder("you@example.com").fill(randomEmail);
	await page.getByPlaceholder("08X-XXX-XXXX").fill(randomPhone);
	await page.getByPlaceholder("••••••••").fill("password123");
	await page.getByTitle("register_button").click();
	await registerResponsePromise;

	const loginResponsePromise = page.waitForResponse(
		(response) =>
			response.url().includes("/auth/login") && response.status() === 201,
		{ timeout: 15000 },
	);
	await page.goto("https://wd07.pupasoft.com");
	const login_button = page.getByText("เข้าสู่ระบบ").first();
	await login_button.click();
	await page.getByPlaceholder("you@example.com").fill(randomEmail);
	await page.getByPlaceholder("••••••••").fill("password123");
	await page.getByTitle("login_button").click();
	await loginResponsePromise;
	await page.waitForLoadState("networkidle");

	// 2. Navigate to products page and find a prescription product
	await page.goto("https://wd07.pupasoft.com/products");
	await expect(page).toHaveURL(/\/products/);

	// Wait for products to load
	await page.waitForSelector("[data-slot='card']");

	// Find a product card that has the "ใบสั่งแพทย์" prescription badge
	const prescriptionCard = page
		.locator("[data-slot='card']", {
			has: page.locator("[data-slot='badge']", { hasText: "ใบสั่งแพทย์" }),
		})
		.first();
	await expect(prescriptionCard).toBeVisible({ timeout: 10000 });

	const productName = await prescriptionCard.locator("h3").textContent();
	console.log(`Ordering product: ${productName}`);

	// Click "สั่งซื้อทันที" directly on the product card (bypasses the product detail page)
	const buyNowOnCard = prescriptionCard.getByText("สั่งซื้อทันที");
	await expect(buyNowOnCard).toBeVisible();
	await buyNowOnCard.click();

	await expect(page).toHaveURL(/\/cart\?buyNow=.+/, { timeout: 15000 });

	await page.locator("textarea").first().fill("123/45 E2E Test Road");

	const summaryColumn = page.locator(".lg\\:col-span-1");
	await summaryColumn.locator("input").nth(0).fill("Test Sub-district");
	await summaryColumn.locator("input").nth(1).fill("Test District");
	await summaryColumn.locator("input").nth(2).fill("Test Province");
	await summaryColumn.locator("input").nth(3).fill("10110");

	const fileChooserPromise = page.waitForEvent("filechooser");
	await page.getByText("คลิกเพื่ออัปโหลด").click();
	const fileChooser = await fileChooserPromise;
	await fileChooser.setFiles("test.png");

	// Wait for the preview to confirm file was accepted
	await expect(page.getByText("ตัวอย่างรูปใบสั่งยา")).toBeVisible({ timeout: 10000 });

	// Take a screenshot to debug state before clicking confirm
	await page.screenshot({ path: "test-results/before-checkout.png" });

	const checkoutButton = page.locator("button", { hasText: "ยืนยันการสั่งซื้อ" });
	await expect(checkoutButton).toBeEnabled({ timeout: 5000 });
	await checkoutButton.click();

	// Take a screenshot shortly after clicking to see what happened
	await page.waitForTimeout(2000);
	await page.screenshot({ path: "test-results/after-checkout-click.png" });

	// The prescription flow redirects to profile orders tab
	await page.waitForURL(/\/profile\?tab=orders/, { timeout: 30000 });
	await expect(page.getByText(/ส่งคำสั่งซื้อสำเร็จ/)).toBeVisible({ timeout: 5000 });

	console.log("Order created successfully!");
});

