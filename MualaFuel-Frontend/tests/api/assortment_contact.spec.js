import { test, expect } from '@playwright/test';

const BACKEND_URL = 'http://localhost:8080/api';

test.describe('Student 1: Asortyment i Kontakt', () => {
    test('API: Pobranie szczegółów produktu', async ({ request }) => {
        const listResponse = await request.post(`${BACKEND_URL}/product/find`, { 
            data: {
                minPrice: 0,
                maxPrice: 10000,
                minAlcoholContent: 0,
                maxAlcoholContent: 100,
                minCapacity: 0,
                maxCapacity: 10000
            } 
        });
        const list = await listResponse.json();
        console.log('Lista produktów:', list);
        const productId = list.content[0]?.id || 1;

        const response = await request.get(`${BACKEND_URL}/product/${productId}`);
        expect(response.status()).toBe(200);
        const product = await response.json();
        expect(product).toHaveProperty('name');
    });

    test('API: Wyszukiwanie produktów', async ({ request }) => {
        const response = await request.post(`${BACKEND_URL}/product/find`, { data: {} });
        expect(response.status()).toBe(200);
        const result = await response.json();
        expect(result).toHaveProperty('content');
        expect(Array.isArray(result.content)).toBeTruthy();
    });

    test('API: Sprawdzenie stanu autoryzacji', async ({ request }) => {
        const response = await request.get(`${BACKEND_URL}/auth/check`);
        expect([200, 400]).toContain(response.status());
    });

    test('Mock: Obsługa braku produktów w wyszukiwarce', async ({ page }) => {
        await page.route('**/api/product/find*', route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ content: [], totalElements: 0 })
            });
        });
        await page.goto('/assortment');
        await expect(page.getByTestId('no-products-message')).toContainText('Brak produktów');
    });

    test('Mock: Błąd serwera 500 przy ładowaniu produktów', async ({ page }) => {
        await page.route('**/api/product/find*', route => route.fulfill({ status: 500 }));
        await page.goto('/assortment');
        await expect(page.getByTestId('error-message')).toBeVisible();
    });

    test('Mock: Sukces wysyłki formularza kontaktowego', async ({ page }) => {
        await page.route('**/api/contact', route => {
            route.fulfill({ status: 200, contentType: 'text/plain', body: "Pomyślnie wysłano wiadomość" });
        });
        await page.goto('/'); 
        await page.fill('[data-testid="contact-name-input"]', 'Karol Testowy');
        await page.fill('[data-testid="contact-email-input"]', 'karol@mail.com');
        await page.fill('[data-testid="contact-subject-input"]', 'Temat testowy');
        await page.fill('[data-testid="contact-message-textarea"]', 'Treść wiadomości');
        await page.click('[data-testid="contact-submit-button"]');
        await expect(page.locator('text=Pomyślnie wysłano wiadomość')).toBeVisible();
    });

    test.describe('Zalogowany Użytkownik', () => {
        test.use({ storageState: 'playwright/.auth/user.json' });

        test('Sesja: Wysłanie formularza kontaktowego jako zalogowany', async ({ page }) => {
            await page.goto('/');
            await page.fill('[data-testid="contact-name-input"]', 'Karol');
            await page.fill('[data-testid="contact-email-input"]', 'karol@mail.com');
            await page.fill('[data-testid="contact-subject-input"]', 'Zapytanie z sesją');
            await page.fill('[data-testid="contact-message-textarea"]', 'Wiadomość testowa');
            
            await page.route('**/api/contact', route => route.fulfill({ status: 200, contentType: 'text/plain', body: "Success" }));
            
            await page.click('[data-testid="contact-submit-button"]');
            await expect(page.locator('text=Success')).toBeVisible();
        });

        test('Sesja: Weryfikacja tożsamości w Navbarze', async ({ page }) => {
            await page.goto('/home');
            await expect(page.getByTestId('user-email').first()).toHaveText('karol@mail.com');
        });

        test('Sesja: Dostęp do koszyka dla zalogowanego', async ({ page }) => {
            await page.goto('/cart');
            await expect(page).toHaveURL(/.*cart/);
            await expect(page.getByTestId('cart-title')).toBeVisible();
        });
    });
});
