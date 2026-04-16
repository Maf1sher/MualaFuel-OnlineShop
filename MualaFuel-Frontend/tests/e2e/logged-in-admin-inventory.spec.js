import { test, expect } from '@playwright/test';
import { AssortmentPage } from '../pages/AssortmentPage';
import { AdminPage } from '../pages/AdminPage';
import fs from 'fs';

const PRODUCT_INFO_PATH = 'playwright/.auth/product.json';

test.describe('Module: Inventory Management (Author: Dorota)', () => {
  let assortmentPage;
  let adminPage;
  let PRODUCT_NAME;

  test.beforeEach(async ({ page }) => {
    assortmentPage = new AssortmentPage(page);
    adminPage = new AdminPage(page);
    try {
        const testProduct = JSON.parse(fs.readFileSync(PRODUCT_INFO_PATH, 'utf-8'));
        PRODUCT_NAME = testProduct.name;
    } catch (e) { PRODUCT_NAME = 'TEST-PRODUCT-E2E'; }
    await page.goto('/home');
  });

  test('TC-AUTH-03: Access panel as Admin', async () => {
    await adminPage.navigateOrders();
    await expect(adminPage.page).toHaveURL(/.*\/ordersManagement/);
  });

  test('TC-PROD-03: Add new product (Admin Only)', async () => {
    await assortmentPage.navigate();
    await assortmentPage.page.getByTestId('product-card').first().waitFor({ state: 'visible' });
    await assortmentPage.openAddProductForm();
    const newName = `New Fuel ${Date.now()}`;
    
    await assortmentPage.page.getByTestId('product-name-input').fill(newName);
    await assortmentPage.page.getByTestId('product-brand-input').fill('BrandX');
    await assortmentPage.page.getByTestId('product-price-input').fill('50');
    await assortmentPage.page.getByTestId('product-description-input').fill('High quality fuel.');
    await assortmentPage.page.getByTestId('product-quantity-input').fill('10');
    await assortmentPage.page.getByTestId('product-alcohol-content-input').fill('40');
    await assortmentPage.page.getByTestId('product-capacity-input').fill('500');
    await assortmentPage.page.getByTestId('product-alcohol-type-select').selectOption('WODKA');
    
    await assortmentPage.page.getByTestId('product-form-submit-button').click();
    await assortmentPage.verifyToast(/success/i);
    await assortmentPage.searchProduct(newName);
    await expect(assortmentPage.page.getByTestId('product-card').filter({ hasText: newName })).toBeVisible();
  });

  test('TC-PROD-04: Edit product (Admin Only)', async () => {
    await assortmentPage.navigate();
    await assortmentPage.searchProduct(PRODUCT_NAME);
    await assortmentPage.editProduct(PRODUCT_NAME, 45.99);
    await assortmentPage.verifyToast(/success/i);
  });
});
