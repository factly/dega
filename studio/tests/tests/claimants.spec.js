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
    await page.goto('http://127.0.0.1:4455/.factly/dega/studio/claimants?sort=desc&limit=10&page=1');
});

test('should edit successfully ', async ({ page }) => {
      const ClaimantSelector = 'text=Shiro';
      const newClaimantName = 'New Tag';
      await page.click(ClaimantSelector);
      await page.click('button:has-text("Expand")');
      const inputSelector = '#creat-claimant_name';
      await page.fill(inputSelector,newClaimantName);
      await page.click('button:has-text("Update")');
      const updatedClaimant = await page.textContent(`text=${newClaimantName}`);
      expect(updatedClaimant).toBe(newClaimantName);
      page.on('dialog', dialog => dialog.accept());
      const successMessage = await page.textContent('.ant-notification-notice-description');
      expect(successMessage).toBe('Claimant updated');
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



test('Should find search results', async ({ page }) => {
  const claimantToSearch = 'New Tag';
  const searchInputSelector = '#filters_q';
  await page.click('button:has([aria-label="search"])');
  await page.fill('#filters_q', claimantToSearch);
  page.locator(claimantToSearch); 
  await page.press(searchInputSelector, 'Enter');
  const claimantExists = await page.isVisible(`text=${claimantToSearch}`);
});



test('should create claimant succesfully ', async ({ page }) => {
    await page.click('button:has-text("Create")');
    await page.click('button:has-text("Expand")');
    await page.type('#creat-claimant_name', 'New123')
    await page.type('#creat-claimant_tag_line', 'New Tag Line')
    await page.click('button:has-text("Submit")');
    const claimantExists = await page.isVisible(`text=New`);
    expect(claimantExists).toBe(true);
    page.on('dialog', dialog => dialog.accept());
    const successMessage = await page.textContent('.ant-notification-notice-description');
    expect(successMessage).toBe('Claimant created');
});


test('should delete claimant successfully', async ({ page }) => {
    const claimantText = 'New Tag';
    // Select the row with the required claimant text
    const rowSelector = `tr:has-text("${claimantText}")`;
    const buttonSelector = 'button:has([aria-label="delete"])'; 
    // Find the button within the specific row and click it
    const buttonLocator = page.locator(`${rowSelector} ${buttonSelector}`);
    // Ensure the button is available before clicking
    await buttonLocator.waitFor({ state: 'visible' });
    // Click on the Fact-check to be deleted
    await buttonLocator.click();
    await page.click('button:has-text("OK")');

    page.on('dialog', dialog => dialog.accept());
    const successMessage = await page.textContent('.ant-notification-notice-description');
    expect(successMessage).toBe('Claimant deleted');
});

test.only('should display already exsists successfully', async ({ page }) => {
  const claimantSelector = 'text=Nine';
  const newClaimantName = 'One';
  await page.click(claimantSelector);
  await page.click('button:has-text("Expand")');
  const inputSelector = '#creat-claimant_name';
  await page.fill(inputSelector, newClaimantName);
  await page.click('button:has-text("Update")');
  page.on('dialog', dialog => dialog.accept());
  const successMessage = await page.textContent('.ant-notification-notice-description');
  expect(successMessage).toBe('Entity with same name exists');
});



test('should display claimants correctly', async ({ page }) => {
    const claimants = await page.$$('.ant-table-cell');
    expect(claimants.length).toBeGreaterThan(0);
});

test('should display the correct number of claimants', async ({ page }) => {
      // This locator should match all the claimants displayed on the page
  const claimantItems = await page.locator('.ant-table-cell');
      // Count the number of claimant items
  const claimantCount = await claimantItems.count();
      
      // This locator should match the element displaying the number of claimants
  const claimantCountDisplay = await page.locator('.ant-pagination-total-text');
  const displayedCount = await claimantCountDisplay.textContent();
      
      // Expect the displayed count to match the actual count of claimants
  expect(Number(displayedCount)).toBe(claimantCount);
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


test('should handle invalid URL parameters gracefully', async ({ page }) => {
  await page.goto('http://127.0.0.1:4455/.factly/dega/studio/claimants?sort=desc&limit=10&page=NaN');
  const accountLogin = await page.locator('text=No data');
  await expect(accountLogin).toBeVisible();
});








