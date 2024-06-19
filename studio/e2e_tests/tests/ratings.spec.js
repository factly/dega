// Import necessary modules from Playwright
import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import {getRandomString} from './randomfunc.js';
// Read from default ".env" file.
dotenv.config();


// This beforeEach hook runs before each test, setting up the test environment
test.beforeEach(async ({ page }) => {
    test.setTimeout(90000)
    // Navigate to the login page
    await page.goto(`${process.env.BASE_URL}`);
    // Fill in the email and password fields
    await page.type('#auth_email', `${process.env.AUTH_EMAIL}`);
    await page.type('#auth_password', `${process.env.AUTH_PASSWORD}`);
    // Click the login button
    await page.click('text=Login')
    await page.goto(`${process.env.BASE_URL}ratings?page=1`);
    // Save session cookies to a file
    const cookies = await page.context().cookies();
    await page.context().storageState({ path: 'state.json' });
});


test('should create rating successfully', async ({ page }) => {
    // Click on the 'New Rating' button
    await page.click('button:has-text("New Rating")');
    // Click on the 'Expand' button
    await page.click('button:has-text("Expand")');
    // Generate a random string
    const randomString = getRandomString(10); // Adjust the length as needed
    // Type the new rating name with the random string into the input field
    const ratingName = `This is a test rating ${randomString}`;
    await page.type('#creat-rating_name', ratingName);
    await page.type('#creat-rating_numeric_value', '5')
    // Click on the 'Save' button
    await page.click('button:has-text("Save")');
    // Handle any dialog that appears by accepting it
    page.on('dialog', dialog => dialog.accept());
    // Get the success message text
    const successMessage = await page.textContent('.ant-notification-notice-description');
    // Assert that the success message is 'Rating created'
    expect(successMessage).toBe('Rating created');
});


