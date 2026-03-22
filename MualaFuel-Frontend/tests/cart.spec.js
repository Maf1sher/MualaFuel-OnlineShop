import { test, expect } from '@playwright/test';
import { AssortmentPage } from './pages/AssortmentPage';
import { CartPage } from './pages/CartPage';

test.describe('Koszyk i Zamówienia (Cart & Orders)', () => {

  test('TC-CART-01: Dodawanie produktu do koszyka', async ({ page }) => {
    const assortmentPage = new AssortmentPage(page);
    await assortmentPage.goto();
    
    // Dodaj pierwszy lepszy produkt do koszyka
    // Używamy selektora ról dla przycisku wewnątrz karty produktu
    const firstProduct = page.getByRole('heading', { level: 3 }).first();
    const productName = await firstProduct.textContent();
    
    await assortmentPage.addToCart(productName);
    
    // Sprawdzenie komunikatu sukcesu (toast)
    await expect(page.getByText(/Product added to cart successfully/i)).toBeVisible();
  });

  test('TC-CART-02: Zarządzanie zawartością koszyka', async ({ page }) => {
    const assortmentPage = new AssortmentPage(page);
    const cartPage = new CartPage(page);

    // 1. Dodaj produkt
    await assortmentPage.goto();
    const firstProduct = page.getByRole('heading', { level: 3 }).first();
    const productName = await firstProduct.textContent();
    await assortmentPage.addToCart(productName);

    // 2. Przejdź do koszyka
    await cartPage.goto();
    
    // 3. Zwiększ ilość
    await cartPage.updateQuantity(productName, 1);
    
    // 4. Usuń produkt
    await cartPage.removeItem(productName);
    
    // 5. Sprawdź czy koszyk jest pusty
    await expect(cartPage.emptyCartMessage).toBeVisible();
  });

});
