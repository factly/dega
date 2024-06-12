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
    await page.goto('http://127.0.0.1:4455/.factly/dega/studio/categories?sort=desc&limit=10&page=1');
    // Save session cookies to a file
    const cookies = await page.context().cookies();
    await page.context().storageState({ path: 'state.json' });
});


test('should stay logged in using stored cookies', async ({ page }) => {
    // Load session cookies from the file
    await page.context().addCookies(JSON.parse(require('fs').readFileSync('state.json', 'utf8')).cookies);

    // Navigate to a page that requires login
    await page.goto('http://127.0.0.1:4455/.factly/dega/studio/');

    // Verify the user is still logged in
    expect(await page.isVisible('text="Categories"')).toBeTruthy();
});

test('should load the Categories page successfully', async ({ page }) => {
    // Locate the header element with the text 'Categories'
    const accountLogin = await page.locator('h3')
    // Assert that the header has the text 'Categories'
    await expect(accountLogin).toHaveText('Categories')
});


test('should handle invalid URL parameters gracefully', async ({ page }) => {
    // Navigate to the URL with invalid parameters
    await page.goto('http://127.0.0.1:4455/.factly/dega/studio/categories?sort=desc&limit=10&page=NaN');
    // Locate the element that shows 'No data' message
    const invalidPage = await page.locator('text=No data');
    // Assert that the 'No data' message is visible
    await expect(invalidPage).toBeVisible();
});


// test('should persist categories data across sessions', async ({ page, context }) => {
//     // Get the text content of the first tag
//     const firstTagText = await page.locator('[data-row-key="11"]').textContent();
//     // Open a new page in the same context
//     await context.newPage();
//     // Navigate to the tags page
//     await page.goto('http://127.0.0.1:4455/.factly/dega/studio/tags?sort=desc&limit=10&page=1');
//     // Get the text content of the first tag again
//     const newFirstTagText = await page.locator('[data-row-key="11"]').textContent();
//     // Assert that the tag data is the same across sessions
//     expect(firstTagText).toEqual(newFirstTagText);
// });


test('should display empty state when no categories are present', async ({ page }) => {
    // Locate the element that represents the empty state image
    const emptyStateMessage = await page.locator('.ant-empty-image');
    // Assert that the empty state image is visible
    await expect(emptyStateMessage).toBeVisible();
});

test('should create a category succesfully ', async ({ page }) => {
    // Click on the 'Create' button
    await page.click('button:has-text("Create")');
    // Click on the 'Expand' button
    await page.click('button:has-text("Expand")');
    // Type the new tag name into the input field
    await page.type('#create-category_name', 'Others')
    // Click on the 'Save' button
    await page.click('button:has-text("Save")');
    await page.isVisible(`text=Others`);
    // Handle any dialog that appears by accepting it
    page.on('dialog', dialog => dialog.accept());
    // Get the success message text
    const successMessage = await page.textContent('.ant-notification-notice-description');
    // Assert that the success message is 'Tag created'
    expect(successMessage).toBe('Category created');
});


test('should delete a category successfully', async ({ page }) => {
    const categoryText = 'Other';
    // Select the row with the required fact-check text
    const rowSelector = `tr:has-text("${categoryText}")`;
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
    // Assert that the success message is 'Tag deleted'
    expect(successMessage).toBe('Category deleted');
});


test.only('should edit a category successfully ', async ({ page }) => {
    const categorySelector = 'text=Other';
    const newCategoryName = 'New';
    // Click on the category to be edited
    await page.click(categorySelector);
    // Click on the 'Expand' button
    await page.click('button:has-text("Expand")');
    // Fill in the new category name
    const inputSelector = '#create-category_name';
    await page.fill(inputSelector, newCategoryName);
    // Click on the 'Update' button
    await page.click('button:has-text("Update")');
    // Check if the t name has been updated
    await page.isVisible(`text=${newCategoryName}`);
    // const updatedCategory = await page.textContent(`text=${newCategoryName}`);
    // expect(updatedCategory).toBe(newCategoryName);
    // Handle any dialog that appears by accepting it
    page.on('dialog', dialog => dialog.accept());
    // Get the success message text
    const successMessage = await page.textContent('.ant-notification-notice-description');
    // Assert that the success message is 'Tag updated'
    expect(successMessage).toBe('Category updated');
});


test('Should find search results', async ({ page }) => {
    const categoryToSearch = 'One';
    const searchInputSelector = '#filters_q';
    // Click the search button
    await page.click('button:has([aria-label="search"])');
    // Enter the search query
    await page.fill(searchInputSelector , categoryToSearch);
    page.locator(categoryToSearch); 
    // Press 'Enter' to search
    await page.press(searchInputSelector, 'Enter');
    // Verify that the category is visible in the results
    const tagExists = await page.isVisible(`text=${categoryToSearch}`);
});


test('Should find no search results', async ({ page }) => {
    const categoryToSearch = 'Zero';
    const searchInputSelector = '#filters_q';
    // Click the search button
    await page.click('button:has([aria-label="search"])');
    // Enter the search query
    await page.fill('#filters_q', categoryToSearch);
    page.locator(tagToSearch); 
    // Press 'Enter' to search
    await page.press(searchInputSelector, 'Enter');
    // Verify that 'No data' is visible
    const accountLogin = await page.locator('text=No data');
    await expect(accountLogin).toBeVisible();
});



test('should display already exsists successfully', async ({ page }) => {
    const tagSelector = 'text=New';
    const newTagName = 'One';
    await page.click(tagSelector);
    await page.click('button:has-text("Expand")');
    const inputSelector = '#create-tag_name';
    await page.fill(inputSelector, newTagName);
    await page.click('button:has-text("Update")');
    page.on('dialog', dialog => dialog.accept());
    const successMessage = await page.textContent('.ant-notification-notice-description');
    expect(successMessage).toBe('Entity with same name exists');
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
    const tagSelector = 'text=Two';
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
  


test('should display tags correctly', async ({ page }) => {
    // Define the expected tag names
    const expectedTags = ['New', 'One', 'Two']; // Add more if needed

    // Loop through each expected tag and check if it's visible on the page
    for (const tagName of expectedTags) {
        const tagExists = await page.isVisible(`text=${tagName}`);
    }
});


test('should sort tags from latest to oldest', async ({ page }) => {
    // Click on the sorting dropdown
    await page.selectOption('.ant-select-item-option-content', 'Old') // Click on the option for sorting from latest to oldest

    // Get the text content of all tags
    const tags = await page.$$eval('.ant-table-tbody tr', rows => {
        return rows.map(row => row.textContent.trim());
    });

    // Check if tags are sorted from latest to oldest
    const sortedTags = tags.slice().sort((a, b) => {
        // Extract timestamp from the row content and compare
        const getTime = str => {
            const match = str.match(/Created At:\s*(.+)/);
            if (match) {
                return new Date(match[1]).getTime();
            }
            return 0;
        };
        return getTime(b) - getTime(a);
    });

    // Check if the tags are in the correct order
    expect(tags).toEqual(sortedTags);
});
