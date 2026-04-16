import { BasePage } from './BasePage';

export class RegistrationPage extends BasePage {
  constructor(page) {
    super(page);
    this.firstnameInput = page.locator('#firstname');
    this.lastnameInput = page.locator('#lastname');
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.confirmPasswordInput = page.locator('#confirmPassword');
    this.registerButton = page.getByRole('button', { name: 'Register' });
  }

  async navigate() {
    await this.page.goto('/registration');
  }

  async register(user) {
    await this.firstnameInput.fill(user.firstname);
    await this.lastnameInput.fill(user.lastname);
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);
    await this.confirmPasswordInput.fill(user.password);
    await this.registerButton.click();
  }
}
