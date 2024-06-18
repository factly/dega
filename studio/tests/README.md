# Dega test cases with Playwright


## Setting up testing environment for Playwright

### Pre-requisites

Before you begin writing test cases with Playwright, ensure you have the following prerequisite:

- Node.js: Playwright requires Node.js. Download and install the latest version from Node.js official website.


### Starting the application
- Execute the following command to install Playwright and its test runner:
    ```
    npm install --save-dev @playwright/test
  ```
- Execute the following command to run the tests:
    ```
    npx playwright test
  ```
 ### Important keywords
- Assertions: Statements that check if a condition is true. Playwright uses the expect API for assertions.

- Headless Mode: Running a browser in headless mode means running without a graphical user interface. This is useful for automated testing.

- Selectors: Patterns used to select elements on a web page. Playwright supports various selectors like CSS, XPath, and text selectors.

### Env files to be added

- Create a `.env` file in the root folder for environment variables (for eg see .env)
- To make environment variables easier to manage, we have .env files. Use dotenv package to read environment variables directly in the configuration file.  
    ```
    import dotenv from 'dotenv';

    // Read from default ".env" file.
    dotenv.config();
  ```
