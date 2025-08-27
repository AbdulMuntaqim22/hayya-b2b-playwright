import { test, expect } from '@playwright/test';
const fs = require('fs');
const LoginPage = require('../Pages/loginPage').default;
const { LoginLocators } = require('../Locators/loginLocators');

test.describe('Login Scenarios', () => {
  /** @type {LoginPage} */
  var loginPage;
  let credentials;
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    credentials = JSON.parse(fs.readFileSync('./src/utils/userCreds.json', 'utf-8'));
  });

  test('Validating Login', async ({ page },testInfo) => {
    await loginPage.login(testInfo, credentials.superOwnerUsers.newUser);
    await expect(page.locator(LoginLocators.profileIconBtn)).toBeVisible();

    await loginPage.attachScreenshot(testInfo, 'Login Successful', false);
  });


  test.afterEach(async ({ page }, testInfo) => {
    // Add any cleanup code if necessary
    console.log(`Test completed: ${testInfo.title} with status: ${testInfo.status}`);
    // For example, you might want to take a screenshot or log out
    await loginPage.attachScreenshot(testInfo, 'Test Completed');    
  });
});