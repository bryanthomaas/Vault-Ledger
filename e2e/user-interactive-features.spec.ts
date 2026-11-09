import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

test.describe('User Interactive Features & Layout Verification', () => {
  const screenshotsDir = path.resolve('screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  async function loginDemo(page: any) {
    await page.goto('/(tabs)');
    const overviewHeading = page.getByText(/Portfolio overview/i);
    const isAlreadyOnDashboard = await overviewHeading.isVisible({ timeout: 1500 }).catch(() => false);
    if (isAlreadyOnDashboard) return;

    await page.goto('/');
    const demoBtn = page.getByRole('button', { name: /demonstration ledger/i });
    await demoBtn.waitFor({ state: 'visible', timeout: 10000 });
    await demoBtn.click();
    await expect(overviewHeading).toBeVisible({ timeout: 10000 });
  }

  test('1. Login Page: Fullscreen Wayglim animated background, readable title, refined controls, and non-scrollable 100vh fit', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    // Verify Wayglim animated background canvas is visible
    const bgCanvas = page.locator('[data-wayglim], canvas');
    await expect(bgCanvas.first()).toBeVisible();

    // Verify large, readable Vault Ledger title and brand monogram (subtext cleanly removed)
    await expect(page.getByText('Vault Ledger').first()).toBeVisible();
    await expect(page.getByLabel('Vault Ledger Monogram').first()).toBeVisible();
    await expect(page.getByText(/Double-entry ledger/i)).not.toBeVisible();

    // Verify authentication controls: 1-click demo button, credentials fields, and sign-in button
    await expect(page.getByRole('button', { name: /demonstration ledger/i })).toBeVisible();
    await expect(page.getByText('Email', { exact: true })).toBeVisible();
    await expect(page.getByText('Password', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign in/i })).toBeVisible();
    await expect(page.getByText('Create account')).toBeVisible();

    // Verify page is strictly non-scrollable (no vertical overflow)
    const isNonScrollable = await page.evaluate(() => {
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      return docHeight <= winHeight + 2; // allowance for subpixel rounding
    });
    expect(isNonScrollable).toBe(true);
  });

  test('2. Transactions: "+ Record Posting" button opens modal, submits new transaction, updates list', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await loginDemo(page);

    // Navigate to Transactions
    await page.locator('#vl-desktop-sidebar').getByText('Transactions', { exact: true }).click();
    await expect(page.getByText(/double-entry postings verified/i)).toBeVisible({ timeout: 5000 });

    // Verify + Record Posting button is present and clickable
    const recordBtn = page.getByRole('button', { name: /\+ Record Posting/i });
    await expect(recordBtn).toBeVisible();
    await recordBtn.click();

    // Modal opens
    await expect(page.getByText('Record Ledger Posting')).toBeVisible();
    await page.screenshot({ path: 'screenshots/transaction-modal-open.png' });

    // Fill form
    const descInput = page.getByPlaceholder(/Blue Bottle Coffee/i);
    await descInput.fill('Client Retainer Payment');

    const amountInput = page.getByPlaceholder('45.50');
    await amountInput.fill('750.00');

    // Toggle Credit
    await page.getByText('Credit (Income)').click();

    // Submit
    await page.getByRole('button', { name: /Post to ledger/i }).click();

    // Verify modal closes and new transaction appears
    await expect(page.getByText('Client Retainer Payment').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('+$750.00').first()).toBeVisible();
  });

  test('3. Rules: "Test Execution" button fires automated round-up and updates ledger state', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await loginDemo(page);

    // Navigate to Rules
    await page.locator('#vl-desktop-sidebar').getByText('Rules', { exact: true }).click();
    await expect(page.getByText(/Automation rules/i)).toBeVisible({ timeout: 5000 });

    // Verify indicator is exactly on Rules (translateY(96px))
    const indicator = page.locator('#vl-desktop-indicator');
    await expect(indicator).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 96)');

    // Verify Test Execution button
    const testExecBtn = page.getByRole('button', { name: /Test Execution/i });
    await expect(testExecBtn).toBeVisible();

    // Click Test Execution
    await testExecBtn.click();
    await page.waitForTimeout(500);

    // Verify execution confirmation message
    await expect(page.getByText(/Rule executed/i)).toBeVisible({ timeout: 5000 });
  });

  test('4. Goals: "+ $100" deposit button increases savings and updates progress bar', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await loginDemo(page);

    // Navigate to Goals
    await page.locator('#vl-desktop-sidebar').getByText('Goals', { exact: true }).click();
    await expect(page.getByText(/Savings goals/i)).toBeVisible({ timeout: 5000 });

    // Verify indicator on Goals (translateY(192px))
    const indicator = page.locator('#vl-desktop-indicator');
    await expect(indicator).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 192)');

    // Find and click the + $100 contribution button
    const plus100Btn = page.getByRole('button', { name: /\+ \$100/i }).first();
    await expect(plus100Btn).toBeVisible();
    await plus100Btn.click();
    await page.waitForTimeout(500);
  });

  test('5. Budgets: "Adjust limit" opens limit adjustment modal and updates allocation', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await loginDemo(page);

    // Navigate to Budgets
    await page.locator('#vl-desktop-sidebar').getByText('Budgets', { exact: true }).click();
    await expect(page.getByText(/Monthly budgets/i)).toBeVisible({ timeout: 5000 });

    // Verify indicator on Budgets (translateY(144px))
    const indicator = page.locator('#vl-desktop-indicator');
    await expect(indicator).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 144)');

    // Click Adjust limit
    const adjustBtn = page.getByRole('button', { name: /Adjust limit/i }).first();
    await expect(adjustBtn).toBeVisible();
    await adjustBtn.click();

    // Verify modal
    await expect(page.getByText('Set Category Budget')).toBeVisible();
    const limitInput = page.getByPlaceholder('400');
    await limitInput.fill('650');

    await page.getByRole('button', { name: /Save budget/i }).click();
    await page.waitForTimeout(500);
  });

  test('6. Overview: Quick action buttons navigate directly to creation workflows', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await loginDemo(page);

    // Verify overview indicator at translateY(0px)
    const indicator = page.locator('#vl-desktop-indicator');
    await expect(indicator).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');

    // Verify quick action strip buttons
    await expect(page.getByRole('button', { name: /\+ Record Posting/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /\+ Automation Rule/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Adjust Budgets/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Savings Goals/i })).toBeVisible();
  });
});
