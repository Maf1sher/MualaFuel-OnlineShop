import { test, expect } from '@playwright/test';
import { AssortmentPage } from './pages/AssortmentPage';

test.describe('Produkty i Asortyment (Assortment)', () => {

  test('TC-PROD-01: Przeglądanie i wyszukiwanie produktów', async ({ page }) => {
    const assortmentPage = new AssortmentPage(page);
    await assortmentPage.goto();
    
    await assortmentPage.searchByName('Piwo');
    
    // Sprawdzenie czy widoczne są tylko produkty zawierające "Piwo"
    const productHeading = page.getByRole('heading', { name: /Piwo/i });
    await expect(productHeading.first()).toBeVisible();
  });

  test('TC-PROD-02: Szczegóły produktu', async ({ page }) => {
    const assortmentPage = new AssortmentPage(page);
    await assortmentPage.goto();
    
    // Kliknięcie w obrazek produktu (zakładając alt text)
    // Na podstawie ProductCard.jsx: alt={product.name}
    await page.getByRole('img').first().click();
    
    await expect(page).toHaveURL(/\/product\/\d+/);
    // Nagłówek h1 na stronie produktu
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

});
