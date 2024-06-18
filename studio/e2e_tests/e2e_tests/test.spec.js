// Import necessary modules from Playwright
import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import {getRandomString} from './randomfunc.js';
// Read from default ".env" file.
dotenv.config();



// This beforeEach hook runs before each test, setting up the test environment
test.only('lohin',async ({ page }) => {
    test.setTimeout(900000)
    // Navigate to the login page
    await page.goto(`${process.env.BASE_URL}/.factly/dega/studio/`);
    // Fill in the email and password fields
    await page.type('#auth_email', `${process.env.AUTH_EMAIL}`);
    await page.type('#auth_password', `${process.env.AUTH_PASSWORD}`);
    // Click the login button
    await page.click('text=Login')
    // Save session cookies to a file
    const cookies = await page.context().cookies();
    await page.context().storageState({ path: 'state.json' });
});


test.beforeEach( async ({ page }) => {
    // Load session cookies from the file
    await page.context().addCookies(JSON.parse(require('fs').readFileSync('state.json', 'utf8')).cookies);
    // Navigate to a page that requires login
    await page.goto(`${process.env.BASE_URL}/.factly/dega/studio/`);
    // Verify the user is still logged in
    expect(await page.isVisible('text="Dashboard"')).toBeTruthy();
    await page.goto(`${process.env.BASE_URL}/.factly/dega/studio/tags?sort=desc&limit=10&page=1`);
});


test('should create tag successfully', async ({ page }) => {
    // Click on the 'Create' button
    await page.click('button:has-text("Create")');
    // Click on the 'Expand' button
    await page.click('button:has-text("Expand")');
    // Generate a random string
    const randomString = getRandomString(10); // Adjust the length as needed
    // Type the new tag name with the random string into the input field
    const tagName = `This is a test tag ${randomString}`;
    await page.type('#create-tag_name', tagName);
    // Click on the 'Save' button
    await page.click('button:has-text("Save")');
    // Handle any dialog that appears by accepting it
    page.on('dialog', dialog => dialog.accept());
    // Get the success message text
    const successMessage = await page.textContent('.ant-notification-notice-description');
    // Assert that the success message is 'Tag created'
    expect(successMessage).toBe('Tag created');
});