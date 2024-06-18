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
    test.setTimeout(90000)
    // Navigate to the login page
    await page.goto(`${process.env.BASE_URL}/.factly/dega/studio/`);
    // Fill in the email and password fields
    await page.type('#auth_email', `${process.env.AUTH_EMAIL}`);
    await page.type('#auth_password', `${process.env.AUTH_PASSWORD}`);
    // Click the login button
    await page.click('text=Login')
    await page.goto(`${process.env.BASE_URL}/.factly/dega/studio/episodes?sort=desc&limit=10&page=1`);
    // Save session cookies to a file
    const cookies = await page.context().cookies();
    await page.context().storageState({ path: 'state.json' });
});


test('should stay logged in using stored cookies', async ({ page }) => {
    // Load session cookies from the file
    await page.context().addCookies(JSON.parse(require('fs').readFileSync('state.json', 'utf8')).cookies);
    // Navigate to a page that requires login
    await page.goto(`${process.env.BASE_URL}/.factly/dega/studio/`);
    // Verify the user is still logged in
    expect(await page.isVisible('text="Dashboard"')).toBeTruthy();
});


test('should load the episodes page successfully', async ({ page }) => {
    // Locate the header element with the text 'Episodes'
    const accountLogin = await page.locator('h3')
    // Assert that the header has the text 'Episodes'
    await expect(accountLogin).toHaveText('Episodes')
});


test('should handle invalid URL parameters gracefully', async ({ page }) => {
    // Navigate to the URL with invalid parameters
    await page.goto(`${process.env.BASE_URL}/.factly/dega/studio/episodes?sort=desc&limit=10&page=NaN`);
    // Locate the element that shows 'No data' message
    const accountLogin = await page.locator('text=No data');
    // Assert that the 'No data' message is visible
    await expect(accountLogin).toBeVisible();
});


test('should persist episode data across sessions', async ({ page, context }) => {
    // Get the text content of the first h3 element
    const firstepisodeText = await page.locator('h3').first().textContent();
    // Open a new page in the same context
    await context.newPage();
    // Navigate to the episodes page
    await page.goto(`${process.env.BASE_URL}/.factly/dega/studio/episodes?sort=desc&limit=10&page=1`);
    // Get the text content of the first h3 element again
    const newFirstepisodeText = await page.locator('h3').first().textContent();
    // Assert that the episode data is the same across sessions
    expect(firstepisodeText).toEqual(newFirstepisodeText);
});

