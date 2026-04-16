import { test, expect } from '@playwright/test';
import { AssortmentPage } from '../pages/AssortmentPage';
import { CartPage } from '../pages/CartPage';
import { AdminPage } from '../pages/AdminPage';
import { OrdersPage } from '../pages/OrdersPage';
import fs from 'fs';

const PRODUCT_INFO_PATH = 'playwright/.auth/product.json';

test.describe('Module: Audit & Operations (Author: Edward)', () => {
  let assortmentPage;
  let adminPage;
  let cartPage;
  let ordersPage;
  let PRODUCT_NAME;

  test.beforeEach(async ({ page }) => {
    assortmentPage = new AssortmentPage(page);
    adminPage = new AdminPage(page);
    cartPage = new CartPage(page);
    ordersPage = new OrdersPage(page);

    try {
        const testProduct = JSON.parse(fs.readFileSync(PRODUCT_INFO_PATH, 'utf-8'));
        PRODUCT_NAME = testProduct.name;
    } catch (e) { PRODUCT_NAME = 'TEST-PRODUCT-E2E'; }
    await page.goto('/home');
  });

  test('TC-ORDER-02: User order history verification', async () => {
    await assortmentPage.navigate();
    await assortmentPage.searchProduct(PRODUCT_NAME);
    await assortmentPage.addProductToCart(PRODUCT_NAME);
    await cartPage.navigate();
    await cartPage.checkout({ country: 'P', city: 'K', zipCode: '0', street: 'M' });
    await ordersPage.navigate();
    await expect(ordersPage.page.getByTestId('order-card').first()).toBeVisible();
  });

  test('TC-ADMIN-01: Order status management (Admin)', async ({ browser }) => {
    const userContext = await browser.newContext({ storageState: 'playwright/.auth/user.json' });
    const userPage = await userContext.newPage();
    const uAssortment = new AssortmentPage(userPage);
    const uCart = new CartPage(userPage);

    await uAssortment.navigate();
    await uAssortment.searchProduct(PRODUCT_NAME);
    await uAssortment.addProductToCart(PRODUCT_NAME);
    await uCart.navigate();
    await uCart.checkout({ country: 'P', city: 'K', zipCode: '0', street: 'M' });
    
    const orderHeader = userPage.locator('h2', { hasText: /Order #/ }).first();
    await orderHeader.waitFor({ state: 'visible' });
    const orderId = (await orderHeader.textContent()).replace('Order # ', '').trim();
    await userContext.close();

    await adminPage.navigateOrders();
    const card = adminPage.page.getByTestId('order-card').filter({ has: adminPage.page.locator('h2', { hasText: new RegExp(`^Order # ${orderId}$`) }) });
    await expect(card.getByTestId('order-status')).toHaveText('NEW');
    await adminPage.changeOrderStatus(orderId);
    await adminPage.verifyToast(/updated/i);
  });

  test('TC-ADMIN-02: Email history and audit (Admin)', async () => {
    await adminPage.navigateEmails();
    await expect(adminPage.page.locator('tr').nth(1)).toBeVisible();
  });
});
