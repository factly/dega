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
    test.setTimeout(90000)
    // Navigate to the login page
    await page.goto('http://127.0.0.1:4455/.factly/dega/studio/');
    // Fill in the email and password fields
    await page.type('#auth_email', 'ramsai.rapole@factly.in')
    await page.type('#auth_password', 'Wrongpass@123')
    await page.click('text=Login')
    // Click the login button
    await page.goto('http://127.0.0.1:4455/.factly/dega/studio/claims?sort=desc');
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


test('should load the claims page successfully', async ({ page }) => {
    // Locate the header element with the text 'claims'
    const accountLogin = await page.locator('h3')
    // Assert that the header has the text 'Claims'
    await expect(accountLogin).toHaveText('Claims')
});


test('should handle invalid URL parameters gracefully', async ({ page }) => {
    // Navigate to the URL with invalid parameters
    await page.goto('http://127.0.0.1:4455/.factly/dega/studio/claims?sort=desc&limit=10&page=NaN');
    // Locate the element that shows 'No data' message
    const accountLogin = await page.locator('text=No data');
    // Assert that the 'No data' message is visible
    await expect(accountLogin).toBeVisible();
});


test('should persist claim data across sessions', async ({ page, context }) => {
    // Get the text content of the first h3 element
    const firstclaimText = await page.locator('h3').first().textContent();
    // Open a new page in the same context
    await context.newPage();
    // Navigate to the claims page
    await page.goto('http://127.0.0.1:4455/.factly/dega/studio/claims?sort=desc&limit=10&page=1');
    // Get the text content of the first h3 element again
    const newFirstclaimText = await page.locator('h3').first().textContent();
    // Assert that the claim data is the same across sessions
    expect(firstclaimText).toEqual(newFirstclaimText);
});


test('should display "Please input the Claim!" successfully, when the respective input fields are empty', async ({ page }) => {
    test.setTimeout(90000)
    // Click on the 'Create' button
    await page.click('button:has-text("Create")');
    // Enter text into the claim input field
    const claimName = 'New claimss';
    await page.type('#create-claim_claim', claimName);
    // Get the length of the typed text
    const deletePressCount = claimName.length;
    // Press the Backspace key multiple times
    for (let i = 0; i < deletePressCount; i++) {
        await page.keyboard.press('Backspace');
    }
    // Click on the 'Submit' button
    await page.click('button:has-text("Submit")');
    // Wait for the error message to appear
    await page.waitForSelector('.ant-form-item-explain-error', { timeout: 80000 });
    // Get the error message text
    const errorMessage = await page.textContent('.ant-form-item-explain-error');
    // Assert that the success message is 'Please input the Claim!'
    expect(errorMessage).toBe('Please input the Claim!');
});

test('should display "Please add claimant!" successfully, when the claimant input fields are empty', async ({ page }) => {
    test.setTimeout(90000)
    // Click on the 'Create' button
    await page.click('button:has-text("Create")');
    // Click on the 'Expand' button
    await page.click('button:has-text("Expand")');
    // Type the new claim name into the input field
    const claimName = 'Th';
    await page.type('#create-claim_claim', claimName);
    // Click on the 'Submit' button
    await page.click('button:has-text("Submit")');
    // Wait for the error message to appear
    await page.waitForSelector('.ant-form-item-explain-error', { timeout: 80000 });
    // Get the error message text
    const errorMessage = await page.textContent('.ant-form-item-explain-error');
    // Assert that the success message is 'Please input the Claim!'
    expect(errorMessage).toBe('Please add claimant!');
});


test('should display "Please add rating!" successfully, when the claima input field is empty', async ({ page }) => {
    test.setTimeout(90000)
    // Click on the 'Create' button
    await page.click('button:has-text("Create")');
    // Click on the 'Expand' button
    await page.click('button:has-text("Expand")');
    // Type the new claim name into the input field
    const claimName = 'Th';
    await page.type('#create-claim_claim', claimName);
    await page.locator('div.ant-select-selector').first().click();
    await page.click('div[title="Nine"]');
    // Click on the 'Submit' button
    await page.click('button:has-text("Submit")');
    // Wait for the error message to appear
    await page.waitForSelector('.ant-form-item-explain-error', { timeout: 80000 });
    // Get the error message text
    const errorMessage = await page.textContent('.ant-form-item-explain-error');
    // Assert that the success message is 'Please add rating!'
    expect(errorMessage).toBe('Please add rating!');
});