//Perform this test case only when there are no tags present
test('should display empty state when no episodes are present', async ({ page }) => {
    // Locate the element that represents the empty state image
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


test('should sort episodes from latest to oldest', async ({ page }) => {
    // Click on the sorting dropdown
    await page.click('#filters_sort', { force: true }); 
    // Click on the option for sorting from latest to oldest
    await page.click('.ant-select-item[title="Latest"]');  
    // Get the text content of all episodes
    const episodes = await page.$$eval('.ant-table-tbody tr', rows => {
        return rows.map(row => row.textContent.trim());
    });
    // Check if episodes are sorted from latest to oldest
    const sortedepisodes = episodes.slice().sort((a, b) => {
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
    // Check if the episodes are in the correct order
    expect(episodes).toEqual(sortedepisodes);
});


test('should sort episodes from oldest to latest', async ({ page }) => {
    // Click on the sorting dropdown
    await page.click('#filters_sort', { force: true });

    // Click on the option for sorting from oldest to latest
    await page.click('.ant-select-item[title="Old"]');  // Adjust the title as needed if "Old" means oldest

    // Get the text content of all episodes
    const episodes = await page.$$eval('.ant-table-tbody tr', rows => {
        return rows.map(row => row.textContent.trim());
    });
    // Check if episodes are sorted from oldest to latest
    const sortedepisodes = episodes.slice().sort((a, b) => {
        // Extract timestamp from the row content and compare
        const getTime = str => {
            const match = str.match(/Created At:\s*(.+)/);
            if (match) {
                return new Date(match[1]).getTime();
            }
            return 0;
        };
        return getTime(a) - getTime(b); // Sorting in ascending order
    });
    // Check if the episodes are in the correct order
    expect(episodes).toEqual(sortedepisodes);
});



test('should remove alert box when x is clicked successfully', async ({ page }) => {
    const episodeText = 'Twelve';
    const episodeSelector = `text=${episodeText}`;
    // Click on the delete button for the episode
    await page.click('button:has([aria-label="delete"])');
    // Click on the 'OK' button in the confirmation dialog
    await page.click('button:has-text("OK")');
    // Handle any dialog that appears by accepting it
    page.on('dialog', dialog => dialog.accept());
    await page.click('.ant-notification-notice-close');
    // Locate the element that shows 'episode deleted' message
    const accountLogin = await page.locator('text=episode deleted');
    // Assert that the 'No data' message is visible
    await expect(accountLogin).not.toBeVisible();
});


test('when the button is clicked, should scroll to the top of the page', async ({ page }) => {
    const episodeSelector = 'text=Ten';
    await page.click(episodeSelector);
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
  


test('should display "Please enter title!" successfully, when the name input field is empty', async ({ page }) => {
    test.setTimeout(90000)
    // Click on the 'Create' button
    await page.click('button:has-text("Create")');
    // Type the new episode name into the input field
    const episodeName = 'This is a test episode';
    await page.type('#create-category_title', episodeName);
    // Get the length of the typed text
    const deletePressCount = episodeName.length;
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
    // Assert that the success message is 'Please enter title!'
    expect(errorMessage).toBe('Please enter title!');
});


test('should create a episode successfully', async ({ page }) => {
    // Click on the 'Create' button
    await page.click('button:has-text("Create")');
    // Click on the 'Expand' button
    await page.click('button:has-text("Expand")');
    // Generate a random string
    const randomString = getRandomString(10); // Adjust the length as needed
    // Type the new episode name with the random string into the input field
    const episodeName = `This is a test episode ${randomString}`;
    await page.type('#create-category_title', episodeName);
    // Click on the 'Save' button
    await page.click('button:has-text("Save")');
    // Check if the episode is visible
    await page.isVisible(`text=${episodeName}`);
    // Handle any dialog that appears by accepting it
    page.on('dialog', dialog => dialog.accept());
    // Get the success message text
    const successMessage = await page.textContent('.ant-notification-notice-description');
    // Assert that the success message is 'episode created'
    expect(successMessage).toBe('episode created');
});


test('should delete episode successfully', async ({ page }) => {
    const episodeText = 'Two';
    const nextButtonSelector = 'button:has([aria-label="right"])';
    let episodeFound = false;
    while (true) {
        // Check if the episode is present on the current page
        const rowSelector = `tr:has-text("${episodeText}")`;
        const buttonSelector = 'button:has([aria-label="delete"])';
        const buttonLocator = page.locator(`${rowSelector} ${buttonSelector}`);
        // Check if the row with the episode text is visible
        const rowCount = await page.locator(rowSelector).count();
        if (rowCount > 0) {
            // Ensure the button is available before clicking
            await buttonLocator.waitFor({ state: 'visible' });
            // Click the delete button
            await buttonLocator.click();
            // Click on the 'OK' button in the confirmation dialog
            await page.click('button:has-text("OK")');
            // Handle any dialog that appears by accepting it
            page.on('dialog', dialog => dialog.accept());
            // Get the success message text
            const successMessage = await page.textContent('.ant-notification-notice-description');
            // Assert that the success message is 'episode deleted'
            expect(successMessage).toBe('episode deleted');
            episodeFound = true;
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
        // Wait for the next page to load (adjust the selector as needed)
        await page.waitForSelector(rowSelector, { state: 'attached' });
    }
    // Assert that the episode was found and deleted
    expect(episodeFound).toBe(true);
});


test('should edit a episode successfully', async ({ page }) => {
    // Generate a random string
    const randomString = getRandomString(10); // Adjust the length as needed
    const episodeselector = 'text=Six';
    const newepisodeName =  `This is a test episode ${randomString}`;;
    let episodeFound = false;
    let pageIndex = 1;

    // Function to check if the episode is on the current page
    const isepisodeVisible = async () => {
        const episodeElements = await page.$$(episodeselector);
        return episodeElements.length > 0;
    };
    // Loop through pages until the episode is found
    while (!episodeFound) {
        episodeFound = await isepisodeVisible();

        if (!episodeFound) {
            // Click the next page button (assuming there's a next page button with the text 'Next')
            await page.click('button:has([aria-label="right"])');
            await page.waitForTimeout(1000); // Wait for the next page to load
            pageIndex++;
        }
    }
    // Click on the episode to be edited
    await page.click(episodeSelector);
    // Click on the 'Expand' button
    await page.click('button:has-text("Expand")');
    // Fill in the new episode name
    const inputSelector = '#create-episode_name';
    await page.fill(inputSelector, newepisodeName);
    // Click on the 'Update' button
    await page.click('button:has-text("Update")');
    // Check if the episode name has been updated
    const updatedepisode = await page.textContent(`text=${newepisodeName}`);
    expect(updatedepisode).toBe(newepisodeName);
    // Handle any dialog that appears by accepting it
    page.on('dialog', dialog => dialog.accept());
    // Get the success message text
    const successMessage = await page.textContent('.ant-notification-notice-description');
    // Assert that the success message is 'episode updated'
    expect(successMessage).toBe('episode updated');
});


test('Should find search results', async ({ page }) => {
    const episodeToSearch = 'Nine';
    const searchInputSelector = '#filters_q';
    // Click the search button
    await page.click('button:has([aria-label="search"])');
    // Enter the search query
    await page.fill(searchInputSelector , episodeToSearch);
    page.locator(episodeToSearch); 
    // Press 'Enter' to search
    await page.press(searchInputSelector, 'Enter');
    // Verify that the episode is visible in the results
    const episodeExists = await page.isVisible(`text=${episodeToSearch}`);
});


test('Should find no search results', async ({ page }) => {
    const episodeToSearch = 'Zero';
    const searchInputSelector = '#filters_q';
    // Click the search button
    await page.click('button:has([aria-label="search"])');
    // Enter the search query
    await page.fill('#filters_q', episodeToSearch);
    page.locator(episodeToSearch); 
    // Press 'Enter' to search
    await page.press(searchInputSelector, 'Enter');
    // Verify that 'No data' is visible
    const accountLogin = await page.locator('text=No data');
    await expect(accountLogin).toBeVisible();
});



test('Should find search results based on podcasts', async ({ page }) => {
    // Locate the specific dropdown using a more specific selector
    const dropdownContainerSelector = '.ant-form-item-control-input-content';
    const dropdownSelector = `${dropdownContainerSelector} .ant-select-selector`;
    // Click on the dropdown to open it
    await page.locator(dropdownSelector).first().click();
    // Select the option "Seven" from the dropdown
    const optionSelector = '.ant-select-item-option[title="Seven"]';
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



test('should display "episode already exists" successfully', async ({ page }) => {
    // Define the selector for the episode to be clicked
    const episodeSelector = 'text=New';
    // Define the new episode name to be entered
    const newepisodeName = 'One';
    // Click the episode to create a new entry
    await page.click(episodeSelector);
    // Click the button to expand the form
    await page.click('button:has-text("Expand")');
    // Define the selector for the input field where the episode name will be entered
    const inputSelector = '#create-episode_name';
    // Fill the input field with the new episode name
    await page.fill(inputSelector, newepisodeName);
    // Click the button to update/create the episode
    await page.click('button:has-text("Update")');
    // Handle the dialog that appears by accepting it
    page.on('dialog', dialog => dialog.accept());
    // Get the success message displayed in the notification
    const successMessage = await page.textContent('.ant-notification-notice-description');
    // Assert that the success message matches the expected text
    expect(successMessage).toBe('Entity with same name exists');
});

