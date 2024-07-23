# Dega test cases with Playwright

## Setting up testing environment for Playwright

### Pre-requisites

Before you begin writing test cases with Playwright, ensure you have the following prerequisite:

- Node.js: Playwright requires Node.js. Download and install the latest version from Node.js official website.

### Starting the application

- Execute the following command to install Playwright:
  ```
  npm install @playwright/test
  ```
- Execute the following command to run the tests:
  ```
  npx playwright test
  ```
- Execute the following command to run a single test file (for example to run a file with name example.spec.js)

  ```
  npx playwright test tests/example.spec.js
  ```

- Execute the following command to run all the test cases in a particular folder ( Suppose you have a folder named tests in your project directory containing all your test cases )

  ```
  npx playwright test tests/example.spec.js
  ```

* Execute the following command to run your tests in headed mode, use the --headed flag. This will give you the ability to visually see how Playwright interacts with the website.

  ```
  npx playwright test tests/example.spec.js --headed
  ```

* To run the tests in desired speed, add slowmo to the launchOptions in the playwright config file

  ```
  launchOptions: {
    slowMo: 2000,
  },
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