test('should create claim successfully', async ({ page }) => {
    // Click on the 'Create' button
    await page.click('button:has-text("Create")');
    // Generate a random string
    const randomString = getRandomString(10); // Adjust the length as needed
    // Type the new claim name with the random string into the input field
    const claimName = `This is a test claim ${randomString}`;
    await page.type('#create-claim_claim', claimName);
    await page.locator('div.ant-select-selector').first().click();
    await page.click('div[title="Nine"]');
    await page.locator('div.ant-select-selector').nth(1).click();
    await page.click('div[title="True"]');
    // Click on the date input field using the selector
    await page.type('#create-claim_claim_date', '2023-09-09');
    await page.keyboard.press('Enter');
    // Click on the 'Submit' button
    await page.click('button:has-text("Submit")');
    // Handle any dialog that appears by accepting it
    page.on('dialog', dialog => dialog.accept());
    // Get the success message text
    const successMessage = await page.textContent('.ant-notification-notice-description');
    // Assert that the success message is 'Claim created'
    expect(successMessage).toBe('Claim created');
});


test('should edit a claim successfully', async ({ page }) => {
    // Generate a random string
    const randomString = getRandomString(10); // Adjust the length as needed
    const claimSelector = 'text=Cong win';
    const newclaimName =  `This is a test claim ${randomString}`;;
    let claimFound = false;
    let pageIndex = 1;
    // Function to check if the claim is on the current page
    const isclaimVisible = async () => {
        const claimElements = await page.$$(claimSelector);
        return claimElements.length > 0;
    };
    // Loop through pages until the claim is found
    while (!claimFound) {
        claimFound = await isclaimVisible();
        if (!claimFound) {
            // Click the next page button (assuming there's a next page button with the text 'Next')
            await page.click('button:has([aria-label="right"])');
            await page.waitForTimeout(1000); // Wait for the next page to load
            pageIndex++;
        }
    }
    // Click on the claim to be edited
    await page.click(claimSelector);
    // Click on the 'Expand' button
    await page.click('button:has-text("Expand")');
    // Fill in the new claim name
    const inputSelector = '#create-claim_claim';
    await page.fill(inputSelector, newclaimName);
    // Click on the 'Update' button
    await page.click('button:has-text("Update")');
    // Check if the claim name has been updated
    const updatedclaim = await page.textContent(`text=${newclaimName}`);
    expect(updatedclaim).toBe(newclaimName);
    // Handle any dialog that appears by accepting it
    page.on('dialog', dialog => dialog.accept());
    // Get the success message text
    const successMessage = await page.textContent('.ant-notification-notice-description');
    // Assert that the success message is 'Claim updated'
    expect(successMessage).toBe('Claim updated');
});


