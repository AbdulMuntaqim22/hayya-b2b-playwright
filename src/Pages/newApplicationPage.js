import { expect, testInfo } from '@playwright/test';
import BasePage from './basePage';
const { NewApplicationLocators } = require('../Locators/newApplicationlocators');
import API from '../Pages/api';
import { AllApplicationLocators } from '../Locators/allApplicationLocators';
const fs = require('fs');


class NewApplicationPage extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }

  async fill_Tourist_A1_AplicationAsDraft(testInfo, data, orgName) {
    var apiConfig = JSON.parse(fs.readFileSync('./src/utils/apiConfig.json', 'utf-8'));
    this.adminApi = new API(this.page, apiConfig.baseUrl);
    var credentials = JSON.parse(fs.readFileSync('./src/utils/userCreds.json', 'utf-8'));
    await this.adminApi.init();
    await this.adminApi.GetAccessToken(credentials.adminUser);

    var groupName = "Group " + this.generateRandomFiveDigit();
    // Navigating to New Application Page
    await this.page.locator(NewApplicationLocators.newAppLeftMenuBtn).click();

    // Opening the Manual Application
    await this.page.locator(NewApplicationLocators.manualAppBtn).click();


    // Wait for the first field of the manual application form to be visible
    await this.page.waitForSelector(NewApplicationLocators.eventSelect, { state: 'visible' });

    //Selecting the Visa Category
    await this.page.locator(NewApplicationLocators.visaCategorySelect).click();
    await this.page.locator(NewApplicationLocators.options).locator(`//li[text()='${data.visaCat}']`).click();

    //Selecting the Visa Type
    await this.page.locator(NewApplicationLocators.visaTypeSelect).click();
    await this.page.locator(NewApplicationLocators.options).locator(`//li[text()='${data.visaType}']`).click();

    // Entering Group Name
    await this.page.locator(NewApplicationLocators.groupNameTxt).fill(groupName);

    // Entering Accommodation Details
    await this.page.locator(NewApplicationLocators.accommodationDetailsTxt).fill(data.accommodationDetails);

    // Clicking on the Next button
    await this.page.locator(NewApplicationLocators.nextBtn).click();
    await this.waitForLoaderToDisappear();

    try {
      // Selecting Purpose of Visit 
      await this.page.locator(NewApplicationLocators.purposeofVisitSelect).fill(data.purposeOfVisit);
      await this.page.locator(NewApplicationLocators.purposeofVisitSelect).press('Enter')

      // Selecting Passport Type
      await this.page.locator(NewApplicationLocators.passportTypeSelect).fill(data.passportType);
      await this.page.locator(NewApplicationLocators.passportTypeSelect).press('Enter');

      // Uploading Passport and Profile Picture
      await this.page.locator(NewApplicationLocators.personalPhoto).setInputFiles(data.personalPhoto);
      await this.waitForLoaderToDisappear();
      await this.page.waitForTimeout(2000);
      await this.page.locator(NewApplicationLocators.passportImage).setInputFiles(data.passportPhoto);
      await this.waitForLoaderToDisappear();

      // Wait for the field to be populated (not empty)
      await this.page.waitForFunction(
        (xpath) => {
          const el = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          return el && el.value && el.value.length > 0;
        },
        NewApplicationLocators.passportNumTxt
      );

      // Selecting Country of Birth
      await this.page.locator(NewApplicationLocators.countryOfBirthSelect).fill(data.country);
      await this.page.locator(NewApplicationLocators.countryOfBirthSelect).press('Enter');

      // Selecting Country of Residence
      await this.page.locator(NewApplicationLocators.countryOfResidenceSelect).fill(data.countryOfResidence);
      await this.page.locator(NewApplicationLocators.countryOfResidenceSelect).press('Enter');

      // Selecting Previous/Other Nationality Question
      if (data.otherNationality) {
        await this.page.locator(NewApplicationLocators.otherNationalityYesOption).check();
      }
      else {
        await this.page.locator(NewApplicationLocators.otherNationalityNoOption).check();
      }

      // Entering Contact and Emergency Contact number
      await this.page.locator(NewApplicationLocators.contactNoTxt).fill(data.contactNo);
      await this.page.locator(NewApplicationLocators.emergencyContactNoTxt).fill(data.emergencyNo);

      await this.attachScreenshot(testInfo, 'Manual Application Data is filled Correctly');
      // Clicking on Save as Draft button    
      await this.page.locator(NewApplicationLocators.saveAsDraftBtn).click();
      await this.page.locator(NewApplicationLocators.continueBtn).click();
    }
    catch (error) {

      await this.adminApi.deleteGroup(orgName, groupName);

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    return groupName;
  }

  async fill_Tourist_A1_Aplication(testInfo, data, orgName) {
    var apiConfig = JSON.parse(fs.readFileSync('./src/utils/apiConfig.json', 'utf-8'));
    this.adminApi = new API(this.page, apiConfig.baseUrl);
    var credentials = JSON.parse(fs.readFileSync('./src/utils/userCreds.json', 'utf-8'));
    await this.adminApi.init();
    await this.adminApi.GetAccessToken(credentials.adminUser);

    var groupName = "Group " + this.generateRandomFiveDigit();
    // Navigating to New Application Page
    await this.page.locator(NewApplicationLocators.newAppLeftMenuBtn).click();

    // Opening the Manual Application
    await this.page.locator(NewApplicationLocators.manualAppBtn).click();


    // Wait for the first field of the manual application form to be visible
    await this.page.waitForSelector(NewApplicationLocators.eventSelect, { state: 'visible' });

    //Selecting the Visa Category
    await this.page.locator(NewApplicationLocators.visaCategorySelect).click();
    await this.page.locator(NewApplicationLocators.options).locator(`//li[text()='${data.visaCat}']`).click();

    //Selecting the Visa Type
    await this.page.locator(NewApplicationLocators.visaTypeSelect).click();
    await this.page.locator(NewApplicationLocators.options).locator(`//li[text()='${data.visaType}']`).click();

    // Entering Group Name
    await this.page.locator(NewApplicationLocators.groupNameTxt).fill(groupName);

    // Entering Accommodation Details
    await this.page.locator(NewApplicationLocators.accommodationDetailsTxt).fill(data.accommodationDetails);

    // Clicking on the Next button
    await this.page.locator(NewApplicationLocators.nextBtn).click();
    await this.waitForLoaderToDisappear();

    try {
      // Selecting Purpose of Visit 
      await this.page.locator(NewApplicationLocators.purposeofVisitSelect).fill(data.purposeOfVisit);
      await this.page.locator(NewApplicationLocators.purposeofVisitSelect).press('Enter')

      // Selecting Passport Type
      await this.page.locator(NewApplicationLocators.passportTypeSelect).fill(data.passportType);
      await this.page.locator(NewApplicationLocators.passportTypeSelect).press('Enter');

      // Uploading Passport and Profile Picture
      await this.page.locator(NewApplicationLocators.personalPhoto).setInputFiles(data.personalPhoto);
      await this.waitForLoaderToDisappear();
      await this.page.waitForTimeout(2000);
      await this.page.locator(NewApplicationLocators.passportImage).setInputFiles(data.passportPhoto);
      await this.waitForLoaderToDisappear();

      // Wait for the field to be populated (not empty)
      await this.page.waitForFunction(
        (xpath) => {
          const el = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          return el && el.value && el.value.length > 0;
        },
        NewApplicationLocators.passportNumTxt
      );

      // Selecting Country of Birth
      await this.page.locator(NewApplicationLocators.countryOfBirthSelect).fill(data.country);
      await this.page.locator(NewApplicationLocators.countryOfBirthSelect).press('Enter');

      // Selecting Country of Residence
      await this.page.locator(NewApplicationLocators.countryOfResidenceSelect).fill(data.countryOfResidence);
      await this.page.locator(NewApplicationLocators.countryOfResidenceSelect).press('Enter');

      // Selecting Previous/Other Nationality Question
      if (data.otherNationality) {
        await this.page.locator(NewApplicationLocators.otherNationalityYesOption).check();
      }
      else {
        await this.page.locator(NewApplicationLocators.otherNationalityNoOption).check();
      }

      // Entering Contact and Emergency Contact number
      await this.page.locator(NewApplicationLocators.contactNoTxt).fill(data.contactNo);
      await this.page.locator(NewApplicationLocators.emergencyContactNoTxt).fill(data.emergencyNo);

      await this.attachScreenshot(testInfo, 'Manual Application Data is filled Correctly');
    }
    catch (error) {

      await this.adminApi.deleteGroup(orgName, groupName);

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    return groupName;
  }

  async fill_Tourist_A2_AplicationAsDraft(testInfo, data, orgName) {
    var apiConfig = JSON.parse(fs.readFileSync('./src/utils/apiConfig.json', 'utf-8'));
    this.adminApi = new API(this.page, apiConfig.baseUrl);
    var credentials = JSON.parse(fs.readFileSync('./src/utils/userCreds.json', 'utf-8'));
    await this.adminApi.init();
    await this.adminApi.GetAccessToken(credentials.adminUser);
    var groupName = "Group " + this.generateRandomFiveDigit();
    // Navigating to New Application Page
    await this.page.locator(NewApplicationLocators.newAppLeftMenuBtn).click();

    // Opening the Manual Application
    await this.page.locator(NewApplicationLocators.manualAppBtn).click();


    // Wait for the first field of the manual application form to be visible
    await this.page.waitForSelector(NewApplicationLocators.eventSelect, { state: 'visible' });

    //Selecting the Visa Category
    await this.page.locator(NewApplicationLocators.visaCategorySelect).click();
    await this.page.locator(NewApplicationLocators.options).locator(`//li[text()='${data.visaCat}']`).click();

    //Selecting the Visa Type
    await this.page.locator(NewApplicationLocators.visaTypeSelect).click();
    await this.page.locator(NewApplicationLocators.options).locator(`//li[text()='${data.visaType}']`).click();

    // Entering Group Name
    await this.page.locator(NewApplicationLocators.groupNameTxt).fill(groupName);

    // Entering Accommodation Details
    await this.page.locator(NewApplicationLocators.accommodationDetailsTxt).fill(data.accommodationDetails);

    // Clicking on the Next button
    await this.page.locator(NewApplicationLocators.nextBtn).click();
    await this.waitForLoaderToDisappear();

    try {

      // Selecting Purpose of Visit 
      await this.page.locator(NewApplicationLocators.purposeofVisitSelect).fill(data.purposeOfVisit);
      await this.page.locator(NewApplicationLocators.purposeofVisitSelect).press('Enter')

      // Selecting Passport Type
      await this.page.locator(NewApplicationLocators.passportTypeSelect).fill(data.passportType);
      await this.page.locator(NewApplicationLocators.passportTypeSelect).press('Enter');

      // Selecting Job Title
      await this.page.locator(NewApplicationLocators.jobTitleSelect).fill(data.jobTitle);
      await this.page.locator(NewApplicationLocators.jobTitleSelect).press('Enter');

      // Uploading Passport and Profile Picture
      await this.page.locator(NewApplicationLocators.personalPhoto).setInputFiles(data.personalPhoto);
      await this.page.locator(NewApplicationLocators.personalPhoto).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });
      await this.page.waitForTimeout(2000);
      await this.page.locator(NewApplicationLocators.passportImage).setInputFiles(data.passportPhoto);
      await this.waitForLoaderToDisappear();

      // Wait for the field to be populated (not empty)
      await this.page.waitForFunction(
        (xpath) => {
          const el = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          return el && el.value && el.value.length > 0;
        },
        NewApplicationLocators.passportNumTxt
      );

      await this.page.locator(NewApplicationLocators.otherNationalitySelect).waitFor({ state: "visible" });
      // Selecting Yes for Previous/Other Nationality Question
      if (data.otherNationality) {
        await this.page.locator(NewApplicationLocators.otherNationalitySelect).fill('Yes');
      }
      else {
        await this.page.locator(NewApplicationLocators.otherNationalitySelect).fill('No');
      }
      await this.page.keyboard.press('Enter');

      // Filling Exp Data field
      await this.fillDatePicker(NewApplicationLocators.residenceExpDateTxt, "01/01/2040");

      // Selecting Country of Residence
      await this.page.locator(NewApplicationLocators.countryOfResidenceSelect).fill(data.countryOfResidence);
      await this.page.keyboard.press('Enter')

      // Entering Contact and Emergency Contact number
      await this.page.locator(NewApplicationLocators.contactNoTxt).fill(data.contactNo);
      await this.page.locator(NewApplicationLocators.emergencyContactNoTxt).fill(data.emergencyNo);

      // Uploading Resident Permit
      await this.page.locator(NewApplicationLocators.residentPermitFront).setInputFiles(data.residentPermitFront);
      await this.page.locator(NewApplicationLocators.residentPermitFront).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });
      await this.page.locator(NewApplicationLocators.residentPermitBack).setInputFiles(data.residentPermitBack);
      await this.page.locator(NewApplicationLocators.residentPermitBack).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

      await this.attachScreenshot(testInfo, 'Manual Application Data is filled Correctly');
      // Clicking on Save as Draft button    
      await this.page.locator(NewApplicationLocators.saveAsDraftBtn).click();
      await this.page.locator(NewApplicationLocators.continueBtn).click();
    }
    catch (error) {

      await this.adminApi.deleteGroup(orgName, groupName);

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    return groupName;
  }

  async fill_Tourist_A2_Aplication(testInfo, data, orgName) {
    var apiConfig = JSON.parse(fs.readFileSync('./src/utils/apiConfig.json', 'utf-8'));
    this.adminApi = new API(this.page, apiConfig.baseUrl);
    var credentials = JSON.parse(fs.readFileSync('./src/utils/userCreds.json', 'utf-8'));
    await this.adminApi.init();
    await this.adminApi.GetAccessToken(credentials.adminUser);
    var groupName = "Group " + this.generateRandomFiveDigit();
    // Navigating to New Application Page
    await this.page.locator(NewApplicationLocators.newAppLeftMenuBtn).click();

    // Opening the Manual Application
    await this.page.locator(NewApplicationLocators.manualAppBtn).click();


    // Wait for the first field of the manual application form to be visible
    await this.page.waitForSelector(NewApplicationLocators.eventSelect, { state: 'visible' });

    //Selecting the Visa Category
    await this.page.locator(NewApplicationLocators.visaCategorySelect).click();
    await this.page.locator(NewApplicationLocators.options).locator(`//li[text()='${data.visaCat}']`).click();

    //Selecting the Visa Type
    await this.page.locator(NewApplicationLocators.visaTypeSelect).click();
    await this.page.locator(NewApplicationLocators.options).locator(`//li[text()='${data.visaType}']`).click();

    // Entering Group Name
    await this.page.locator(NewApplicationLocators.groupNameTxt).fill(groupName);

    // Entering Accommodation Details
    await this.page.locator(NewApplicationLocators.accommodationDetailsTxt).fill(data.accommodationDetails);

    // Clicking on the Next button
    await this.page.locator(NewApplicationLocators.nextBtn).click();
    await this.waitForLoaderToDisappear();

    try {

      // Selecting Purpose of Visit 
      await this.page.locator(NewApplicationLocators.purposeofVisitSelect).fill(data.purposeOfVisit);
      await this.page.locator(NewApplicationLocators.purposeofVisitSelect).press('Enter')

      // Selecting Passport Type
      await this.page.locator(NewApplicationLocators.passportTypeSelect).fill(data.passportType);
      await this.page.locator(NewApplicationLocators.passportTypeSelect).press('Enter');

      // Selecting Job Title
      await this.page.locator(NewApplicationLocators.jobTitleSelect).fill(data.jobTitle);
      await this.page.locator(NewApplicationLocators.jobTitleSelect).press('Enter');

      // Uploading Passport and Profile Picture
      await this.page.locator(NewApplicationLocators.personalPhoto).setInputFiles(data.personalPhoto);
      await this.page.locator(NewApplicationLocators.personalPhoto).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });
      await this.page.waitForTimeout(2000);
      await this.page.locator(NewApplicationLocators.passportImage).setInputFiles(data.passportPhoto);
      await this.waitForLoaderToDisappear();

      // Wait for the field to be populated (not empty)
      await this.page.waitForFunction(
        (xpath) => {
          const el = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          return el && el.value && el.value.length > 0;
        },
        NewApplicationLocators.passportNumTxt
      );

      await this.page.locator(NewApplicationLocators.otherNationalitySelect).waitFor({ state: "visible" });
      // Selecting Yes for Previous/Other Nationality Question
      if (data.otherNationality) {
        await this.page.locator(NewApplicationLocators.otherNationalitySelect).fill('Yes');
      }
      else {
        await this.page.locator(NewApplicationLocators.otherNationalitySelect).fill('No');
      }
      await this.page.keyboard.press('Enter');

      // Filling Exp Data field
      await this.fillDatePicker(NewApplicationLocators.residenceExpDateTxt, "01/01/2040");

      // Selecting Country of Residence
      await this.page.locator(NewApplicationLocators.countryOfResidenceSelect).fill(data.countryOfResidence);
      await this.page.keyboard.press('Enter')

      // Entering Contact and Emergency Contact number
      await this.page.locator(NewApplicationLocators.contactNoTxt).fill(data.contactNo);
      await this.page.locator(NewApplicationLocators.emergencyContactNoTxt).fill(data.emergencyNo);

      // Uploading Resident Permit
      await this.page.locator(NewApplicationLocators.residentPermitFront).setInputFiles(data.residentPermitFront);
      await this.page.locator(NewApplicationLocators.residentPermitFront).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });
      await this.page.locator(NewApplicationLocators.residentPermitBack).setInputFiles(data.residentPermitBack);
      await this.page.locator(NewApplicationLocators.residentPermitBack).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

      await this.attachScreenshot(testInfo, 'Manual Application Data is filled Correctly');
    }
    catch (error) {

      await this.adminApi.deleteGroup(orgName, groupName);

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    return groupName;
  }

  async fill_Tourist_A3_AplicationAsDraft(testInfo, data, orgName) {
    var apiConfig = JSON.parse(fs.readFileSync('./src/utils/apiConfig.json', 'utf-8'));
    this.adminApi = new API(this.page, apiConfig.baseUrl);
    var credentials = JSON.parse(fs.readFileSync('./src/utils/userCreds.json', 'utf-8'));
    await this.adminApi.init();
    await this.adminApi.GetAccessToken(credentials.adminUser);
    var groupName = "Group " + this.generateRandomFiveDigit();
    // Navigating to New Application Page
    await this.page.locator(NewApplicationLocators.newAppLeftMenuBtn).click();

    // Opening the Manual Application
    await this.page.locator(NewApplicationLocators.manualAppBtn).click();


    // Wait for the first field of the manual application form to be visible
    await this.page.waitForSelector(NewApplicationLocators.eventSelect, { state: 'visible' });

    //Selecting the Visa Category
    await this.page.locator(NewApplicationLocators.visaCategorySelect).click();
    await this.page.locator(NewApplicationLocators.options).locator(`//li[text()='${data.visaCat}']`).click();

    //Selecting the Visa Type
    await this.page.locator(NewApplicationLocators.visaTypeSelect).click();
    await this.page.locator(NewApplicationLocators.options).locator(`//li[text()='${data.visaType}']`).click();

    // Entering Group Name
    await this.page.locator(NewApplicationLocators.groupNameTxt).fill(groupName);

    // Entering Accommodation Details
    await this.page.locator(NewApplicationLocators.accommodationDetailsTxt).fill(data.accommodationDetails);

    // Clicking on the Next button
    await this.page.locator(NewApplicationLocators.nextBtn).click();
    await this.waitForLoaderToDisappear();

    try {
      // Selecting Purpose of Visit 
      await this.page.locator(NewApplicationLocators.purposeofVisitSelect).fill(data.purposeOfVisit);
      await this.page.locator(NewApplicationLocators.purposeofVisitSelect).press('Enter')

      // Selecting Passport Type
      await this.page.locator(NewApplicationLocators.passportTypeSelect).fill(data.passportType);
      await this.page.locator(NewApplicationLocators.passportTypeSelect).press('Enter');

      // Uploading Passport and Profile Picture
      await this.page.locator(NewApplicationLocators.personalPhoto).setInputFiles(data.personalPhoto);
      await this.page.locator(NewApplicationLocators.personalPhoto).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });
      await this.page.waitForTimeout(2000);
      await this.page.locator(NewApplicationLocators.passportImage).setInputFiles(data.passportPhoto);
      await this.waitForLoaderToDisappear();

      // Wait for the field to be populated (not empty)
      await this.page.waitForFunction(
        (xpath) => {
          const el = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          return el && el.value && el.value.length > 0;
        },
        NewApplicationLocators.passportNumTxt
      );

      await this.page.locator(NewApplicationLocators.otherNationalitySelect).waitFor({ state: "visible" });
      // Selecting Yes for Previous/Other Nationality Question
      if (data.otherNationality) {
        await this.page.locator(NewApplicationLocators.otherNationalitySelect).fill('Yes');
      }
      else {
        await this.page.locator(NewApplicationLocators.otherNationalitySelect).fill('No');
      }
      await this.page.keyboard.press('Enter');

      // Leaving Space for Citizenship field
      //###

      // Selecting Country of Residence
      await this.page.locator(NewApplicationLocators.countryOfResidenceSelect).fill(data.countryOfResidence);
      await this.page.locator(NewApplicationLocators.countryOfResidenceSelect).press('Enter');

      // Filling Exp Data field
      await this.fillDatePicker(NewApplicationLocators.residenceExpDateTxt, "01/01/2040");

      // Entering Contact and Emergency Contact number
      await this.page.locator(NewApplicationLocators.contactNoTxt).fill(data.contactNo);
      await this.page.locator(NewApplicationLocators.emergencyContactNoTxt).fill(data.emergencyNo);

      // Uploading Schengen Documents
      await this.page.locator(NewApplicationLocators.schengenFrontDoc).setInputFiles(data.schengenFront);
      await this.page.locator(NewApplicationLocators.schengenFrontDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });
      await this.page.locator(NewApplicationLocators.schengenBackDoc).setInputFiles(data.schengenBack);
      await this.page.locator(NewApplicationLocators.schengenBackDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

      await this.attachScreenshot(testInfo, 'Manual Application Data is filled Correctly');
      // Clicking on Save as Draft button    
      await this.page.locator(NewApplicationLocators.saveAsDraftBtn).click();
      await this.page.locator(NewApplicationLocators.continueBtn).click();
    }
    catch (error) {

      await this.adminApi.deleteGroup(orgName, groupName);

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    return groupName;
  }

  async fill_Tourist_A3_Aplication(testInfo, data, orgName) {
    var apiConfig = JSON.parse(fs.readFileSync('./src/utils/apiConfig.json', 'utf-8'));
    this.adminApi = new API(this.page, apiConfig.baseUrl);
    var credentials = JSON.parse(fs.readFileSync('./src/utils/userCreds.json', 'utf-8'));
    await this.adminApi.init();
    await this.adminApi.GetAccessToken(credentials.adminUser);
    var groupName = "Group " + this.generateRandomFiveDigit();
    // Navigating to New Application Page
    await this.page.locator(NewApplicationLocators.newAppLeftMenuBtn).click();

    // Opening the Manual Application
    await this.page.locator(NewApplicationLocators.manualAppBtn).click();


    // Wait for the first field of the manual application form to be visible
    await this.page.waitForSelector(NewApplicationLocators.eventSelect, { state: 'visible' });

    //Selecting the Visa Category
    await this.page.locator(NewApplicationLocators.visaCategorySelect).click();
    await this.page.locator(NewApplicationLocators.options).locator(`//li[text()='${data.visaCat}']`).click();

    //Selecting the Visa Type
    await this.page.locator(NewApplicationLocators.visaTypeSelect).click();
    await this.page.locator(NewApplicationLocators.options).locator(`//li[text()='${data.visaType}']`).click();

    // Entering Group Name
    await this.page.locator(NewApplicationLocators.groupNameTxt).fill(groupName);

    // Entering Accommodation Details
    await this.page.locator(NewApplicationLocators.accommodationDetailsTxt).fill(data.accommodationDetails);

    // Clicking on the Next button
    await this.page.locator(NewApplicationLocators.nextBtn).click();
    await this.waitForLoaderToDisappear();

    try {
      // Selecting Purpose of Visit 
      await this.page.locator(NewApplicationLocators.purposeofVisitSelect).fill(data.purposeOfVisit);
      await this.page.locator(NewApplicationLocators.purposeofVisitSelect).press('Enter')

      // Selecting Passport Type
      await this.page.locator(NewApplicationLocators.passportTypeSelect).fill(data.passportType);
      await this.page.locator(NewApplicationLocators.passportTypeSelect).press('Enter');

      // Uploading Passport and Profile Picture
      await this.page.locator(NewApplicationLocators.personalPhoto).setInputFiles(data.personalPhoto);
      await this.page.locator(NewApplicationLocators.personalPhoto).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });
      await this.page.waitForTimeout(2000);
      await this.page.locator(NewApplicationLocators.passportImage).setInputFiles(data.passportPhoto);
      await this.waitForLoaderToDisappear();

      // Wait for the field to be populated (not empty)
      await this.page.waitForFunction(
        (xpath) => {
          const el = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          return el && el.value && el.value.length > 0;
        },
        NewApplicationLocators.passportNumTxt
      );

      await this.page.locator(NewApplicationLocators.otherNationalitySelect).waitFor({ state: "visible" });
      // Selecting Yes for Previous/Other Nationality Question
      if (data.otherNationality) {
        await this.page.locator(NewApplicationLocators.otherNationalitySelect).fill('Yes');
      }
      else {
        await this.page.locator(NewApplicationLocators.otherNationalitySelect).fill('No');
      }
      await this.page.keyboard.press('Enter');

      // Leaving Space for Citizenship field
      //###

      // Selecting Country of Residence
      await this.page.locator(NewApplicationLocators.countryOfResidenceSelect).fill(data.countryOfResidence);
      await this.page.locator(NewApplicationLocators.countryOfResidenceSelect).press('Enter');

      // Filling Exp Data field
      await this.fillDatePicker(NewApplicationLocators.residenceExpDateTxt, "01/01/2040");

      // Entering Contact and Emergency Contact number
      await this.page.locator(NewApplicationLocators.contactNoTxt).fill(data.contactNo);
      await this.page.locator(NewApplicationLocators.emergencyContactNoTxt).fill(data.emergencyNo);

      // Uploading Schengen Documents
      await this.page.locator(NewApplicationLocators.schengenFrontDoc).setInputFiles(data.schengenFront);
      await this.page.locator(NewApplicationLocators.schengenFrontDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });
      await this.page.locator(NewApplicationLocators.schengenBackDoc).setInputFiles(data.schengenBack);
      await this.page.locator(NewApplicationLocators.schengenBackDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

      await this.attachScreenshot(testInfo, 'Manual Application Data is filled Correctly');
    }
    catch (error) {

      await this.adminApi.deleteGroup(orgName, groupName);

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    return groupName;
  }

  async fill_Tourist_A4_AplicationAsDraft(testInfo, data, orgName) {
    var apiConfig = JSON.parse(fs.readFileSync('./src/utils/apiConfig.json', 'utf-8'));
    this.adminApi = new API(this.page, apiConfig.baseUrl);
    var credentials = JSON.parse(fs.readFileSync('./src/utils/userCreds.json', 'utf-8'));
    await this.adminApi.init();
    await this.adminApi.GetAccessToken(credentials.adminUser);
    var groupName = "Group " + this.generateRandomFiveDigit();
    // Navigating to New Application Page
    await this.page.locator(NewApplicationLocators.newAppLeftMenuBtn).click();

    // Opening the Manual Application
    await this.page.locator(NewApplicationLocators.manualAppBtn).click();


    // Wait for the first field of the manual application form to be visible
    await this.page.waitForSelector(NewApplicationLocators.eventSelect, { state: 'visible' });

    //Selecting the Visa Category
    await this.page.locator(NewApplicationLocators.visaCategorySelect).click();
    await this.page.locator(NewApplicationLocators.options).locator(`//li[text()='${data.visaCat}']`).click();

    //Selecting the Visa Type
    await this.page.locator(NewApplicationLocators.visaTypeSelect).click();
    await this.page.locator(NewApplicationLocators.options).locator(`//li[text()='${data.visaType}']`).click();

    // Entering Group Name
    await this.page.locator(NewApplicationLocators.groupNameTxt).fill(groupName);

    // Entering Accommodation Details
    await this.page.locator(NewApplicationLocators.accommodationDetailsTxt).fill(data.accommodationDetails);

    // Clicking on the Next button
    await this.page.locator(NewApplicationLocators.nextBtn).click();
    await this.waitForLoaderToDisappear();

    try {
      // Selecting Purpose of Visit 
      await this.page.locator(NewApplicationLocators.purposeofVisitSelect).fill(data.purposeOfVisit);
      await this.page.locator(NewApplicationLocators.purposeofVisitSelect).press('Enter')

      // Selecting Passport Type
      await this.page.locator(NewApplicationLocators.passportTypeSelect).fill(data.passportType);
      await this.page.locator(NewApplicationLocators.passportTypeSelect).press('Enter');

      // Selecting Job Title
      await this.page.locator(NewApplicationLocators.jobTitleSelect).fill(data.jobTitle);
      await this.page.locator(NewApplicationLocators.jobTitleSelect).press('Enter');

      // Uploading Passport and Profile Picture
      await this.page.locator(NewApplicationLocators.personalPhoto).setInputFiles(data.personalPhoto);
      await this.page.locator(NewApplicationLocators.personalPhoto).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });
      await this.page.waitForTimeout(2000);
      await this.page.locator(NewApplicationLocators.passportImage).setInputFiles(data.passportPhoto);
      await this.waitForLoaderToDisappear();

      // Wait for the field to be populated (not empty)
      await this.page.waitForFunction(
        (xpath) => {
          const el = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          return el && el.value && el.value.length > 0;
        },
        NewApplicationLocators.passportNumTxt
      );

      await this.page.locator(NewApplicationLocators.otherNationalitySelect).waitFor({ state: "visible" });
      // Selecting Yes for Previous/Other Nationality Question
      if (data.otherNationality) {
        await this.page.locator(NewApplicationLocators.otherNationalitySelect).fill('Yes');
      }
      else {
        await this.page.locator(NewApplicationLocators.otherNationalitySelect).fill('No');
      }
      await this.page.keyboard.press('Enter');

      // Leaving space for Citizenship

      // Filling Exp Data field
      await this.fillDatePicker(NewApplicationLocators.residenceExpDateTxt, "01/01/2040");

      // Selecting Country of Residence
      await this.page.locator(NewApplicationLocators.countryOfResidenceSelect).fill(data.countryOfResidence);
      await this.page.keyboard.press('Enter')

      // Entering Contact and Emergency Contact number
      await this.page.locator(NewApplicationLocators.contactNoTxt).fill(data.contactNo);
      await this.page.locator(NewApplicationLocators.emergencyContactNoTxt).fill(data.emergencyNo);

      // Uploading Resident Permit
      await this.page.locator(NewApplicationLocators.residentPermitFront).setInputFiles(data.residentPermitFront);
      await this.page.locator(NewApplicationLocators.residentPermitFront).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });
      await this.page.locator(NewApplicationLocators.residentPermitBack).setInputFiles(data.residentPermitBack);
      await this.page.locator(NewApplicationLocators.residentPermitBack).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

      await this.attachScreenshot(testInfo, 'Manual Application Data is filled Correctly');
      // Clicking on Save as Draft button    
      await this.page.locator(NewApplicationLocators.saveAsDraftBtn).click();
      await this.page.locator(NewApplicationLocators.continueBtn).click();
    }
    catch (error) {

      await this.adminApi.deleteGroup(orgName, groupName);

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    return groupName;
  }

  async fill_Tourist_A4_Aplication(testInfo, data, orgName) {
    var apiConfig = JSON.parse(fs.readFileSync('./src/utils/apiConfig.json', 'utf-8'));
    this.adminApi = new API(this.page, apiConfig.baseUrl);
    var credentials = JSON.parse(fs.readFileSync('./src/utils/userCreds.json', 'utf-8'));
    await this.adminApi.init();
    await this.adminApi.GetAccessToken(credentials.adminUser);
    var groupName = "Group " + this.generateRandomFiveDigit();
    // Navigating to New Application Page
    await this.page.locator(NewApplicationLocators.newAppLeftMenuBtn).click();

    // Opening the Manual Application
    await this.page.locator(NewApplicationLocators.manualAppBtn).click();


    // Wait for the first field of the manual application form to be visible
    await this.page.waitForSelector(NewApplicationLocators.eventSelect, { state: 'visible' });

    //Selecting the Visa Category
    await this.page.locator(NewApplicationLocators.visaCategorySelect).click();
    await this.page.locator(NewApplicationLocators.options).locator(`//li[text()='${data.visaCat}']`).click();

    //Selecting the Visa Type
    await this.page.locator(NewApplicationLocators.visaTypeSelect).click();
    await this.page.locator(NewApplicationLocators.options).locator(`//li[text()='${data.visaType}']`).click();

    // Entering Group Name
    await this.page.locator(NewApplicationLocators.groupNameTxt).fill(groupName);

    // Entering Accommodation Details
    await this.page.locator(NewApplicationLocators.accommodationDetailsTxt).fill(data.accommodationDetails);

    // Clicking on the Next button
    await this.page.locator(NewApplicationLocators.nextBtn).click();
    await this.waitForLoaderToDisappear();

    try {
      // Selecting Purpose of Visit 
      await this.page.locator(NewApplicationLocators.purposeofVisitSelect).fill(data.purposeOfVisit);
      await this.page.locator(NewApplicationLocators.purposeofVisitSelect).press('Enter')

      // Selecting Passport Type
      await this.page.locator(NewApplicationLocators.passportTypeSelect).fill(data.passportType);
      await this.page.locator(NewApplicationLocators.passportTypeSelect).press('Enter');

      // Selecting Job Title
      await this.page.locator(NewApplicationLocators.jobTitleSelect).fill(data.jobTitle);
      await this.page.locator(NewApplicationLocators.jobTitleSelect).press('Enter');

      // Uploading Passport and Profile Picture
      await this.page.locator(NewApplicationLocators.personalPhoto).setInputFiles(data.personalPhoto);
      await this.page.locator(NewApplicationLocators.personalPhoto).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });
      await this.page.waitForTimeout(2000);
      await this.page.locator(NewApplicationLocators.passportImage).setInputFiles(data.passportPhoto);
      await this.waitForLoaderToDisappear();

      // Wait for the field to be populated (not empty)
      await this.page.waitForFunction(
        (xpath) => {
          const el = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          return el && el.value && el.value.length > 0;
        },
        NewApplicationLocators.passportNumTxt
      );

      await this.page.locator(NewApplicationLocators.otherNationalitySelect).waitFor({ state: "visible" });
      // Selecting Yes for Previous/Other Nationality Question
      if (data.otherNationality) {
        await this.page.locator(NewApplicationLocators.otherNationalitySelect).fill('Yes');
      }
      else {
        await this.page.locator(NewApplicationLocators.otherNationalitySelect).fill('No');
      }
      await this.page.keyboard.press('Enter');

      // Leaving space for Citizenship

      // Filling Exp Data field
      await this.fillDatePicker(NewApplicationLocators.residenceExpDateTxt, "01/01/2040");

      // Selecting Country of Residence
      await this.page.locator(NewApplicationLocators.countryOfResidenceSelect).fill(data.countryOfResidence);
      await this.page.keyboard.press('Enter')

      // Entering Contact and Emergency Contact number
      await this.page.locator(NewApplicationLocators.contactNoTxt).fill(data.contactNo);
      await this.page.locator(NewApplicationLocators.emergencyContactNoTxt).fill(data.emergencyNo);

      // Uploading Resident Permit
      await this.page.locator(NewApplicationLocators.residentPermitFront).setInputFiles(data.residentPermitFront);
      await this.page.locator(NewApplicationLocators.residentPermitFront).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });
      await this.page.locator(NewApplicationLocators.residentPermitBack).setInputFiles(data.residentPermitBack);
      await this.page.locator(NewApplicationLocators.residentPermitBack).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

      await this.attachScreenshot(testInfo, 'Manual Application Data is filled Correctly');
    }
    catch (error) {

      await this.adminApi.deleteGroup(orgName, groupName);

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    return groupName;
  }

  async fill_Tourist_F1_AplicationAsDraft(testInfo, data, orgName) {
    var apiConfig = JSON.parse(fs.readFileSync('./src/utils/apiConfig.json', 'utf-8'));
    this.adminApi = new API(this.page, apiConfig.baseUrl);
    var credentials = JSON.parse(fs.readFileSync('./src/utils/userCreds.json', 'utf-8'));
    await this.adminApi.init();
    await this.adminApi.GetAccessToken(credentials.adminUser);
    var groupName = "Group " + this.generateRandomFiveDigit();
    // Navigating to New Application Page
    await this.page.locator(NewApplicationLocators.newAppLeftMenuBtn).click();

    // Opening the Manual Application
    await this.page.locator(NewApplicationLocators.manualAppBtn).click();


    // Wait for the first field of the manual application form to be visible
    await this.page.waitForSelector(NewApplicationLocators.eventSelect, { state: 'visible' });

    //Selecting the Visa Category
    await this.page.locator(NewApplicationLocators.visaCategorySelect).click();
    await this.page.locator(NewApplicationLocators.options).locator(`//li[text()='${data.visaCat}']`).click();

    //Selecting the Visa Type
    await this.page.locator(NewApplicationLocators.visaTypeSelect).click();
    await this.page.locator(NewApplicationLocators.options).locator(`//li[text()='${data.visaType}']`).click();

    // Entering Group Name
    await this.page.locator(NewApplicationLocators.groupNameTxt).fill(groupName);

    // Entering Accommodation Details
    await this.page.locator(NewApplicationLocators.accommodationDetailsTxt).fill(data.accommodationDetails);

    // Clicking on the Next button
    await this.page.locator(NewApplicationLocators.nextBtn).click();
    await this.waitForLoaderToDisappear();

    try {
      // Selecting Purpose of Visit 
      await this.page.locator(NewApplicationLocators.purposeofVisitSelect).fill(data.purposeOfVisit);
      await this.page.locator(NewApplicationLocators.purposeofVisitSelect).press('Enter')

      // Selecting Passport Type
      await this.page.locator(NewApplicationLocators.passportTypeSelect).fill(data.passportType);
      await this.page.locator(NewApplicationLocators.passportTypeSelect).press('Enter');

      // Selecting Job Title
      await this.page.locator(NewApplicationLocators.jobTitleSelect).fill(data.jobTitle);
      await this.page.locator(NewApplicationLocators.jobTitleSelect).press('Enter');

      // Uploading Passport and Profile Picture
      await this.page.locator(NewApplicationLocators.personalPhoto).setInputFiles(data.personalPhoto);
      await this.page.locator(NewApplicationLocators.personalPhoto).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });
      await this.page.waitForTimeout(2000);
      await this.page.locator(NewApplicationLocators.passportImage).setInputFiles(data.passportPhoto);
      await this.waitForLoaderToDisappear();

      // Wait for the field to be populated (not empty)
      await this.page.waitForFunction(
        (xpath) => {
          const el = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          return el && el.value && el.value.length > 0;
        },
        NewApplicationLocators.passportNumTxt
      );

      await this.page.locator(NewApplicationLocators.otherNationalityYesOption).waitFor({ state: "visible" });
      // Selecting Yes for Previous/Other Nationality Question
      if (data.otherNationality) {
        await this.page.locator(NewApplicationLocators.otherNationalityYesOption).check();
      }
      else {
        await this.page.locator(NewApplicationLocators.otherNationalityNoOption).check();
      }
      await this.page.keyboard.press('Enter');

      if (data.otherNationality) {
        // Selecting Other Country
        await this.page.locator(NewApplicationLocators.previousOtherCitizenshipSelect).fill(data.otherCountry);
        await this.page.locator(NewApplicationLocators.previousOtherCitizenshipSelect).press('Enter');
      }

      // Filling Exp Data field
      await this.fillDatePicker(NewApplicationLocators.residenceExpDateTxt, "01/01/2040");

      // Selecting Country of Residence
      await this.page.locator(NewApplicationLocators.countryOfResidenceSelect).fill(data.countryOfResidence);
      await this.page.keyboard.press('Enter')

      // Entering Contact and Emergency Contact number
      await this.page.locator(NewApplicationLocators.contactNoTxt).fill(data.contactNo);
      await this.page.locator(NewApplicationLocators.emergencyContactNoTxt).fill(data.emergencyNo);

      await this.attachScreenshot(testInfo, 'Manual Application Data is filled Correctly');
      // Clicking on Save as Draft button    
      await this.page.locator(NewApplicationLocators.saveAsDraftBtn).click();
      await this.page.locator(NewApplicationLocators.continueBtn).click();
    }
    catch (error) {

      await this.adminApi.deleteGroup(orgName, groupName);

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    return groupName;
  }

  async fill_Tourist_F1_Aplication(testInfo, data, orgName) {
    var apiConfig = JSON.parse(fs.readFileSync('./src/utils/apiConfig.json', 'utf-8'));
    this.adminApi = new API(this.page, apiConfig.baseUrl);
    var credentials = JSON.parse(fs.readFileSync('./src/utils/userCreds.json', 'utf-8'));
    await this.adminApi.init();
    await this.adminApi.GetAccessToken(credentials.adminUser);
    var groupName = "Group " + this.generateRandomFiveDigit();
    // Navigating to New Application Page
    await this.page.locator(NewApplicationLocators.newAppLeftMenuBtn).click();

    // Opening the Manual Application
    await this.page.locator(NewApplicationLocators.manualAppBtn).click();


    // Wait for the first field of the manual application form to be visible
    await this.page.waitForSelector(NewApplicationLocators.eventSelect, { state: 'visible' });

    //Selecting the Visa Category
    await this.page.locator(NewApplicationLocators.visaCategorySelect).click();
    await this.page.locator(NewApplicationLocators.options).locator(`//li[text()='${data.visaCat}']`).click();

    //Selecting the Visa Type
    await this.page.locator(NewApplicationLocators.visaTypeSelect).click();
    await this.page.locator(NewApplicationLocators.options).locator(`//li[text()='${data.visaType}']`).click();

    // Entering Group Name
    await this.page.locator(NewApplicationLocators.groupNameTxt).fill(groupName);

    // Entering Accommodation Details
    await this.page.locator(NewApplicationLocators.accommodationDetailsTxt).fill(data.accommodationDetails);

    // Clicking on the Next button
    await this.page.locator(NewApplicationLocators.nextBtn).click();
    await this.waitForLoaderToDisappear();

    try {
      // Selecting Purpose of Visit 
      await this.page.locator(NewApplicationLocators.purposeofVisitSelect).fill(data.purposeOfVisit);
      await this.page.locator(NewApplicationLocators.purposeofVisitSelect).press('Enter')

      // Selecting Passport Type
      await this.page.locator(NewApplicationLocators.passportTypeSelect).fill(data.passportType);
      await this.page.locator(NewApplicationLocators.passportTypeSelect).press('Enter');

      // Selecting Job Title
      await this.page.locator(NewApplicationLocators.jobTitleSelect).fill(data.jobTitle);
      await this.page.locator(NewApplicationLocators.jobTitleSelect).press('Enter');

      // Uploading Passport and Profile Picture
      await this.page.locator(NewApplicationLocators.personalPhoto).setInputFiles(data.personalPhoto);
      await this.page.locator(NewApplicationLocators.personalPhoto).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });
      await this.page.waitForTimeout(2000);
      await this.page.locator(NewApplicationLocators.passportImage).setInputFiles(data.passportPhoto);
      await this.waitForLoaderToDisappear();

      // Wait for the field to be populated (not empty)
      await this.page.waitForFunction(
        (xpath) => {
          const el = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          return el && el.value && el.value.length > 0;
        },
        NewApplicationLocators.passportNumTxt
      );

      await this.page.locator(NewApplicationLocators.otherNationalityYesOption).waitFor({ state: "visible" });
      // Selecting Yes for Previous/Other Nationality Question
      if (data.otherNationality) {
        await this.page.locator(NewApplicationLocators.otherNationalityYesOption).check();
      }
      else {
        await this.page.locator(NewApplicationLocators.otherNationalityNoOption).check();
      }
      await this.page.keyboard.press('Enter');

      if (data.otherNationality) {
        // Selecting Other Country
        await this.page.locator(NewApplicationLocators.previousOtherCitizenshipSelect).fill(data.otherCountry);
        await this.page.locator(NewApplicationLocators.previousOtherCitizenshipSelect).press('Enter');
      }

      // Filling Exp Data field
      await this.fillDatePicker(NewApplicationLocators.residenceExpDateTxt, "01/01/2040");

      // Selecting Country of Residence
      await this.page.locator(NewApplicationLocators.countryOfResidenceSelect).fill(data.countryOfResidence);
      await this.page.keyboard.press('Enter')

      // Entering Contact and Emergency Contact number
      await this.page.locator(NewApplicationLocators.contactNoTxt).fill(data.contactNo);
      await this.page.locator(NewApplicationLocators.emergencyContactNoTxt).fill(data.emergencyNo);

      await this.attachScreenshot(testInfo, 'Manual Application Data is filled Correctly');
    }
    catch (error) {

      await this.adminApi.deleteGroup(orgName, groupName);

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    return groupName;
  }

  async fill_Diamond_D1_AplicationAsDraft(testInfo, data, orgName) {
    var apiConfig = JSON.parse(fs.readFileSync('./src/utils/apiConfig.json', 'utf-8'));
    this.adminApi = new API(this.page, apiConfig.baseUrl);
    var credentials = JSON.parse(fs.readFileSync('./src/utils/userCreds.json', 'utf-8'));
    await this.adminApi.init();
    await this.adminApi.GetAccessToken(credentials.adminUser);
    var groupName = "Group " + this.generateRandomFiveDigit();
    // Navigating to New Application Page
    await this.page.locator(NewApplicationLocators.newAppLeftMenuBtn).click();

    // Opening the Manual Application
    await this.page.locator(NewApplicationLocators.manualAppBtn).click();

    // Wait for the first field of the manual application form to be visible
    await this.page.waitForSelector(NewApplicationLocators.eventSelect, { state: 'visible' });

    //Selecting the Visa Category
    await this.page.locator(NewApplicationLocators.visaCategorySelect).click();
    await this.page.locator(NewApplicationLocators.options).locator(`//li[text()='${data.visaCat}']`).click();

    //Selecting the Visa Type
    await this.page.locator(NewApplicationLocators.visaTypeSelect).click();
    await this.page.locator(NewApplicationLocators.options).locator(`//li[text()='${data.visaType}']`).click();

    // Selecting the Applicant Type
    if (data.applicantType === "International") {
      await this.page.locator(NewApplicationLocators.internationalApplicantOptionCheckbox).check();
    } else {
      await this.page.locator(NewApplicationLocators.qatarResidentOptionCheckbox).check();
    }

    // Entering Group Name
    await this.page.locator(NewApplicationLocators.groupNameTxt).fill(groupName);

    // Entering the Accommodation Details
    if (data.applicantType !== "Qatar Resident") {
      await this.page.locator(NewApplicationLocators.accommodationDetailsTxt).fill(data.accommodationDetails);
    }

    // Clicking on the Next button
    await this.page.locator(NewApplicationLocators.nextBtn).click();
    await this.waitForLoaderToDisappear();

    try {

      await this.waitForLoaderToDisappear();
      await this.page.locator(NewApplicationLocators.occupationTypeSelect).waitFor({ state: 'visible' });
      // Selecting Occupation Type
      await this.page.locator(NewApplicationLocators.occupationTypeSelect).fill(data.occupationType);
      await this.page.locator(NewApplicationLocators.occupationTypeSelect).press('Enter')

      // Selecting Passport Type
      await this.page.locator(NewApplicationLocators.passportTypeSelect).fill(data.passportType);
      await this.page.locator(NewApplicationLocators.passportTypeSelect).press('Enter');

      // Uploading Passport and Profile Picture
      await this.page.locator(NewApplicationLocators.personalPhoto).setInputFiles(data.personalPhoto);
      await this.waitForLoaderToDisappear();
      await this.page.waitForTimeout(2000);
      await this.page.locator(NewApplicationLocators.passportImage).setInputFiles(data.passportPhoto);
      await this.waitForLoaderToDisappear();

      // Wait for the field to be populated (not empty)
      await this.page.waitForFunction(
        (xpath) => {
          const el = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          return el && el.value && el.value.length > 0;
        },
        NewApplicationLocators.passportNumTxt
      );

      // Setting Issue Date
      await this.fillDatePicker(NewApplicationLocators.issueDateTxt, '16/07/2025');

      // Selecting the Job Title
      await this.page.locator(NewApplicationLocators.jobTitleSelect).fill(data.jobTitle);
      await this.page.locator(NewApplicationLocators.jobTitleSelect).press('Enter');

      // Selecting Country of Birth
      await this.page.locator(NewApplicationLocators.countryOfBirthSelect).fill(data.country);
      await this.page.locator(NewApplicationLocators.countryOfBirthSelect).press('Enter');

      // Selecting Country of Residence
      await this.page.locator(NewApplicationLocators.countryOfResidenceSelect).fill(data.countryOfResidence);
      await this.page.locator(NewApplicationLocators.countryOfResidenceSelect).press('Enter');

      // Selecting Previous/Other Nationality Question
      if (data.otherNationality) {
        await this.page.locator(NewApplicationLocators.otherNationalitySelect).fill('Yes');
      }
      else {
        await this.page.locator(NewApplicationLocators.otherNationalitySelect).fill('No');
      }
      await this.page.keyboard.press('Enter');

      // Selecting Marital Status
      await this.page.locator(NewApplicationLocators.maritalStatusSelect).fill(data.maritalStatus);
      await this.page.locator(NewApplicationLocators.maritalStatusSelect).press('Enter');

      // Entering Place Of Birth
      await this.page.locator(NewApplicationLocators.placeOfBirthTxt).fill(data.placeOfBirth);

      // uploading Candidate Approval Doc
      await this.page.locator(NewApplicationLocators.candidateApprovalDoc).setInputFiles(data.candidateApprovalDoc);
      await this.page.locator(NewApplicationLocators.candidateApprovalDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

      // Entering Contact and Emergency Contact number
      await this.page.locator(NewApplicationLocators.contactNoTxt).fill(data.contactNo);
      await this.page.locator(NewApplicationLocators.emergencyContactNoTxt).fill(data.emergencyNo);

      await this.attachScreenshot(testInfo, 'Manual Application Data is filled Correctly');
      // Clicking on Save as Draft button    
      await this.page.locator(NewApplicationLocators.saveAsDraftBtn).click();
      await this.page.locator(NewApplicationLocators.continueBtn).click();
    }
    catch (error) {

      await this.adminApi.deleteGroup(orgName, groupName);

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    return groupName;
  }

  async fill_Diamond_D1_Aplication(testInfo, data, orgName) {
    var apiConfig = JSON.parse(fs.readFileSync('./src/utils/apiConfig.json', 'utf-8'));
    this.adminApi = new API(this.page, apiConfig.baseUrl);
    var credentials = JSON.parse(fs.readFileSync('./src/utils/userCreds.json', 'utf-8'));
    await this.adminApi.init();
    await this.adminApi.GetAccessToken(credentials.adminUser);
    var groupName = "Group " + this.generateRandomFiveDigit();
    // Navigating to New Application Page
    await this.page.locator(NewApplicationLocators.newAppLeftMenuBtn).click();

    // Opening the Manual Application
    await this.page.locator(NewApplicationLocators.manualAppBtn).click();

    // Wait for the first field of the manual application form to be visible
    await this.page.waitForSelector(NewApplicationLocators.eventSelect, { state: 'visible' });

    //Selecting the Visa Category
    await this.page.locator(NewApplicationLocators.visaCategorySelect).click();
    await this.page.locator(NewApplicationLocators.options).locator(`//li[text()='${data.visaCat}']`).click();

    //Selecting the Visa Type
    await this.page.locator(NewApplicationLocators.visaTypeSelect).click();
    await this.page.locator(NewApplicationLocators.options).locator(`//li[text()='${data.visaType}']`).click();

    // Selecting the Applicant Type
    if (data.applicantType === "International") {
      await this.page.locator(NewApplicationLocators.internationalApplicantOptionCheckbox).check();
    } else {
      await this.page.locator(NewApplicationLocators.qatarResidentOptionCheckbox).check();
    }

    // Entering Group Name
    await this.page.locator(NewApplicationLocators.groupNameTxt).fill(groupName);

    // Entering the Accommodation Details
    if (data.applicantType !== "Qatar Resident") {
      await this.page.locator(NewApplicationLocators.accommodationDetailsTxt).fill(data.accommodationDetails);
    }

    // Clicking on the Next button
    await this.page.locator(NewApplicationLocators.nextBtn).click();
    await this.waitForLoaderToDisappear();

    try {

      await this.waitForLoaderToDisappear();
      await this.page.locator(NewApplicationLocators.occupationTypeSelect).waitFor({ state: 'visible' });
      // Selecting Occupation Type
      await this.page.locator(NewApplicationLocators.occupationTypeSelect).fill(data.occupationType);
      await this.page.locator(NewApplicationLocators.occupationTypeSelect).press('Enter')

      // Selecting Passport Type
      await this.page.locator(NewApplicationLocators.passportTypeSelect).fill(data.passportType);
      await this.page.locator(NewApplicationLocators.passportTypeSelect).press('Enter');

      // Uploading Passport and Profile Picture
      await this.page.locator(NewApplicationLocators.personalPhoto).setInputFiles(data.personalPhoto);
      await this.waitForLoaderToDisappear();
      await this.page.waitForTimeout(2000);
      await this.page.locator(NewApplicationLocators.passportImage).setInputFiles(data.passportPhoto);
      await this.waitForLoaderToDisappear();

      // Wait for the field to be populated (not empty)
      await this.page.waitForFunction(
        (xpath) => {
          const el = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          return el && el.value && el.value.length > 0;
        },
        NewApplicationLocators.passportNumTxt
      );

      // Setting Issue Date
      await this.fillDatePicker(NewApplicationLocators.issueDateTxt, '16/07/2025');

      // Selecting the Job Title
      await this.page.locator(NewApplicationLocators.jobTitleSelect).fill(data.jobTitle);
      await this.page.locator(NewApplicationLocators.jobTitleSelect).press('Enter');

      // Selecting Country of Birth
      await this.page.locator(NewApplicationLocators.countryOfBirthSelect).fill(data.country);
      await this.page.locator(NewApplicationLocators.countryOfBirthSelect).press('Enter');

      // Selecting Country of Residence
      await this.page.locator(NewApplicationLocators.countryOfResidenceSelect).fill(data.countryOfResidence);
      await this.page.locator(NewApplicationLocators.countryOfResidenceSelect).press('Enter');

      // Selecting Previous/Other Nationality Question
      if (data.otherNationality) {
        await this.page.locator(NewApplicationLocators.otherNationalitySelect).fill('Yes');
      }
      else {
        await this.page.locator(NewApplicationLocators.otherNationalitySelect).fill('No');
      }
      await this.page.keyboard.press('Enter');

      // Selecting Marital Status
      await this.page.locator(NewApplicationLocators.maritalStatusSelect).fill(data.maritalStatus);
      await this.page.locator(NewApplicationLocators.maritalStatusSelect).press('Enter');

      // Entering Place Of Birth
      await this.page.locator(NewApplicationLocators.placeOfBirthTxt).fill(data.placeOfBirth);

      // uploading Candidate Approval Doc
      await this.page.locator(NewApplicationLocators.candidateApprovalDoc).setInputFiles(data.candidateApprovalDoc);
      await this.page.locator(NewApplicationLocators.candidateApprovalDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

      // Entering Contact and Emergency Contact number
      await this.page.locator(NewApplicationLocators.contactNoTxt).fill(data.contactNo);
      await this.page.locator(NewApplicationLocators.emergencyContactNoTxt).fill(data.emergencyNo);

      await this.attachScreenshot(testInfo, 'Manual Application Data is filled Correctly');
    }
    catch (error) {

      await this.adminApi.deleteGroup(orgName, groupName);

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    return groupName;
  }

  async fill_Diamond_D2_AplicationAsDraft(testInfo, data, orgName) {
    var apiConfig = JSON.parse(fs.readFileSync('./src/utils/apiConfig.json', 'utf-8'));
    this.adminApi = new API(this.page, apiConfig.baseUrl);
    var credentials = JSON.parse(fs.readFileSync('./src/utils/userCreds.json', 'utf-8'));
    await this.adminApi.init();
    await this.adminApi.GetAccessToken(credentials.adminUser);
    var groupName = "Group " + this.generateRandomFiveDigit();
    // Navigating to New Application Page
    await this.page.locator(NewApplicationLocators.newAppLeftMenuBtn).click();

    // Opening the Manual Application
    await this.page.locator(NewApplicationLocators.manualAppBtn).click();

    // Wait for the first field of the manual application form to be visible
    await this.page.waitForSelector(NewApplicationLocators.eventSelect, { state: 'visible' });

    //Selecting the Visa Category
    await this.page.locator(NewApplicationLocators.visaCategorySelect).click();
    await this.page.locator(NewApplicationLocators.options).locator(`//li[text()='${data.visaCat}']`).click();

    //Selecting the Visa Type
    await this.page.locator(NewApplicationLocators.visaTypeSelect).click();
    await this.page.locator(NewApplicationLocators.options).locator(`//li[text()='${data.visaType}']`).click();

    // Selecting the Applicant Type
    if (data.applicantType === "International") {
      await this.page.locator(NewApplicationLocators.internationalApplicantOptionCheckbox).check();
    } else {
      await this.page.locator(NewApplicationLocators.qatarResidentOptionCheckbox).check();
    }

    // Entering Group Name
    await this.page.locator(NewApplicationLocators.groupNameTxt).fill(groupName);

    // Entering the Accommodation Details
    if (data.applicantType !== "Qatar Resident") {
      await this.page.locator(NewApplicationLocators.accommodationDetailsTxt).fill(data.accommodationDetails);
    }

    // Clicking on the Next button
    await this.page.locator(NewApplicationLocators.nextBtn).click();
    await this.waitForLoaderToDisappear();

    try {
      await this.waitForLoaderToDisappear();
      await this.page.locator(NewApplicationLocators.occupationTypeSelect).waitFor({ state: 'visible' });
      // Selecting Occupation Type
      await this.page.locator(NewApplicationLocators.occupationTypeSelect).fill(data.occupationType);
      await this.page.locator(NewApplicationLocators.occupationTypeSelect).press('Enter');

      // Selecting Purpose of Visit 
      await this.page.locator(NewApplicationLocators.purposeofVisitSelect).fill(data.purposeOfVisit);
      await this.page.locator(NewApplicationLocators.purposeofVisitSelect).press('Enter')

      // Selecting Passport Type
      await this.page.locator(NewApplicationLocators.passportTypeSelect).fill(data.passportType);
      await this.page.locator(NewApplicationLocators.passportTypeSelect).press('Enter');

      // Uploading Passport and Profile Picture
      await this.page.locator(NewApplicationLocators.personalPhoto).setInputFiles(data.personalPhoto);
      await this.waitForLoaderToDisappear();
      await this.page.waitForTimeout(2000);
      await this.page.locator(NewApplicationLocators.passportImage).setInputFiles(data.passportPhoto);
      await this.waitForLoaderToDisappear();

      // Wait for the field to be populated (not empty)
      await this.page.waitForFunction(
        (xpath) => {
          const el = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          return el && el.value && el.value.length > 0;
        },
        NewApplicationLocators.passportNumTxt
      );

      // Setting Issue Date
      await this.fillDatePicker(NewApplicationLocators.issueDateTxt, '16/07/2025');

      // Selecting Country of Birth
      await this.page.locator(NewApplicationLocators.countryOfBirthSelect).fill(data.country);
      await this.page.locator(NewApplicationLocators.countryOfBirthSelect).press('Enter');

      // Selecting Country of Residence
      await this.page.locator(NewApplicationLocators.countryOfResidenceSelect).fill(data.countryOfResidence);
      await this.page.locator(NewApplicationLocators.countryOfResidenceSelect).press('Enter');

      // Selecting Previous/Other Nationality Question
      if (data.otherNationality) {
        await this.page.locator(NewApplicationLocators.otherNationalitySelect).fill('Yes');
      }
      else {
        await this.page.locator(NewApplicationLocators.otherNationalitySelect).fill('No');
      }
      await this.page.keyboard.press('Enter');

      // Entering Place Of Birth
      await this.page.locator(NewApplicationLocators.placeOfBirthTxt).fill(data.placeOfBirth);

      // Uploading Police Clearance Doc
      await this.page.locator(NewApplicationLocators.policeClearanceDoc).setInputFiles(data.policeClearanceDoc);
      await this.page.locator(NewApplicationLocators.policeClearanceDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

      // Uploading Authenticated Degree Doc
      await this.page.locator(NewApplicationLocators.degreeDoc).setInputFiles(data.degreeDoc);
      await this.page.locator(NewApplicationLocators.degreeDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

      // Uploading Sectoral Endorsement Letter Doc
      await this.page.locator(NewApplicationLocators.sectoralEndorsementDoc).setInputFiles(data.sectoralEndorsementDoc);
      await this.page.locator(NewApplicationLocators.sectoralEndorsementDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

      // Uploading Valid International license to practice Medicine Doc
      await this.page.locator(NewApplicationLocators.medLicenseDoc).setInputFiles(data.medLicenseDoc);
      await this.page.locator(NewApplicationLocators.medLicenseDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

      // Uploading CV (including proof of experience)
      await this.page.locator(NewApplicationLocators.cvDoc).setInputFiles(data.cvDoc);
      await this.page.locator(NewApplicationLocators.cvDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

      // Uploading Case Research Report
      await this.page.locator(NewApplicationLocators.caseResearchDoc).setInputFiles(data.caseResearchDoc);
      await this.page.locator(NewApplicationLocators.caseResearchDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

      // Uploading Certificate of Good Standing
      await this.page.locator(NewApplicationLocators.goodStandingCertDoc).setInputFiles(data.goodStandingCertDoc);
      await this.page.locator(NewApplicationLocators.goodStandingCertDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

      // Uploading Personal Bank Statement (Last 3 months)
      await this.page.locator(NewApplicationLocators.bankStatementDoc).setInputFiles(data.bankStatementDoc);
      await this.page.locator(NewApplicationLocators.bankStatementDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

      // Uploading Job Contract or Offer letter from Hiring entity
      await this.page.locator(NewApplicationLocators.offerLetterDoc).setInputFiles(data.offerLetterDoc);
      await this.page.locator(NewApplicationLocators.offerLetterDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

      // Entering Contact and Emergency Contact number
      await this.page.locator(NewApplicationLocators.contactNoTxt).fill(data.contactNo);
      await this.page.locator(NewApplicationLocators.emergencyContactNoTxt).fill(data.emergencyNo);

      await this.attachScreenshot(testInfo, 'Manual Application Data is filled Correctly');
      // Clicking on Save as Draft button    
      await this.page.locator(NewApplicationLocators.saveAsDraftBtn).click();
      await this.page.locator(NewApplicationLocators.continueBtn).click();

    }
    catch (error) {

      await this.adminApi.deleteGroup(orgName, groupName);

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }
    return groupName;
  }

  async fill_Diamond_D2_Aplication(testInfo, data, orgName) {
    var apiConfig = JSON.parse(fs.readFileSync('./src/utils/apiConfig.json', 'utf-8'));
    this.adminApi = new API(this.page, apiConfig.baseUrl);
    var credentials = JSON.parse(fs.readFileSync('./src/utils/userCreds.json', 'utf-8'));
    await this.adminApi.init();
    await this.adminApi.GetAccessToken(credentials.adminUser);
    var groupName = "Group " + this.generateRandomFiveDigit();
    // Navigating to New Application Page
    await this.page.locator(NewApplicationLocators.newAppLeftMenuBtn).click();

    // Opening the Manual Application
    await this.page.locator(NewApplicationLocators.manualAppBtn).click();

    // Wait for the first field of the manual application form to be visible
    await this.page.waitForSelector(NewApplicationLocators.eventSelect, { state: 'visible' });

    //Selecting the Visa Category
    await this.page.locator(NewApplicationLocators.visaCategorySelect).click();
    await this.page.locator(NewApplicationLocators.options).locator(`//li[text()='${data.visaCat}']`).click();

    //Selecting the Visa Type
    await this.page.locator(NewApplicationLocators.visaTypeSelect).click();
    await this.page.locator(NewApplicationLocators.options).locator(`//li[text()='${data.visaType}']`).click();

    // Selecting the Applicant Type
    if (data.applicantType === "International") {
      await this.page.locator(NewApplicationLocators.internationalApplicantOptionCheckbox).check();
    } else {
      await this.page.locator(NewApplicationLocators.qatarResidentOptionCheckbox).check();
    }

    // Entering Group Name
    await this.page.locator(NewApplicationLocators.groupNameTxt).fill(groupName);

    // Entering the Accommodation Details
    if (data.applicantType !== "Qatar Resident") {
      await this.page.locator(NewApplicationLocators.accommodationDetailsTxt).fill(data.accommodationDetails);
    }

    // Clicking on the Next button
    await this.page.locator(NewApplicationLocators.nextBtn).click();
    await this.waitForLoaderToDisappear();

    try {
      await this.waitForLoaderToDisappear();
      await this.page.locator(NewApplicationLocators.occupationTypeSelect).waitFor({ state: 'visible' });
      // Selecting Occupation Type
      await this.page.locator(NewApplicationLocators.occupationTypeSelect).fill(data.occupationType);
      await this.page.locator(NewApplicationLocators.occupationTypeSelect).press('Enter');

      // Selecting Purpose of Visit 
      await this.page.locator(NewApplicationLocators.purposeofVisitSelect).fill(data.purposeOfVisit);
      await this.page.locator(NewApplicationLocators.purposeofVisitSelect).press('Enter')

      // Selecting Passport Type
      await this.page.locator(NewApplicationLocators.passportTypeSelect).fill(data.passportType);
      await this.page.locator(NewApplicationLocators.passportTypeSelect).press('Enter');

      // Uploading Passport and Profile Picture
      await this.page.locator(NewApplicationLocators.personalPhoto).setInputFiles(data.personalPhoto);
      await this.waitForLoaderToDisappear();
      await this.page.waitForTimeout(2000);
      await this.page.locator(NewApplicationLocators.passportImage).setInputFiles(data.passportPhoto);
      await this.waitForLoaderToDisappear();

      // Wait for the field to be populated (not empty)
      await this.page.waitForFunction(
        (xpath) => {
          const el = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          return el && el.value && el.value.length > 0;
        },
        NewApplicationLocators.passportNumTxt
      );

      // Setting Issue Date
      await this.fillDatePicker(NewApplicationLocators.issueDateTxt, '16/07/2025');

      // Selecting Country of Birth
      await this.page.locator(NewApplicationLocators.countryOfBirthSelect).fill(data.country);
      await this.page.locator(NewApplicationLocators.countryOfBirthSelect).press('Enter');

      // Selecting Country of Residence
      await this.page.locator(NewApplicationLocators.countryOfResidenceSelect).fill(data.countryOfResidence);
      await this.page.locator(NewApplicationLocators.countryOfResidenceSelect).press('Enter');

      // Selecting Previous/Other Nationality Question
      if (data.otherNationality) {
        await this.page.locator(NewApplicationLocators.otherNationalitySelect).fill('Yes');
      }
      else {
        await this.page.locator(NewApplicationLocators.otherNationalitySelect).fill('No');
      }
      await this.page.keyboard.press('Enter');

      // Entering Place Of Birth
      await this.page.locator(NewApplicationLocators.placeOfBirthTxt).fill(data.placeOfBirth);

      // Uploading Police Clearance Doc
      await this.page.locator(NewApplicationLocators.policeClearanceDoc).setInputFiles(data.policeClearanceDoc);
      await this.page.locator(NewApplicationLocators.policeClearanceDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

      // Uploading Authenticated Degree Doc
      await this.page.locator(NewApplicationLocators.degreeDoc).setInputFiles(data.degreeDoc);
      await this.page.locator(NewApplicationLocators.degreeDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

      // Uploading Sectoral Endorsement Letter Doc
      await this.page.locator(NewApplicationLocators.sectoralEndorsementDoc).setInputFiles(data.sectoralEndorsementDoc);
      await this.page.locator(NewApplicationLocators.sectoralEndorsementDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

      // Uploading Valid International license to practice Medicine Doc
      await this.page.locator(NewApplicationLocators.medLicenseDoc).setInputFiles(data.medLicenseDoc);
      await this.page.locator(NewApplicationLocators.medLicenseDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

      // Uploading CV (including proof of experience)
      await this.page.locator(NewApplicationLocators.cvDoc).setInputFiles(data.cvDoc);
      await this.page.locator(NewApplicationLocators.cvDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

      // Uploading Case Research Report
      await this.page.locator(NewApplicationLocators.caseResearchDoc).setInputFiles(data.caseResearchDoc);
      await this.page.locator(NewApplicationLocators.caseResearchDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

      // Uploading Certificate of Good Standing
      await this.page.locator(NewApplicationLocators.goodStandingCertDoc).setInputFiles(data.goodStandingCertDoc);
      await this.page.locator(NewApplicationLocators.goodStandingCertDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

      // Uploading Personal Bank Statement (Last 3 months)
      await this.page.locator(NewApplicationLocators.bankStatementDoc).setInputFiles(data.bankStatementDoc);
      await this.page.locator(NewApplicationLocators.bankStatementDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

      // Uploading Job Contract or Offer letter from Hiring entity
      await this.page.locator(NewApplicationLocators.offerLetterDoc).setInputFiles(data.offerLetterDoc);
      await this.page.locator(NewApplicationLocators.offerLetterDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

      // Entering Contact and Emergency Contact number
      await this.page.locator(NewApplicationLocators.contactNoTxt).fill(data.contactNo);
      await this.page.locator(NewApplicationLocators.emergencyContactNoTxt).fill(data.emergencyNo);

      await this.attachScreenshot(testInfo, 'Manual Application Data is filled Correctly');

    }
    catch (error) {

      await this.adminApi.deleteGroup(orgName, groupName);

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }
    return groupName;
  }

  async fill_Diamond_D3_AplicationAsDraft(testInfo, data, orgName) {
    var apiConfig = JSON.parse(fs.readFileSync('./src/utils/apiConfig.json', 'utf-8'));
    this.adminApi = new API(this.page, apiConfig.baseUrl);
    var credentials = JSON.parse(fs.readFileSync('./src/utils/userCreds.json', 'utf-8'));
    await this.adminApi.init();
    await this.adminApi.GetAccessToken(credentials.adminUser);
    var groupName = "Group " + this.generateRandomFiveDigit();
    // Navigating to New Application Page
    await this.page.locator(NewApplicationLocators.newAppLeftMenuBtn).click();

    // Opening the Manual Application
    await this.page.locator(NewApplicationLocators.manualAppBtn).click();

    // Wait for the first field of the manual application form to be visible
    await this.page.waitForSelector(NewApplicationLocators.eventSelect, { state: 'visible' });

    //Selecting the Visa Category
    await this.page.locator(NewApplicationLocators.visaCategorySelect).click();
    await this.page.locator(NewApplicationLocators.options).locator(`//li[text()='${data.visaCat}']`).click();

    //Selecting the Visa Type
    await this.page.locator(NewApplicationLocators.visaTypeSelect).click();
    await this.page.locator(NewApplicationLocators.options).locator(`//li[text()='${data.visaType}']`).click();

    // Selecting the Applicant Type
    if (data.applicantType === "International") {
      await this.page.locator(NewApplicationLocators.internationalApplicantOptionCheckbox).check();
    } else {
      await this.page.locator(NewApplicationLocators.qatarResidentOptionCheckbox).check();
    }

    // Entering Group Name
    await this.page.locator(NewApplicationLocators.groupNameTxt).fill(groupName);

    // Entering the Accommodation Details
    if (data.applicantType !== "Qatar Resident") {
      await this.page.locator(NewApplicationLocators.accommodationDetailsTxt).fill(data.accommodationDetails);
    }

    // Clicking on the Next button
    await this.page.locator(NewApplicationLocators.nextBtn).click();
    await this.waitForLoaderToDisappear();

    try {

      await this.waitForLoaderToDisappear();
      await this.page.locator(NewApplicationLocators.occupationTypeSelect).waitFor({ state: 'visible' });

      // Selecting Occupation Type
      await this.page.locator(NewApplicationLocators.occupationTypeSelect).fill(data.occupationType);
      await this.page.locator(NewApplicationLocators.occupationTypeSelect).press('Enter');

      // Selecting Purpose of Visit 
      await this.page.locator(NewApplicationLocators.purposeofVisitSelect).fill(data.purposeOfVisit);
      await this.page.locator(NewApplicationLocators.purposeofVisitSelect).press('Enter')

      // Selecting Passport Type
      await this.page.locator(NewApplicationLocators.passportTypeSelect).fill(data.passportType);
      await this.page.locator(NewApplicationLocators.passportTypeSelect).press('Enter');

      // Uploading Passport and Profile Picture
      await this.page.locator(NewApplicationLocators.personalPhoto).setInputFiles(data.personalPhoto);
      await this.waitForLoaderToDisappear();
      await this.page.waitForTimeout(2000);
      await this.page.locator(NewApplicationLocators.passportImage).setInputFiles(data.passportPhoto);
      await this.waitForLoaderToDisappear();

      // Wait for the field to be populated (not empty)
      await this.page.waitForFunction(
        (xpath) => {
          const el = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          return el && el.value && el.value.length > 0;
        },
        NewApplicationLocators.passportNumTxt
      );

      // Setting Issue Date
      await this.fillDatePicker(NewApplicationLocators.issueDateTxt, '16/07/2025');

      // Selecting Country of Birth
      await this.page.locator(NewApplicationLocators.countryOfBirthSelect).fill(data.country);
      await this.page.locator(NewApplicationLocators.countryOfBirthSelect).press('Enter');

      // Selecting Country of Residence
      await this.page.locator(NewApplicationLocators.countryOfResidenceSelect).fill(data.countryOfResidence);
      await this.page.locator(NewApplicationLocators.countryOfResidenceSelect).press('Enter');

      // Selecting Previous/Other Nationality Question
      if (data.otherNationality) {
        await this.page.locator(NewApplicationLocators.otherNationalitySelect).fill('Yes');
      }
      else {
        await this.page.locator(NewApplicationLocators.otherNationalitySelect).fill('No');
      }
      await this.page.keyboard.press('Enter');

      // Entering Place Of Birth
      await this.page.locator(NewApplicationLocators.placeOfBirthTxt).fill(data.placeOfBirth);

      // Uploading Police Clearance Doc
      await this.page.locator(NewApplicationLocators.policeClearanceDoc).setInputFiles(data.policeClearanceDoc);
      await this.page.locator(NewApplicationLocators.policeClearanceDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

      // Uploading Authenticated Degree Doc
      await this.page.locator(NewApplicationLocators.degreeDoc).setInputFiles(data.degreeDoc);
      await this.page.locator(NewApplicationLocators.degreeDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

      // Uploading CV (including proof of experience)
      await this.page.locator(NewApplicationLocators.cvDoc).setInputFiles(data.cvDoc);
      await this.page.locator(NewApplicationLocators.cvDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

      // Uploading Case Research Report
      await this.page.locator(NewApplicationLocators.caseResearchDoc).setInputFiles(data.caseResearchDoc);
      await this.page.locator(NewApplicationLocators.caseResearchDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

      // Uploading Personal Bank Statement (Last 3 months)
      await this.page.locator(NewApplicationLocators.bankStatementDoc).setInputFiles(data.bankStatementDoc);
      await this.page.locator(NewApplicationLocators.bankStatementDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

      // Entering Contact and Emergency Contact number
      await this.page.locator(NewApplicationLocators.contactNoTxt).fill(data.contactNo);
      await this.page.locator(NewApplicationLocators.emergencyContactNoTxt).fill(data.emergencyNo);

      await this.attachScreenshot(testInfo, 'Manual Application Data is filled Correctly');
      // Clicking on Save as Draft button    
      await this.page.locator(NewApplicationLocators.saveAsDraftBtn).click();
      await this.page.locator(NewApplicationLocators.continueBtn).click();
    }
    catch (error) {

      await this.adminApi.deleteGroup(orgName, groupName);

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }
    return groupName;
  }

  async fill_Diamond_D3_Aplication(testInfo, data, orgName) {
    var apiConfig = JSON.parse(fs.readFileSync('./src/utils/apiConfig.json', 'utf-8'));
    this.adminApi = new API(this.page, apiConfig.baseUrl);
    var credentials = JSON.parse(fs.readFileSync('./src/utils/userCreds.json', 'utf-8'));
    await this.adminApi.init();
    await this.adminApi.GetAccessToken(credentials.adminUser);
    var groupName = "Group " + this.generateRandomFiveDigit();
    // Navigating to New Application Page
    await this.page.locator(NewApplicationLocators.newAppLeftMenuBtn).click();

    // Opening the Manual Application
    await this.page.locator(NewApplicationLocators.manualAppBtn).click();

    // Wait for the first field of the manual application form to be visible
    await this.page.waitForSelector(NewApplicationLocators.eventSelect, { state: 'visible' });

    //Selecting the Visa Category
    await this.page.locator(NewApplicationLocators.visaCategorySelect).click();
    await this.page.locator(NewApplicationLocators.options).locator(`//li[text()='${data.visaCat}']`).click();

    //Selecting the Visa Type
    await this.page.locator(NewApplicationLocators.visaTypeSelect).click();
    await this.page.locator(NewApplicationLocators.options).locator(`//li[text()='${data.visaType}']`).click();

    // Selecting the Applicant Type
    if (data.applicantType === "International") {
      await this.page.locator(NewApplicationLocators.internationalApplicantOptionCheckbox).check();
    } else {
      await this.page.locator(NewApplicationLocators.qatarResidentOptionCheckbox).check();
    }

    // Entering Group Name
    await this.page.locator(NewApplicationLocators.groupNameTxt).fill(groupName);

    // Entering the Accommodation Details
    if (data.applicantType !== "Qatar Resident") {
      await this.page.locator(NewApplicationLocators.accommodationDetailsTxt).fill(data.accommodationDetails);
    }

    // Clicking on the Next button
    await this.page.locator(NewApplicationLocators.nextBtn).click();
    await this.waitForLoaderToDisappear();

    try {

      await this.waitForLoaderToDisappear();
      await this.page.locator(NewApplicationLocators.occupationTypeSelect).waitFor({ state: 'visible' });

      // Selecting Occupation Type
      await this.page.locator(NewApplicationLocators.occupationTypeSelect).fill(data.occupationType);
      await this.page.locator(NewApplicationLocators.occupationTypeSelect).press('Enter');

      // Selecting Purpose of Visit 
      await this.page.locator(NewApplicationLocators.purposeofVisitSelect).fill(data.purposeOfVisit);
      await this.page.locator(NewApplicationLocators.purposeofVisitSelect).press('Enter')

      // Selecting Passport Type
      await this.page.locator(NewApplicationLocators.passportTypeSelect).fill(data.passportType);
      await this.page.locator(NewApplicationLocators.passportTypeSelect).press('Enter');

      // Uploading Passport and Profile Picture
      await this.page.locator(NewApplicationLocators.personalPhoto).setInputFiles(data.personalPhoto);
      await this.waitForLoaderToDisappear();
      await this.page.waitForTimeout(2000);
      await this.page.locator(NewApplicationLocators.passportImage).setInputFiles(data.passportPhoto);
      await this.waitForLoaderToDisappear();

      // Wait for the field to be populated (not empty)
      await this.page.waitForFunction(
        (xpath) => {
          const el = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
          return el && el.value && el.value.length > 0;
        },
        NewApplicationLocators.passportNumTxt
      );

      // Setting Issue Date
      await this.fillDatePicker(NewApplicationLocators.issueDateTxt, '16/07/2025');

      // Selecting Country of Birth
      await this.page.locator(NewApplicationLocators.countryOfBirthSelect).fill(data.country);
      await this.page.locator(NewApplicationLocators.countryOfBirthSelect).press('Enter');

      // Selecting Country of Residence
      await this.page.locator(NewApplicationLocators.countryOfResidenceSelect).fill(data.countryOfResidence);
      await this.page.locator(NewApplicationLocators.countryOfResidenceSelect).press('Enter');

      // Selecting Previous/Other Nationality Question
      if (data.otherNationality) {
        await this.page.locator(NewApplicationLocators.otherNationalitySelect).fill('Yes');
      }
      else {
        await this.page.locator(NewApplicationLocators.otherNationalitySelect).fill('No');
      }
      await this.page.keyboard.press('Enter');

      // Entering Place Of Birth
      await this.page.locator(NewApplicationLocators.placeOfBirthTxt).fill(data.placeOfBirth);

      // Uploading Police Clearance Doc
      await this.page.locator(NewApplicationLocators.policeClearanceDoc).setInputFiles(data.policeClearanceDoc);
      await this.page.locator(NewApplicationLocators.policeClearanceDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

      // Uploading Authenticated Degree Doc
      await this.page.locator(NewApplicationLocators.degreeDoc).setInputFiles(data.degreeDoc);
      await this.page.locator(NewApplicationLocators.degreeDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

      // Uploading CV (including proof of experience)
      await this.page.locator(NewApplicationLocators.cvDoc).setInputFiles(data.cvDoc);
      await this.page.locator(NewApplicationLocators.cvDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

      // Uploading Case Research Report
      await this.page.locator(NewApplicationLocators.caseResearchDoc).setInputFiles(data.caseResearchDoc);
      await this.page.locator(NewApplicationLocators.caseResearchDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

      // Uploading Personal Bank Statement (Last 3 months)
      await this.page.locator(NewApplicationLocators.bankStatementDoc).setInputFiles(data.bankStatementDoc);
      await this.page.locator(NewApplicationLocators.bankStatementDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

      // Entering Contact and Emergency Contact number
      await this.page.locator(NewApplicationLocators.contactNoTxt).fill(data.contactNo);
      await this.page.locator(NewApplicationLocators.emergencyContactNoTxt).fill(data.emergencyNo);

      await this.attachScreenshot(testInfo, 'Manual Application Data is filled Correctly');
    }
    catch (error) {

      await this.adminApi.deleteGroup(orgName, groupName);

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }
    return groupName;
  }

  async fill_Bulk_Upload(testInfo, data) {
    var groupName = "Group " + this.generateRandomFiveDigit();

    // Navigating to New Application Page
    await this.page.locator(NewApplicationLocators.newAppLeftMenuBtn).click();

    // Opening the Manual Application
    await this.page.locator(NewApplicationLocators.bulkUploadBtn).click();

    // Wait for the first field of the manual application form to be visible
    await this.page.waitForSelector(NewApplicationLocators.eventSelect, { state: 'visible' });

    //Selecting the Visa Category
    await this.page.locator(NewApplicationLocators.visaCategorySelect).click();
    await this.page.locator(NewApplicationLocators.options).locator(`//li[text()='${data.visaCat}']`).click();

    //Selecting the Visa Type
    await this.page.locator(NewApplicationLocators.visaTypeSelect).click();
    await this.page.locator(NewApplicationLocators.options).locator(`//li[text()='${data.visaType}']`).click();

    // Entering Group Name
    await this.page.locator(NewApplicationLocators.groupNameTxt).fill(groupName);

    // Entering Accommodation Details
    await this.page.locator(NewApplicationLocators.accommodationDetailsTxt).fill(data.accommodationDetails);

    // Uploading the Zip file
    await this.page.locator(NewApplicationLocators.uploadZipFile).setInputFiles(data.zipFile);

    if (data.visaCat.includes('Diamond')) {
      // selecting the Applicant Type
      if (data.applicantType === "International") {
        await this.page.locator(NewApplicationLocators.internationalApplicantOptionCheckbox).check();
      } else {
        await this.page.locator(NewApplicationLocators.qatarResidentOptionCheckbox).check();
      }
      if (data.docType === 'Passport') {
        await this.page.locator(NewApplicationLocators.passportOption).check();
      }
      else {
        await this.page.locator(NewApplicationLocators.qidOption).check();
      }
    }

    // clicking on the submit button
    await this.page.locator(NewApplicationLocators.submitBtn).click();

    // clicking on the Continue button
    await this.page.locator(NewApplicationLocators.continueBtn).click();

    await this.page.locator(NewApplicationLocators.tableRows).first().waitFor({ state: "visible" });

    var element = NewApplicationLocators.tableRows + "//td/p[text()='" + groupName + "']/ancestor::td/following-sibling::td[7]/span";
    // Waiting for the bul Upload to be Processed
    await this.reloadUntilValueChanges(element, "Completed");

    await this.attachScreenshot(testInfo, "The Bulk Data is Processed");

    return groupName;
  }

  async update_Submitted_Application(testInfo) {
    await this.page.locator(AllApplicationLocators.editAppBtn).click();

    var otherNationalCheckbox = this.page.locator(NewApplicationLocators.otherNationalityNoOption);
    var occupationType = this.page.locator(NewApplicationLocators.otherNationalityNoOption);

    try {
      await occupationType.waitFor({ state: 'visible', timeout: 15000 });      
      await occupationType.fill(data.occupationType);
      await this.page.keyboard.press('Enter');
    }
    catch{}
    try {
      await otherNationalCheckbox.waitFor({ state: 'visible', timeout: 15000 });      
      await otherNationalCheckbox.check();
    } catch {
      await this.page.locator(NewApplicationLocators.otherNationalitySelect).fill('No');
      await this.page.keyboard.press('Enter');
    }
    await this.page.locator(NewApplicationLocators.updateApplicationBtn).click();
  }
}

export default NewApplicationPage;