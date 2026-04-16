import { expect } from '@playwright/test';

export class BasePage {
  constructor(page) {
    this.page = page;
  }

  async verifyToast(message) {
    const toast = this.page.locator('div[role="status"]').filter({ hasText: message }).first();
    await expect(toast).toBeVisible({ timeout: 10000 });
  }

  async logout() {
    const menuButton = this.page.locator('button:has(svg), button:has(img)').last();
    await menuButton.click();
    await this.page.getByRole('button', { name: /logout/i }).click();
  }
}
