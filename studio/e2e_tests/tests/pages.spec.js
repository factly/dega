// Import necessary modules from Playwright
import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { getRandomString } from './randomfunc.js';
// Read from default ".env" file.
dotenv.config();

// This beforeEach hook runs before each test, setting up the test environment
test.beforeEach(async ({ page }) => {
  test.setTimeout(90000);
  // Navigate to the login page
  await page.goto(`${process.env.BASE_URL}`);
  // Fill in the email and password fields
  await page.type('#auth_email', `${process.env.AUTH_EMAIL}`);
  await page.type('#auth_password', `${process.env.AUTH_PASSWORD}`);
  // Click the login button
  await page.click('text=Login');
  await page.goto(`${process.env.BASE_URL}pages`);
  // Save session cookies to a file
  const cookies = await page.context().cookies();
  await page.context().storageState({ path: 'state.json' });
});

test('should create a draft page succesfully ', async ({ page }) => {
  // Click on the 'Create' button
  await page.click('button:has-text("Create")');
  // Type the new page name into the input field
  const randomString = getRandomString(10); // Adjust the length as needed
  await page.type('#title', `This is a test page ${randomString}`);
  // Type the new page name into the input block
  await page.click('p.is-empty.is-editor-empty');
  await page.keyboard.type('Sub title');
  await page.click('button:has([aria-label="setting"])');
  await page.click('div.ant-select-selector');
  // Wait for the dropdown list to appear and populate
  await page.keyboard.press('Enter');
  await page.click('button:has([aria-label="close"])');
  await page.click('button:has([aria-label="down"])');
  // Click on the 'Save as Draft' button
  await page.click('span:has-text("Save Draft")');
  // Handle any dialog that appears by accepting it
  page.on('dialog', (dialog) => dialog.accept());
  // Get the success message text
  const successMessage = await page.textContent('.ant-notification-notice-description');
  // Assert that the success message is 'page added''
  expect(successMessage).toBe('page added');
});

test('should create a ready to publish page succesfully ', async ({ page }) => {
  // Click on the 'Create' button
  await page.click('button:has-text("Create")');
  // Type the new page name into the input field
  const randomString = getRandomString(10); // Adjust the length as needed
  await page.type('#title', `This is a test page ${randomString}`);
  // Type the new page name into the input block
  await page.click('p.is-empty.is-editor-empty');
  await page.keyboard.type('Sub title');
  await page.click('button:has([aria-label="setting"])');
  await page.click('div.ant-select-selector');
  // Wait for the dropdown list to appear and populate
  await page.keyboard.press('Enter');
  await page.click('button:has([aria-label="close"])');
  await page.click('button:has([aria-label="down"])');
  // Click on the 'Ready to Publish' button
  await page.click('span:has-text("Ready to Publish")');
  // Handle any dialog that appears by accepting it
  page.on('dialog', (dialog) => dialog.accept());
  // Get the success message text
  const successMessage = await page.textContent('.ant-notification-notice-description');
  // Assert that the success message is 'page added & Ready to Publish'
  expect(successMessage).toBe('page added & Ready to Publish');
});

test('should publish page succesfully ', async ({ page }) => {
  // Click on the 'Create' button
  await page.click('button:has-text("Create")');
  const randomString = getRandomString(10); // Adjust the length as needed
  // Type the new page name into the input field
  await page.type('#title', `This is a test page ${randomString}`);
  // Type the new page name into the input block
  await page.click('p.is-empty.is-editor-empty');
  await page.keyboard.type('Sub title');
  await page.click('button:has([aria-label="setting"])');
  await page.click('div.ant-select-selector');
  // Wait for the dropdown list to appear and populate
  await page.keyboard.press('Enter');
  await page.click('button:has([aria-label="close"])');
  // Click on the 'Publish' button
  await page.click('span:has-text("Publish")');
  // Handle any dialog that appears by accepting it
  page.on('dialog', (dialog) => dialog.accept());
  // Get the error message text
  const errorMessage = await page.textContent('.ant-notification-notice-description');
  // Assert that the success message is 'Article Published'
  expect(errorMessage).toBe('Article Published');
});

test('should display tippy ', async ({ page }) => {
  // Click on the 'Create' button
  await page.click('button:has-text("Create")');
  // Type the new page name into the input field
  await page.type('#title', 'New page');
  // Type the new page name into the input block
  await page.click('p.is-empty.is-editor-empty');
  await page.keyboard.press('/');
  await page.isVisible('#tippy-11');
});

