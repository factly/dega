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



test('when the button is clicked, should show more filters and hide', async ({ page }) => {
    // Find the button with text 'abcd' and aria-label 'down'
    const button = await page.locator('button:has-text("More Filters")[aria-label="down"]');
    await button.waitFor({ state: 'visible', timeout: 30000 });


    // Click the button
    await button.click();
});
