import { test, expect } from '@playwright/test';

const BACKEND_URL = 'http://localhost:8080/api';

test.describe('Student 2: Zarządzanie Koszykiem', () => {
    test.describe('API Koszyka', () => {
        test.use({ storageState: 'playwright/.auth/user.json' });

        test('API: Pobranie koszyka', async ({ request }) => {
            const response = await request.get(`${BACKEND_URL}/cart`);
            expect(response.status()).toBe(200);
            const cart = await response.json();
            expect(cart).toHaveProperty('totalPrice');
        });

        test('API: Dodanie przedmiotu do koszyka', async ({ request }) => {
            const prodRes = await request.post(`${BACKEND_URL}/product/find`, { 
                data: {
                    minPrice: 0,
                    maxPrice: 10000,
                    minAlcoholContent: 0,
                    maxAlcoholContent: 100,
                    minCapacity: 0,
                    maxCapacity: 10000
                } 
            });
            const prods = await prodRes.json();
            const productId = prods.content[0]?.id || 1;

            const response = await request.post(`${BACKEND_URL}/cart/items`, {
                data: { productId: productId, quantity: 1 }
            });
            expect([200, 204]).toContain(response.status());
        });

        test('API: Usunięcie przedmiotu z koszyka', async ({ request }) => {
            const prodRes = await request.post(`${BACKEND_URL}/product/find`, { 
                data: {
                    minPrice: 0,
                    maxPrice: 10000,
                    minAlcoholContent: 0,
                    maxAlcoholContent: 100,
                    minCapacity: 0,
                    maxCapacity: 10000
                } 
            });
            const prods = await prodRes.json();
            const productId = prods.content[0]?.id || 1;

            await request.post(`${BACKEND_URL}/cart/items`, {
                data: { productId: productId, quantity: 1 }
            });

            const response = await request.delete(`${BACKEND_URL}/cart/items/${productId}`);
            expect([200, 204]).toContain(response.status());
        });
    });

    test('Mock: Wyświetlanie bardzo drogiego koszyka', async ({ page }) => {
        await page.route('**/api/cart', route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ 
                    items: [{ productId: 1, productName: 'Złoty Trunek', price: 1234567.89, quantity: 1, totalPrice: 1234567.89 }], 
                    totalPrice: 1234567.89 
                })
            });
        });
        await page.goto('/cart');
        await expect(page.getByTestId('cart-total-price')).toContainText('1234567.89');
    });

    test('Mock: Błąd 400 przy dodawaniu (brak w magazynie)', async ({ page }) => {
        await page.route('**/api/cart/items', route => route.fulfill({ status: 400, body: JSON.stringify({ message: "Out of stock" }) }));
        await page.goto('/assortment');
        
        const addToCartButtons = page.getByTestId('add-to-cart-button');
        if (await addToCartButtons.count() > 0) {
            await addToCartButtons.first().click();
            await expect(page.getByTestId('error-message')).toBeVisible();
        }
    });

    test('Mock: Pusty koszyk', async ({ page }) => {
        await page.route('**/api/cart', route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ items: [], totalPrice: 0 })
            });
        });
        await page.goto('/cart');
        await expect(page.getByTestId('empty-cart-message')).toBeVisible();
    });

    test.describe('Stan Użytkownika', () => {
        test.use({ storageState: 'playwright/.auth/user.json' });

        test('Sesja: Bezpośrednie wejście do koszyka', async ({ page }) => {
            await page.goto('/cart');
            await expect(page).toHaveURL(/.*cart/);
            await expect(page.getByTestId('cart-title')).toBeVisible();
        });

        test('Sesja: Sprawdzenie adresu email w Navbarze', async ({ page }) => {
            await page.goto('/home');
            await expect(page.getByTestId('user-email').first()).toHaveText('karol@mail.com');
        });

        test('Sesja: Wylogowanie czyści stan sesji', async ({ page }) => {
            await page.goto('/home');
            await page.getByTestId('user-menu-button').click();
            await page.getByTestId('logout-button').click();
            await page.goto('/home'); // Re-navigate to home to see the updated Navbar
            await expect(page.getByTestId('login-button')).toBeVisible();
        });
    });
});
