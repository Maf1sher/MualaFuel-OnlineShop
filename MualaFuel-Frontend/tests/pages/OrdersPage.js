import { BasePage } from './BasePage';
import { expect } from '@playwright/test';

export class OrdersPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async navigate() {
    await this.page.goto('/orders');
  }

  async verifyOrderExists(orderIdPart) {
    // Assuming there's some text identifying the order, like a number or status
    await expect(this.page.getByText(orderIdPart)).toBeVisible();
  }
}
