// Import necessary modules from Playwright
import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
// Read from default ".env" file.
dotenv.config();

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
    await page.goto('http://127.0.0.1:4455/.factly/dega/studio/fact-checks');
    // Save session cookies to a file
    const cookies = await page.context().cookies();
    await page.context().storageState({ path: 'state.json' });
});


test('should edit a published post successfully ', async ({ page }) => {
  await page.goto(`${process.env.BASE_URL}/.factly/dega/studio/fact-checks?status=publish`);
  const randomString = getRandomString(10); // Adjust the length as needed
  const postSelector = 'text=jhjrhf';
  const newPostName = `This is a test post ${randomString}`;
  // Click on the post to be edited
  await page.click(postSelector);
  // Fill in the new post name
  const inputSelector = '#title';
  await page.fill(inputSelector, newPostName);
  // Click on the 'Update' button
  await page.click('button:has-text("Update")');
  // Handle any dialog that appears by accepting it
  page.on('dialog', dialog => dialog.accept());
  // Check if "cannot publish post without author" message is displayed
  const authorMessageSelector = 'text=cannot publish post without author';
  const isAuthorMessageVisible = await page.isVisible(authorMessageSelector);
  if (isAuthorMessageVisible) {
      console.log("Author selection required");
      await page.click('.ant-notification-notice-close'); // Close the notification
      // Select an author if the message is displayed
      await page.click('button:has([aria-label="setting"])');
      // Locate the 4th div with class 'ant-select-selector'
      const selectorDiv = page.locator('div.ant-select-selector').nth(3);
      // Click on the located div
      await selectorDiv.click();  // Wait for the dropdown list to appear and populate
      await page.keyboard.press('Enter'); // Select the first author in the list
      await page.click('button:has([aria-label="close"])'); // Close the settings modal
      await page.fill(inputSelector, newPostName);
      // Click on the 'Publish' button again
      await page.click('button:has-text("Update")');
      page.on('dialog', dialog => dialog.accept()); // Handle any dialog that appears by accepting it
        // Get the success message text
  const successMessage = await page.textContent('.ant-notification-notice-description');
  console.log("Success message received:", successMessage); // Log the success message
  // Assert that the success message is 'Article Published'
  expect(successMessage).toBe('Article Published');
  }
}); 