test('should delete a rating successfully', async ({ page }) => {
    const ratingText = 'Outrageous';
    const nextButtonSelector = 'button:has([aria-label="right"])';
    let ratingFound = false;
    while (true) {
        // Check if the rating is present on the current page
        const rowSelector = `tr:has-text("${ratingText}")`;
        const buttonSelector = 'button:has([aria-label="delete"])';
        const buttonLocator = page.locator(`${rowSelector} ${buttonSelector}`);
        // Check if the row with the rating text is visible
        const rowCount = await page.locator(rowSelector).count();
        if (rowCount > 0) {
            // Ensure the button is available before clicking
            await buttonLocator.waitFor({ state: 'visible' });
            // Click the delete button
            await buttonLocator.click();
            // Click on the 'OK' button in the confirmation dialog
            await page.click('button:has-text("OK")');
            ratingFound = true;
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
    // Assert that the rating was found and deleted
    expect(ratingFound).toBe(true);
});


test('should edit a ratings name successfully ', async ({ page }) => {
    const ratingSelector = 'text=Partially true';
    const newRatingName = 'Trues';
    // Click on the rating to be edited
    await page.click(ratingSelector);
    // Click on the 'Expand' button
    await page.click('button:has-text("Expand")');
    // Fill in the new rating name
    const inputSelector = '#creat-rating_name';
    await page.fill(inputSelector, newRatingName);
    // Click on the 'Update' button
    await page.click('button:has-text("Update")');
    // Check if the rating name has been updated
    await page.isVisible(`text=True`);
    // Handle any dialog that appears by accepting it
    page.on('dialog', dialog => dialog.accept());
    // Get the success message text
    const successMessage = await page.textContent('.ant-notification-notice-description');
    // Assert that the success message is 'rating updated'
    expect(successMessage).toBe('Rating updated');
});


test('should edit a ratings value successfully ', async ({ page }) => {
    const ratingSelector = 'text=Trues';
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
    // Check if the rating name has been updated
    await page.isVisible(`text=True`);
    // Handle any dialog that appears by accepting it
    page.on('dialog', dialog => dialog.accept());
    // Get the success message text
    const successMessage = await page.textContent('.ant-notification-notice-description');
    // Assert that the success message is 'rating updated'
    expect(successMessage).toBe('Rating updated');
});


test('should display "rating with same name already exists" successfully', async ({ page }) => {
    // Click on the 'New Rating' button
    await page.click('button:has-text("New Rating")');
    // Click on the 'Expand' button
    await page.click('button:has-text("Expand")');
    // Type the rating name which already exists and its value into the input fields
    await page.type('#creat-rating_name', 'Trues');
    await page.type('#creat-rating_numeric_value', '3')
    // Click on the 'Save' button
    await page.click('button:has-text("Save")');
    page.on('dialog', dialog => dialog.accept());
    const successMessage = await page.textContent('.ant-notification-notice-description');
    expect(successMessage).toBe('Entity with same name exists');
});


test('should display "rating with same numeric value exists" successfully', async ({ page }) => {
    // Click on the 'New Rating' button
    await page.click('button:has-text("New Rating")');
    // Click on the 'Expand' button
    await page.click('button:has-text("Expand")');
    // Generate a random string
    const randomString = getRandomString(10); // Adjust the length as needed
    // Type the new rating name with the random string into the input field
    const ratingName = `This is a test rating ${randomString}`;
    await page.type('#creat-rating_name', ratingName);
    await page.type('#creat-rating_numeric_value', '3')
    // Click on the 'Save' button
    await page.click('button:has-text("Save")');
    // Handle any dialog that appears by accepting it
    page.on('dialog', dialog => dialog.accept());
    // Get the success message text
    const successMessage = await page.textContent('.ant-notification-notice-description');
    // Assert that the success message is 'rating with same numeric value exists'
    expect(successMessage).toBe('rating with same numeric value exists');
});



test('should stay logged in using stored cookies', async ({ page }) => {
    // Load session cookies from the file
    await page.context().addCookies(JSON.parse(require('fs').readFileSync('state.json', 'utf8')).cookies);
    // Navigate to a page that requires login
    await page.goto(`${process.env.BASE_URL}`);
    // Verify the user is still logged in
    expect(await page.isVisible('text="Logout"')).toBeTruthy();
});


test('should load the ratings page successfully', async ({ page }) => {
    // Locate the header element with the text 'ratings'
    const accountLogin = await page.locator('h3')
    // Assert that the header has the text 'Ratings'
    await expect(accountLogin).toHaveText('Ratings')
});


test('should handle invalid URL parameters gracefully', async ({ page }) => {
    // Navigate to the URL with invalid parameters
    await page.goto(`${process.env.BASE_URL}ratings?page=NaN`);
    // Locate the element that shows 'No data' message
    const accountLogin = await page.locator('text=No data');
    // Assert that the 'No data' message is visible
    await expect(accountLogin).toBeVisible();
});


test('should persist ratings data across sessions', async ({ page, context }) => {
    // Get the text content of the first h3 element
    const firstratingText = await page.locator('h3').first().textContent();
    // Open a new page in the same context
    await context.newPage();
    // Navigate to the ratings page
    await page.goto(`${process.env.BASE_URL}ratings?page=1`);
    // Get the text content of the first h3 element again
    const newFirstratingText = await page.locator('h3').first().textContent();
    // Assert that the rating data is the same across sessions
    expect(firstratingText).toEqual(newFirstratingText);
});


//Perform this test case only when there are no ratings present
test('should display empty state when no ratings are present', async ({ page }) => {
    // Locate the element that represents the empty state image
    const emptyStateMessage = await page.locator('.ant-empty-image');
    // Assert that the empty state image is visible
    await expect(emptyStateMessage).toBeVisible();
});


test('should check for the numeric value input field up and down functionality successfully', async ({ page }) => {
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


test('when the button is clicked, should scroll to the top of the page', async ({ page }) => {
    const ratingSelector = 'text=Trues';
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
  
