// Import necessary modules from Playwright
import { test, expect } from '@playwright/test';
// This beforeEach hook runs before each test, setting up the test environment
test.beforeEach(async ({ page }) => {
    // Navigate to the login page
    await page.goto(`${process.env.BASE_URL}`);
    // Fill in the email and password fields
    await page.type('#auth_email', 'ramsai.rapole@factly.in')
  });


test('Button click refreshes the page', async ({ page }) => {
    // Get the initial page content (could be a timestamp or any content that changes on refresh)
    const initialContent = await page.content();
    // Click the button to refresh the page
    await page.click('span[aria-label="close-circle"]');
    // Wait for the page to reload
    await page.waitForLoadState('load');
    // Get the content after the refresh
    const refreshedContent = await page.content();
    // Check that the content has changed
    expect(initialContent).not.toBe(refreshedContent);
});
  

test('should login correctly', async ({ page }) => {
    await page.type('#auth_password', 'Wrongpass@123')
    // Click the login button
    await page.click('text=Login')
    // Locate the element with the 'h2' tag
    const accountLogin = await page.locator('h2')
    // Check that the element is visible
    await expect(accountLogin).toBeVisible()
});


test('should fail login correctly', async ({ page }) => {
    await page.type('#auth_password', 'Wrongpass@123')
    // Click the login button
    await page.click('text=Login')
    // Locate the element containing the specific text message indicating invalid credentials
    const accountLogin = await page.locator('text=The provided credentials are invalid.')
    // Assert that the located element is visible on the page
    await expect(accountLogin).toBeVisible()
});
