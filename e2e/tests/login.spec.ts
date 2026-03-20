import { test, expect } from "@playwright/test";

test("Is the page valid? checking title", async ({ page }) => {
	await page.goto("https://wd07.pupasoft.com");
	await expect(page).toHaveTitle("MEDS Project");
});

test("Register Flow && Login Flow", async ({ page }) => {
	await page.goto("https://wd07.pupasoft.com");
	const register_button = page.getByText("สมัครสมาชิก");
	await expect(register_button).toBeVisible();
	await register_button.click();

	await expect(page.getByText("มีบัญชีอยู่แล้วใช่ไหม?")).toBeVisible();
	await expect(page.getByPlaceholder("ชื่อจริง นามสกุล")).toBeVisible();
	await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
	await expect(page.getByPlaceholder("08X-XXX-XXXX")).toBeVisible();
	await expect(page.getByPlaceholder("••••••••")).toBeVisible();

	await page.getByPlaceholder("ชื่อจริง นามสกุล").fill("Test User");
	const randomEmail = Math.random().toString().slice(2) + "@email.com";
	const randomPhone = Math.random().toString().slice(2, 8);
	await page.getByPlaceholder("you@example.com").fill(randomEmail);
	await page.getByPlaceholder("08X-XXX-XXXX").fill(randomPhone);
	await page.getByPlaceholder("••••••••").fill("password");

	const register_submit_button = page.getByTitle("register_button");
	await register_submit_button.click();

	await page.goto("https://wd07.pupasoft.com");
	const login_button = page.getByText("เข้าสู่ระบบ");
	await expect(login_button).toBeVisible();
	await login_button.click();

	await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
	await expect(page.getByPlaceholder("••••••••")).toBeVisible();

	await page.getByPlaceholder("you@example.com").fill(randomEmail);
	await page.getByPlaceholder("••••••••").fill("password");

	const login_submit_button = page.getByTitle("login_button");
	await login_submit_button.click();
});
