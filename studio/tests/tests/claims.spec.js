// Import necessary modules from Playwright
import { test, expect } from '@playwright/test';

// This beforeEach hook runs before each test, setting up the test environment
test.beforeEach(async ({ page }) => {
    // Navigate to the login page
    await page.goto('http://127.0.0.1:4455/.factly/dega/studio/');
    // Fill in the email and password fields
    await page.type('#auth_email', 'ramsai.rapole@factly.in')
    await page.type('#auth_password', 'Wrongpass@123')
    await page.click('text=Login')
    // Click the login button
    await page.goto('http://127.0.0.1:4455/.factly/dega/studio/claims?sort=desc');
});


test('should load claims page', async ({ page }) => {
    // Locate the heading element on the page
    const accountLogin = await page.locator('h3')
    // Locate the heading element on the page
    await expect(accountLogin).toHaveText('Claims')
});


test.only('should create claims', async ({ page }) => {
    // Click the 'Create' button
    await page.click('button:has-text("Create")');
    // Enter text into the claim input field
    await page.type('#create-claim_claim', 'Cong win');
    // Click on the parent element to expand the dropdown
    await page.locator('div.ant-select-selector').first().click();
    await page.click('div[title="Nine"]');
    await page.locator('div.ant-select-selector').nth(1).click();
    await page.click('div[title="True"]');
    await page.click('button:has-text("Submit")');
    await page.waitForSelector('.ant-notification-notice-description');
    const successMessage = await page.textContent('.ant-notification-notice-description');
    expect(successMessage).toBe('Claim created');
});


test('should edit claims', async ({ page }) => {
    const newClaimName = 'New claimss';
    await page.click('text=Cong win');
    await page.fill('#create-claim_claim', newClaimName);
    await page.click('button:has-text("Update")');
    await page.waitForSelector('.ant-notification-notice-description');
    const successMessage = await page.textContent('.ant-notification-notice-description');
    expect(successMessage).toBe('Claim updated');
});


test('should delete a claim successfully', async ({ page }) => {
    const claimText = 'New';
    // Select the row with the required claim text
    const rowSelector = `tr:has-text("${claimText}")`;
    const buttonSelector = 'button:has([aria-label="delete"])'; 
    // Find the button within the specific row and click it
    const buttonLocator = page.locator(`${rowSelector} ${buttonSelector}`);
    // Ensure the button is available before clicking
    await buttonLocator.waitFor({ state: 'visible' });
    // Click on the Fact-check to be deleted
    await buttonLocator.click();
    // Click the 'OK' button from the confirmation dialog
    await page.click('button:has-text("OK")');
    // Handle any dialog that appears
    page.on('dialog', dialog => dialog.accept());
    // Verify the success message
    const successMessage = await page.textContent('.ant-notification-notice-description');
    expect(successMessage).toBe('Tag deleted');
});


test('Should find search results based on claimant', async ({ page }) => {
    // Locate the specific dropdown using a more specific selector
    const dropdownContainerSelector = '.ant-form-item-control-input-content';
    const dropdownSelector = `${dropdownContainerSelector} .ant-select-selector`;
    // Click on the dropdown to open it
    await page.locator(dropdownSelector).first().click();
    // Select the option "Nine" from the dropdown
    const optionSelector = '.ant-select-item-option[title="Nine"]';
    await page.locator(optionSelector).click();
    await page.press(dropdownContainerSelector, 'Enter');
  
    // Wait for all the search results to be visible
    const resultsSelector = 'td.ant-table-cell a[href="/.factly/dega/studio/claimants/13/edit"]';
    const results = page.locator(resultsSelector);
    const count = await results.count();
    for (let i = 0; i < count; i++) {
      await expect(results.nth(i)).toBeVisible();
    }
  
});


test('Should find search results based on rating', async ({ page }) => {
    // Locate the specific dropdown using a more specific selector
    const dropdownContainerSelector = '.ant-form-item-control-input-content';
    const dropdownSelector = `${dropdownContainerSelector}.ant-select-selector`;
    // Click on the dropdown to open it
    await page.locator(dropdownSelector).nth(1).click();
    // Select the option "Nine" from the dropdown
    const optionSelector = '.ant-select-item-option[title="True"]';
    await page.locator(optionSelector).click();
    await page.press(dropdownContainerSelector, 'Enter');
  
    // Wait for all the search results to be visible
    const resultsSelector = 'td.ant-table-cell a[href="/.factly/dega/studio/claimants/13/edit"]';
    const results = page.locator(resultsSelector);
    const count = await results.count();
    for (let i = 0; i < count; i++) {
      await expect(results.nth(i)).toBeVisible();
    }  
});


test('should navigate to the next page', async ({ page }) => {
    // Click the button to navigate to the next page
    await page.click('button:has([aria-label="right"])');
    await page.waitForNavigation();
    // Verify that the URL contains 'page=2'
    expect(page.url()).toContain('page=2');
});

test('should navigate to the previous page', async ({ page }) => {
    // Click the button to navigate to the next page
    await page.click('button:has([aria-label="right"])');
    await page.waitForNavigation();
    // Click the button to navigate back to the previous page
    await page.click('button:has([aria-label="left"])');
    await page.waitForNavigation();
    // Verify that the URL contains 'page=1'
    expect(page.url()).toContain('page=1');
});

test('Should find search results', async ({ page }) => {
    const claimToSearch = 'bjp';
    const searchInputSelector = '#filters_q';
    // Click the search button
    await page.click('button:has([aria-label="search"])');
    // Enter the search query
    await page.fill('#filters_q', claimToSearch);
    page.locator(claimToSearch); 
    // Press 'Enter' to search
    await page.press(searchInputSelector, 'Enter');
    // Verify that the claim is visible in the results
    const claimExists = await page.isVisible(`text=${claimToSearch}`);
});


test('Should find no search results', async ({ page }) => {
    const claimToSearch = 'Zero';
    const searchInputSelector = '#filters_q';
    // Click the search button
    await page.click('button:has([aria-label="search"])');
    // Enter the search query
    await page.fill('#filters_q', claimToSearch);
    page.locator(claimToSearch); 
    // Press 'Enter' to search
    await page.press(searchInputSelector, 'Enter');
    // Verify that 'No data' is visible
    const accountLogin = await page.locator('text=No data');
    await expect(accountLogin).toBeVisible();
});

test('when the button is clicked, should scroll to the top of the page', async ({ page }) => {
    const claimSelector = 'text=Two';
    await page.click(claimSelector);
    await page.click('button:has-text("Expand")');
    await page.click('button:has-text("Expand")');
    await page.click('button:has-text("Expand")');
    // Find the scroll to top button and click it
    const spanElement = page.locator('span[aria-label="vertical-align-top"]');
    // Click on the span element
    await spanElement.click();
    // Wait for the scroll action to complete
    await page.waitForTimeout(1000); // adjust the timeout based on your scroll animation duration
    // Check if the page is scrolled to the top
    const scrollPosition = await page.evaluate(() => window.scrollY);
    expect(scrollPosition).toBe(0);
  });




test('Should search results', async ({ page }) => {
    const claimantoToSearch = 'Seven';
    
    await page.click('.ant-select-selection-placeholder:has-text("Select Claimant")');

    // Press 'Enter' to search
    await page.locator('input[aria-owns=rc_select_32_list]').press('Enter');
    // Verify that 'No data' is visible
    const accountLogin = await page.locator('text=Seven');
    await expect(accountLogin).toBeVisible();
});