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
    await page.goto('http://127.0.0.1:4455/.factly/dega/studio/tags?sort=desc&limit=10&page=1');
    // Save session cookies to a file
    const cookies = await page.context().cookies();
    await page.context().storageState({ path: 'state.json' });
});

// Helper function to generate a random string using JavaScript's Math.random
function getRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}


test('should edit successfully and check pages', async ({ page }) => {

    // Generate a random string
    const randomString = getRandomString(10); // Adjust the length as needed
    const tagSelector = 'text=Four';
    const newTagName =  `This is a test tag ${randomString}`;;
    let tagFound = false;
    let pageIndex = 1;

    // Function to check if the tag is on the current page
    const isTagVisible = async () => {
        const tagElements = await page.$$(tagSelector);
        return tagElements.length > 0;
    };

    // Loop through pages until the tag is found
    while (!tagFound) {
        tagFound = await isTagVisible();

        if (!tagFound) {
            // Click the next page button (assuming there's a next page button with the text 'Next')
            await page.click('button:has([aria-label="right"])');
            await page.waitForTimeout(1000); // Wait for the next page to load
            pageIndex++;
        }
    }

    // Click on the tag to be edited
    await page.click(tagSelector);
    // Click on the 'Expand' button
    await page.click('button:has-text("Expand")');
    // Fill in the new tag name
    const inputSelector = '#create-tag_name';
    await page.fill(inputSelector, newTagName);
    // Click on the 'Update' button
    await page.click('button:has-text("Update")');
    // Check if the tag name has been updated
    const updatedTag = await page.textContent(`text=${newTagName}`);
    expect(updatedTag).toBe(newTagName);
    // Handle any dialog that appears by accepting it
    page.on('dialog', dialog => dialog.accept());
    // Get the success message text
    const successMessage = await page.textContent('.ant-notification-notice-description');
    // Assert that the success message is 'Tag updated'
    expect(successMessage).toBe('Tag updated');
});
