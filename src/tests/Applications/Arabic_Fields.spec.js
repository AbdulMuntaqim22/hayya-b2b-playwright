import { test, expect } from '@playwright/test';
const fs = require('fs');
import API from '../../Pages/api';
import LoginPage from '../../Pages/loginPage';
import NewApplicationPage from '../../Pages/newApplicationPage';
const { NewApplicationLocators } = require('../../Locators/newApplicationlocators');


const exemptedCountries = JSON.parse(fs.readFileSync('./src/Resources/Arabic_Fields_Countries.json', 'utf-8'));

test.describe('Arabic Fields', () => {  
  var loginPage;  
  var newApp;
  let credentials;  
  let apiConfig;
  /** @type {API} */
  let adminApi;
  let adminUserData;
  let visaData;

  test.beforeEach(async ({ page }, testInfo) => {
    apiConfig = JSON.parse(fs.readFileSync('./src/utils/apiConfig.json', 'utf-8'));
    visaData = JSON.parse(fs.readFileSync('./src/Resources/Visas.json', 'utf-8'));
    adminApi = new API(page, apiConfig.baseUrl);
    loginPage = new LoginPage(page);
    newApp = new NewApplicationPage(page);

    credentials = JSON.parse(fs.readFileSync('./src/utils/userCreds.json', 'utf-8'));    
    await adminApi.init(); // Initialize the API instance
    adminUserData = await adminApi.GetAccessToken(credentials.adminUser);
    await adminApi.deleteAllProfiles();

    // Logging in before each test    
    await loginPage.login(testInfo, credentials.requestorUsers.existingUser);
  });

  for (const country of exemptedCountries.countries01) {
    test(`Verify Payment Exemption for A1 Visa: ${country}`, async ({ page }, testInfo) => {

      var data = {
        "visaCat": "Tourist",
        "visaType": "A1 - Tourist Visa",
        "accommodationDetails": "Not Decided",
        "purposeOfVisit": "Business Meeting",
        "passportType": "Normal",
        "personalPhoto": `./src/Resources/Passports/${country}/Pic 1.jpg`,
        "passportPhoto": `./src/Resources/Passports/${country}/Passport 1.jpg`,
      }
      
    var groupName = "Group " + newApp.generateRandomFiveDigit();
    // Navigating to New Application Page
    await page.locator(NewApplicationLocators.newAppLeftMenuBtn).click();

    // Opening the Manual Application
    await page.locator(NewApplicationLocators.manualAppBtn).click();


    // Wait for the first field of the manual application form to be visible
    await page.waitForSelector(NewApplicationLocators.visaCategorySelect, { state: 'visible' });

    //Selecting the Visa Category
    await page.locator(NewApplicationLocators.visaCategorySelect).click();
    await page.locator(NewApplicationLocators.options).locator(`//li[text()='${data.visaCat}']`).click();

    //Selecting the Visa Type
    await page.locator(NewApplicationLocators.visaTypeSelect).click();
    await page.locator(NewApplicationLocators.options).locator(`//li[text()='${data.visaType}']`).click();

    // Entering Group Name
    await page.locator(NewApplicationLocators.groupNameTxt).fill(groupName);

    // Entering Accommodation Details
    await page.locator(NewApplicationLocators.accommodationDetailsTxt).fill(data.accommodationDetails);

    // Clicking on the Next button
    await page.locator(NewApplicationLocators.nextBtn).click();
    await newApp.waitForLoaderToDisappear();

    try {
      // Selecting Purpose of Visit 
      await page.locator(NewApplicationLocators.visitTypeSelect).fill(data.purposeOfVisit);
      await page.locator(NewApplicationLocators.visitTypeSelect).press('Enter')

      // Selecting Passport Type
      await page.locator(NewApplicationLocators.passportTypeSelect).fill(data.passportType);
      await page.locator(NewApplicationLocators.passportTypeSelect).press('Enter');

      // Uploading Passport and Profile Picture
      await page.locator(NewApplicationLocators.personalPhoto).setInputFiles(data.personalPhoto);
      await newApp.waitForLoaderToDisappear();
      await page.waitForTimeout(2000);
      await page.locator(NewApplicationLocators.passportImage).setInputFiles(data.passportPhoto);
      await newApp.waitForLoaderToDisappear();

      // Wait for the field to be populated (not empty)
      await page.waitForFunction(
        (xpath) => {
          const el = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          return el && el.value && el.value.length > 0;
        },
        NewApplicationLocators.passportNumTxt
      );

      // Verifying Arabic Fields Appearing Correctly
      await expect(page.locator(NewApplicationLocators.firstArabicNameTxt)).toBeVisible();
      await expect(page.locator(NewApplicationLocators.firstArabicNameTxt)).toBeEnabled();

      await expect(page.locator(NewApplicationLocators.secondArabicNameTxt)).toBeVisible();
      await expect(page.locator(NewApplicationLocators.secondArabicNameTxt)).toBeEnabled();

      await expect(page.locator(NewApplicationLocators.thirdArabicNameTxt)).toBeVisible();
      await expect(page.locator(NewApplicationLocators.thirdArabicNameTxt)).toBeEnabled();

      await expect(page.locator(NewApplicationLocators.fourthArabicNameTxt)).toBeVisible();
      await expect(page.locator(NewApplicationLocators.fourthArabicNameTxt)).toBeEnabled();

      await expect(page.locator(NewApplicationLocators.lastArabicNameTxt)).toBeVisible();
      await expect(page.locator(NewApplicationLocators.lastArabicNameTxt)).toBeEnabled();

      await page.locator(NewApplicationLocators.firstArabicNameTxt).scrollIntoViewIfNeeded();
      await loginPage.attachScreenshot(testInfo, 'Arabic Fields are Appearing Correctly and Enabled');


    }
    catch(error){      
      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName);
      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)
    })
  }

  test.afterEach(async ({ page }, testInfo) => {
    // Add any cleanup code if necessary
    console.log(`Test completed: ${testInfo.title} with status: ${testInfo.status}`);
    // For example, you might want to take a screenshot or log out
    await loginPage.attachScreenshot(testInfo, 'Test Completed');
    await adminApi.deleteAllProfiles();

  });
})