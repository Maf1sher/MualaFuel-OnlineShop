import { BasePage } from './BasePage';
import { expect } from '@playwright/test';

export class CartPage extends BasePage {
  constructor(page) {
    super(page);
    this.checkoutButton = page.getByRole('button', { name: 'Proceed to Checkout' });
    this.placeOrderButton = page.getByRole('button', { name: 'Place Order' });
  }

  async navigate() {
    await this.page.goto('/cart');
  }

  async changeQuantity(productName, increase = true) {
    const item = this.page.locator('.bg-gray-50', { hasText: productName });
    await item.getByRole('button', { name: increase ? '+' : '-' }).click();
  }

  async removeItem(productName) {
    const item = this.page.locator('.bg-gray-50', { hasText: productName });
    await item.getByRole('button', { name: 'Remove' }).click();
  }

  async checkout(details) {
    await this.checkoutButton.click();
    await this.page.locator('label:has-text("Country") + input').fill(details.country);
    await this.page.locator('label:has-text("City") + input').fill(details.city);
    await this.page.locator('label:has-text("Zip Code") + input').fill(details.zipCode);
    await this.page.locator('label:has-text("Street Address") + input').fill(details.street);
    await this.placeOrderButton.click();
  }
}
