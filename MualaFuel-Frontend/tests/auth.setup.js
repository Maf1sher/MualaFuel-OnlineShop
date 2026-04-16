import { test as setup, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import fs from 'fs';
import path from 'path';

const ADMIN_STORAGE_STATE = 'playwright/.auth/admin.json';
const USER_STORAGE_STATE = 'playwright/.auth/user.json';
const PRODUCT_INFO_PATH = 'playwright/.auth/product.json';

const ADMIN = { email: 'jan@mail.com', password: '12345678' };
const USER = { email: 'karol@mail.com', password: '12345678' };

setup('authenticate as admin', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login(ADMIN.email, ADMIN.password);
  await expect(page).toHaveURL(/.*\/home/);
  
  await page.waitForFunction(() => localStorage.getItem('isLoggedIn') === '1');

  // Generate UNIQUE name
  const uniqueId = Date.now();
  const PRODUCT_NAME = `TEST-PROD-${uniqueId}`;

  await page.goto('/assortment');
  const menuBtn = page.getByTestId('user-menu-button');
  await menuBtn.waitFor({ state: 'visible' });
  await menuBtn.click();
  await page.getByTestId('add-product-menu-item').click();

  await page.getByTestId('product-name-input').fill(PRODUCT_NAME);
  await page.getByTestId('product-brand-input').fill('E2E-BRAND');
  await page.getByTestId('product-price-input').fill('10.00');
  await page.getByTestId('product-description-input').fill('Dedicated product for E2E testing.');
  await page.getByTestId('product-quantity-input').fill('9999');
  await page.getByTestId('product-alcohol-content-input').fill('5');
  await page.getByTestId('product-capacity-input').fill('500');
  await page.getByTestId('product-alcohol-type-select').selectOption('BEER');
  
  await page.getByTestId('product-form-submit-button').click();
  await expect(page.locator('div[role="status"]')).toBeVisible();

  // Save product name for other tests
  if (!fs.existsSync(path.dirname(PRODUCT_INFO_PATH))) {
    fs.mkdirSync(path.dirname(PRODUCT_INFO_PATH), { recursive: true });
  }
  fs.writeFileSync(PRODUCT_INFO_PATH, JSON.stringify({ name: PRODUCT_NAME }));
  
  await page.context().storageState({ path: ADMIN_STORAGE_STATE });
});

setup('authenticate as user', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login(USER.email, USER.password);
  await expect(page).toHaveURL(/.*\/home/);

  await page.waitForFunction(() => localStorage.getItem('isLoggedIn') === '1');

  await page.context().storageState({ path: USER_STORAGE_STATE });
});