test('should delete a published page successfully', async ({ page }) => {
  await page.goto(`${process.env.BASE_URL}pages?status=publish`);
  const pageText = 'ndscn';
  //const pageDateTime = 'Jun 03, 2024 03:25 PM'; // specify the exact date and time of the page
  // Select the row with the required fact-check text and date-time
  const rowSelector = `tr:has-text("${pageText}")`;
  const buttonSelector = 'button:has([aria-label="delete"])';
  // Find the button within the specific row and click it
  const buttonLocator = page.locator(`${rowSelector} ${buttonSelector}`);
  // Ensure the button is available before clicking
  await buttonLocator.waitFor({ state: 'visible' });
  // Click on the Fact-check to be deleted
  await buttonLocator.click();
  // Click on the 'OK' button in the confirmation dialog
  await page.click('button:has-text("OK")');
  // Handle any dialog that appears by accepting it
  page.on('dialog', (dialog) => dialog.accept());
  // Get the success message text
  const successMessage = await page.textContent('.ant-notification-notice-description');
  // Assert that the success message is 'page deleted'
  expect(successMessage).toBe('page deleted');
});

test('should delete a page from ready to publish successfully', async ({ page }) => {
  await page.goto(`${process.env.BASE_URL}pages?status=ready`);
  const pageText = 'Onel';
  // Select the row with the required fact-check text
  const rowSelector = `tr:has-text("${pageText}")`;
  const buttonSelector = 'button:has([aria-label="delete"])';
  // Find the button within the specific row and click it
  const buttonLocator = page.locator(`${rowSelector} ${buttonSelector}`);
  // Ensure the button is available before clicking
  await buttonLocator.waitFor({ state: 'visible' });
  // Click on the Fact-check to be deleted
  await buttonLocator.click();
  // Click on the 'OK' button in the confirmation dialog
  await page.click('button:has-text("OK")');
  // Handle any dialog that appears by accepting it
  page.on('dialog', (dialog) => dialog.accept());
  // Get the success message text
  const successMessage = await page.textContent('.ant-notification-notice-description');
  // Assert that the success message is 'page deleted'
  expect(successMessage).toBe('page deleted');
});

test('should delete a page from drafts successfully', async ({ page }) => {
  await page.goto(`${process.env.BASE_URL}pages?status=draft`);
  const pageText = 'asax';
  // Select the row with the required fact-check text
  const rowSelector = `tr:has-text("${pageText}")`;
  const buttonSelector = 'button:has([aria-label="delete"])';
  // Find the button within the specific row and click it
  const buttonLocator = page.locator(`${rowSelector} ${buttonSelector}`);
  // Click on the Fact-check to be deleted
  await buttonLocator.click();
  // Click on the 'OK' button in the confirmation dialog
  await page.click('button:has-text("OK")');
  // Handle any dialog that appears by accepting it
  page.on('dialog', (dialog) => dialog.accept());
  // Get the success message text
  const successMessage = await page.textContent('.ant-notification-notice-description');
  // Assert that the success message is 'page deleted'
  expect(successMessage).toBe('page deleted');
});

test('should edit a published page successfully ', async ({ page }) => {
  await page.goto(`${process.env.BASE_URL}pages?status=publish`);
  const randomString = getRandomString(10); // Adjust the length as needed
  const pageSelector = 'text=dkndkm';
  const newpageName = `This is a test page ${randomString}`;
  // Click on the page to be edited
  await page.click(pageSelector);
  // Fill in the new page name
  const inputSelector = '#title';
  await page.fill(inputSelector, newpageName);
  // Click on the 'Update' button
  await page.click('button:has-text("Update")');
  // Check if the pagename has been updated
  const updatedpage = await page.textContent(`text=${newpageName}`);
  expect(updatedpage).toBe(newpageName);
  // Handle any dialog that appears by accepting it
  page.on('dialog', (dialog) => dialog.accept());
  // Get the success message text
  const successMessage = await page.textContent('.ant-notification-notice-description');
  // Assert that the success message is 'Article Published'
  expect(successMessage).toBe('Article Published');
});

