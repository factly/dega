// Import necessary modules from Playwright
import { test, expect } from '@playwright/test';

// This beforeEach hook runs before each test, setting up the test environment
test.beforeEach(async ({ page }) => {
    // Navigate to the login page
    await page.goto('http://127.0.0.1:4455/.factly/dega/studio/');
    // Fill in the email and password fields
    await page.type('#auth_email', 'ramsai.rapole@factly.in')
    await page.type('#auth_password', 'Wrongpass@123')
    // Click the login button
    await page.click('text=Login')
    await page.goto('http://127.0.0.1:4455/.factly/dega/studio/ratings?page=1');
    // Save session cookies to a file
    const cookies = await page.context().cookies();
    await page.context().storageState({ path: 'state.json' });
});


test('should reset', async ({ page }) => {    
    await page.click('button:has-text("Create")');
    await page.click('button:has-text("Expand")');
    await page.fill('#creat-claimant_name', 'Kurt');
    await page.click('button:has-text("Reset")');

  // Verify that the form fields have been reset
  const input1Value = await page.$eval('#creat-claimant_name', input => input.value);    
  if (input1Value === '') {
    console.log('Form reset test passed');
  } else {
    console.error('Form reset test failed');
  }
});