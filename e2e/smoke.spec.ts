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

  test('launches live demo sandbox and enters dashboard with accounts and forecast', async ({ page }) => {
    page.on('console', (msg) => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', (err) => console.log('BROWSER PAGEERROR:', err.message));

    await page.goto('/');
    await page.getByText('Launch Live Demo Sandbox').click();
    await expect(page.getByText('PORTFOLIO OVERVIEW')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/dashboard-screen.png' });
  });

  test('navigates through all core tabs and captures screenshots', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Launch Live Demo Sandbox').click();
    await expect(page.getByText('PORTFOLIO OVERVIEW')).toBeVisible({ timeout: 10000 });

    // Transactions
    await page.getByText('Transactions').click();
    await expect(page.getByText('verified ledger postings')).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'screenshots/transactions-screen.png' });

    // Rules
    await page.getByText('Rules').click();
    await expect(page.getByText('AUTOMATION RULES')).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'screenshots/rules-screen.png' });

    // Budgets
    await page.getByText('Budgets').click();
    await expect(page.getByText('MONTHLY BUDGETS')).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'screenshots/budgets-screen.png' });

    // Goals
    await page.getByText('Goals').click();
    await expect(page.getByText('SAVINGS GOALS')).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'screenshots/goals-screen.png' });

    // Activity
    await page.getByText('Activity').click();
    await expect(page.getByText('ACTIVITY & AUDIT LOG')).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'screenshots/activity-screen.png' });
  });
});
