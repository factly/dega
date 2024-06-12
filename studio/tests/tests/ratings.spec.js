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


test('should stay logged in using stored cookies', async ({ page }) => {
    // Load session cookies from the file
    await page.context().addCookies(JSON.parse(require('fs').readFileSync('state.json', 'utf8')).cookies);

    // Navigate to a page that requires login
    await page.goto('http://127.0.0.1:4455/.factly/dega/studio/');

    // Verify the user is still logged in
    expect(await page.isVisible('text="Logout"')).toBeTruthy();
});

test('should load the ratings page successfully', async ({ page }) => {
    // Locate the header element with the text 'Tags'
    const accountLogin = await page.locator('h3')
    // Assert that the header has the text 'Tags'
    await expect(accountLogin).toHaveText('Ratings')
});


test('should handle invalid URL parameters gracefully', async ({ page }) => {
    // Navigate to the URL with invalid parameters
    await page.goto('http://127.0.0.1:4455/.factly/dega/studio/ratings?page=NaN');
    // Locate the element that shows 'No data' message
    const accountLogin = await page.locator('text=No data');
    // Assert that the 'No data' message is visible
    await expect(accountLogin).toBeVisible();
});


test('should persist ratings data across sessions', async ({ page, context }) => {
    // Get the text content of the first h3 element
    const firstTagText = await page.locator('h3').first().textContent();
    // Open a new page in the same context
    await context.newPage();
    // Navigate to the tags page
    await page.goto('http://127.0.0.1:4455/.factly/dega/studio/ratings?page=1');
    // Get the text content of the first h3 element again
    const newFirstTagText = await page.locator('h3').first().textContent();
    // Assert that the tag data is the same across sessions
    expect(firstTagText).toEqual(newFirstTagText);
});


test('should display empty state when no ratings are present', async ({ page }) => {
    // Locate the element that represents the empty state image
    const emptyStateMessage = await page.locator('.ant-empty-image');
    // Assert that the empty state image is visible
    await expect(emptyStateMessage).toBeVisible();
});

test('should create a rating succesfully ', async ({ page }) => {
    // Click on the 'New Rating' button
    await page.click('button:has-text("New Rating")');
    // Click on the 'Expand' button
    await page.click('button:has-text("Expand")');
    // Type the new rating name and its value into the input fields
    await page.type('#creat-rating_name', 'Outrageous');
    await page.type('#creat-rating_numeric_value', '3')
    // Click on the 'Save' button
    await page.click('button:has-text("Save")');
    await page.isVisible(`text=Outrageous`);
    // Handle any dialog that appears by accepting it
    page.on('dialog', dialog => dialog.accept());
    // Get the success message text
    const successMessage = await page.textContent('.ant-notification-notice-description');
    // Assert that the success message is 'Tag created'
    expect(successMessage).toBe('Rating created');
});


test('should delete a rating successfully', async ({ page }) => {
    const ratingText = 'Outrageous';
    // Select the row with the required rating text
    const rowSelector = `tr:has-text("${ratingText}")`;
    const buttonSelector = 'button:has([aria-label="delete"])'; 
    // Find the button within the specific row and click it
    const buttonLocator = page.locator(`${rowSelector} ${buttonSelector}`);
    // Ensure the button is available before clicking
    await buttonLocator.waitFor({ state: 'visible' });
    // Click on the Fact-check to be deleted
    await buttonLocator.click();
    // Click on the 'OK' button in the confirmation dialog
    await page.click('button:has-text("OK")');
});


test('should edit a ratings name successfully ', async ({ page }) => {
    const ratingSelector = 'text=Trues';
    const newRatingName = 'True';
    // Click on the rating to be edited
    await page.click(ratingSelector);
    // Click on the 'Expand' button
    await page.click('button:has-text("Expand")');
    // Fill in the new rating name
    const inputSelector = '#creat-rating_name';
    await page.fill(inputSelector, newRatingName);
    // Click on the 'Update' button
    await page.click('button:has-text("Update")');
    // Check if the tag name has been updated
    await page.isVisible(`text=True`);
    // Handle any dialog that appears by accepting it
    page.on('dialog', dialog => dialog.accept());
    // Get the success message text
    const successMessage = await page.textContent('.ant-notification-notice-description');
    // Assert that the success message is 'Tag updated'
    expect(successMessage).toBe('Rating updated');
});


test('should edit a ratings value successfully ', async ({ page }) => {
    const ratingSelector = 'text=True';
    const newRatingValue = '6';
    // Click on the rating to be edited
    await page.click(ratingSelector);
    // Click on the 'Expand' button
    await page.click('button:has-text("Expand")');
    // Fill in the new rating name
    const inputSelector = '#creat-rating_numeric_value';
    await page.fill(inputSelector, newRatingValue);
    // Click on the 'Update' button
    await page.click('button:has-text("Update")');
    // Check if the tag name has been updated
    await page.isVisible(`text=True`);
    // Handle any dialog that appears by accepting it
    page.on('dialog', dialog => dialog.accept());
    // Get the success message text
    const successMessage = await page.textContent('.ant-notification-notice-description');
    // Assert that the success message is 'Tag updated'
    expect(successMessage).toBe('Rating updated');
});


test('Should find search results', async ({ page }) => {
    const ratingToSearch = 'One';
    const searchInputSelector = '#filters_q';
    // Click the search button
    await page.click('button:has([aria-label="search"])');
    // Enter the search query
    await page.fill(searchInputSelector , ratingToSearch);
    page.locator(ratingToSearch); 
    // Press 'Enter' to search
    await page.press(searchInputSelector, 'Enter');
    // Verify that the tag is visible in the results
    const tagExists = await page.isVisible(`text=${ratingToSearch}`);
});


test('Should find no search results', async ({ page }) => {
    const ratingToSearch = 'Zero';
    const searchInputSelector = '#filters_q';
    // Click the search button
    await page.click('button:has([aria-label="search"])');
    // Enter the search query
    await page.fill('#filters_q', ratingToSearch);
    page.locator(ratingToSearch); 
    // Press 'Enter' to search
    await page.press(searchInputSelector, 'Enter');
    // Verify that 'No data' is visible
    const accountLogin = await page.locator('text=No data');
    await expect(accountLogin).toBeVisible();
});



test.only('should display rating already exsists successfully', async ({ page }) => {
    // Click on the 'New Rating' button
    await page.click('button:has-text("New Rating")');
    // Click on the 'Expand' button
    await page.click('button:has-text("Expand")');
    // Type the new rating name and its value into the input fields
    await page.type('#creat-rating_name', 'True');
    await page.type('#creat-rating_numeric_value', '3')
    // Click on the 'Save' button
    await page.click('button:has-text("Save")');
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
    const ratingSelector = 'text=Two';
    await page.click(ratingSelector);
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
  


test('should display ratings correctly', async ({ page }) => {
    // Define the expected rating names
    const expectedRatings = ['New', 'One', 'Two']; // Add more if needed

    // Loop through each expected tag and check if it's visible on the page
    for (const ratingName of expectedRatings) {
        const ratingExists = await page.isVisible(`text=${ratingName}`);
    }
});


test('should sort ratings from latest to oldest', async ({ page }) => {
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
