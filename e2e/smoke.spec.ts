import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

test.describe('Vault Ledger Web Application Smoke Test', () => {
  test.beforeAll(async () => {
    const dir = path.resolve('screenshots');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  test('loads login portal and renders demo button', async ({ page }) => {
    await page.goto('/');

    // Verify title and page element
    await expect(page).toHaveTitle(/Vault Ledger/);
    const root = page.locator('#root');
    await expect(root).toBeVisible();

    // Verify UI text rendered by React Native Web
    await expect(page.getByText('VAULT LEDGER')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('DOUBLE-ENTRY CORE')).toBeVisible();
    await expect(page.getByText('Launch Live Demo Sandbox')).toBeVisible();
    await expect(page.getByText('Sign In', { exact: true }).first()).toBeVisible();

    // Capture screenshot of the login experience
    await page.screenshot({ path: 'screenshots/login-screen.png' });
  });

  test('navigates to registration portal', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Create Account').click();
    await expect(page.getByText('Create Ledger')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('FIRST NAME')).toBeVisible();
    await expect(page.getByText('LAST NAME')).toBeVisible();
    await page.screenshot({ path: 'screenshots/register-screen.png' });
  });
});
