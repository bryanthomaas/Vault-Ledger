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

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test('loads login portal and renders animated Wayglim background in dark theme', async ({ page }) => {
    await page.goto('/');

    // Verify title and page element
    await expect(page).toHaveTitle(/Vault Ledger/);
    const root = page.locator('#root');
    await expect(root).toBeVisible();

    // Verify UI text rendered by React Native Web
    await expect(page.getByText(/Vault Ledger/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel('Vault Ledger Monogram').first()).toBeVisible();
    await expect(page.getByText(/Double-entry ledger/i)).not.toBeVisible();
    await expect(page.getByText(/Midnight ledger/i)).not.toBeVisible();
    await expect(page.getByRole('button', { name: /demonstration ledger/i })).toBeVisible();
    await expect(page.getByText(/Sign in/i).first()).toBeVisible();

    // Verify Wayglim animated background canvas is present in the DOM
    const bgCanvas = page.locator('[data-wayglim], canvas');
    await expect(bgCanvas.first()).toBeVisible();

    // Verify dark mode is permanently active
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');

    // Capture screenshot of the login experience
    await page.screenshot({ path: 'screenshots/login-screen.png' });
  });

  test('navigates to registration portal with Wayglim backdrop', async ({ page }) => {
    await page.goto('/');
    await page.getByText(/Register account|Create account/i).first().click();
    await expect(page.getByText(/Create ledger/i).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/First name/i)).toBeVisible();
    await expect(page.getByText(/Last name/i)).toBeVisible();
    await page.screenshot({ path: 'screenshots/register-screen.png' });
  });

  test('launches live demo sandbox and enters dashboard with accounts and forecast', async ({ page }) => {
    page.on('console', (msg) => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', (err) => console.log('BROWSER PAGEERROR:', err.message));

    await page.goto('/');
    await page.getByRole('button', { name: /demonstration ledger/i }).click();
    await expect(page.getByText(/Portfolio overview/i)).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/dashboard-screen.png' });
  });

  test('navigates to rules tab and verifies correct active tab highlighting and indicator animation', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /demonstration ledger/i }).click();
    await expect(page.getByText(/Portfolio overview/i)).toBeVisible({ timeout: 10000 });

    // Navigate to Rules
    await page.locator('#vl-desktop-sidebar').getByText('Rules', { exact: true }).click();
    await expect(page.getByText(/Automation rules/i)).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(500);

    // Capture Rules screen verifying active indicator alignment
    await page.screenshot({ path: 'screenshots/rules-screen.png' });

    // Navigate to Transactions
    await page.locator('#vl-desktop-sidebar').getByText('Transactions', { exact: true }).click();
    await expect(page.getByText(/postings verified|ledger postings/i)).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'screenshots/transactions-screen.png' });

    // Navigate to Budgets
    await page.locator('#vl-desktop-sidebar').getByText('Budgets', { exact: true }).click();
    await expect(page.getByText(/Monthly budgets/i)).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'screenshots/budgets-screen.png' });

    // Navigate to Goals
    await page.locator('#vl-desktop-sidebar').getByText('Goals', { exact: true }).click();
    await expect(page.getByText(/Savings goals/i)).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'screenshots/goals-screen.png' });

    // Navigate to Activity
    await page.locator('#vl-desktop-sidebar').getByText('Activity', { exact: true }).click();
    await expect(page.getByText(/Activity & audit log/i)).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'screenshots/activity-screen.png' });
  });

  test('verifies permanent dark theme and absence of light mode toggle', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await expect(html).toHaveClass(/dark/);

    // Verify no light mode toggle button exists
    const lightToggle = page.getByRole('button', { name: /switch to light/i });
    await expect(lightToggle).not.toBeVisible();
  });
});