test('should edit a ready to publish page successfully ', async ({ page }) => {
  await page.goto(`${process.env.BASE_URL}pages?status=ready`);
  const randomString = getRandomString(10); // Adjust the length as needed
  const pageSelector = 'text=cddc';
  const newpageName = `This is a test page ${randomString}`;
  // Click on the page to be edited
  await page.click(pageSelector);
  // Fill in the new page name
  const inputSelector = '#title';
  await page.fill(inputSelector, newpageName);
  // Click on the 'Update' button
  await page.click('button:has-text("Update")');
  // Check if the pagename has been updated
  const updatedpage = await page.textContent(`text=${newpageName}`);
  expect(updatedpage).toBe(newpageName);
  // Handle any dialog that appears by accepting it
  page.on('dialog', (dialog) => dialog.accept());
  // Get the success message text
  const successMessage = await page.textContent('.ant-notification-notice-description');
  // Assert that the success message is 'Article Published'
  expect(successMessage).toBe('Article Published');
});

test('should edit a draft page successfully ', async ({ page }) => {
  await page.goto(`${process.env.BASE_URL}pages?status=draft`);
  const randomString = getRandomString(10); // Adjust the length as needed
  const pageSelector = 'text=cddc';
  const newpageName = `This is a test page ${randomString}`;
  // Click on the page to be edited
  await page.click(pageSelector);
  // Fill in the new page name
  const inputSelector = '#title';
  await page.fill(inputSelector, newpageName);
  // Click on the 'Update' button
  await page.click('button:has-text("Update")');
  // Check if the pagename has been updated
  const updatedpage = await page.textContent(`text=${newpageName}`);
  expect(updatedpage).toBe(newpageName);
  // Handle any dialog that appears by accepting it
  page.on('dialog', (dialog) => dialog.accept());
  // Get the success message text
  const successMessage = await page.textContent('.ant-notification-notice-description');
  // Assert that the success message is 'Article Published'
  expect(successMessage).toBe('Article Published');
});

test('should edit a published page successfully from the shortcut edit button  ', async ({
  page,
}) => {
  await page.goto(`${process.env.BASE_URL}pages?status=publish`);
  const randomString = getRandomString(10); // Adjust the length as needed
  const pageName = 'dkndkm';
  const newpageName = `This is a test page ${randomString}`;
  const rowSelector = `tr:has-text("${pageName}")`;
  const buttonSelector =
    'button.ant-btn.css-dev-only-do-not-override-1cn9vqe.ant-btn-default.ant-btn-lg.ant-btn-icon-only';
  // Find the button within the specific row and click it
  const buttonLocator = page.locator(`${rowSelector} ${buttonSelector}`);
  await buttonLocator.first().click();
  // Fill in the new page name
  const inputSelector = '#title';
  await page.fill(inputSelector, newpageName);
  // Click on the 'Update' button
  await page.click('button:has-text("Update")');
  // Check if the pagename has been updated
  const updatedpage = await page.textContent(`text=${newpageName}`);
  expect(updatedpage).toBe(newpageName);
  // Handle any dialog that appears by accepting it
  page.on('dialog', (dialog) => dialog.accept());
  // Get the success message text
  const successMessage = await page.textContent('.ant-notification-notice-description');
  // Assert that the success message is 'Article Published'
  expect(successMessage).toBe('Article Published');
});

test('should edit a ready to publish page successfully from the shortcut edit button  ', async ({
  page,
}) => {
  await page.goto(`${process.env.BASE_URL}pages?status=ready`);
  const randomString = getRandomString(10); // Adjust the length as needed
  const pageName = 'jxks';
  const newpageName = `This is a test page ${randomString}`;
  const rowSelector = `tr:has-text("${pageName}")`;
  const buttonSelector =
    'button.ant-btn.css-dev-only-do-not-override-1cn9vqe.ant-btn-default.ant-btn-lg.ant-btn-icon-only';
  // Find the button within the specific row and click it
  const buttonLocator = page.locator(`${rowSelector} ${buttonSelector}`);
  await buttonLocator.first().click();
  // Fill in the new page name
  const inputSelector = '#title';
  await page.fill(inputSelector, newpageName);
  // Click on the 'Update' button
  await page.click('button:has-text("Update")');
  // Check if the pagename has been updated
  const updatedpage = await page.textContent(`text=${newpageName}`);
  expect(updatedpage).toBe(newpageName);
  // Handle any dialog that appears by accepting it
  page.on('dialog', (dialog) => dialog.accept());
  // Get the success message text
  const successMessage = await page.textContent('.ant-notification-notice-description');
  // Assert that the success message is 'Draft saved & Ready to Publish'
  expect(successMessage).toBe('Draft saved & Ready to Publish');
});

