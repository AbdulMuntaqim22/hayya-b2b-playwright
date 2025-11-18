import { test, expect } from '@playwright/test';
const fs = require('fs');
import API from '../../Pages/api';
import LoginPage from '../../Pages/loginPage';
import NewApplicationPage from '../../Pages/newApplicationPage';
const { NewApplicationLocators } = require('../../Locators/newApplicationlocators');
const { AllApplicationLocators } = require('../../Locators/allApplicationLocators');
const { OrgGroupsLocators } = require('../../Locators/orgGroupsLocators');

test.describe.configure({ mode: 'parallel' });

test.describe('Manual Application Scenarios', () => {
  var loginPage;
  var newApp;
  let credentials;
  let apiConfig;
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
    await adminApi.deleteAllProfiles(visaData.orgName);

    // Logging in before each test    
    await loginPage.login(testInfo, credentials.requestorUsers.existingUser);
  });

  test('A1: Verify that the Data is populated after uploading the Passport', async ({ page }, testInfo) => {

    var photo = "./src/Resources/Passports/Algeria/Pic 1.jpg";
    var passport = "./src/Resources/Passports/Algeria/Passport 1.jpg"
    // Navigating to New Application Page
    await page.locator(NewApplicationLocators.newAppLeftMenuBtn).click();

    // Opening the Manual Application
    await page.locator(NewApplicationLocators.manualAppBtn).click();


    // Wait for the first field of the manual application form to be visible
    await page.waitForSelector(NewApplicationLocators.visaTypeSelect, { state: 'visible' });

    //Selecting the Visa Category
    await page.locator(NewApplicationLocators.visaCategorySelect).click();
    await page.locator(NewApplicationLocators.options).locator(`//li[text()='Tourist']`).click();

    //Selecting the Visa Type
    await page.locator(NewApplicationLocators.visaTypeSelect).click();
    await page.locator(NewApplicationLocators.options).locator(`//li[text()='A1 - Tourist Visa']`).click();

    // Entering Group Name
    await page.locator(NewApplicationLocators.groupNameTxt).fill(`Group ${newApp.generateRandomFiveDigit()}`);

    // Entering Accommodation Details
    await page.locator(NewApplicationLocators.accommodationDetailsTxt).fill("Abc Hotel");

    // Clicking on the Next button
    await page.locator(NewApplicationLocators.nextBtn).click();
    await newApp.waitForLoaderToDisappear();

    // Uploading Passport and Profile Picture
    await page.locator(NewApplicationLocators.personalPhoto).setInputFiles(photo);
    await newApp.waitForLoaderToDisappear();
    await expect(page.locator(NewApplicationLocators.personalPhoto).locator("xpath=//following-sibling::div//img[@alt='Preview']")).toBeVisible();
    await page.waitForTimeout(2000);
    await page.locator(NewApplicationLocators.passportImage).setInputFiles(passport);
    await newApp.waitForLoaderToDisappear();
    await expect(page.locator(NewApplicationLocators.passportImage).locator("xpath=//following-sibling::div//img[@alt='Preview']")).toBeVisible();

    // Verifying the Data Population
    await expect(page.locator(NewApplicationLocators.firstNameTxt)).toHaveValue("TAHAR");
    await expect(page.locator(NewApplicationLocators.lastNameTxt)).toHaveValue("BOUZEKRI");
    await expect(page.locator(NewApplicationLocators.passportNumTxt)).toHaveValue("156884267");
    expect(await page.locator(NewApplicationLocators.dobTxt).inputValue()).toBe("25/01/1964");
    expect(await page.locator(NewApplicationLocators.expDateTxt).inputValue()).toBe("24/10/2025");
    expect(await page.locator(NewApplicationLocators.nationalitySelect).locator("xpath=/parent::div/preceding-sibling::div").textContent()).toBe("Algeria");
    expect(await page.locator(NewApplicationLocators.countryIssuingPassportSelect).locator("xpath=/parent::div/preceding-sibling::div").textContent()).toBe("Algeria");

    await newApp.attachScreenshot(testInfo, 'Data populated after uploading passport');
  });

  test('A2: Verify that the Data is populated after uploading the Passport', async ({ page }, testInfo) => {

    var photo = "./src/Resources/Passports/Algeria/Pic 1.jpg";
    var passport = "./src/Resources/Passports/Algeria/Passport 1.jpg"
    // Navigating to New Application Page
    await page.locator(NewApplicationLocators.newAppLeftMenuBtn).click();

    // Opening the Manual Application
    await page.locator(NewApplicationLocators.manualAppBtn).click();


    // Wait for the first field of the manual application form to be visible
    await page.waitForSelector(NewApplicationLocators.visaTypeSelect, { state: 'visible' });

    //Selecting the Visa Category
    await page.locator(NewApplicationLocators.visaCategorySelect).click();
    await page.locator(NewApplicationLocators.options).locator(`//li[text()='Tourist']`).click();

    //Selecting the Visa Type
    await page.locator(NewApplicationLocators.visaTypeSelect).click();
    await page.locator(NewApplicationLocators.options).locator(`//li[text()='A2 - GCC Resident Visa']`).click();

    // Entering Group Name
    await page.locator(NewApplicationLocators.groupNameTxt).fill(`Group ${newApp.generateRandomFiveDigit()}`);

    // Entering Accommodation Details
    await page.locator(NewApplicationLocators.accommodationDetailsTxt).fill("Abc Hotel");

    // Clicking on the Next button
    await page.locator(NewApplicationLocators.nextBtn).click();
    await newApp.waitForLoaderToDisappear();

    // Uploading Passport and Profile Picture
    await page.locator(NewApplicationLocators.personalPhoto).setInputFiles(photo);
    await newApp.waitForLoaderToDisappear();
    await expect(page.locator(NewApplicationLocators.personalPhoto).locator("xpath=//following-sibling::div//img[@alt='Preview']")).toBeVisible();
    await page.waitForTimeout(2000);
    await page.locator(NewApplicationLocators.passportImage).setInputFiles(passport);
    await newApp.waitForLoaderToDisappear();
    await expect(page.locator(NewApplicationLocators.passportImage).locator("xpath=//following-sibling::div//img[@alt='Preview']")).toBeVisible();

    // Verifying the Data Population
    await expect(page.locator(NewApplicationLocators.firstNameTxt)).toHaveValue("TAHAR");
    await expect(page.locator(NewApplicationLocators.lastNameTxt)).toHaveValue("BOUZEKRI");
    await expect(page.locator(NewApplicationLocators.passportNumTxt)).toHaveValue("156884267");
    expect(await page.locator(NewApplicationLocators.dobTxt).inputValue()).toBe("25/01/1964");
    expect(await page.locator(NewApplicationLocators.expDateTxt).nth(0).inputValue()).toBe("24/10/2025");
    expect(await page.locator(NewApplicationLocators.nationalitySelect).locator("xpath=/parent::div/preceding-sibling::div").textContent()).toBe("Algeria");
    expect(await page.locator(NewApplicationLocators.countryIssuingPassportSelect).locator("xpath=/parent::div/preceding-sibling::div").textContent()).toBe("Algeria");

    await newApp.attachScreenshot(testInfo, 'Data populated after uploading passport');
  });

  test('A3: Verify that the Data is populated after uploading the Passport', async ({ page }, testInfo) => {

    var photo = "./src/Resources/Passports/Algeria/Pic 1.jpg";
    var passport = "./src/Resources/Passports/Algeria/Passport 1.jpg"
    // Navigating to New Application Page
    await page.locator(NewApplicationLocators.newAppLeftMenuBtn).click();

    // Opening the Manual Application
    await page.locator(NewApplicationLocators.manualAppBtn).click();


    // Wait for the first field of the manual application form to be visible
    await page.waitForSelector(NewApplicationLocators.visaTypeSelect, { state: 'visible' });

    //Selecting the Visa Category
    await page.locator(NewApplicationLocators.visaCategorySelect).click();
    await page.locator(NewApplicationLocators.options).locator(`//li[text()='Tourist']`).click();

    //Selecting the Visa Type
    await page.locator(NewApplicationLocators.visaTypeSelect).click();
    await page.locator(NewApplicationLocators.options).locator(`//li[text()='A3 - Visa with ETA']`).click();

    // Entering Group Name
    await page.locator(NewApplicationLocators.groupNameTxt).fill(`Group ${newApp.generateRandomFiveDigit()}`);

    // Entering Accommodation Details
    await page.locator(NewApplicationLocators.accommodationDetailsTxt).fill("Abc Hotel");

    // Clicking on the Next button
    await page.locator(NewApplicationLocators.nextBtn).click();
    await newApp.waitForLoaderToDisappear();

    // Uploading Passport and Profile Picture
    await page.locator(NewApplicationLocators.personalPhoto).setInputFiles(photo);
    await newApp.waitForLoaderToDisappear();
    await expect(page.locator(NewApplicationLocators.personalPhoto).locator("xpath=//following-sibling::div//img[@alt='Preview']")).toBeVisible();
    await page.waitForTimeout(2000);
    await page.locator(NewApplicationLocators.passportImage).setInputFiles(passport);
    await newApp.waitForLoaderToDisappear();
    await expect(page.locator(NewApplicationLocators.passportImage).locator("xpath=//following-sibling::div//img[@alt='Preview']")).toBeVisible();

    // Verifying the Data Population
    await expect(page.locator(NewApplicationLocators.firstNameTxt)).toHaveValue("TAHAR");
    await expect(page.locator(NewApplicationLocators.lastNameTxt)).toHaveValue("BOUZEKRI");
    await expect(page.locator(NewApplicationLocators.passportNumTxt)).toHaveValue("156884267");
    expect(await page.locator(NewApplicationLocators.dobTxt).inputValue()).toBe("25/01/1964");
    expect(await page.locator(NewApplicationLocators.expDateTxt).nth(0).inputValue()).toBe("24/10/2025");
    expect(await page.locator(NewApplicationLocators.nationalitySelect).locator("xpath=/parent::div/preceding-sibling::div").textContent()).toBe("Algeria");
    expect(await page.locator(NewApplicationLocators.countryIssuingPassportSelect).locator("xpath=/parent::div/preceding-sibling::div").textContent()).toBe("Algeria");

    await newApp.attachScreenshot(testInfo, 'Data populated after uploading passport');
  });

  test('D1 - International: Verify that the Data is populated after uploading the Passport', async ({ page }, testInfo) => {

    var photo = "./src/Resources/Passports/Algeria/Pic 1.jpg";
    var passport = "./src/Resources/Passports/Algeria/Passport 1.jpg"
    // Navigating to New Application Page
    await page.locator(NewApplicationLocators.newAppLeftMenuBtn).click();

    // Opening the Manual Application
    await page.locator(NewApplicationLocators.manualAppBtn).click();


    // Wait for the first field of the manual application form to be visible
    await page.waitForSelector(NewApplicationLocators.visaTypeSelect, { state: 'visible' });

    //Selecting the Visa Category
    await page.locator(NewApplicationLocators.visaCategorySelect).click();
    await page.locator(NewApplicationLocators.options).locator(`//li[text()='Diamond Visa']`).click();

    //Selecting the Visa Type
    await page.locator(NewApplicationLocators.visaTypeSelect).click();
    await page.locator(NewApplicationLocators.options).locator(`//li[text()='D1 - Diamond Hayya Exceptional']`).click();

    // Selecting Applicant Type as International Applicant
    await page.locator(NewApplicationLocators.internationalApplicantOptionCheckbox).check();

    // Entering Group Name
    await page.locator(NewApplicationLocators.groupNameTxt).fill(`Group ${newApp.generateRandomFiveDigit()}`);

    // Entering Accommodation Details
    await page.locator(NewApplicationLocators.accommodationDetailsTxt).fill("Abc Hotel");

    // Clicking on the Next button
    await page.locator(NewApplicationLocators.nextBtn).click();
    await newApp.waitForLoaderToDisappear();

    // Uploading Passport and Profile Picture
    await page.locator(NewApplicationLocators.personalPhoto).setInputFiles(photo);
    await newApp.waitForLoaderToDisappear();
    await expect(page.locator(NewApplicationLocators.personalPhoto).locator("xpath=//following-sibling::div//img[@alt='Preview']")).toBeVisible();
    await page.waitForTimeout(2000);
    await page.locator(NewApplicationLocators.passportImage).setInputFiles(passport);
    await newApp.waitForLoaderToDisappear();
    await expect(page.locator(NewApplicationLocators.passportImage).locator("xpath=//following-sibling::div//img[@alt='Preview']")).toBeVisible();

    // Verifying the Data Population
    await expect(page.locator(NewApplicationLocators.firstNameTxt)).toHaveValue("TAHAR");
    await expect(page.locator(NewApplicationLocators.lastNameTxt)).toHaveValue("BOUZEKRI");
    await expect(page.locator(NewApplicationLocators.passportNumTxt)).toHaveValue("156884267");
    expect(await page.locator(NewApplicationLocators.dobTxt).inputValue()).toBe("25/01/1964");
    expect(await page.locator(NewApplicationLocators.expDateTxt).nth(0).inputValue()).toBe("24/10/2025");
    expect(await page.locator(NewApplicationLocators.nationalitySelect).locator("xpath=/parent::div/preceding-sibling::div").textContent()).toBe("Algeria");
    expect(await page.locator(NewApplicationLocators.countryIssuingPassportSelect).locator("xpath=/parent::div/preceding-sibling::div").textContent()).toBe("Algeria");

    await newApp.attachScreenshot(testInfo, 'Data populated after uploading passport');
  });

  test('D2 - International: Verify that the Data is populated after uploading the Passport', async ({ page }, testInfo) => {

    var photo = "./src/Resources/Passports/Algeria/Pic 1.jpg";
    var passport = "./src/Resources/Passports/Algeria/Passport 1.jpg"
    // Navigating to New Application Page
    await page.locator(NewApplicationLocators.newAppLeftMenuBtn).click();

    // Opening the Manual Application
    await page.locator(NewApplicationLocators.manualAppBtn).click();


    // Wait for the first field of the manual application form to be visible
    await page.waitForSelector(NewApplicationLocators.visaTypeSelect, { state: 'visible' });

    //Selecting the Visa Category
    await page.locator(NewApplicationLocators.visaCategorySelect).click();
    await page.locator(NewApplicationLocators.options).locator(`//li[text()='Diamond Visa']`).click();

    //Selecting the Visa Type
    await page.locator(NewApplicationLocators.visaTypeSelect).click();
    await page.locator(NewApplicationLocators.options).locator(`//li[text()='D2 - Diamond Hayya Talent']`).click();

    // Selecting Applicant Type as International Applicant
    await page.locator(NewApplicationLocators.internationalApplicantOptionCheckbox).check();

    // Entering Group Name
    await page.locator(NewApplicationLocators.groupNameTxt).fill(`Group ${newApp.generateRandomFiveDigit()}`);

    // Entering Accommodation Details
    await page.locator(NewApplicationLocators.accommodationDetailsTxt).fill("Abc Hotel");

    // Clicking on the Next button
    await page.locator(NewApplicationLocators.nextBtn).click();
    await newApp.waitForLoaderToDisappear();

    // Uploading Passport and Profile Picture
    await page.locator(NewApplicationLocators.personalPhoto).setInputFiles(photo);
    await newApp.waitForLoaderToDisappear();
    await expect(page.locator(NewApplicationLocators.personalPhoto).locator("xpath=//following-sibling::div//img[@alt='Preview']")).toBeVisible();
    await page.waitForTimeout(2000);
    await page.locator(NewApplicationLocators.passportImage).setInputFiles(passport);
    await newApp.waitForLoaderToDisappear();
    await expect(page.locator(NewApplicationLocators.passportImage).locator("xpath=//following-sibling::div//img[@alt='Preview']")).toBeVisible();

    // Verifying the Data Population
    await expect(page.locator(NewApplicationLocators.firstNameTxt)).toHaveValue("TAHAR");
    await expect(page.locator(NewApplicationLocators.lastNameTxt)).toHaveValue("BOUZEKRI");
    await expect(page.locator(NewApplicationLocators.passportNumTxt)).toHaveValue("156884267");
    expect(await page.locator(NewApplicationLocators.dobTxt).inputValue()).toBe("25/01/1964");
    expect(await page.locator(NewApplicationLocators.expDateTxt).nth(0).inputValue()).toBe("24/10/2025");
    expect(await page.locator(NewApplicationLocators.nationalitySelect).locator("xpath=/parent::div/preceding-sibling::div").textContent()).toBe("Algeria");
    expect(await page.locator(NewApplicationLocators.countryIssuingPassportSelect).locator("xpath=/parent::div/preceding-sibling::div").textContent()).toBe("Algeria");

    await newApp.attachScreenshot(testInfo, 'Data populated after uploading passport');
  });

  test('D3 - International: Verify that the Data is populated after uploading the Passport', async ({ page }, testInfo) => {

    var photo = "./src/Resources/Passports/Algeria/Pic 1.jpg";
    var passport = "./src/Resources/Passports/Algeria/Passport 1.jpg"
    // Navigating to New Application Page
    await page.locator(NewApplicationLocators.newAppLeftMenuBtn).click();

    // Opening the Manual Application
    await page.locator(NewApplicationLocators.manualAppBtn).click();


    // Wait for the first field of the manual application form to be visible
    await page.waitForSelector(NewApplicationLocators.visaTypeSelect, { state: 'visible' });

    //Selecting the Visa Category
    await page.locator(NewApplicationLocators.visaCategorySelect).click();
    await page.locator(NewApplicationLocators.options).locator(`//li[text()='Diamond Visa']`).click();

    //Selecting the Visa Type
    await page.locator(NewApplicationLocators.visaTypeSelect).click();
    await page.locator(NewApplicationLocators.options).locator(`//li[text()='D3 - Diamond Hayya Entrepreneur']`).click();

    // Selecting Applicant Type as International Applicant
    await page.locator(NewApplicationLocators.internationalApplicantOptionCheckbox).check();

    // Entering Group Name
    await page.locator(NewApplicationLocators.groupNameTxt).fill(`Group ${newApp.generateRandomFiveDigit()}`);

    // Entering Accommodation Details
    await page.locator(NewApplicationLocators.accommodationDetailsTxt).fill("Abc Hotel");

    // Clicking on the Next button
    await page.locator(NewApplicationLocators.nextBtn).click();
    await newApp.waitForLoaderToDisappear();

    // Uploading Passport and Profile Picture
    await page.locator(NewApplicationLocators.personalPhoto).setInputFiles(photo);
    await newApp.waitForLoaderToDisappear();
    await expect(page.locator(NewApplicationLocators.personalPhoto).locator("xpath=//following-sibling::div//img[@alt='Preview']")).toBeVisible();
    await page.waitForTimeout(2000);
    await page.locator(NewApplicationLocators.passportImage).setInputFiles(passport);
    await newApp.waitForLoaderToDisappear();
    await expect(page.locator(NewApplicationLocators.passportImage).locator("xpath=//following-sibling::div//img[@alt='Preview']")).toBeVisible();

    // Verifying the Data Population
    await expect(page.locator(NewApplicationLocators.firstNameTxt)).toHaveValue("TAHAR");
    await expect(page.locator(NewApplicationLocators.lastNameTxt)).toHaveValue("BOUZEKRI");
    await expect(page.locator(NewApplicationLocators.passportNumTxt)).toHaveValue("156884267");
    expect(await page.locator(NewApplicationLocators.dobTxt).inputValue()).toBe("25/01/1964");
    expect(await page.locator(NewApplicationLocators.expDateTxt).nth(0).inputValue()).toBe("24/10/2025");
    expect(await page.locator(NewApplicationLocators.nationalitySelect).locator("xpath=/parent::div/preceding-sibling::div").textContent()).toBe("Algeria");
    expect(await page.locator(NewApplicationLocators.countryIssuingPassportSelect).locator("xpath=/parent::div/preceding-sibling::div").textContent()).toBe("Algeria");

    await newApp.attachScreenshot(testInfo, 'Data populated after uploading passport');
  });


  test.afterEach(async ({ page }, testInfo) => {
    // Add any cleanup code if necessary
    console.log(`Test completed: ${testInfo.title} with status: ${testInfo.status}`);
    // For example, you might want to take a screenshot or log out
    await loginPage.attachScreenshot(testInfo, 'Test Completed');
    await adminApi.deleteAllGroups(visaData.orgName);

  });

});