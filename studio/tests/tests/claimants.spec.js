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
    // Click the login button
    await page.click('text=Login')
    await page.goto('http://127.0.0.1:4455/.factly/dega/studio/claimants?sort=desc&limit=10&page=1');
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


test('should load the claimants page successfully', async ({ page }) => {
  // Locate the header element with the text 'claimants'
  const accountLogin = await page.locator('h3')
  // Assert that the header has the text 'Claimants'
  await expect(accountLogin).toHaveText('Claimants')
});


test('should handle invalid URL parameters gracefully', async ({ page }) => {
  // Navigate to the URL with invalid parameters
  await page.goto('http://127.0.0.1:4455/.factly/dega/studio/claimants?sort=desc&limit=10&page=NaN');
  // Locate the element that shows 'No data' message
  const accountLogin = await page.locator('text=No data');
  // Assert that the 'No data' message is visible
  await expect(accountLogin).toBeVisible();
});


test('should persist claimant data across sessions', async ({ page, context }) => {
  // Get the text content of the first h3 element
  const firstclaimantText = await page.locator('h3').first().textContent();
  // Open a new page in the same context
  await context.newPage();
  // Navigate to the Claimants page
  await page.goto('http://127.0.0.1:4455/.factly/dega/studio/claimants?sort=desc&limit=10&page=1');
  // Get the text content of the first h3 element again
  const newFirstclaimantText = await page.locator('h3').first().textContent();
  // Assert that the claimant data is the same across sessions
  expect(firstclaimantText).toEqual(newFirstclaimantText);
});


//Perform this test case only when there are no claimants present
test('should display empty state when no claimants are present', async ({ page }) => {
  // Locate the element that represents the empty state image
  const emptyStateMessage = await page.locator('.ant-empty-image');
  // Assert that the empty state image is visible
  await expect(emptyStateMessage).toBeVisible();
});


test('Should find search results', async ({ page }) => {
  const claimantToSearch = 'Shiro';
  const searchInputSelector = '#filters_q';
  await page.click('button:has([aria-label="search"])');
  await page.fill('#filters_q', claimantToSearch);
  page.locator(claimantToSearch); 
  await page.press(searchInputSelector, 'Enter');
  const claimantExists = await page.isVisible(`text=${claimantToSearch}`);
});


test('Should find no search results', async ({ page }) => {
  const claimantToSearch = 'Zero';
  const searchInputSelector = '#filters_q';
  // Click the search button
  await page.click('button:has([aria-label="search"])');
  // Enter the search query
  await page.fill('#filters_q', claimantToSearch);
  page.locator(claimantToSearch); 
  // Press 'Enter' to search
  await page.press(searchInputSelector, 'Enter');
  // Verify that 'No data' is visible
  const accountLogin = await page.locator('text=No data');
  await expect(accountLogin).toBeVisible();
});


test('should display "Please enter name!" successfully, when the name input field is empty', async ({ page }) => {
  test.setTimeout(90000)
  // Click on the 'Create' button
  await page.click('button:has-text("Create")');
  // Click on the 'Expand' button
  await page.click('button:has-text("Expand")');
  // Type the new claimant name into the input field
  const claimantName = 'This is a test claimant';
  await page.type('#creat-claimant_name', claimantName);
  // Get the length of the typed text
  const deletePressCount = claimantName.length;
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
  // Assert that the success message is 'Please enter name!'
  expect(errorMessage).toBe('Please enter name!');
});


test('should create claimant successfully', async ({ page }) => {
  // Click on the 'Create' button
  await page.click('button:has-text("Create")');
  // Click on the 'Expand' button
  await page.click('button:has-text("Expand")');
  // Generate a random string
  const randomString = getRandomString(10); // Adjust the length as needed
  // Type the new claimant name with the random string into the input field
  const claimantName = `This is a test claimant ${randomString}`;
  await page.type('#creat-claimant_name', claimantName);
  await page.type('#creat-claimant_claimant_line', 'New claimant Line')
  // Click on the 'Submit' button
  await page.click('button:has-text("Submit")');
  // Handle any dialog that appears by accepting it
  page.on('dialog', dialog => dialog.accept());
  // Get the success message text
  const successMessage = await page.textContent('.ant-notification-notice-description');
  // Assert that the success message is 'Claimant created'
  expect(successMessage).toBe('Claimant created');
});


