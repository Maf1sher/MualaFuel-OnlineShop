export class AdminPage {
  constructor(page) {
    this.page = page;
    this.ordersHeading = page.getByRole('heading', { name: /Admin Orders Panel/i });
  }

  async gotoOrders() {
    await this.page.goto('/ordersManagement');
  }

  async updateOrderStatus(orderId) {
    // Zakładając, że OrderCard ma przycisk "Update" dla wariantu admin
    const orderCard = this.page.locator(`div`).filter({ hasText: `Order #${orderId}` });
    await orderCard.getByRole('button', { name: /Update/i }).click();
  }

  async gotoEmails() {
    await this.page.goto('/emailsHistory');
  }
}
