import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { AdminPage } from './pages/AdminPage';

test.describe('Administracja i Audyt (Admin Ops)', () => {

  test('TC-ADMIN-01: Zarządzanie statusem zamówienia (Admin)', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const adminPage = new AdminPage(page);

    // 1. Zaloguj się jako admin
    await loginPage.goto();
    await loginPage.login('admin@example.com', 'adminpassword');

    // 2. Przejdź do panelu zamówień
    await adminPage.gotoOrders();
    await expect(adminPage.ordersHeading).toBeVisible();

    // 3. Sprawdź czy przycisk aktualizacji jest widoczny dla zamówienia
    const updateBtn = page.getByRole('button', { name: /Update|Aktualizuj/i }).first();
    await expect(updateBtn).toBeVisible();
  });

  test('TC-ADMIN-02: Historia e-maili i audyt (Admin)', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const adminPage = new AdminPage(page);

    await loginPage.goto();
    await loginPage.login('admin@example.com', 'adminpassword');

    await adminPage.gotoEmails();
    
    // Sprawdzenie nagłówka tabeli lub wpisu (dostępność)
    await expect(page.getByRole('heading', { name: /Email History/i })).toBeVisible();
  });

});
