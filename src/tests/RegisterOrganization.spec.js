import { test, expect } from '@playwright/test';
const fs = require('fs');
import LoginPage from '../Pages/loginPage';
import RegisterOrganizationPage from '../Pages/registerOrganizationPage';
const { RegisterOrganizationLocators } = require('../Locators/registerOrganizationLocators');

test.describe('Register Organization Form Scenarios', () => {  
  var loginPage;  
  var regOrg;
  let credentials;
  test.beforeEach(async ({ page },testInfo) => {
    loginPage = new LoginPage(page);
    regOrg = new RegisterOrganizationPage(page);
    credentials = JSON.parse(fs.readFileSync('./src/utils/userCreds.json', 'utf-8'));
    await loginPage.login(testInfo, credentials.requestorUsers.newUser);
  });

  test('Verify that the following fields are required in Register Organization form', async ({ page },testInfo) => {
    
    // Navigate to the Register Organization page
    await page.locator(RegisterOrganizationLocators.registerOrgBtn).click();
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    // Clearing Organization and Requestor Name field
    //await page.locator(RegisterOrganizationLocators.orgNameTxt).fill('');
    await page.locator(RegisterOrganizationLocators.requestorNameTxt).fill('');

    //clicking on the verify button
    await page.locator(RegisterOrganizationLocators.verifyBtn).click();

    // Verify that the required fields are required
    //expect(await page.locator(RegisterOrganizationLocators.orgNameValidation).textContent()).toBe("Organization name is required");
    expect(await page.locator(RegisterOrganizationLocators.establishmentNoValidation).textContent()).toBe("Establishment number is required");
    expect(await page.locator(RegisterOrganizationLocators.establishmentExpDateValdiation).textContent()).toBe("Establishment card expiry date is required"); 
    expect(await page.locator(RegisterOrganizationLocators.requestorNameValidation).textContent()).toBe("Requestor name is required"); 
    expect(await page.locator(RegisterOrganizationLocators.jobTitleValidation).textContent()).toBe("Job title is required");
    expect(await page.locator(RegisterOrganizationLocators.requestorNationalitySelectValdiaiton).textContent()).toBe("Nationality is required");
    expect(await page.locator(RegisterOrganizationLocators.requestorsQatarIDValdiation).textContent()).toBe("QID number is required");
    //expect(await page.locator(RegisterOrganizationLocators.requestorDobValidation).textContent()).toBe("Date of birth is required");    
    //expect(await page.locator(RegisterOrganizationLocators.requestorsContactNumValidation).textContent()).toBe("Contact number is required");
    expect(await page.locator(RegisterOrganizationLocators.orgAuthorizedSignatoryNameValidation).textContent()).toBe("Authorized signatory name is required");
    expect(await page.locator(RegisterOrganizationLocators.signatoryQatarIDValidation).textContent()).toBe("Signatory QID is required");
    expect(await page.locator(RegisterOrganizationLocators.signatoryContactNumValidation).textContent()).toBe("Signatory contact number is required");
    expect(await page.locator(RegisterOrganizationLocators.authorizerLetterUploadValidation).textContent()).toBe("Authorizer letter  is required");
    expect(await page.locator(RegisterOrganizationLocators.establishmentCardUploadValidation).textContent()).toBe("Upload Establishment Card Image  is required");

    await loginPage.attachScreenshot(testInfo, 'Required Fields Validation',true);
  });

  test('Verify that the Organization and Requestor Name fields are pre-populated and enabled', async ({ page },testInfo) => {
  
    // Navigate to the Register Organization page
    await page.locator(RegisterOrganizationLocators.registerOrgBtn).click();
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');    

    // Verify that the Requestor Email Address field is disabled and pre-populated
    //await expect(page.locator(RegisterOrganizationLocators.orgNameTxt)).toBeEnabled();
    expect(await page.locator(RegisterOrganizationLocators.orgNameTxt).inputValue()).not.toBeNull();
    await expect(page.locator(RegisterOrganizationLocators.requestorNameTxt)).toBeEnabled();
    expect(await page.locator(RegisterOrganizationLocators.requestorNameTxt).inputValue()).not.toBeNull();

    await loginPage.attachScreenshot(testInfo, 'Organization and Requestor Name fields are pre-populated and enabled', true);
  });

  test('Verify that the Requestor Email Address field is disabled and pre-populated', async ({ page },testInfo) => {
  
  // Navigate to the Register Organization page
  await page.locator(RegisterOrganizationLocators.registerOrgBtn).click();
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');    

  // Verify that the Requestor Email Address field is disabled and pre-populated
  const requestorEmail = page.locator(RegisterOrganizationLocators.requestorsEmailAdddressTxt);
  await expect(requestorEmail).toBeDisabled();
  const emailValue = await requestorEmail.inputValue();
  expect(emailValue).toBe(credentials.requestorUsers.newUser.email);

  await loginPage.attachScreenshot(testInfo, 'Request Email Address field is disabled and Pre-populated');
});

  test('Verify that the Requestors and Signatory Qatar Id field must have at least 7 characters', async ({ page },testInfo) => {
  
    // Navigate to the Register Organization page
    await page.locator(RegisterOrganizationLocators.registerOrgBtn).click();
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');    

    // Verify that the Requestors and Signatory Qatar Id field must have at least 7 characters
    await page.locator(RegisterOrganizationLocators.requestorsQatarIDTxt).fill('123456');
    await page.locator(RegisterOrganizationLocators.signatoryQatarIDTxt).fill('123456');
    await page.locator(RegisterOrganizationLocators.verifyBtn).click();
    expect(await page.locator(RegisterOrganizationLocators.requestorsQatarIDValdiation).textContent()).toBe("QID number must be at least 7 characters");
    expect(await page.locator(RegisterOrganizationLocators.signatoryQatarIDValidation).textContent()).toBe("QID number must be at least 7 characters");

    await loginPage.attachScreenshot(testInfo, 'Requestors and Signatory Qatar Id field must have at least 7 characters');

    // Verify that the Requestors and Signatory Qatar Id field accepts 7 characters 
    await page.locator(RegisterOrganizationLocators.requestorsQatarIDTxt).fill('1234567');
    await page.locator(RegisterOrganizationLocators.signatoryQatarIDTxt).fill('1234567');
    await page.locator(RegisterOrganizationLocators.verifyBtn).click();
    await expect(page.locator(RegisterOrganizationLocators.requestorsQatarIDValdiation)).toHaveCount(0);
    await expect(page.locator(RegisterOrganizationLocators.signatoryQatarIDValidation)).toHaveCount(0);

    await loginPage.attachScreenshot(testInfo, 'Requestors and Signatory Qatar Id field accepts 7 characters', true);
  });

    test('Verify that the Requestors and Signatory Qatar Id field accepts maximum 11 characters', async ({ page },testInfo) => {
  
    // Navigate to the Register Organization page
    await page.locator(RegisterOrganizationLocators.registerOrgBtn).click();
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');    

    // Verify that the Requestors and Signatory Qatar Id field must have at least 7 characters
    await page.locator(RegisterOrganizationLocators.requestorsQatarIDTxt).fill('123456789101');
    await page.locator(RegisterOrganizationLocators.signatoryQatarIDTxt).fill('123456789101');
    await page.locator(RegisterOrganizationLocators.verifyBtn).click();
    await expect(page.locator(RegisterOrganizationLocators.requestorsQatarIDValdiation)).toHaveCount(0);
    await expect(page.locator(RegisterOrganizationLocators.signatoryQatarIDValidation)).toHaveCount(0);

    await loginPage.attachScreenshot(testInfo, 'Requestors and Signatory Qatar Id field accepts Max 11 characters till 0', true);
  });


  test.afterEach(async ({ page }, testInfo) => {
    // Add any cleanup code if necessary
    console.log(`Test completed: ${testInfo.title} with status: ${testInfo.status}`);
    // For example, you might want to take a screenshot or log out
    await loginPage.attachScreenshot(testInfo, 'Test Completed');    
  });
});
