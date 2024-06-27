// Import necessary modules from Playwright
import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { getRandomString } from './randomfunc.js';
// Read from default ".env" file.
dotenv.config();

// This beforeEach hook runs before each test, setting up the test environment
test.beforeEach(async ({ page }) => {
  test.setTimeout(900000);
  // Load session cookies from the file
  await page
    .context()
    .addCookies(JSON.parse(require('fs').readFileSync('state.json', 'utf8')).cookies);
  // Navigate to a page that requires login
  await page.goto(`${process.env.BASE_URL}`);
  // Verify the user is still logged in
  expect(await page.isVisible('text="Dashboard"')).toBeTruthy();
  await page.goto(`${process.env.BASE_URL}posts`);
});

test('login', async ({ page }) => {
  // Navigate to the login page
  await page.goto(`${process.env.BASE_URL}`);
  // Fill in the email and password fields
  await page.type('#auth_email', `${process.env.AUTH_EMAIL}`);
  await page.type('#auth_password', `${process.env.AUTH_PASSWORD}`);
  // Click the login button
  await page.click('text=Login');
  // Save session cookies to a file
  const cookies = await page.context().cookies();
  await page.context().storageState({ path: 'state.json' });
});
