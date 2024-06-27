// Import necessary modules from Playwright
import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { getRandomString } from './randomfunc.js';
// Read from default ".env" file.
dotenv.config();

// This beforeEach hook runs before each test, setting up the test environment
test.beforeEach(async ({ page }) => {
  test.setTimeout(900000);
  // Load session cookies from the file
  await page
    .context()
    .addCookies(JSON.parse(require('fs').readFileSync('state.json', 'utf8')).cookies);
  // Navigate to a page that requires login
  await page.goto(`${process.env.BASE_URL}`);
  await page.goto(`${process.env.BASE_URL}tags?sort=desc&limit=10&page=1`);
});

test('login', async ({ page }) => {
  // Navigate to the login page
  await page.goto(`${process.env.BASE_URL}`);
  // Fill in the email and password fields
  await page.type('#auth_email', `${process.env.AUTH_EMAIL}`);
  await page.type('#auth_password', `${process.env.AUTH_PASSWORD}`);
  // Click the login button
  await page.click('text=Login');
  // Verify the user is still logged in
  expect(await page.isVisible('text="Dashboard"')).toBeTruthy();
  // Save session cookies to a file
  const cookies = await page.context().cookies();
  await page.context().storageState({ path: 'state.json' });
});

let createdTagName = ''; // Define a global variable to store the created tag name
let editedTagName = ''; // Define a global variable to store the edited tag name

test('should create tag successfully', async ({ page }) => {
  // Click on the 'Create' button
  await page.click('button:has-text("Create")');
  // Click on the 'Expand' button
  await page.click('button:has-text("Expand")');
  // Generate a random string
  const randomString = getRandomString(10); // Adjust the length as needed
  // Type the new tag name with the random string into the input field
  createdTagName = `This is a test tag ${randomString}`;
  await page.type('#create-tag_name', createdTagName);
  // Click on the 'Save' button
  await page.click('button:has-text("Save")');
  // Handle any dialog that appears by accepting it
  page.on('dialog', (dialog) => dialog.accept());
  // Get the success message text
  const successMessage = await page.textContent('.ant-notification-notice-description');
  // Assert that the success message is 'Tag created'
  expect(successMessage).toBe('Tag created');
});

test('should edit a tag successfully', async ({ page }) => {
  // Generate a random string
  const randomString = getRandomString(10); // Adjust the length as needed
  editedTagName = `This is an edited test tag ${randomString}`;
  const tagSelector = `text=${createdTagName}`;
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
      const nextButton = await page.$('button:has([aria-label="right"])');
      if (!nextButton) {
        break; // No more pages to navigate
      }
      await nextButton.click();
      await page.waitForTimeout(1000); // Wait for the next page to load
      pageIndex++;
    }
  }
  if (tagFound) {
    // Click on the tag to be edited
    await page.click(tagSelector);
    // Click on the 'Expand' button
    await page.click('button:has-text("Expand")');
    // Fill in the new tag name
    const inputSelector = '#create-tag_name';
    await page.fill(inputSelector, editedTagName);
    // Click on the 'Update' button
    await page.click('button:has-text("Update")');
    // Handle any dialog that appears by accepting it
    page.on('dialog', (dialog) => dialog.accept());
    // Check if the tag name has been updated
    const updatedTag = await page.textContent(`text=${editedTagName}`);
    expect(updatedTag).toBe(editedTagName);
    // Get the success message text
    const successMessage = await page.textContent('.ant-notification-notice-description');
    // Assert that the success message is 'Tag updated'
    expect(successMessage).toBe('Tag updated');
  } else {
    throw new Error(`Tag with name "${createdTagName}" not found.`);
  }
});

test('Should find search results', async ({ page }) => {
  const tagToSearch = editedTagName;
  const searchInputSelector = '#filters_q';
  // Click the search button
  await page.click('button:has([aria-label="search"])');
  // Enter the search query
  await page.fill(searchInputSelector, tagToSearch);
  page.locator(tagToSearch);
  // Press 'Enter' to search
  await page.press(searchInputSelector, 'Enter');
  // Verify that the tag is visible in the results
  const tagExists = await page.isVisible(`text=${tagToSearch}`);
});