test('should delete a claim successfully', async ({ page }) => {
    const claimText = 'sscsc';
    const nextButtonSelector = 'button:has([aria-label="right"])';
    let claimFound = false;
    while (true) {
        // Check if the claim is present on the current page
        const rowSelector = `tr:has-text("${claimText}")`;
        const buttonSelector = 'button:has([aria-label="delete"])';
        const buttonLocator = page.locator(`${rowSelector} ${buttonSelector}`);
        // Check if the row with the claim text is visible
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
            // Assert that the success message is 'Claim deleted'
            expect(successMessage).toBe('Claim deleted');
            claimFound = true;
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
    // Assert that the claim was found and deleted
    expect(claimFound).toBe(true);
});


test('Should find search results based on claimant', async ({ page }) => {
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


test('Should find no search results based on claimant', async ({ page }) => {
    // Locate the specific dropdown using a more specific selector
    const dropdownContainerSelector = '.ant-form-item-control-input-content';
    const dropdownSelector = `${dropdownContainerSelector} .ant-select-selector`;
    // Click on the dropdown to open it
    await page.locator(dropdownSelector).first().click();
    // Select the option "Eight" from the dropdown
    const optionSelector = '.ant-select-item-option[title="Eight"]';
    await page.locator(optionSelector).click();
    await page.press(dropdownContainerSelector, 'Enter');
    // Verify that 'No data' is visible
    const accountLogin = await page.locator('text=No data');
    await expect(accountLogin).toBeVisible();
});


test('Should find search results based on rating', async ({ page }) => {
    // Locate the specific dropdown using a more specific selector
    const dropdownContainerSelector = '.ant-form-item-control-input-content';
    const dropdownSelector = `${dropdownContainerSelector} .ant-select-selector`;
    // Click on the dropdown to open it
    await page.locator(dropdownSelector).nth(1).click();
    // Select the option "One" from the dropdown
    const optionSelector = '.ant-select-item-option[title="One"]';
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


test('Should find no search results based on rating successfully', async ({ page }) => {
    // Locate the specific dropdown using a more specific selector
    const dropdownContainerSelector = '.ant-form-item-control-input-content';
    const dropdownSelector = `${dropdownContainerSelector} .ant-select-selector`;
    // Click on the dropdown to open it
    await page.locator(dropdownSelector).nth(1).click();
    // Select the option "One" from the dropdown
    const optionSelector = '.ant-select-item-option[title="This is a test rating"]';
    await page.locator(optionSelector).click();
    await page.press(dropdownContainerSelector, 'Enter');
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


test('Should find search results', async ({ page }) => {
    const claimToSearch = 'cong';
    const searchInputSelector = '#filters_q';
    // Click the search button
    await page.click('button:has([aria-label="search"])');
    // Enter the search query
    await page.fill('#filters_q', claimToSearch);
    page.locator(claimToSearch); 
    // Press 'Enter' to search
    await page.press(searchInputSelector, 'Enter');
    // Verify that the claim is visible in the results
    const claimExists = await page.isVisible(`text=${claimToSearch}`);
});


test('Should find no search results', async ({ page }) => {
    const claimToSearch = 'Zero';
    const searchInputSelector = '#filters_q';
    // Click the search button
    await page.click('button:has([aria-label="search"])');
    // Enter the search query
    await page.fill('#filters_q', claimToSearch);
    page.locator(claimToSearch); 
    // Press 'Enter' to search
    await page.press(searchInputSelector, 'Enter');
    // Verify that 'No data' is visible
    const accountLogin = await page.locator('text=No data');
    await expect(accountLogin).toBeVisible();
});

test('when the button is clicked, should scroll to the top of the page', async ({ page }) => {
    const claimSelector = 'text=Two';
    await page.click(claimSelector);
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


test('should sort claims from latest to oldest', async ({ page }) => {
    // Click on the sorting dropdown
    await page.click('#filters_sort', { force: true }); 
    // Click on the option for sorting from latest to oldest
    await page.click('.ant-select-item[title="Latest"]');  
    // Get the text content of all claims
    const claims = await page.$$eval('.ant-table-tbody tr', rows => {
        return rows.map(row => row.textContent.trim());
    });

    // Check if claims are sorted from latest to oldest
    const sortedclaims = claims.slice().sort((a, b) => {
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

    // Check if the claims are in the correct order
    expect(claims).toEqual(sortedclaims);
});


test('should sort claims from oldest to latest', async ({ page }) => {
    // Click on the sorting dropdown
    await page.click('#filters_sort', { force: true });
    // Click on the option for sorting from oldest to latest
    await page.click('.ant-select-item[title="Old"]');  // Adjust the title as needed if "Old" means oldest

    // Get the text content of all claims
    const claims = await page.$$eval('.ant-table-tbody tr', rows => {
        return rows.map(row => row.textContent.trim());
    });

    // Check if claims are sorted from oldest to latest
    const sortedclaims = claims.slice().sort((a, b) => {
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

    // Check if the claims are in the correct order
    expect(claims).toEqual(sortedclaims);
});
