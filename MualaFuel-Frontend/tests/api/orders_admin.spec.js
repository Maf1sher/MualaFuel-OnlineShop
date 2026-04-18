import { test, expect } from '@playwright/test';

const BACKEND_URL = 'http://localhost:8080/api';

test.describe('Student 4: Panel Administratora (Zamówienia)', () => {
    test.describe('API Admina - Zamówienia', () => {
        test.use({ storageState: 'playwright/.auth/admin.json' });

        test('API: Pobranie wszystkich zamówień (Admin)', async ({ request }) => {
            const response = await request.get(`${BACKEND_URL}/admin/orders`);
            expect(response.status()).toBe(200);
            const orders = await response.json();
            expect(Array.isArray(orders)).toBeTruthy();
        });

        test('API: Aktualizacja statusu zamówienia', async ({ request }) => {
            const listRes = await request.get(`${BACKEND_URL}/admin/orders`);
            const orders = await listRes.json();
            const orderId = orders[0]?.id || 1;

            const response = await request.put(`${BACKEND_URL}/admin/orders/${orderId}`);
            expect(response.status()).toBe(200);
        });

        test('API: Anulowanie zamówienia przez admina', async ({ request }) => {
            const listRes = await request.get(`${BACKEND_URL}/admin/orders`);
            const orders = await listRes.json();
            const orderId = orders[0]?.id || 1;

            const response = await request.delete(`${BACKEND_URL}/admin/orders/${orderId}`);
            expect(response.status()).toBe(200);
        });
    });

    test.describe('Mocks z autoryzacją', () => {
        test.use({ storageState: 'playwright/.auth/admin.json' });

        test('Mock: Bardzo duża liczba zamówień', async ({ page }) => {
            const manyOrders = Array.from({ length: 25 }, (_, i) => ({
                id: i + 1,
                totalAmount: 50,
                status: "NEW",
                orderDate: "2024-05-01",
                orderItems: [],
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
            }));
            await page.route('**/api/admin/orders', route => {
                route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(manyOrders) });
            });
            await page.goto('/ordersManagement');
            await expect(page.getByTestId('order-card')).toHaveCount(25);
        });
        test('Mock: Błąd 403 Forbidden dla nie-admina', async ({ page }) => {
            await page.route('**/api/admin/orders', route => route.fulfill({ status: 403, contentType: 'application/json', body: JSON.stringify({ message: "Brak uprawnień" }) }));
            await page.goto('/ordersManagement');
            await expect(page.getByTestId('error-message')).toBeVisible();
            await expect(page.getByTestId('error-message')).toContainText('Brak uprawnień');
        });
        test('Mock: Wszystkie zamówienia jako DELIVERED', async ({ page }) => {
            await page.route('**/api/admin/orders', route => {
                route.fulfill({ 
                    status: 200, 
                    contentType: 'application/json',
                    body: JSON.stringify([{ 
                        id: 1, 
                        status: "DELIVERED", 
                        totalAmount: 10, 
                        orderDate: "2024-01-01", 
                        orderItems: [],
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
                    }]) 
                });
            });
            await page.goto('/ordersManagement');
            await expect(page.getByTestId('order-card').first()).toContainText('DELIVERED');
        });
    });

    test.describe('Stan Administratora', () => {
        test.use({ storageState: 'playwright/.auth/admin.json' });

        test('Sesja: Link do zarządzania zamówieniami jest widoczny', async ({ page }) => {
            await page.goto('/home');
            await expect(page.getByTestId('nav-ordersManagement')).toBeVisible();
            await expect(page.getByTestId('nav-ordersManagement')).toContainText('Orders');
        });

        test('Sesja: Bezpośredni dostęp do panelu zarządzania', async ({ page }) => {
            await page.goto('/ordersManagement');
            await expect(page).toHaveURL(/.*ordersManagement/);
            await expect(page.getByTestId('admin-orders-title')).toBeVisible();
        });

        test('Sesja: Sprawdzenie adresu admina w Navbarze', async ({ page }) => {
            await page.goto('/home');
            await expect(page.getByTestId('user-email').first()).toHaveText('jan@mail.com');
        });
    });
});
