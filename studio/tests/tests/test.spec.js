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


test.only('Should find search results based on tag', async ({ page }) => {
  await page.click('span:has-text("More Filters ")');
  // Locate the specific dropdown using a more specific selector
  const dropdownContainerSelector = '.ant-form-item-control-input-content';
  const dropdownSelector = `${dropdownContainerSelector} .ant-select-selector`;
  // Click on the dropdown to open it
  await page.locator(dropdownSelector).nth(1).click();
  // Wait for the dropdown options to be visible
  const dropdownMenuSelector = '.ant-select-dropdown';
  await page.waitForSelector(dropdownMenuSelector);
  // Scroll the dropdown to the desired option
  await page.evaluate(() => {
      const dropdown = document.querySelector('.ant-select-dropdown');
      if (dropdown) {
          dropdown.scrollTop = 100; // Adjust the value based on how far you need to scroll
      }
  });
  // Select the option "One" from the dropdown
  const optionSelector = '.ant-select-item-option[title="One"]';
  await page.waitForSelector(optionSelector);
  await page.locator(optionSelector).click();
  // Wait for all the search results to be visible
  const resultsSelector = 'tbody.ant-table-tbody tr.ant-table-row td.ant-table-cell a[href*="/.factly/dega/studio/posts/"]';
  const results = page.locator(resultsSelector);
  const count = await results.count();
  for (let i = 0; i < count; i++) {
      await expect(results.nth(i)).toBeVisible();
  }  
});