test('should edit a draft page successfully from the shortcut edit button  ', async ({ page }) => {
  await page.goto(`${process.env.BASE_URL}pages?status=draft`);
  const randomString = getRandomString(10); // Adjust the length as needed
  const pageName = 'skis';
  const newpageName = `This is a test page ${randomString}`;
  const rowSelector = `tr:has-text("${pageName}")`;
  const buttonSelector =
    'button.ant-btn.css-dev-only-do-not-override-1cn9vqe.ant-btn-default.ant-btn-lg.ant-btn-icon-only';
  // Find the button within the specific row and click it
  const buttonLocator = page.locator(`${rowSelector} ${buttonSelector}`);
  await buttonLocator.first().click();
  // Fill in the new page name
  const inputSelector = '#title';
  await page.fill(inputSelector, newpageName);
  // Click on the 'Update' button
  await page.click('button:has-text("Update")');
  // Check if the pagename has been updated
  const updatedpage = await page.textContent(`text=${newpageName}`);
  expect(updatedpage).toBe(newpageName);
  // Handle any dialog that appears by accepting it
  page.on('dialog', (dialog) => dialog.accept());
  // Get the success message text
  const successMessage = await page.textContent('.ant-notification-notice-description');
  // Assert that the success message is 'Draft Saved'
  expect(successMessage).toBe('Draft Saved');
});

test('Should find search results based on tag', async ({ page }) => {
  await page.click('span:has-text("More Filters ")');
  // Locate the specific dropdown using a more specific selector
  const dropdownContainerSelector = '.ant-form-item-control-input-content';
  const dropdownSelector = `${dropdownContainerSelector} .ant-select-selector`;
  // Click on the dropdown to open it
  await page.locator(dropdownSelector).nth(1).click();
  // Select the option "One" from the dropdown
  const optionSelector = '.ant-select-item-option[title="One"]';
  await page.waitForSelector(optionSelector);
  await page.locator(optionSelector).click();
  // Wait for all the search results to be visible
  const resultsSelector =
    'tbody.ant-table-tbody tr.ant-table-row td.ant-table-cell a[href*="/.factly/dega/studio/pages/"]';
  const results = page.locator(resultsSelector);
  const count = await results.count();
  for (let i = 0; i < count; i++) {
    await expect(results.nth(i)).toBeVisible();
  }
});

test('Should find search results based on category', async ({ page }) => {
  await page.click('span:has-text("More Filters ")');
  // Locate the specific dropdown using a more specific selector
  const dropdownContainerSelector = '.ant-form-item-control-input-content';
  const dropdownSelector = `${dropdownContainerSelector} .ant-select-selector`;
  // Click on the dropdown to open it
  await page.locator(dropdownSelector).nth(2).click();
  // Select the option "One" from the dropdown
  // Select the option "Nine" from the dropdown
  const optionSelector = '.ant-select-item-option[title="nkxnckxn"]';
  await page.waitForSelector(optionSelector);
  await page.locator(optionSelector).click();
  // Wait for all the search results to be visible
  const resultsSelector =
    'tbody.ant-table-tbody tr.ant-table-row td.ant-table-cell a[href*="/.factly/dega/studio/pages/"]';
  const results = page.locator(resultsSelector);
  const count = await results.count();
  for (let i = 0; i < count; i++) {
    await expect(results.nth(i)).toBeVisible();
  }
});

test('Should find search results based on author', async ({ page }) => {
  await page.click('span:has-text("More Filters ")');
  // Locate the specific dropdown using a more specific selector
  const dropdownContainerSelector = '.ant-form-item-control-input-content';
  const dropdownSelector = `${dropdownContainerSelector} .ant-select-selector`;
  // Click on the dropdown to open it
  await page.locator(dropdownSelector).nth(3).click();
  // Select the option "One" from the dropdown
  // Select the option "Nine" from the dropdown
  const optionSelector = '.ant-select-item-option[title="Ramsai Rapole"]';
  await page.waitForSelector(optionSelector);
  await page.locator(optionSelector).click();
  // Wait for all the search results to be visible
  const resultsSelector =
    'tbody.ant-table-tbody tr.ant-table-row td.ant-table-cell a[href*="/.factly/dega/studio/pages/"]';
  const results = page.locator(resultsSelector);
  const count = await results.count();
  for (let i = 0; i < count; i++) {
    await expect(results.nth(i)).toBeVisible();
  }
});

