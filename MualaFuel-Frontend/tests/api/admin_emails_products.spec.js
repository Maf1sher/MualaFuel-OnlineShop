import { test, expect } from '@playwright/test';

const BACKEND_URL = 'http://localhost:8080/api';

test.describe('Student 5: Panel Administratora (Emaile i Asortyment)', () => {
    test.describe('API Admina - Emaile i Produkty', () => {
        test.use({ storageState: 'playwright/.auth/admin.json' });

        test('API: Pobranie historii emaili', async ({ request }) => {
            const response = await request.get(`${BACKEND_URL}/emailHistory/all`);
            expect(response.status()).toBe(200);
            const emails = await response.json();
            expect(Array.isArray(emails) || (emails && typeof emails === 'object')).toBeTruthy();
        });

        test('API: Pobranie treści emaila', async ({ request }) => {
            const listRes = await request.get(`${BACKEND_URL}/emailHistory/all`);
            const emails = await listRes.json();
            const emailId = Array.isArray(emails) ? emails[0]?.id : (emails?.content?.[0]?.id || emails?.id || 1);

            const response = await request.get(`${BACKEND_URL}/emailHistory/${emailId}/body`);
            expect(response.status()).toBe(200);
        });

        test('API: Usunięcie produktu', async ({ request }) => {
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

            const response = await request.delete(`${BACKEND_URL}/product/${productId}`);
            expect(response.status()).toBe(200);
        });
    });

    test.describe('Mocks z autoryzacją admina', () => {
        test.use({ storageState: 'playwright/.auth/admin.json' });

        test('Mock: Email z bardzo długim tematem', async ({ page }) => {
            const mockEmails = {
                content: [{
                    id: 1,
                    recipient: "karol@mail.com",
                    subject: "Bardzo ".repeat(30) + " długi temat maila",
                    sentAt: new Date().toISOString()
                }],
                totalElements: 1,
                totalPages: 1,
                size: 10,
                number: 0
            };
            await page.route('**/api/emailHistory/all*', route => {
                route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockEmails) });
            });
            await page.goto('/emailsHistory');
            await expect(page.getByTestId('email-history-table')).toContainText('Bardzo');
        });

        test('Mock: Podgląd maila jako surowy HTML', async ({ page }) => {
            const rawHtml = "<h1 id='mock-title'>Witaj!</h1><p>Twoje zamówienie zostało wysłane.</p>";
            await page.route('**/api/emailHistory/*/body', route => {
                route.fulfill({ status: 200, contentType: 'text/html', body: rawHtml });
            });
            
            const mockEmails = {
                content: [{ id: 1, recipient: "karol@mail.com", subject: "Test", sentAt: new Date().toISOString() }],
                totalElements: 1,
                totalPages: 1,
                size: 10,
                number: 0
            };
            await page.route('**/api/emailHistory/all*', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockEmails) }));

            await page.goto('/emailsHistory');
            const previewButtons = page.locator('button:has-text("Preview")');
            if (await previewButtons.count() > 0) {
                await previewButtons.first().click();
                await expect(page.frameLocator('iframe').locator('#mock-title')).toHaveText('Witaj!');
            }
        });

        test('Mock: Błąd przy usuwaniu produktu (409 Conflict)', async ({ page }) => {
            const mockProducts = {
                content: [{
                    id: 1,
                    name: "Produkt do usunięcia",
                    price: 10,
                    quantity: 5,
                    alcoholType: "BEER",
                    alcoholContent: 5,
                    capacityInMilliliters: 500,
                    imagePath: ""
                }],
                totalElements: 1
            };
            await page.route('**/api/product/find*', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockProducts) }));
            await page.route('**/api/product/*', route => {
                if (route.request().method() === 'DELETE') {
                    route.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ message: "Konflikt" }) });
                } else {
                    route.continue();
                }
            });

            await page.goto('/assortment');
            
            await page.getByTestId('user-menu-button').first().click();
            
            const deleteButtons = page.locator('button:has-text("Usuń"), button:has-text("Delete")');
            page.on('dialog', dialog => dialog.accept());
            await deleteButtons.first().click();
            await expect(page.getByTestId('error-message')).toBeVisible();
            await expect(page.getByTestId('error-message')).toContainText('Konflikt');
        });
    });

    test.describe('Stan Administratora', () => {
        test.use({ storageState: 'playwright/.auth/admin.json' });

        test('Sesja: Szybkie przejście do historii emaili', async ({ page }) => {
            await page.goto('/emailsHistory');
            await expect(page).toHaveURL(/.*emailsHistory/);
            await expect(page.getByTestId('email-history-title')).toBeVisible();
        });

        test('Sesja: Formularz dodawania produktu jest dostępny dla admina', async ({ page }) => {
            await page.goto('/home');
            await page.getByTestId('user-menu-button').first().click();
            await expect(page.getByTestId('add-product-menu-item')).toBeVisible();
        });

        test('Sesja: Weryfikacja tożsamości admina w Navbarze', async ({ page }) => {
            await page.goto('/home');
            await expect(page.getByTestId('user-email').first()).toHaveText('jan@mail.com');
        });
    });
});
