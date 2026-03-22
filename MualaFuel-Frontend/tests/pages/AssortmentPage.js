export class AssortmentPage {
  constructor(page) {
    this.page = page;
    this.nameInput = page.getByLabel('Name');
    this.brandInput = page.getByLabel('Brand');
    this.searchButton = page.getByRole('button', { name: /Search/i });
    this.productCards = page.locator('.product-card'); // Fallback if no specific role
  }

  async goto() {
    await this.page.goto('/assortment');
  }

  async searchByName(name) {
    await this.nameInput.fill(name);
    await this.searchButton.click();
  }

  async getProductCard(name) {
    // Użycie getByRole dla nagłówka wewnątrz karty produktu
    return this.page.locator('div').filter({ has: this.page.getByRole('heading', { name: name }) });
  }

  async addToCart(productName) {
    const card = await this.getProductCard(productName);
    await card.getByRole('button', { name: /Add to Cart/i }).click();
  }
}