test('Should find no search results based on tag', async ({ page }) => {
  await page.click('span:has-text("More Filters ")');
  // Locate the specific dropdown using a more specific selector
  const dropdownContainerSelector = '.ant-form-item-control-input-content';
  const dropdownSelector = `${dropdownContainerSelector} .ant-select-selector`;
  // Click on the dropdown to open it
  await page.locator(dropdownSelector).nth(1).click();
  // Select the option "One" from the dropdown
  const optionSelector = '.ant-select-item-option[title="This is a test tag a0Xh2oSXTA"]';
  await page.waitForSelector(optionSelector);
  await page.locator(optionSelector).click();
  // Verify that 'No data' is visible
  const accountLogin = await page.locator('text=No data');
  await expect(accountLogin).toBeVisible();
});

test('Should find no search results based on category', async ({ page }) => {
  await page.click('span:has-text("More Filters ")');
  // Locate the specific dropdown using a more specific selector
  const dropdownContainerSelector = '.ant-form-item-control-input-content';
  const dropdownSelector = `${dropdownContainerSelector} .ant-select-selector`;
  // Click on the dropdown to open it
  await page.locator(dropdownSelector).nth(2).click();
  // Select the option "One" from the dropdown
  const optionSelector = '.ant-select-item-option[title="jxmixckixmm"]';
  await page.waitForSelector(optionSelector);
  await page.locator(optionSelector).click();
  // Verify that 'No data' is visible
  const accountLogin = await page.locator('text=No data');
  await expect(accountLogin).toBeVisible();
});

test('Should find search results', async ({ page }) => {
  const pageToSearch = 'new page';
  const searchInputSelector = '#filters_q';
  // Click the search button
  await page.click('button:has([aria-label="search"])');
  // Enter the search query
  await page.fill(searchInputSelector, pageToSearch);
  page.locator(pageToSearch);
  // Press 'Enter' to search
  await page.press(searchInputSelector, 'Enter');
  // Verify that the page is visible in the results
  const pageExists = await page.isVisible(`text=${pageToSearch}`);
});

test('Should find no search results', async ({ page }) => {
  const pageToSearch = 'Zero';
  const searchInputSelector = '#filters_q';
  // Click the search button
  await page.click('button:has([aria-label="search"])');
  // Enter the search query
  await page.fill('#filters_q', pageToSearch);
  page.locator(pageToSearch);
  // Press 'Enter' to search
  await page.press(searchInputSelector, 'Enter');
  // Verify that 'No data' is visible
  const accountLogin = await page.locator('text=No data');
  await expect(accountLogin).toBeVisible();
});

test('should show "cannot publish page without author" successfully ', async ({ page }) => {
  // Click on the 'Create' button
  await page.click('button:has-text("Create")');
  // Type the new page name into the input field
  await page.type('#title', 'New page');
  // Type the new page name into the input block
  await page.click('p.is-empty.is-editor-empty');
  await page.keyboard.type('Sub title');
  // Click on the 'Save' button
  await page.click('button:has-text("Publish")');
  // Handle any dialog that appears by accepting it
  page.on('dialog', (dialog) => dialog.accept());
  // Get the error message text
  const errorMessage = await page.textContent('.ant-notification-notice-description');
  // Assert that the error message is 'cannot publish page without author'
  expect(errorMessage).toBe('cannot publish page without author');
});

test('should show "Please input the title!" succesfully ', async ({ page }) => {
  // Click on the 'Create' button
  await page.click('button:has-text("Create")');
  await page.click('button:has-text("Publish")');
  // Get the error message text
  const errorMessage = await page.textContent('.ant-form-item-explain-error');
  // Assert that the error message is 'Please input the title!'
  expect(errorMessage).toBe('Please input the title!');
});

test('should create a template successfully ', async ({ page }) => {
  const pageSelector = 'text=One';
  // Click on the page to be edited
  await page.click(pageSelector);
  // Click on the 'Templates' button
  await page.click('button#template');
  // Handle any dialog that appears by accepting it
  page.on('dialog', (dialog) => dialog.accept());
  // Get the success message text
  const successMessage = await page.textContent('.ant-notification-notice-description');
  // Assert that the success message is 'Template created'
  expect(successMessage).toBe('Template created');
});

test('should save a draft when clicked on a template successfully ', async ({ page }) => {
  // Click on the 'Templates' button
  await page.click('span:has-text("Templates")');
  // Click on the 'Show more' button
  await page.click('button:has-text("Show more")');
  const pageSelector = 'text=One';
  // Click on the page to be edited
  await page.click(pageSelector);
  // Handle any dialog that appears by accepting it
  page.on('dialog', (dialog) => dialog.accept());
  // Get the success message text
  const successMessage = await page.textContent('.ant-notification-notice-description');
  // Assert that the success message is 'page added'
  expect(successMessage).toBe('page added');
});

