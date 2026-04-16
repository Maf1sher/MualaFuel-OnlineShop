import { BasePage } from './BasePage';

export class AssortmentPage extends BasePage {
  constructor(page) {
    super(page);
    this.nameSearchInput = page.locator('label:has-text("Name") + input');
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.addProductBtn = page.getByRole('button', { name: 'Add Product' });
  }

  async navigate() {
    await this.page.goto('/assortment');
  }

  async searchProduct(name) {
    await this.nameSearchInput.fill(name);
    await this.searchButton.click();
  }

  async addProductToCart(productName) {
    const card = this.page.getByTestId('product-card').filter({ hasText: productName });
    await card.getByTestId('add-to-cart-button').click();
  }

  async openProductDetails(productName) {
    const card = this.page.getByTestId('product-card').filter({ hasText: productName });
    await card.locator('img').first().click();
  }

  async editProduct(productName, newPrice) {
    const card = this.page.getByTestId('product-card').filter({ hasText: productName });
    await card.getByRole('button', { name: 'Edit' }).click();
    await this.page.getByTestId('product-price-input').fill(newPrice.toString());
    await this.page.getByTestId('product-form-submit-button').click();
  }

  async openAddProductForm() {
    await this.page.getByTestId('user-menu-button').click();
    await this.page.getByTestId('add-product-menu-item').click();
  }
}
