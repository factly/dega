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
});

test('should load the Fact-checks page successfully', async ({ page }) => {
    // Locate the header Fact-checkwith the text 'Fact-checks'
    const accountLogin = await page.locator('h3')
    // Assert that the header has the text 'Fact-checks'
    await expect(accountLogin).toHaveText('Fact-checks')
});


test('should handle invalid URL parameters gracefully', async ({ page }) => {
    // Navigate to the URL with invalid parameters
    await page.goto('http://127.0.0.1:4455/.factly/dega/studio/fact-checksNaN');
    // Locate the text that shows '404' message
    const accountLogin = await page.locator('text=404');
    // Assert that the '404' message is visible
    await expect(accountLogin).toBeVisible();
});


test('should persist fact check data across sessions', async ({ page, context }) => {
    // Get the text content of the first h3 element
    const firstTagText = await page.locator('h3').first().textContent();
    // Open a new page in the same context
    await context.newPage();
    // Navigate to the tags page
    await page.goto('http://127.0.0.1:4455/.factly/dega/studio/fact-checks');
    // Get the text content of the first h3 element again
    const newFirstTagText = await page.locator('h3').first().textContent();
    // Assert that the tag data is the same across sessions
    expect(firstTagText).toEqual(newFirstTagText);
});


test('should show "cannot publish Fact-check without author" succesfully ', async ({ page }) => {
    // Click on the 'Create' button
    await page.click('button:has-text("Create")');
    // Type the new Fact-check name into the input field
    await page.type('#title', 'New Fact-check')
    // Type the new Fact-check name into the input block
    await page.click('p.is-empty.is-editor-empty');
    await page.keyboard.type('Sub title');
    // Click on the 'Save' button
    await page.click('button:has-text("Publish")');
    // Handle any dialog that appears by accepting it
    page.on('dialog', dialog => dialog.accept());
    // Get the error message text
    const errorMessage = await page.textContent('.ant-notification-notice-description');
    // Assert that the success message is 'Fact-checkcreated'
    expect(errorMessage).toBe('cannot publish post without author');
});



test('should show "Please input the title!" succesfully ', async ({ page }) => {
    // Click on the 'Create' button
    await page.click('button:has-text("Create")');
    await page.click('button:has-text("Publish")');
    // Get the error message text
    await page.waitForTimeout(3000)
    const errorMessage = await page.textContent('.ant-form-item-explain-error');
    // Assert that the error message is 'Please input the title!'
    expect(errorMessage).toBe('Please input the title!');
});


test('should create Fact-check succesfully ', async ({ page }) => {
    // Click on the 'Create' button
    await page.click('button:has-text("Create")');
    // Type the new Fact-check name into the input field
    await page.type('#title', 'New Fact-check')
    // Type the new Fact-check name into the input block
    await page.click('p.is-empty.is-editor-empty');
    await page.keyboard.type('Sub title');
    await page.click('button:has([aria-label="setting"])');
    await page.click('div.ant-select-selector:has-text("Select authors")');
    // Wait for the dropdown list to appear and populate
    await page.keyboard.press('Enter');
    await page.click('button:has([aria-label="close"])');
    // Click on the 'Publish' button
    await page.click('span:has-text("Publish")');
    // Handle any dialog that appears by accepting it
    page.on('dialog', dialog => dialog.accept());
    // Get the error message text
    const errorMessage = await page.textContent('.ant-notification-notice-description');
    // Assert that the success message is 'Fact Check Published'
    expect(errorMessage).toBe('Fact Check Published');
});


test('should create a template successfully ', async ({ page }) => {
    const Factcheckselector = 'text=One';
    // Click on the Fact-check to be edited
    await page.click(Factcheckselector);
    // Click on the 'Create Template' button
    await page.click('button#template');
    // Handle any dialog that appears by accepting it
    page.on('dialog', dialog => dialog.accept());
    // Get the success message text
    const successMessage = await page.textContent('.ant-notification-notice-description');
    // Assert that the success message is 'Template created'
    expect(successMessage).toBe('Template created');
});



test('should display tippy ', async ({ page }) => {
    // Click on the 'Create' button
    await page.click('button:has-text("Create")');
    // Type the new Fact-check name into the input field
    await page.type('#title', 'New Fact-check')
    // Type the new Fact-check name into the input block
    await page.click('p.is-empty.is-editor-empty');
    await page.keyboard.press('/');
    await page.isVisible('#tippy-11');
});