test('should display "tag already exists" successfully', async ({ page }) => {
  // Define the selector for the tag to be clicked
  const tagName = editedTagName;
  // Define the new tag name to be entered
  const newTagName = editedTagName;
  // Click the tag to create a new entry
  await page.click(`text=${tagName}`);
  // Click the button to expand the form
  await page.click('button:has-text("Expand")');
  // Define the selector for the input field where the tag name will be entered
  const inputSelector = '#create-tag_name';
  await page.click(inputSelector);
  // Get the length of the typed text
  const deletePressCount = tagName.length;
  // Press the Backspace key multiple times
  for (let i = 0; i < deletePressCount; i++) {
    await page.keyboard.press('Backspace');
  }
  // Fill the input field with the new tag name
  await page.fill(inputSelector, newTagName);
  // Click the button to update/create the tag
  await page.click('button:has-text("Update")');
  // Handle the dialog that appears by accepting it
  page.on('dialog', (dialog) => dialog.accept());
  // Get the success message displayed in the notification
  const successMessage = await page.textContent('.ant-notification-notice-description');
  // Assert that the success message matches the expected text
  expect(successMessage).toBe('Entity with same name exists');
});

test('should delete tag successfully', async ({ page }) => {
  const tagText = editedTagName;
  const nextButtonSelector = 'button:has([aria-label="right"])';
  let tagFound = false;
  while (true) {
    // Check if the tag is present on the current page
    const rowSelector = `tr:has-text("${tagText}")`;

    const buttonSelector = 'button:has([aria-label="delete"])';
    const buttonLocator = page.locator(`${rowSelector} ${buttonSelector}`);
    // Check if the row with the tag text is visible
    const rowCount = await page.locator(rowSelector).count();
    if (rowCount > 0) {
      // Ensure the button is available before clicking
      await buttonLocator.waitFor({ state: 'visible' });
      // Click the delete button
      await buttonLocator.click();
      // Click on the 'OK' button in the confirmation dialog
      await page.click('button:has-text("OK")');
      // Handle any dialog that appears by accepting it
      page.on('dialog', (dialog) => dialog.accept());
      // Get the success message text
      const successMessage = await page.textContent('.ant-notification-notice-description');
      // Assert that the success message is 'Tag deleted'
      expect(successMessage).toBe('Tag deleted');
      tagFound = true;
      break;
    }
    // Check if the "Next" button is available
    const nextButtonEnabled = await page.isEnabled(nextButtonSelector);
    if (!nextButtonEnabled) {
      // If there are no more pages to check, break the loop
      break;
    }
    // Click the "Next" button to go to the next page
    await page.click(nextButtonSelector);
  }
  // Assert that the tag was found and deleted
  expect(tagFound).toBe(true);
});

test('should load the tags page successfully', async ({ page }) => {
  // Locate the header element with the text 'Tags'
  const accountLogin = await page.locator('h3');
  // Assert that the header has the text 'Tags'
  await expect(accountLogin).toHaveText('Tags');
});

test('should handle invalid URL parameters gracefully', async ({ page }) => {
  // Navigate to the URL with invalid parameters
  await page.goto(`${process.env.BASE_URL}tags?sort=desc&limit=10&page=NaN`);
  // Locate the element that shows 'No data' message
  const accountLogin = await page.locator('text=No data');
  // Assert that the 'No data' message is visible
  await expect(accountLogin).toBeVisible();
});

test('should persist tag data across sessions', async ({ page, context }) => {
  // Get the text content of the first h3 element
  const firstTagText = await page.locator('h3').first().textContent();
  // Open a new page in the same context
  await context.newPage();
  // Navigate to the tags page
  await page.goto(`${process.env.BASE_URL}tags?sort=desc&limit=10&page=1`);
  // Get the text content of the first h3 element again
  const newFirstTagText = await page.locator('h3').first().textContent();
  // Assert that the tag data is the same across sessions
  expect(firstTagText).toEqual(newFirstTagText);
});

test('should display "Please enter name!" successfully, when the name input field is empty', async ({
  page,
}) => {
  // Click on the 'Create' button
  await page.click('button:has-text("Create")');
  // Click on the 'Expand' button
  await page.click('button:has-text("Expand")');
  // Type the new tag name into the input field
  const tagName = 'This is a test tag';
  await page.type('#create-tag_name', tagName);
  // Get the length of the typed text
  const deletePressCount = tagName.length;
  // Press the Backspace key multiple times
  for (let i = 0; i < deletePressCount; i++) {
    await page.keyboard.press('Backspace');
  }
  // Click on the 'Save' button
  await page.click('button:has-text("Save")');
  // Wait for the error message to appear
  await page.waitForSelector('.ant-form-item-explain-error', { timeout: 80000 });
  // Get the error message text
  const errorMessage = await page.textContent('.ant-form-item-explain-error');
  // Assert that the success message is 'Please enter name!'
  expect(errorMessage).toBe('Please enter name!');
});

