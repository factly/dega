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
    await page.goto('http://127.0.0.1:4455/.factly/dega/studio/claims');
    // Save session cookies to a file
    const cookies = await page.context().cookies();
    await page.context().storageState({ path: 'state.json' });
});

test.only('Should find search results based on rating', async ({ page }) => {
    // Ensure the page is open and wait for it to be fully loaded
    await page.waitForLoadState('domcontentloaded');

    // Locate the specific dropdown using a more specific selector
    const dropdownContainerSelector = '.ant-form-item-control-input-content';
    const dropdownSelector = `${dropdownContainerSelector} .ant-select-selector`;

    // Click on the dropdown to open it
    await page.locator(dropdownSelector).nth(1).click();

    // Wait for the option to be available and select "Mostly true" from the dropdown
    const optionSelector = '.ant-select-item-option[title="Mostly true"]';
    await page.locator(optionSelector).waitFor();
    await page.locator(optionSelector).click();
    
    // Press Enter to apply the selection
    await page.press(dropdownContainerSelector, 'Enter');

    // Wait for the search results to be visible
    const resultsSelector = 'td.ant-table-cell a[href="/.factly/dega/studio/claimants/13/edit"]';
    await page.locator(resultsSelector).waitFor();

    // Get all the results and ensure each one is visible
    const results = page.locator(resultsSelector);
    const count = await results.count();
    for (let i = 0; i < count; i++) {
        await expect(results.nth(i)).toBeVisible();
    }
});

