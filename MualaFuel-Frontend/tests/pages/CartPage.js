export class CartPage {
  constructor(page) {
    this.page = page;
    this.emptyCartMessage = page.getByText(/Your cart is currently empty/i);
    this.checkoutButton = page.getByRole('button', { name: /Proceed to Checkout/i });
  }

  async goto() {
    await this.page.goto('/cart');
  }

  async removeItem(productName) {
    const itemRow = this.page.locator('div').filter({ has: this.page.getByRole('heading', { name: productName }) });
    await itemRow.getByRole('button', { name: /Remove/i }).click();
  }

  async updateQuantity(productName, delta) {
    const itemRow = this.page.locator('div').filter({ has: this.page.getByRole('heading', { name: productName }) });
    const buttonLabel = delta > 0 ? '+' : '-';
    await itemRow.getByRole('button', { name: buttonLabel }).click();
  }

  async fillCheckoutForm(details) {
    await this.page.getByLabel('Country').fill(details.country);
    await this.page.getByLabel('City').fill(details.city);
    await this.page.getByLabel('Zip Code').fill(details.zipCode);
    await this.page.getByLabel('Street Address').fill(details.street);
    await this.page.getByRole('button', { name: /Place Order/i }).click();
  }
}
