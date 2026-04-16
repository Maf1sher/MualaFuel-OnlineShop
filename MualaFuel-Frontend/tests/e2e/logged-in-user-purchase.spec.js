import { test, expect } from '@playwright/test';
import { AssortmentPage } from '../pages/AssortmentPage';
import { CartPage } from '../pages/CartPage';
import fs from 'fs';

const PRODUCT_INFO_PATH = 'playwright/.auth/product.json';

test.describe('Module: Purchase Flow (Author: Cezary)', () => {
  let assortmentPage;
  let cartPage;
  let PRODUCT_NAME;

  test.beforeEach(async ({ page }) => {
    assortmentPage = new AssortmentPage(page);
    cartPage = new CartPage(page);
    try {
        const testProduct = JSON.parse(fs.readFileSync(PRODUCT_INFO_PATH, 'utf-8'));
        PRODUCT_NAME = testProduct.name;
    } catch (e) { PRODUCT_NAME = 'TEST-PRODUCT-E2E'; }
    await page.goto('/home');
  });

  test('TC-CART-01: Adding product to cart', async () => {
    await assortmentPage.navigate();
    await assortmentPage.searchProduct(PRODUCT_NAME);
    await assortmentPage.addProductToCart(PRODUCT_NAME);
    await assortmentPage.verifyToast(/success/i);
  });

  test('TC-CART-02: Managing cart content', async () => {
    await assortmentPage.navigate();
    await assortmentPage.searchProduct(PRODUCT_NAME);
    await assortmentPage.addProductToCart(PRODUCT_NAME);
    await cartPage.navigate();
    await cartPage.changeQuantity(PRODUCT_NAME, true);
    await cartPage.removeItem(PRODUCT_NAME);
    await expect(cartPage.page.getByText('Your cart is currently empty')).toBeVisible();
  });

  test('TC-ORDER-01: Checkout process', async () => {
    await assortmentPage.navigate();
    await assortmentPage.searchProduct(PRODUCT_NAME);
    await assortmentPage.addProductToCart(PRODUCT_NAME);
    await cartPage.navigate();
    await cartPage.checkout({
      country: 'Poland',
      city: 'Krakow',
      zipCode: '30-001',
      street: 'Main St 1'
    });
    await cartPage.verifyToast(/success/i);
    await expect(cartPage.page).toHaveURL(/.*\/orders/);
  });
});
