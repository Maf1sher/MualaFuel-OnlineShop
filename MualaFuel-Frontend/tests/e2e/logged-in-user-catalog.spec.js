import { test, expect } from '@playwright/test';
import { AssortmentPage } from '../pages/AssortmentPage';
import fs from 'fs';

const PRODUCT_INFO_PATH = 'playwright/.auth/product.json';

test.describe('Module: Catalog & Identity (Author: Barbara)', () => {
  let assortmentPage;
  let PRODUCT_NAME;

  test.beforeEach(async ({ page }) => {
    assortmentPage = new AssortmentPage(page);
    try {
        const testProduct = JSON.parse(fs.readFileSync(PRODUCT_INFO_PATH, 'utf-8'));
        PRODUCT_NAME = testProduct.name;
    } catch (e) { PRODUCT_NAME = 'TEST-PRODUCT-E2E'; }
    await page.goto('/home');
  });

  test('TC-AUTH-02: User Identity verification', async ({ page }) => {
    await expect(page.getByTestId('test-id-user').textContent()).resolves.toEqual('karol nowak');
  });

  test('TC-PROD-01: Browsing and searching products', async () => {
    await assortmentPage.navigate();
    await assortmentPage.searchProduct(PRODUCT_NAME);
    const productCard = assortmentPage.page.getByTestId('product-card').filter({ hasText: PRODUCT_NAME });
    await expect(productCard).toBeVisible();
    await expect(productCard.getByTestId('product-name')).toContainText(PRODUCT_NAME);
  });

  test('TC-PROD-02: Product details', async () => {
    await assortmentPage.navigate();
    await assortmentPage.searchProduct(PRODUCT_NAME);
    await assortmentPage.openProductDetails(PRODUCT_NAME);
    await expect(assortmentPage.page).toHaveURL(/.*\/product\/\d+/);
    await expect(assortmentPage.page.locator('h1')).toBeVisible();
  });
});
