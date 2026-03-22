export class RegistrationPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.getByLabel('Username');
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.registerButton = page.getByRole('button', { name: /Zarejestruj|Sign Up/i });
  }

  async goto() {
    await this.page.goto('/registration');
  }

  async register(username, email, password) {
    await this.usernameInput.fill(username);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.registerButton.click();
  }
}