test('should delete claimant successfully', async ({ page }) => {
  const claimantText = 'Shiro';
  const nextButtonSelector = 'button:has([aria-label="right"])';
  let claimantFound = false;
  while (true) {
      // Check if the claimant is present on the current page
      const rowSelector = `tr:has-text("${claimantText}")`;
      const buttonSelector = 'button:has([aria-label="delete"])';
      const buttonLocator = page.locator(`${rowSelector} ${buttonSelector}`);
      // Check if the row with the claimant text is visible
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
          // Assert that the success message is 'Claimant deleted'
          expect(successMessage).toBe('Claimant deleted');
          claimantFound = true;
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
  // Assert that the claimant was found and deleted
  expect(claimantFound).toBe(true);
});


test('should edit a claimant successfully', async ({ page }) => {

  // Generate a random string
  const randomString = getRandomString(10); // Adjust the length as needed
  const claimantSelector = 'text=Six';
  const newclaimantName =  `This is a test claimant ${randomString}`;;
  let claimantFound = false;
  let pageIndex = 1;

  // Function to check if the claimant is on the current page
  const isClaimantVisible = async () => {
      const claimantElements = await page.$$(claimantSelector);
      return claimantElements.length > 0;
  };

  // Loop through pages until the claimant is found
  while (!claimantFound) {
      claimantFound = await isClaimantVisible();

      if (!claimantFound) {
          // Click the next page button (assuming there's a next page button with the text 'Next')
          await page.click('button:has([aria-label="right"])');
          await page.waitForTimeout(1000); // Wait for the next page to load
          pageIndex++;
      }
  }
  // Click on the claimant to be edited
  await page.click(claimantSelector);
  // Click on the 'Expand' button
  await page.click('button:has-text("Expand")');
  // Fill in the new claimant name
  const inputSelector = '#creat-claimant_name';
  await page.fill(inputSelector, newclaimantName);
  // Click on the 'Update' button
  await page.click('button:has-text("Update")');
  // Check if the claimant name has been updated
  const updatedclaimant = await page.textContent(`text=${newclaimantName}`);
  expect(updatedclaimant).toBe(newclaimantName);
  // Handle any dialog that appears by accepting it
  page.on('dialog', dialog => dialog.accept());
  // Get the success message text
  const successMessage = await page.textContent('.ant-notification-notice-description');
  // Assert that the success message is 'Claimant updated'
  expect(successMessage).toBe('Claimant updated');
});


test('should display "claimant with same name exists" successfully', async ({ page }) => {
  // Selector for the claimant element with the text 'Nine'
  const claimantSelector = 'text=Nine';
  // New claimant name to be used for testing duplicate name scenario
  const newClaimantName = 'One';
  // Click on the claimant element to select it
  await page.click(claimantSelector);
  // Click on the 'Expand' button to open the details or edit section
  await page.click('button:has-text("Expand")');
  // Selector for the claimant name input field
  const inputSelector = '#creat-claimant_name';
  // Fill the input field with the new claimant name
  await page.fill(inputSelector, newClaimantName);
  // Click on the 'Update' button to submit the form
  await page.click('button:has-text("Update")');
  // Handle the dialog that appears after clicking 'Update' and accept it
  page.on('dialog', dialog => dialog.accept());
  // Get the text content of the success message notification
  const successMessage = await page.textContent('.ant-notification-notice-description');
  // Verify that the success message is as expected
  expect(successMessage).toBe('Entity with same name exists');
});



test('should reset', async ({ page }) => {    
  await page.click('button:has-text("Create")');
  await page.click('button:has-text("Expand")');
  await page.fill('#creat-claimant_name', 'Kurt');
  await page.click('button:has-text("Reset")');

// Verify that the form fields have been reset
const input1Value = await page.$eval('#creat-claimant_name', input => input.value);    
if (input1Value === '') {
  console.log('Form reset test passed');
} else {
  console.error('Form reset test failed');
}
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


test('when the button is clicked, should scroll to the top of the page', async ({ page }) => {
  const claimantSelector = 'text=Two';
  await page.click(claimantSelector);
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



test('should sort claimants from latest to oldest', async ({ page }) => {
  // Click on the sorting dropdown
  await page.click('#filters_sort', { force: true }); 
  // Click on the option for sorting from latest to oldest
  await page.click('.ant-select-item[title="Latest"]');  
  // Get the text content of all claimants
  const claimants = await page.$$eval('.ant-table-tbody tr', rows => {
      return rows.map(row => row.textContent.trim());
  });

  // Check if claimants are sorted from latest to oldest
  const sortedclaimants = claimants.slice().sort((a, b) => {
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

  // Check if the claimants are in the correct order
  expect(claimants).toEqual(sortedclaimants);
});


test('should sort claimants from oldest to latest', async ({ page }) => {
  // Click on the sorting dropdown
  await page.click('#filters_sort', { force: true });

  // Click on the option for sorting from oldest to latest
  await page.click('.ant-select-item[title="Old"]');  // Adjust the title as needed if "Old" means oldest

  // Get the text content of all claimants
  const claimants = await page.$$eval('.ant-table-tbody tr', rows => {
      return rows.map(row => row.textContent.trim());
  });

  // Check if claimants are sorted from oldest to latest
  const sortedclaimants = claimants.slice().sort((a, b) => {
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

  // Check if the claimants are in the correct order
  expect(claimants).toEqual(sortedclaimants);
});







