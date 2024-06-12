// Import necessary modules from Playwright
import { test, expect } from '@playwright/test';


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
    await page.goto('http://127.0.0.1:4455/.factly/dega/studio/podcasts?sort=desc&limit=10&page=1');
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
    expect(await page.isVisible('text="Dashboard"')).toBeTruthy();
});


test('should load the podcasts page successfully', async ({ page }) => {
    // Locate the header element with the text 'podcasts'
    const accountLogin = await page.locator('h3')
    // Assert that the header has the text 'podcasts'
    await expect(accountLogin).toHaveText('podcasts')
});


test('should handle invalid URL parameters gracefully', async ({ page }) => {
    // Navigate to the URL with invalid parameters
    await page.goto('http://127.0.0.1:4455/.factly/dega/studio/podcasts?sort=desc&limit=10&page=NaN');
    // Locate the element that shows 'No data' message
    const accountLogin = await page.locator('text=No data');
    // Assert that the 'No data' message is visible
    await expect(accountLogin).toBeVisible();
});


test('should persist podcast data across sessions', async ({ page, context }) => {
    // Get the text content of the first h3 element
    const firstpodcastText = await page.locator('h3').first().textContent();
    // Open a new page in the same context
    await context.newPage();
    // Navigate to the podcasts page
    await page.goto('http://127.0.0.1:4455/.factly/dega/studio/podcasts?sort=desc&limit=10&page=1');
    // Get the text content of the first h3 element again
    const newFirstpodcastText = await page.locator('h3').first().textContent();
    // Assert that the podcast data is the same across sessions
    expect(firstpodcastText).toEqual(newFirstpodcastText);
});