test('should remove alert box when x is clicked successfully', async ({ page }) => {
  const tagText = 'Twelve';
  const tagSelector = `text=${tagText}`;
  // Click on the delete button for the tag
  await page.click('button:has([aria-label="delete"])');
  // Click on the 'OK' button in the confirmation dialog
  await page.click('button:has-text("OK")');
  // Handle any dialog that appears by accepting it
  page.on('dialog', (dialog) => dialog.accept());
  await page.click('.ant-notification-notice-close');
  // Locate the element that shows 'Tag deleted' message
  const accountLogin = await page.locator('text=Tag deleted');
  // Assert that the 'No data' message is visible
  await expect(accountLogin).not.toBeVisible();
});

test('when the button is clicked, should scroll to the top of the page', async ({ page }) => {
  const tagSelector = 'text=Nine';
  await page.click(tagSelector);
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

//Perform this test case only when there are no tags present
test('should display empty state when no tags are present', async ({ page }) => {
  // Locate the element that represents the empty state image
  const emptyStateMessage = await page.locator('.ant-empty-image');
  // Assert that the empty state image is visible
  await expect(emptyStateMessage).toBeVisible();
});

test('Should find no search results', async ({ page }) => {
  const tagToSearch = 'Zero';
  const searchInputSelector = '#filters_q';
  // Click the search button
  await page.click('button:has([aria-label="search"])');
  // Enter the search query
  await page.fill('#filters_q', tagToSearch);
  page.locator(tagToSearch);
  // Press 'Enter' to search
  await page.press(searchInputSelector, 'Enter');
  // Verify that 'No data' is visible
  const accountLogin = await page.locator('text=No data');
  await expect(accountLogin).toBeVisible();
});

test('should navigate to the next page', async ({ page }) => {
  // Click the button to navigate to the next page
  await page.click('button:has([aria-label="right"])');
  // Verify that the URL contains 'page=2'
  expect(page.url()).toContain('page=2');
});

test('should navigate to the previous page', async ({ page }) => {
  // Click the button to navigate to the next page
  await page.click('button:has([aria-label="right"])');
  // Click the button to navigate back to the previous page
  await page.click('button:has([aria-label="left"])');
  // Verify that the URL contains 'page=1'
  expect(page.url()).toContain('page=1');
});

test('should navigate to the selected page', async ({ page }) => {
  const pageNumber = 2; // You can set this to any number dynamically
  // Click the button to navigate to the next page
  await page.click(`.ant-pagination-item-${pageNumber}`);
  // Verify that the URL contains 'page=2'
  expect(page.url()).toContain(`page=${pageNumber}`);
});

test('should sort tags from latest to oldest', async ({ page }) => {
  // Click on the sorting dropdown
  await page.click('#filters_sort', { force: true });
  // Click on the option for sorting from latest to oldest
  await page.click('.ant-select-item[title="Latest"]');
  // Get the text content of all tags
  const tags = await page.$$eval('.ant-table-tbody tr', (rows) => {
    return rows.map((row) => row.textContent.trim());
  });
  // Check if tags are sorted from latest to oldest
  const sortedtags = tags.slice().sort((a, b) => {
    // Extract timestamp from the row content and compare
    const getTime = (str) => {
      const match = str.match(/Created At:\s*(.+)/);
      if (match) {
        return new Date(match[1]).getTime();
      }
      return 0;
    };
    return getTime(b) - getTime(a);
  });
  // Check if the tags are in the correct order
  expect(tags).toEqual(sortedtags);
});

test('should sort tags from oldest to latest', async ({ page }) => {
  // Click on the sorting dropdown
  await page.click('#filters_sort', { force: true });
  // Click on the option for sorting from oldest to latest
  await page.click('.ant-select-item[title="Old"]'); // Adjust the title as needed if "Old" means oldest
  // Get the text content of all tags
  const tags = await page.$$eval('.ant-table-tbody tr', (rows) => {
    return rows.map((row) => row.textContent.trim());
  });
  // Check if tags are sorted from oldest to latest
  const sortedtags = tags.slice().sort((a, b) => {
    // Extract timestamp from the row content and compare
    const getTime = (str) => {
      const match = str.match(/Created At:\s*(.+)/);
      if (match) {
        return new Date(match[1]).getTime();
      }
      return 0;
    };
    return getTime(a) - getTime(b); // Sorting in ascending order
  });
  // Check if the tags are in the correct order
  expect(tags).toEqual(sortedtags);
});
