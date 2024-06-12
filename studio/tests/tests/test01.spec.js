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
    await page.goto('http://127.0.0.1:4455/.factly/dega/studio/fact-checks');
    // Save session cookies to a file
    const cookies = await page.context().cookies();
    await page.context().storageState({ path: 'state.json' });
});

test('should edit a template successfully', async ({ page }) => {
    await page.click('span:has-text("Templates")');
    const Factcheckselector = 'text=One';
    const newFactcheckName = 'One';
    
    // Click on the Fact-check to be edited
    await page.click(Factcheckselector);
  
    // Fill in the new Fact-check name
    const inputSelector = '#title';
    await page.fill(inputSelector, newFactcheckName);
  
    // Handle any dialog that appears by accepting it
    page.on('dialog', dialog => dialog.accept());
    await page.click('.ant-notification-notice-close');
  
    // Click on the 'Publish' button
    await page.click('button:has-text("Publish")');
  
    // Handle any dialog that appears by accepting it
    page.on('dialog', dialog => dialog.accept());
  
    // Check if "cannot publish Fact-check without author" message is displayed
    const authorMessageSelector = 'text=cannot publish Fact-check without author';
    const isAuthorMessageVisible = await page.isVisible(authorMessageSelector);
  
    if (isAuthorMessageVisible) {
        console.log("Author selection required");
  
        await page.click('.ant-notification-notice-close'); // Close the notification
        // Select an author if the message is displayed
        await page.click('button:has([aria-label="setting"])');
        await page.click('div.ant-select-selector');
        await page.waitForSelector('div.ant-select-dropdown', { state: 'visible' }); // Ensure dropdown is visible
        await page.keyboard.press('Enter'); // Select the first author in the list
        await page.click('button:has([aria-label="close"])'); // Close the settings modal
  
        // Click on the 'Publish' button again
        await page.click('button:has-text("Publish")');
        page.on('dialog', dialog => dialog.accept()); // Handle any dialog that appears by accepting it
          // Get the success message text
    const successMessage = await page.textContent('.ant-notification-notice-description');
    console.log("Success message received:", successMessage); // Log the success message
  
    // Assert that the success message is 'Article Published'
    expect(successMessage).toBe('Article Published');
    }
});  
