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
    await page.goto('http://127.0.0.1:4455/.factly/dega/studio/claims?sort=desc&limit=10&page=1');
    // Save session cookies to a file
    const cookies = await page.context().cookies();
    await page.context().storageState({ path: 'state.json' });
});



test('Should find search results based on claimant and rating', async ({ page }) => {
  // Locate the dropdowns using specific selectors
  const dropdownContainerSelector = '.ant-form-item-control-input-content';
  const dropdownSelectors = [
      `${dropdownContainerSelector} .ant-select-selector`, // Claimant dropdown
      `${dropdownContainerSelector} .ant-select-selector:nth-child(2)` // Rating dropdown
  ];

  // Select options for claimant and rating
  const options = [
      { selector: '.ant-select-item-option[title="Seven"]', dropdownIndex: 0 }, // Option "Seven" for claimant
      { selector: '.ant-select-item-option[title="One"]', dropdownIndex: 1 }    // Option "One" for rating
  ];

  // Loop through dropdowns and select options
  for (const option of options) {
      await page.locator(dropdownSelectors[option.dropdownIndex]).click();
      await page.locator(option.selector).click();
      await page.press(dropdownContainerSelector, 'Enter');
  }

  // Wait for search results to be visible
  const resultsSelector = 'td.ant-table-cell a[href="/.factly/dega/studio/claimants/13/edit"]';
  const results = page.locator(resultsSelector);
  const count = await results.count();

  // Validate each result
  for (let i = 0; i < count; i++) {
      await expect(results.nth(i)).toBeVisible();
  }
});
