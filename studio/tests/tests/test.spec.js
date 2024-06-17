// Import necessary modules from Playwright
import { test, expect } from '@playwright/test';

// Helper function to generate a random string using JavaScript's Math.random
function getRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// This beforeEach hook runs before each test, setting up the test environment
test.beforeEach(async ({ page }) => {
    // Navigate to the login page
    await page.goto('http://127.0.0.1:4455/.factly/dega/studio/');
    // Fill in the email and password fields
    await page.type('#auth_email', 'ramsai.rapole@factly.in')
    await page.type('#auth_password', 'Wrongpass@123')
    // Click the login button
    await page.click('text=Login')
    await page.goto('http://127.0.0.1:4455/.factly/dega/studio/posts');
    // Save session cookies to a file
    const cookies = await page.context().cookies();
    await page.context().storageState({ path: 'state.json' });
});


test('Should find search results based on category', async ({ page }) => {
  await page.click('span:has-text("More Filters ")');
  // Locate the specific dropdown using a more specific selector
  const dropdownSelect = page.locator('[placeholder="Filter Tags"]');
  await dropdownSelect.click();
  // Select the option "Nine" from the dropdown
  const optionSelector = '.ant-select-item-option[title="This is a test tag 3pHK7DfLFN"]';
  await page.waitForSelector(optionSelector);
  await page.locator(optionSelector).click();
  // Wait for all the search results to be visible
  const resultsSelector = 'td.ant-table-cell a[href="/.factly/dega/studio/claimants/13/edit"]';
  const results = page.locator(resultsSelector);
  const count = await results.count();
  for (let i = 0; i < count; i++) {
    await expect(results.nth(i)).toBeVisible();
  }  
});
