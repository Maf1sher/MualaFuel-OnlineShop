import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegistrationPage } from '../pages/RegistrationPage';
import { AssortmentPage } from '../pages/AssortmentPage';

const USER = { email: 'karol@mail.com', password: '12345678' };

test.describe('Module: Security & Registration (Author: Adam)', () => {
  let loginPage;
  let registrationPage;
  let assortmentPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    registrationPage = new RegistrationPage(page);
    assortmentPage = new AssortmentPage(page);
  });

  test('TC-AUTH-01: Registration of a new user', async () => {
    const newUser = {
      firstname: 'Test',
      lastname: 'User',
      email: `testuser_${Date.now()}@example.com`,
      password: 'password123'
    };
    await registrationPage.navigate();
    await registrationPage.register(newUser);
    await expect(registrationPage.page).toHaveURL(/.*\/login/);
  });

  test('TC-AUTH-04: Failed login (incorrect password)', async () => {
    await loginPage.navigate();
    await loginPage.login(USER.email, 'wrongpassword');
    await loginPage.verifyToast('Bad credentials');
  });

  test('TC-AUTH-05: Protected routes', async () => {
    await assortmentPage.page.goto('/ordersManagement');
    await expect(assortmentPage.page).toHaveURL(/.*\/login/);
    await assortmentPage.page.goto('/emailsHistory');
    await expect(assortmentPage.page).toHaveURL(/.*\/login/);
  });
});
