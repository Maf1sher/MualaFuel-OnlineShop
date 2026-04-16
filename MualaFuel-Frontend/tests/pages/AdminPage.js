import { BasePage } from './BasePage';
import { expect } from '@playwright/test';

export class AdminPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async navigateOrders() {
    await this.page.goto('/ordersManagement');
  }

  async navigateEmails() {
    await this.page.goto('/emailsHistory');
  }

  async changeOrderStatus(orderId) {
    // Find the precise OrderCard using exact regex match for the ID
    const card = this.page.getByTestId('order-card').filter({ 
      has: this.page.locator('h2', { hasText: new RegExp(`^Order # ${orderId}$`) }) 
    });
    await card.getByRole('button', { name: 'Update Status' }).click();
  }

  async verifyEmailExists(recipient, subject) {
    await expect(this.page.getByText(recipient)).toBeVisible();
    await expect(this.page.getByText(subject)).toBeVisible();
  }
}
