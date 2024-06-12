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


test('should create rating successfully', async ({ page }) => {
    // Click on the 'New Rating' button
    await page.click('button:has-text("New Rating")');
    // Click on the 'Expand' button
    await page.click('button:has-text("Expand")');
    
    // Type the rating name into the input field
    const ratingName = 'This is a test rating';
    let ratingValue = 5; // starting value
    
    await page.type('#creat-rating_name', ratingName);

    // Focus on the rating value input field
    const ratingInput = await page.$('#creat-rating_numeric_value');
    await ratingInput.focus();
    await page.type('#creat-rating_numeric_value', ratingValue.toString());

    // Press the 'Up' key to increment the rating value
    await page.keyboard.press('ArrowUp');
    ratingValue += 1;

    // Press the 'Down' key to decrement the rating value
    await page.keyboard.press('ArrowDown');
    ratingValue -= 1;
    
    // Click on the 'Save' button
    await page.click('button:has-text("Save")');

    // Handle any dialog that appears by accepting it
    page.on('dialog', dialog => dialog.accept());

    // Get the success message text
    const successMessage = await page.textContent('.ant-notification-notice-description');

    // Assert that the success message is 'Rating created'
    expect(successMessage).toBe('Rating created');
});
