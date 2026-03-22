import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { RegistrationPage } from './pages/RegistrationPage';

test.describe('Autoryzacja i Dostęp (Auth)', () => {

  test('TC-AUTH-01: Rejestracja nowego użytkownika (Happy Path)', async ({ page }) => {
    const registrationPage = new RegistrationPage(page);
    await registrationPage.goto();
    
    const uniqueUser = `user_${Date.now()}`;
    await registrationPage.register(uniqueUser, `${uniqueUser}@example.com`, 'Password123!');
    
    await expect(page).toHaveURL(/.*login/);
  });

  test('TC-AUTH-02: Logowanie użytkownika (Role: USER)', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    await loginPage.login('user@example.com', 'password');
    
    await expect(page).toHaveURL(/.*home/);
    const logoutBtn = page.getByRole('button', { name: /Logout|Wyloguj/i });
    await expect(logoutBtn).toBeVisible();
  });

  test('TC-AUTH-04: Nieudane logowanie (Negative Path)', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    await loginPage.login('wrong@example.com', 'wrongpassword');
    
    // Użycie selektora tekstowego dla komunikatu o błędzie (dostępność)
    await expect(page.getByText(/Invalid credentials|Invalid email or password/i)).toBeVisible();
    await expect(page).toHaveURL(/.*login/);
  });

  test('TC-AUTH-05: Zabezpieczenie tras (Protected Routes)', async ({ page }) => {
    await page.goto('/orders');
    await expect(page).toHaveURL(/.*login/);
  });

});