test('should display mini edit ', async ({ page }) => {
    const FactcheckName = 'New Fact-check';
    const newFactcheckName = 'dknweredkm';
    // Locate the row with the specific data-row-key
    const row = page.locator('tr[data-row-key="41"]');
    // Locate the button within that row
    const button = row.locator('button.ant-btn-icon-only').first();
    // Click the button
    await button.click();
    // Fill in the new Fact-check name
    const inputSelector = '#title';
    await page.fill(inputSelector, newFactcheckName);
    // Click on the 'Update' button
    await page.click('button:has-text("Update")');
    // Check if the Fact-checkname has been updated
    const updatedFactcheck= await page.textContent(`text=${newFactcheckName}`);
    expect(updatedFactcheck).toBe(newFactcheckName);
    // Handle any dialog that appears by accepting it
    page.on('dialog', dialog => dialog.accept());
    // Get the success message text
    const successMessage = await page.textContent('.ant-notification-notice-description');
    // Assert that the success message is 'Fact Check Published'
    expect(successMessage).toBe('Fact Check Published');
    
});













test('should delete a published Fact-check successfully', async ({ page }) => {
    await page.goto('http://127.0.0.1:4455/.factly/dega/studio/fact-checks?status=publish');
    const FactcheckText = 'New Fact-check';
    // Select the row with the required fact-check text
    const rowSelector = `tr:has-text("${FactcheckText}")`;
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
    page.on('dialog', dialog => dialog.accept());
    // Get the success message text
    const successMessage = await page.textContent('.ant-notification-notice-description');
    // Assert that the success message is 'Post deleted'
    expect(successMessage).toBe('Post deleted');
});

test('should delete a Fact-check draft successfully', async ({ page }) => {
    await page.goto('http://127.0.0.1:4455/.factly/dega/studio/fact-checks?status=draft');
    const FactcheckText = 'New Fact-check';
    // Select the row with the required fact-check text
    const rowSelector = `tr:has-text("${FactcheckText}")`;
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
    page.on('dialog', dialog => dialog.accept());
    // Get the success message text
    const successMessage = await page.textContent('.ant-notification-notice-description');
    // Assert that the success message is 'Post deleted'
    expect(successMessage).toBe('Post deleted');
});


test('should delete a ready to publish Fact-check successfully', async ({ page }) => {
    await page.goto('http://127.0.0.1:4455/.factly/dega/studio/fact-checks?status=ready');
    const FactcheckText = 'New Fact-check';
    // Select the row with the required fact-check text
    const rowSelector = `tr:has-text("${FactcheckText}")`;
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
    page.on('dialog', dialog => dialog.accept());
    // Get the success message text
    const successMessage = await page.textContent('.ant-notification-notice-description');
    // Assert that the success message is 'Post deleted'
    expect(successMessage).toBe('Post deleted');
});











test('should edit a Fact-check successfully ', async ({ page }) => {
    const Factcheckselector = 'text=New Fact-check';
    const newFactcheckName = 'Newest fact check';
    // Click on the Fact-check to be edited
    await page.click(Factcheckselector);
    // Fill in the new Fact-check name
    const inputSelector = '#title';
    await page.fill(inputSelector, newFactcheckName);
    // Click on the 'Update' button
    await page.click('button:has-text("Update")');
    // Handle any dialog that appears by accepting it
    page.on('dialog', dialog => dialog.accept());
    // Get the success message text
    const successMessage = await page.textContent('.ant-notification-notice-description');
    // Assert that the success message is 'Fact Check  Published'
    expect(successMessage).toBe('Fact Check  Published');
    // Check if the Fact-checkname has been updated
    // const updatedFactcheck= await page.textContent(`text=${newFactcheckName}`);
    // expect(updatedFactcheck).toBe(newFactcheckName);
});

test('should edit a Fact-check successfully -2 ', async ({ page }) => {
    const FactcheckName = 'New Fact-check';
    const newFactcheckName = 'dknweredkm';
    // Select the row with data-row-key="9"
    const rowSelector = `tr:has-text("${FactcheckName}")`;
    //const rowSelector = '[data-row-key="9"]';
    const buttonSelector = 'button.ant-btn.css-dev-only-do-not-override-1cn9vqe.ant-btn-default.ant-btn-lg.ant-btn-icon-only';  // Assuming the button is a <button> element

    // Find the button within the specific row and click it
    // await page.locator(`${rowSelector} ${buttonSelector}`).click();
    // Click on the Fact-check to be edited
    const buttonLocator = page.locator(`${rowSelector} ${buttonSelector}`);

    // Ensure the button is available before clicking
    await buttonLocator.waitFor({ state: 'visible' });
    await buttonLocator.click();

    //await page.click('button.ant-btn.css-dev-only-do-not-override-1cn9vqe.ant-btn-default.ant-btn-lg.ant-btn-icon-only');
    // Fill in the new Fact-check name
    const inputSelector = '#title';
    await page.fill(inputSelector, newFactcheckName);
    // Click on the 'Update' button
    await page.click('button:has-text("Update")');
    // Check if the Fact-checkname has been updated
    const updatedFactcheck= await page.textContent(`text=${newFactcheckName}`);
    expect(updatedFactcheck).toBe(newFactcheckName);
    // Handle any dialog that appears by accepting it
    page.on('dialog', dialog => dialog.accept());
    // Get the success message text
    const successMessage = await page.textContent('.ant-notification-notice-description');
    // Assert that the success message is 'Fact Check Published'
    expect(successMessage).toBe('Fact Check Published');
});