test('should edit a template successfully', async ({ page }) => {
  // Click on the 'Templates' button
  await page.click('span:has-text("Templates")');
  await page.click('button:has-text("show more")');
  const pageSelector = 'div.ant-card-meta-description >> text="One"';
  const newpageName = 'One one';
  // Click on the page to be edited
  await page.click(pageSelector);
  // Fill in the new page name
  const inputSelector = '#title';
  await page.fill(inputSelector, newpageName);
  // Handle any dialog that appears by accepting it
  page.on('dialog', (dialog) => dialog.accept());
  await page.click('.ant-notification-notice-close');
  // Click on the 'Publish' button
  await page.click('button:has-text("Publish")');
  // Handle any dialog that appears by accepting it
  page.on('dialog', (dialog) => dialog.accept());
  // Check if "cannot publish page without author" message is displayed
  const authorMessageSelector = 'text=cannot publish page without author';
  const isAuthorMessageVisible = await page.isVisible(authorMessageSelector);
  if (isAuthorMessageVisible) {
    console.log('Author selection required');
    await page.click('.ant-notification-notice-close'); // Close the notification
    // Select an author if the message is displayed
    await page.click('button:has([aria-label="setting"])');
    await page.click('div.ant-select-selector');
    await page.waitForSelector('div.ant-select-dropdown', { state: 'visible' }); // Ensure dropdown is visible
    await page.keyboard.press('Enter'); // Select the first author in the list
    await page.click('button:has([aria-label="close"])'); // Close the settings modal
    await page.fill(inputSelector, newpageName);
    // Click on the 'Publish' button again
    await page.click('button:has-text("Publish")');
    page.on('dialog', (dialog) => dialog.accept()); // Handle any dialog that appears by accepting it
    // Get the success message text
    const successMessage = await page.textContent('.ant-notification-notice-description');
    console.log('Success message received:', successMessage); // Log the success message
    // Assert that the success message is 'Article Published'
    expect(successMessage).toBe('Article Published');
  }
});

test('should open to edit when clicked on template edit button successfully ', async ({ page }) => {
  // Click on the 'Templates' button
  await page.click('span:has-text("Templates")');
  // Click on the 'Show more' button
  await page.click('button:has-text("Show more")');
  // Locate the 'edit' buttons and click on the one in the second row, fourth column
  const editButtons = page.locator('span[aria-label="edit"]');
  await editButtons.nth(5).click();
});

test('should delete template when clicked on template delete button successfully ', async ({
  page,
}) => {
  // Click on the 'Templates' button
  await page.click('span:has-text("Templates")');
  // Click on the 'Show more' button
  await page.click('button:has-text("Show more")');
  // Locate the 'edit' buttons and click on the one in the second row, fourth column
  const editButtons = page.locator('span[aria-label="delete"]');
  await editButtons.nth(5).click();
  await page.click('button:has-text("OK")');
});

test('should load the pages page successfully', async ({ page }) => {
  // Locate the header pagewith the text 'pages'
  const accountLogin = await page.locator('h3');
  // Assert that the header has the text 'pages'
  await expect(accountLogin).toHaveText('pages');
});

test('should handle invalid URL parameters gracefully', async ({ page }) => {
  // Navigate to the URL with invalid parameters
  await page.goto(`${process.env.BASE_URL}pages-`);
  // Locate the pagethat shows '404' message
  const accountLogin = await page.locator('text=404');
  // Assert that the '404' message is visible
  await expect(accountLogin).toBeVisible();
});

test('should persist pages data across sessions', async ({ page, context }) => {
  // Get the text content of the first h3 element
  const firstTagText = await page.locator('h3').first().textContent();
  // Open a new page in the same context
  await context.newPage();
  // Navigate to the tags page
  await page.goto(`${process.env.BASE_URL}pages`);
  // Get the text content of the first h3 element again
  const newFirstTagText = await page.locator('h3').first().textContent();
  // Assert that the tag data is the same across sessions
  expect(firstTagText).toEqual(newFirstTagText);
});

//Perform this test case only when there are no tags present
test('should display empty state when no pages are present', async ({ page }) => {
  // Locate the selector that represents the empty state image
  const emptyStateMessage = await page.locator('.ant-empty-image');
  // Assert that the empty state image is visible
  await expect(emptyStateMessage).toBeVisible();
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
