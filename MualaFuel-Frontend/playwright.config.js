import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },

  projects: [
    { name: 'setup', testMatch: /.*\.setup\.js/ },

    {
      name: 'chromium-logged-in-admin',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/admin.json',
      },
      dependencies: ['setup'],
      testMatch: /.*logged-in-admin.*\.spec\.js/,
    },
    {
      name: 'chromium-logged-in-user',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
      testMatch: /.*logged-in-user.*\.spec\.js/,
    },
    {
      name: 'chromium-guest',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: [/.*logged-in-.*\.spec\.js/, /.*\.setup\.js/],
    },
  ],
});
