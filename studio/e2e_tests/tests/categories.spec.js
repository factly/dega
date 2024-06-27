// Import necessary modules from Playwright
import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { getRandomString } from './randomfunc.js';
// Read from default ".env" file.
dotenv.config();

// This beforeEach hook runs before each test, setting up the test environment
test.beforeEach(async ({ page }) => {
  test.setTimeout(900000);
  // Load session cookies from the file
  await page
    .context()
    .addCookies(JSON.parse(require('fs').readFileSync('state.json', 'utf8')).cookies);
  // Navigate to a page that requires login
  await page.goto(`${process.env.BASE_URL}`);
  // Verify the user is still logged in
  expect(await page.isVisible('text="Dashboard"')).toBeTruthy();
  await page.goto(`${process.env.BASE_URL}categories?sort=desc&limit=10&page=1`);
});

test('login', async ({ page }) => {
  // Navigate to the login page
  await page.goto(`${process.env.BASE_URL}`);
  // Fill in the email and password fields
  await page.type('#auth_email', `${process.env.AUTH_EMAIL}`);
  await page.type('#auth_password', `${process.env.AUTH_PASSWORD}`);
  // Click the login button
  await page.click('text=Login');
  // Save session cookies to a file
  const cookies = await page.context().cookies();
  await page.context().storageState({ path: 'state.json' });
});

let createdCategoryName = ''; // Define a global variable to store the created category name
let editedCategoryName = ''; // Define a global variable to store the edited category name

test.only('should create category successfully', async ({ page }) => {
  // Click on the 'Create' button
  await page.click('button:has-text("Create")');
  // Click on the 'Expand' button
  await page.click('button:has-text("Expand")');
  // Generate a random string
  const randomString = getRandomString(10); // Adjust the length as needed
  // Type the new category name with the random string into the input field
  createdCategoryName = `This is a test category ${randomString}`;
  await page.type('#create-category_name', createdCategoryName);
  // Click on the 'Save' button
  await page.click('button:has-text("Save")');
  // Handle any dialog that appears by accepting it
  page.on('dialog', (dialog) => dialog.accept());
  // Get the success message text
  const successMessage = await page.textContent('.ant-notification-notice-description');
  // Assert that the success message is 'Category created'
  expect(successMessage).toBe('Category created');
});

test.only('should edit a category successfully', async ({ page }) => {
  // Generate a random string
  const randomString = getRandomString(10); // Adjust the length as needed
  editedCategoryName = `This is an edited test category ${randomString}`;
  const categorySelector = `text=${createdCategoryName}`;
  let categoryFound = false;
  let pageIndex = 1;
  // Function to check if the category is on the current page
  const isCategoryVisible = async () => {
    const categoryElements = await page.$$(categorySelector);
    return categoryElements.length > 0;
  };
  // Loop through pages until the category is found
  while (!categoryFound) {
    categoryFound = await isCategoryVisible();
    if (!categoryFound) {
      // Click the next page button (assuming there's a next page button with the text 'Next')
      const nextButton = await page.$('button:has([aria-label="right"])');
      if (!nextButton) {
        break; // No more pages to navigate
      }
      await nextButton.click();
      await page.waitForTimeout(1000); // Wait for the next page to load
      pageIndex++;
    }
  }
  if (categoryFound) {
    // Click on the category to be edited
    await page.click(categorySelector);
    // Click on the 'Expand' button
    await page.click('button:has-text("Expand")');
    // Fill in the new category name
    const inputSelector = '#create-category_name';
    await page.fill(inputSelector, editedCategoryName);
    // Click on the 'Update' button
    await page.click('button:has-text("Update")');
    // Handle any dialog that appears by accepting it
    page.on('dialog', (dialog) => dialog.accept());
    // Check if the category name has been updated
    const updatedCategory = await page.textContent(`text=${editedCategoryName}`);
    expect(updatedCategory).toBe(editedCategoryName);
    // Get the success message text
    const successMessage = await page.textContent('.ant-notification-notice-description');
    // Assert that the success message is 'Category updated'
    expect(successMessage).toBe('Category updated');
  } else {
    throw new Error(`Category with name "${createdCategoryName}" not found.`);
  }
});

test.only('Should find search results', async ({ page }) => {
  const categoryToSearch = editedCategoryName;
  const searchInputSelector = '#filters_q';
  // Click the search button
  await page.click('button:has([aria-label="search"])');
  // Enter the search query
  await page.fill(searchInputSelector, categoryToSearch);
  page.locator(categoryToSearch);
  // Press 'Enter' to search
  await page.press(searchInputSelector, 'Enter');
  // Verify that the category is visible in the results
  const categoryExists = await page.isVisible(`text=${categoryToSearch}`);
});