test('should display "Please enter title!" successfully, when the name input field is empty', async ({ page }) => {
    test.setTimeout(90000)
    // Click on the 'Create' button
    await page.click('button:has-text("Create")');
    // Click on the 'Expand' button
    await page.click('button:has-text("Expand")');
    // Type the new podcast name into the input field
    const podcastName = 'This is a test podcast';
    await page.type('#create-category_title', podcastName);
    // Get the length of the typed text
    const deletePressCount = podcastName.length;
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


test('should create podcast successfully', async ({ page }) => {
    // Click on the 'Create' button
    await page.click('button:has-text("Create")');
    // Click on the 'Expand' button
    await page.click('button:has-text("Expand")');

    // Generate a random string
    const randomString = getRandomString(10); // Adjust the length as needed

    // Type the new podcast name with the random string into the input field
    const podcastName = `This is a test podcast ${randomString}`;
    await page.type('#create-category_title', podcastName);

    // Click on the 'Save' button
    await page.click('button:has-text("Save")');

    // Check if the podcast is visible
    await page.isVisible(`text=${podcastName}`);

    // Handle any dialog that appears by accepting it
    page.on('dialog', dialog => dialog.accept());

    // Get the success message text
    const successMessage = await page.textContent('.ant-notification-notice-description');

    // Assert that the success message is 'Podcast added'
    expect(successMessage).toBe('Podcast added');
});


test('should delete podcast successfully', async ({ page }) => {
    const podcastText = 'Two';
    const nextButtonSelector = 'button:has([aria-label="right"])';
    let podcastFound = false;
    while (true) {
        // Check if the podcast is present on the current page
        const rowSelector = `tr:has-text("${podcastText}")`;
        const buttonSelector = 'button:has([aria-label="delete"])';
        const buttonLocator = page.locator(`${rowSelector} ${buttonSelector}`);
        // Check if the row with the podcast text is visible
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
            // Assert that the success message is 'Podcast deleted'
            expect(successMessage).toBe('Podcast deleted');
            podcastFound = true;
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
    // Assert that the podcast was found and deleted
    expect(podcastFound).toBe(true);
});

//Cannot edit the podcast for now
// test('should edit a podcast successfully', async ({ page }) => {

//     // Generate a random string
//     const randomString = getRandomString(10); // Adjust the length as needed
//     const podcastSelector = 'text=Six';
//     const newpodcastName =  `This is a test podcast ${randomString}`;;
//     let podcastFound = false;
//     let pageIndex = 1;

//     // Function to check if the podcast is on the current page
//     const ispodcastVisible = async () => {
//         const podcastElements = await page.$$(podcastSelector);
//         return podcastElements.length > 0;
//     };

//     // Loop through pages until the podcast is found
//     while (!podcastFound) {
//         podcastFound = await ispodcastVisible();

//         if (!podcastFound) {
//             // Click the next page button (assuming there's a next page button with the text 'Next')
//             await page.click('button:has([aria-label="right"])');
//             await page.waitForTimeout(1000); // Wait for the next page to load
//             pageIndex++;
//         }
//     }

//     // Click on the podcast to be edited
//     await page.click(podcastSelector);
//     // Click on the 'Expand' button
//     await page.click('button:has-text("Expand")');
//     // Fill in the new podcast name
//     const inputSelector = '#create-podcast_name';
//     await page.fill(inputSelector, newpodcastName);
//     // Click on the 'Update' button
//     await page.click('button:has-text("Update")');
//     // Check if the podcast name has been updated
//     const updatedpodcast = await page.textContent(`text=${newpodcastName}`);
//     expect(updatedpodcast).toBe(newpodcastName);
//     // Handle any dialog that appears by accepting it
//     page.on('dialog', dialog => dialog.accept());
//     // Get the success message text
//     const successMessage = await page.textContent('.ant-notification-notice-description');
//     // Assert that the success message is 'podcast updated'
//     expect(successMessage).toBe('podcast updated');
// });


test('Should find search results', async ({ page }) => {
    const podcastToSearch = 'Nine';
    const searchInputSelector = '#filters_q';
    // Click the search button
    await page.click('button:has([aria-label="search"])');
    // Enter the search query
    await page.fill(searchInputSelector , podcastToSearch);
    page.locator(podcastToSearch); 
    // Press 'Enter' to search
    await page.press(searchInputSelector, 'Enter');
    // Verify that the podcast is visible in the results
    const podcastExists = await page.isVisible(`text=${podcastToSearch}`);
});


test('should display "podcast already exists" successfully', async ({ page }) => {
    // Define the selector for the podcast to be clicked
    const podcastSelector = 'text=New';
    // Define the new podcast name to be entered
    const newpodcastName = 'One';
    // Click the podcast to create a new entry
    await page.click(podcastSelector);
    // Click the button to expand the form
    await page.click('button:has-text("Expand")');
    // Define the selector for the input field where the podcast name will be entered
    const inputSelector = '#create-podcast_name';
    // Fill the input field with the new podcast name
    await page.fill(inputSelector, newpodcastName);
    // Click the button to update/create the podcast
    await page.click('button:has-text("Update")');
    // Handle the dialog that appears by accepting it
    page.on('dialog', dialog => dialog.accept());
    // Get the success message displayed in the notification
    const successMessage = await page.textContent('.ant-notification-notice-description');
    // Assert that the success message matches the expected text
    expect(successMessage).toBe('Entity with same name exists');
});



test('should remove alert box when x is clicked successfully', async ({ page }) => {
    const podcastText = 'Twelve';
    const podcastSelector = `text=${podcastText}`;
    // Click on the delete button for the podcast
    await page.click('button:has([aria-label="delete"])');
    // Click on the 'OK' button in the confirmation dialog
    await page.click('button:has-text("OK")');
    // Handle any dialog that appears by accepting it
    page.on('dialog', dialog => dialog.accept());
    await page.click('.ant-notification-notice-close');
    // Locate the element that shows 'podcast deleted' message
    const accountLogin = await page.locator('text=podcast deleted');
    // Assert that the 'No data' message is visible
    await expect(accountLogin).not.toBeVisible();
});


test('when the button is clicked, should scroll to the top of the page', async ({ page }) => {
    const podcastSelector = 'text=Ten';
    await page.click(podcastSelector);
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
  


test('should display podcasts correctly', async ({ page }) => {
    // Define the expected podcast names
    const expectedpodcasts = ['New', 'One', 'Two']; // Add more if needed

    // Loop through each expected podcast and check if it's visible on the page
    for (const podcastName of expectedpodcasts) {
        const podcastExists = await page.isVisible(`text=${podcastName}`);
    }
});


test('should display empty state when no podcasts are present', async ({ page }) => {
    // Locate the element that represents the empty state image
    const emptyStateMessage = await page.locator('.ant-empty-image');
    // Assert that the empty state image is visible
    await expect(emptyStateMessage).toBeVisible();
});


test('Should find no search results', async ({ page }) => {
    const podcastToSearch = 'Zero';
    const searchInputSelector = '#filters_q';
    // Click the search button
    await page.click('button:has([aria-label="search"])');
    // Enter the search query
    await page.fill('#filters_q', podcastToSearch);
    page.locator(podcastToSearch); 
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


test('should navigate to the selected page', async ({ page }) => {
    const pageNumber = 2; // You can set this to any number dynamically
  
    // Click the button to navigate to the next page
    await page.click(`.ant-pagination-item-${pageNumber}`);
    await page.waitForNavigation();
  
    // Verify that the URL contains 'page=2'
    expect(page.url()).toContain(`page=${pageNumber}`);
});


test('should sort podcasts from latest to oldest', async ({ page }) => {
    // Click on the sorting dropdown
    await page.click('#filters_sort', { force: true }); 
    // Click on the option for sorting from latest to oldest
    await page.click('.ant-select-item[title="Latest"]');  
    // Get the text content of all podcasts
    const podcasts = await page.$$eval('.ant-table-tbody tr', rows => {
        return rows.map(row => row.textContent.trim());
    });

    // Check if podcasts are sorted from latest to oldest
    const sortedpodcasts = podcasts.slice().sort((a, b) => {
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

    // Check if the podcasts are in the correct order
    expect(podcasts).toEqual(sortedpodcasts);
});


test('should sort podcasts from oldest to latest', async ({ page }) => {
    // Click on the sorting dropdown
    await page.click('#filters_sort', { force: true });

    // Click on the option for sorting from oldest to latest
    await page.click('.ant-select-item[title="Old"]');  // Adjust the title as needed if "Old" means oldest

    // Get the text content of all podcasts
    const podcasts = await page.$$eval('.ant-table-tbody tr', rows => {
        return rows.map(row => row.textContent.trim());
    });

    // Check if podcasts are sorted from oldest to latest
    const sortedpodcasts = podcasts.slice().sort((a, b) => {
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

    // Check if the podcasts are in the correct order
    expect(podcasts).toEqual(sortedpodcasts);
});

