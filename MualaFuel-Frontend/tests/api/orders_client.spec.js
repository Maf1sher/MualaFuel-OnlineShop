import { test, expect } from '@playwright/test';

const BACKEND_URL = 'http://localhost:8080/api';

test.describe('Student 3: Składanie Zamówień (Klient)', () => {
    test.describe('API Zamówień', () => {
        test.use({ storageState: 'playwright/.auth/user.json' });

        test('API: Złożenie zamówienia', async ({ request }) => {
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

            const orderData = {
                shippingDetails: {
                    shipping_country: "Poland",
                    shipping_city: "Krakow",
                    shipping_zipCode: "30-001",
                    shipping_street: "Main St 1"
                },
                paymentDetails: {
                    payment_method: "CREDIT_CARD",
                    payment_status: "PENDING",
                    payment_transactionId: "TX123456"
                }
            };
            const response = await request.post(`${BACKEND_URL}/orders`, { data: orderData });
            expect([200, 201]).toContain(response.status());
        });

        test('API: Pobranie historii zamówień', async ({ request }) => {
            const response = await request.get(`${BACKEND_URL}/orders`);
            expect(response.status()).toBe(200);
            const orders = await response.json();
            expect(Array.isArray(orders)).toBeTruthy();
        });

        test('API: Próba złożenia zamówienia z błędnymi danymi', async ({ request }) => {
            const response = await request.post(`${BACKEND_URL}/orders`, { data: {} });
            expect(response.status()).toBe(400);
        });
    });

    test('Mock: Brak zamówień w historii', async ({ page }) => {
        await page.route('**/api/orders', route => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([])
            });
        });
        await page.goto('/orders');
        await expect(page.getByTestId('no-orders-message')).toContainText('No orders found');
    });

    test('Mock: Opóźnienie przy składaniu zamówienia (Spinner)', async ({ page }) => {
        await page.route('**/api/cart', route => route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ items: [{ productId: 1, productName: 'Test', price: 10, quantity: 1, totalPrice: 10 }], totalPrice: 10 })
        }));

        await page.route('**/api/orders', async route => {
            await new Promise(resolve => setTimeout(resolve, 2000));
            route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 99 }) });
        });
        await page.goto('/cart');
        
        await page.getByTestId('checkout-button').click();
        await page.fill('[data-testid="checkout-country-input"]', 'Poland');
        await page.fill('[data-testid="checkout-city-input"]', 'Krakow');
        await page.fill('[data-testid="checkout-zip-input"]', '30-001');
        await page.fill('[data-testid="checkout-street-input"]', 'Main St 1');
        
        await page.getByTestId('place-order-button').click();
        await expect(page.getByTestId('spinner')).toBeVisible();
    });

    test.describe('Stan Użytkownika', () => {
        test.use({ storageState: 'playwright/.auth/user.json' });

        test('Mock: Zamówienie ze statusem CANCELLED', async ({ page }) => {
            const mockOrders = [{
                id: 123,
                totalAmount: 100,
                status: "CANCELLED",
                orderDate: "2024-01-01",
                orderItems: [{ productId: 1, productName: "Produkt Testowy", quantity: 1, unitPrice: 100 }],
                shippingDetails: {
                    shipping_country: "Poland",
                    shipping_city: "Krakow",
                    shipping_zipCode: "30-001",
                    shipping_street: "Main St 1"
                },
                paymentDetails: {
                    payment_method: "CREDIT_CARD",
                    payment_status: "PAID",
                    payment_transactionId: "TX123456"
                }
            }];
            await page.route('**/api/orders', route => {
                route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockOrders) });
            });
            await page.goto('/orders');
            await expect(page.getByTestId('order-card').first()).toContainText('CANCELLED');
        });

        test('Sesja: Przejście bezpośrednio do historii zamówień', async ({ page }) => {
            await page.goto('/orders');
            await expect(page).toHaveURL(/.*orders/);
            await expect(page.getByTestId('order-history-title')).toBeVisible();
        });

        test('Sesja: Weryfikacja adresu email w Navbarze', async ({ page }) => {
            await page.goto('/home');
            await expect(page.getByTestId('user-email').first()).toHaveText('karol@mail.com');
        });

        test('Sesja: Przycisk zamówienia jest aktywny dla zalogowanego', async ({ page }) => {
            await page.goto('/cart');
             await page.route('**/api/cart', route => route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ items: [{ productId: 1, productName: 'Test', price: 10, quantity: 1, totalPrice: 10 }], totalPrice: 10 })
            }));
            await page.reload();
            await expect(page.getByTestId('checkout-button')).toBeVisible();
        });
    });
});