test('should make a Fact-check ready to publish succesfully ', async ({ page }) => {
    // Click on the 'Create' button
    await page.click('button:has-text("Create")');
    // Type the new Fact-check name into the input field
    await page.type('#title', 'New Fact-checkx2')
    // Type the new Fact-check name into the input block
    await page.click('p.is-empty.is-editor-empty');
    await page.keyboard.type('Sub title');
    await page.click('button:has([aria-label="setting"])');
    await page.click('div.ant-select-selector');
    // Wait for the dropdown list to appear and populate
    await page.click('div[title="Ramsai Rapole"]');
    await page.click('button:has([data-icon="down"])');
    // Click on the 'Publish' button
    await page.click('button:has-text("Ready to Publish")');
    // Handle any dialog that appears by accepting it
    page.on('dialog', dialog => dialog.accept());
    // Get the error message text
    const errorMessage = await page.textContent('.ant-notification-notice-description');
    // Assert that the success message is 'Article Published'
    //expect(errorMessage).toBe('Article Published');
});


test('should edit a template successfully', async ({ page }) => {
    await page.click('span:has-text("Templates")');
    const Factcheckselector = 'text=One';
    const newFactcheckName = 'One one';
    
    // Click on the Fact-check to be edited
    await page.click(Fact-checkselector);
  
    // Fill in the new Fact-check name
    const inputSelector = '#title';
    await page.fill(inputSelector, newFact-checkName);
  
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













test('should display empty state when no Fact-checks are present', async ({ page }) => {
    // Locate the Fact-checkthat represents the empty state image
    const emptyStateMessage = await page.locator('.ant-empty-image');
    // Assert that the empty state image is visible
    await expect(emptyStateMessage).toBeVisible();
});

test('Should find search results', async ({ page }) => {
    const FactcheckToSearch = 'm';
    const searchInputSelector = '#filters_q';
    // Click the search button
    await page.click('button:has([aria-label="search"])');
    // Enter the search query
    await page.fill(searchInputSelector , Fact-checkToSearch);
    page.locator(Fact-checkToSearch); 
    // Press 'Enter' to search
    await page.press(searchInputSelector, 'Enter');
    // Verify that the Fact-check is visible in the results
    const FactcheckExists = await page.isVisible(`text=${Fact-checkToSearch}`);
});


test('Should find no search results', async ({ page }) => {
    const FactcheckToSearch = 'Zero';
    const searchInputSelector = '#filters_q';
    // Click the search button
    await page.click('button:has([aria-label="search"])');
    // Enter the search query
    await page.fill('#filters_q', FactcheckToSearch);
    page.locator(Fact-checkToSearch); 
    // Press 'Enter' to search
    await page.press(searchInputSelector, 'Enter');
    // Verify that 'No data' is visible
    const accountLogin = await page.locator('text=No data');
    await expect(accountLogin).toBeVisible();
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

test('when the button is clicked, should scroll to the top of the page', async ({ page }) => {
    const Factcheckselector = 'text=Two';
    await page.click(Fact-checkselector);
    await page.click('button:has-text("Expand")');
    await page.click('button:has-text("Expand")');
    await page.click('button:has-text("Expand")');
    // Find the scroll to top button and click it
    const spanFactcheck= page.locator('span[aria-label="vertical-align-top"]');
    // Click on the span Fact-check
    await spanFact-check.click();
    // Wait for the scroll action to complete
    await page.waitForTimeout(1000); // adjust the timeout based on your scroll animation duration
    // Check if the page is scrolled to the top
    const scrollPosition = await page.evaluate(() => window.scrollY);
    expect(scrollPosition).toBe(0);
});
  
















test('Should find search results based on tag', async ({ page }) => {
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



test('Should find search results based on category', async ({ page }) => {
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


test('Should find search results based on author', async ({ page }) => {
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


test('when the button is clicked, should show more filters and hide', async ({ page }) => {
    // Find the button with text 'abcd' and aria-label 'down'
    const button = await page.locator('button:has-text("More Filters")[aria-label="down"]');
    await button.waitFor({ state: 'visible', timeout: 30000 });


    // Click the button
    await button.click();
});
  