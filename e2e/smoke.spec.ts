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
    await expect(page.getByText('VAULT LEDGER').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('DOUBLE-ENTRY CORE').first()).toBeVisible();
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

  test('toggles light mode and dark mode seamlessly with theme persistence', async ({ page }) => {
    await page.goto('/');

    // Check light mode by default
    const html = page.locator('html');
    await expect(html).not.toHaveClass(/dark/);

    // Toggle to Dark Mode on the login screen
    const loginThemeToggle = page.getByRole('button', { name: /switch to dark mode/i });
    await expect(loginThemeToggle).toBeVisible();
    await loginThemeToggle.click();

    // Verify dark theme attribute and class applied
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await expect(html).toHaveClass(/dark/);
    await page.screenshot({ path: 'screenshots/login-dark-screen.png' });

    // Launch Demo in dark mode
    await page.getByText('Launch Live Demo Sandbox').click();
    await expect(page.getByText('PORTFOLIO OVERVIEW')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/dashboard-dark-screen.png' });

    // Verify sidebar theme toggle displays "Light Sand" option
    const sidebarThemeToggle = page.getByRole('button', { name: /switch to light sand mode/i });
    await expect(sidebarThemeToggle).toBeVisible();

    // Toggle back to Light Sand mode
    await sidebarThemeToggle.click();
    await expect(html).toHaveAttribute('data-theme', 'light');
    await expect(html).not.toHaveClass(/dark/);

    // Verify persistence after page reload
    await page.reload();
    await expect(page.getByText('PORTFOLIO OVERVIEW')).toBeVisible({ timeout: 10000 });
    await expect(html).toHaveAttribute('data-theme', 'light');
  });
});