test('Should find no search results', async ({ page }) => {
  const categoryToSearch = 'Zero';
  const searchInputSelector = '#filters_q';
  // Click the search button
  await page.click('button:has([aria-label="search"])');
  // Enter the search query
  await page.fill('#filters_q', categoryToSearch);
  page.locator(categoryToSearch);
  // Press 'Enter' to search
  await page.press(searchInputSelector, 'Enter');
  // Verify that 'No data' is visible
  const accountLogin = await page.locator('text=No data');
  await expect(accountLogin).toBeVisible();
});

test('should display "Please enter name!" successfully, when the name input field is empty', async ({
  page,
}) => {
  test.setTimeout(90000);
  // Click on the 'Create' button
  await page.click('button:has-text("Create")');
  // Click on the 'Expand' button
  await page.click('button:has-text("Expand")');
  // Type the new category name into the input field
  const categoryName = 'This is a test category';
  await page.type('#create-category_name', categoryName);
  // Get the length of the typed text
  const deletePressCount = categoryName.length;
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
  // Assert that the success message is 'Please enter name!'
  expect(errorMessage).toBe('Please enter name!');
});

test('should display already exsists successfully', async ({ page }) => {
  const categorySelector = 'text=Others';
  const newcategoryName = 'Other';
  await page.click(categorySelector);
  await page.click('button:has-text("Expand")');
  const inputSelector = '#create-category_name';
  await page.fill(inputSelector, newcategoryName);
  await page.click('button:has-text("Update")');
  page.on('dialog', (dialog) => dialog.accept());
  const successMessage = await page.textContent('.ant-notification-notice-description');
  expect(successMessage).toBe('Entity with same name exists');
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
  const categorySelector = 'text=Other';
  await page.click(categorySelector);
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

test('should sort categories from latest to oldest', async ({ page }) => {
  // Click on the sorting dropdown
  await page.click('#filters_sort', { force: true });
  // Click on the option for sorting from latest to oldest
  await page.click('.ant-select-item[title="Latest"]');
  // Get the text content of all categories
  const categories = await page.$$eval('.ant-table-tbody tr', (rows) => {
    return rows.map((row) => row.textContent.trim());
  });

  // Check if categories are sorted from latest to oldest
  const sortedcategories = categories.slice().sort((a, b) => {
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

  // Check if the categories are in the correct order
  expect(categories).toEqual(sortedcategories);
});

test('should sort categories from oldest to latest', async ({ page }) => {
  // Click on the sorting dropdown
  await page.click('#filters_sort', { force: true });

  // Click on the option for sorting from oldest to latest
  await page.click('.ant-select-item[title="Old"]'); // Adjust the title as needed if "Old" means oldest

  // Get the text content of all categories
  const categories = await page.$$eval('.ant-table-tbody tr', (rows) => {
    return rows.map((row) => row.textContent.trim());
  });

  // Check if categories are sorted from oldest to latest
  const sortedcategories = categories.slice().sort((a, b) => {
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

  // Check if the categories are in the correct order
  expect(categories).toEqual(sortedcategories);
});

test('should load the Categories page successfully', async ({ page }) => {
  // Locate the header element with the text 'Categories'
  const accountLogin = await page.locator('h3');
  // Assert that the header has the text 'Categories'
  await expect(accountLogin).toHaveText('Categories');
});

test('should handle invalid URL parameters gracefully', async ({ page }) => {
  // Navigate to the URL with invalid parameters
  await page.goto(`${process.env.BASE_URL}/categories?sort=desc&limit=10&page=NaN`);
  // Locate the element that shows 'No data' message
  const invalidPage = await page.locator('text=No data');
  // Assert that the 'No data' message is visible
  await expect(invalidPage).toBeVisible();
});

test('should persist category data across sessions', async ({ page, context }) => {
  // Get the text content of the first h3 element
  const firstcategoryText = await page.locator('h3').first().textContent();
  // Open a new page in the same context
  await context.newPage();
  // Navigate to the categoriess page
  await page.goto(`${process.env.BASE_URL}/categories?sort=desc&limit=10&page=1`);
  // Get the text content of the first h3 element again
  const newFirstcategoryText = await page.locator('h3').first().textContent();
  // Assert that the category data is the same across sessions
  expect(firstcategoryText).toEqual(newFirstcategoryText);
});

//Perform this test case only when there are no categories present
test('should display empty state when no categories are present', async ({ page }) => {
  // Locate the element that represents the empty state image
  const emptyStateMessage = await page.locator('.ant-empty-image');
  // Assert that the empty state image is visible
  await expect(emptyStateMessage).toBeVisible();
});
