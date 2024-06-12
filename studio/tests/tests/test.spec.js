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


test('should edit successfully ', async ({ page }) => {
  const tagSelector = 'text=Three';
  const newTagName = 'New Tag';
  let tagFound = false;

  while (!tagFound) {
      // Check if the tag exists on the current page
      const tagElement = await page.$(tagSelector);
      if (tagElement) {
          tagFound = true;
      } else {
          // If the tag is not found, navigate to the next page
          const nextPageButton = await page.$('button:has([aria-label="right"])');
          if (nextPageButton) {
              await nextPageButton.click();
              await page.waitForNavigation();
          } else {
              break; // Exit the loop if there are no more pages
          }
      }
  }

  if (tagFound) {
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
  } else {
      console.log('Tag not found on any page');
  }
});




