const { defineConfig, devices } = require('@playwright/test');
const path = require('path');

module.exports = defineConfig({
  timeout: 180000,
  workers: 2,
  testDir: './DEV-Other-Specs',
  reporter: [['html', { outputFolder: 'playwright-report', open: 'always' }]],
  use: {
    headless: true, // Default to true for CI compatibility; override locally with --headed
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'on',
    // Each test context is already isolated/incognito by default.
    // Ensure no persistent storage is shared.
    storageState: undefined, 
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
});
