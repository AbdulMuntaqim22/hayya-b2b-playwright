import { test, expect } from '@playwright/test';
const fs = require('fs');
import API from '../../Pages/api';
import LoginPage from '../../Pages/loginPage';
import NewApplicationPage from '../../Pages/newApplicationPage';
const { NewApplicationLocators } = require('../../Locators/newApplicationlocators');
const { AllApplicationLocators } = require('../../Locators/allApplicationLocators');
const { OrgGroupsLocators } = require('../../Locators/orgGroupsLocators');

test.describe.configure({ mode: 'parallel' }); 

test.describe('Manual Application Scenarios - Rejected Without Reason', () => {
  /** @type {LoginPage} */
  var loginPage;
  /** @type {NewApplicationPage} */
  var newApp;
  let credentials;
  let apiConfig;
  let adminUserData;
  /** @type {API} */
  let adminApi;
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

  test('A1: Verify that the user will be blocked and for applying and updating the Application when it is Rejected without a Reason', async ({ page }, testInfo) => {

    var data = visaData.A1;

    // Fill and Save the Application as Draft
    var groupName = await newApp.fill_Tourist_A1_AplicationAsDraft(testInfo, data, visaData.orgName);
    try {

      // Navigating to Organization Groups Page
      await page.locator(OrgGroupsLocators.orgGroupsLeftMenu).click();
      await page.waitForLoadState('load');
      await page.locator(OrgGroupsLocators.groupTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Group is created
      var row = page.locator(OrgGroupsLocators.groupTableRows).locator(`//td/p[text()='${groupName}']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The group ${groupName} is created`);

      // Navigating to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      await page.waitForLoadState('load');
      await page.locator(OrgGroupsLocators.groupTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Application is created with status Draft
      var row = page.locator(OrgGroupsLocators.groupTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td/span[text()='Draft']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application is submitted as Draft status in group Name ${groupName}`);
    } catch (error) {
      // Deleting All Draft Applications
      await adminApi.deleteAllDraftApps(visaData.orgName);

      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    try {
      // Navigating to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      await page.waitForLoadState('load');
      await page.locator(AllApplicationLocators.appTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Application is created with status Draft
      var row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td/span[text()='Draft']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application is submitted as Draft status in group Name ${groupName}`);

      // Navigating to Organization Groups Page
      await page.locator(OrgGroupsLocators.orgGroupsLeftMenu).click();
      await page.waitForLoadState('load');
      await page.locator(OrgGroupsLocators.groupTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Group is created
      var row = page.locator(OrgGroupsLocators.groupTableRows).locator(`//td/p[text()='${groupName}']`);
      await expect(row).toBeVisible();

      // Submitting the Application

      // 1. Clicking on the Actions button
      await row.locator("xpath=parent::td/preceding-sibling::td[3]/button").click();
      await page.locator(OrgGroupsLocators.viewDraftAppBtn).click();
      await page.waitForLoadState('load');

      // Select the Application
      await page.locator(OrgGroupsLocators.groupTableRows).locator("//td//input").check();

      await page.locator(OrgGroupsLocators.submitBtn).click();

      var okButton = page.locator(OrgGroupsLocators.okBtn);
      await okButton.waitFor({ state: "visible" });
      await okButton.click();

      // Navigating to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      await page.waitForLoadState('load');
      await page.locator(AllApplicationLocators.appTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Application is Submitted with the Status Pending
      var row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application is submitted with status Pending`);

      // Retrieving All Submitted Applications Data
      const subApp = await adminApi.PostRequest('/api/sc/v1/OrganizationGroup/get-all-applications', { "pageNumber": 1, "pageSize": 10, "searchTerm": visaData.orgName });
      const entryReferenceNo = subApp.jsonResponse.result.find((appId) => appId.organizationGroupName === groupName).entryReference;
      const subAppGlobalId = subApp.jsonResponse.result.find((appId) => appId.organizationGroupName === groupName).globalId;

      // Rejecting the Visa Request
      const approveResponse = await adminApi.PostRequest('/api/shared/v1/ExternalCallback/moi/submitted-app', { "entryReferenceNumber": entryReferenceNo, "status": "rejected", "rejectionReason": null, "isEditable": false, "visaApplication": null });
      expect(approveResponse.statusCode).toBe(200);

      await page.locator(AllApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Rejected']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Rejected`);

      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await page.locator(AllApplicationLocators.editAppBtn).click();

      await page.locator(NewApplicationLocators.otherNationalityNoOption).check();

      await page.locator(NewApplicationLocators.updateApplicationBtn).click();

      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("Cannot proceed with rejected application.");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Can't Update Application When Rejected without Reason`);

      await page.getByText('Ok').click();      
    } catch (error) {
      await page.waitForTimeout(10000);
      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    try {

      // Re-Applying for the Applicaiton         
      var groupName2 = await newApp.fill_Tourist_A1_Aplication(testInfo, data, visaData.orgName);
      // Clicking on Save as Draft button    
      await page.locator(NewApplicationLocators.saveAsDraftBtn).click();

      //Error Message is Displayed When Saving the Rejected Application as Draft
      var msg = 'A visa application draft already exists for this profile or passport. Please review your existing drafts before creating a new one.';
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe(msg);
      await newApp.attachScreenshot(testInfo, `The user Cannot apply again when it is Rejected.`);
    }
    catch (error) {
      // Deleting the Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Groups
      await adminApi.deleteGroup(visaData.orgName, groupName);
      await adminApi.deleteGroup(visaData.orgName, groupName2);
      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    // Deleting the Profile
    await adminApi.deleteCompleteProfile(groupName);
    // Deleting the Groups
    await adminApi.deleteGroup(visaData.orgName, groupName);
    await adminApi.deleteGroup(visaData.orgName, groupName2);

  });

  test('A2: Verify that the user will be blocked and for applying and updating the Application when it is Rejected without a Reason', async ({ page }, testInfo) => {

    var data = visaData.A2;

    // Fill and Save the Application as Draft
    var groupName = await newApp.fill_Tourist_A2_AplicationAsDraft(testInfo, data, visaData.orgName);
    try {

      // Navigating to Organization Groups Page
      await page.locator(OrgGroupsLocators.orgGroupsLeftMenu).click();
      await page.waitForLoadState('load');
      await page.locator(OrgGroupsLocators.groupTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Group is created
      var row = page.locator(OrgGroupsLocators.groupTableRows).locator(`//td/p[text()='${groupName}']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The group ${groupName} is created`);

      // Navigating to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      await page.waitForLoadState('load');
      await page.locator(OrgGroupsLocators.groupTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Application is created with status Draft
      var row = page.locator(OrgGroupsLocators.groupTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td/span[text()='Draft']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application is submitted as Draft status in group Name ${groupName}`);
    } catch (error) {
      // Deleting All Draft Applications
      await adminApi.deleteAllDraftApps(visaData.orgName);

      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    try {
      // Navigating to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      await page.waitForLoadState('load');
      await page.locator(AllApplicationLocators.appTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Application is created with status Draft
      var row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td/span[text()='Draft']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application is submitted as Draft status in group Name ${groupName}`);

      // Navigating to Organization Groups Page
      await page.locator(OrgGroupsLocators.orgGroupsLeftMenu).click();
      await page.waitForLoadState('load');
      await page.locator(OrgGroupsLocators.groupTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Group is created
      var row = page.locator(OrgGroupsLocators.groupTableRows).locator(`//td/p[text()='${groupName}']`);
      await expect(row).toBeVisible();

      // Submitting the Application

      // 1. Clicking on the Actions button
      await row.locator("xpath=parent::td/preceding-sibling::td[3]/button").click();
      await page.locator(OrgGroupsLocators.viewDraftAppBtn).click();
      await page.waitForLoadState('load');

      // Select the Application
      await page.locator(OrgGroupsLocators.groupTableRows).locator("//td//input").check();

      await page.locator(OrgGroupsLocators.submitBtn).click();

      var okButton = page.locator(OrgGroupsLocators.okBtn);
      await okButton.waitFor({ state: "visible" });
      await okButton.click();

      // Navigating to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      await page.waitForLoadState('load');
      await page.locator(AllApplicationLocators.appTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Application is Submitted with the Status Pending
      var row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application is submitted with status Pending`);

      // Retrieving All Submitted Applications Data
      const subApp = await adminApi.PostRequest('/api/sc/v1/OrganizationGroup/get-all-applications', { "pageNumber": 1, "pageSize": 10, "searchTerm": visaData.orgName });
      const entryReferenceNo = subApp.jsonResponse.result.find((appId) => appId.organizationGroupName === groupName).entryReference;
      const subAppGlobalId = subApp.jsonResponse.result.find((appId) => appId.organizationGroupName === groupName).globalId;

      // Rejecting the Visa Request
      const approveResponse = await adminApi.PostRequest('/api/shared/v1/ExternalCallback/moi/submitted-app', { "entryReferenceNumber": entryReferenceNo, "status": "rejected", "rejectionReason": null, "isEditable": false, "visaApplication": null });
      expect(approveResponse.statusCode).toBe(200);

      await page.locator(NewApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Rejected']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Rejected`);

      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');
      
      await page.locator(AllApplicationLocators.editAppBtn).click();

      await page.locator(NewApplicationLocators.otherNationalitySelect).fill("No");
      await page.keyboard.press("Enter");

      await page.locator(NewApplicationLocators.updateApplicationBtn).click();

      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("Cannot proceed with rejected application.");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Can't Update Application When Rejected without Reason`);

      await page.getByText('Ok').click();
    } catch (error) {
      await page.waitForTimeout(10000);
      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    try {
      // Re-Applying for the Applicaiton         
      var groupName2 = await newApp.fill_Tourist_A2_Aplication(testInfo, data, visaData.orgName);
      // Clicking on Save as Draft button    
      await page.locator(NewApplicationLocators.saveAsDraftBtn).click();

      //Error Message is Displayed When Saving the Rejected Application as Draft
      var msg = 'A visa application draft already exists for this profile or passport. Please review your existing drafts before creating a new one.';
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe(msg);

      await newApp.attachScreenshot(testInfo, `The user Cannot apply again when it is Rejected.`);
    }
    catch (error) {
      // Deleting the Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Groups
      await adminApi.deleteGroup(visaData.orgName, groupName);
      await adminApi.deleteGroup(visaData.orgName, groupName2);
      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    // Deleting the Profile
    await adminApi.deleteCompleteProfile(groupName);
    // Deleting the Groups
    await adminApi.deleteGroup(visaData.orgName, groupName);
    await adminApi.deleteGroup(visaData.orgName, groupName2);

  });

  test('A3: Verify that the user will be blocked and for applying and updating the Application when it is Rejected without a Reason', async ({ page }, testInfo) => {

    var data = visaData.A3;

    // Fill and Save the Application as Draft
    var groupName = await newApp.fill_Tourist_A3_AplicationAsDraft(testInfo, data, visaData.orgName);
    try {

      // Navigating to Organization Groups Page
      await page.locator(OrgGroupsLocators.orgGroupsLeftMenu).click();
      await page.waitForLoadState('load');
      await page.locator(OrgGroupsLocators.groupTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Group is created
      var row = page.locator(OrgGroupsLocators.groupTableRows).locator(`//td/p[text()='${groupName}']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The group ${groupName} is created`);

      // Navigating to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      await page.waitForLoadState('load');
      await page.locator(OrgGroupsLocators.groupTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Application is created with status Draft
      var row = page.locator(OrgGroupsLocators.groupTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td/span[text()='Draft']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application is submitted as Draft status in group Name ${groupName}`);
    } catch (error) {
      // Deleting All Draft Applications
      await adminApi.deleteAllDraftApps(visaData.orgName);

      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    try {
      // Navigating to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      await page.waitForLoadState('load');
      await page.locator(AllApplicationLocators.appTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Application is created with status Draft
      var row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td/span[text()='Draft']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application is submitted as Draft status in group Name ${groupName}`);

      // Navigating to Organization Groups Page
      await page.locator(OrgGroupsLocators.orgGroupsLeftMenu).click();
      await page.waitForLoadState('load');
      await page.locator(OrgGroupsLocators.groupTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Group is created
      var row = page.locator(OrgGroupsLocators.groupTableRows).locator(`//td/p[text()='${groupName}']`);
      await expect(row).toBeVisible();

      // Submitting the Application

      // 1. Clicking on the Actions button
      await row.locator("xpath=parent::td/preceding-sibling::td[3]/button").click();
      await page.locator(OrgGroupsLocators.viewDraftAppBtn).click();
      await page.waitForLoadState('load');

      // Select the Application
      await page.locator(OrgGroupsLocators.groupTableRows).locator("//td//input").check();

      await page.locator(OrgGroupsLocators.submitBtn).click();

      var okButton = page.locator(OrgGroupsLocators.okBtn);
      await okButton.waitFor({ state: "visible" });
      await okButton.click();

      // Navigating to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      await page.waitForLoadState('load');
      await page.locator(AllApplicationLocators.appTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Application is Submitted with the Status Pending
      var row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application is submitted with status Pending`);

      // Retrieving All Submitted Applications Data
      const subApp = await adminApi.PostRequest('/api/sc/v1/OrganizationGroup/get-all-applications', { "pageNumber": 1, "pageSize": 10, "searchTerm": visaData.orgName });
      const entryReferenceNo = subApp.jsonResponse.result.find((appId) => appId.organizationGroupName === groupName).entryReference;
      const subAppGlobalId = subApp.jsonResponse.result.find((appId) => appId.organizationGroupName === groupName).globalId;

      // Rejecting the Visa Request
      const approveResponse = await adminApi.PostRequest('/api/shared/v1/ExternalCallback/moi/submitted-app', { "entryReferenceNumber": entryReferenceNo, "status": "rejected", "rejectionReason": null, "isEditable": false, "visaApplication": null });
      expect(approveResponse.statusCode).toBe(200);

      await page.locator(NewApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Rejected']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Rejected`);

      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');
      
      await page.locator(AllApplicationLocators.editAppBtn).click();

      await page.locator(NewApplicationLocators.otherNationalitySelect).fill("No");
      await page.keyboard.press("Enter");

      await page.locator(NewApplicationLocators.updateApplicationBtn).click();

      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("Cannot proceed with rejected application.");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Can't Update Application When Rejected without Reason`);

      await page.getByText('Ok').click();
    } catch (error) {
      await page.waitForTimeout(10000);
      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    try {
      // Re-Applying for the Applicaiton         
      var groupName2 = await newApp.fill_Tourist_A3_Aplication(testInfo, data, visaData.orgName);
      // Clicking on Save as Draft button    
      await page.locator(NewApplicationLocators.saveAsDraftBtn).click();

      //Error Message is Displayed When Saving the Rejected Application as Draft
      var msg = 'A visa application draft already exists for this profile or passport. Please review your existing drafts before creating a new one.';
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe(msg);

      await newApp.attachScreenshot(testInfo, `The user Cannot apply again when it is Rejected.`);
    }
    catch (error) {
      // Deleting the Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Groups
      await adminApi.deleteGroup(visaData.orgName, groupName);
      await adminApi.deleteGroup(visaData.orgName, groupName2);
      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    // Deleting the Profile
    await adminApi.deleteCompleteProfile(groupName);
    // Deleting the Groups
    await adminApi.deleteGroup(visaData.orgName, groupName);
    await adminApi.deleteGroup(visaData.orgName, groupName2);


  });

  test('A4: Verify that the user will be blocked and for applying and updating the Application when it is Rejected without a Reason', async ({ page }, testInfo) => {

    var data = visaData.A4;

    // Fill and Save the Application as Draft
    var groupName = await newApp.fill_Tourist_A4_AplicationAsDraft(testInfo, data, visaData.orgName);
    try {

      // Navigating to Organization Groups Page
      await page.locator(OrgGroupsLocators.orgGroupsLeftMenu).click();
      await page.waitForLoadState('load');
      await page.locator(OrgGroupsLocators.groupTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Group is created
      var row = page.locator(OrgGroupsLocators.groupTableRows).locator(`//td/p[text()='${groupName}']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The group ${groupName} is created`);

      // Navigating to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      await page.waitForLoadState('load');
      await page.locator(OrgGroupsLocators.groupTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Application is created with status Draft
      var row = page.locator(OrgGroupsLocators.groupTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td/span[text()='Draft']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application is submitted as Draft status in group Name ${groupName}`);
    } catch (error) {
      // Deleting All Draft Applications
      await adminApi.deleteAllDraftApps(visaData.orgName);

      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    try {
      // Navigating to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      await page.waitForLoadState('load');
      await page.locator(AllApplicationLocators.appTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Application is created with status Draft
      var row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td/span[text()='Draft']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application is submitted as Draft status in group Name ${groupName}`);

      // Navigating to Organization Groups Page
      await page.locator(OrgGroupsLocators.orgGroupsLeftMenu).click();
      await page.waitForLoadState('load');
      await page.locator(OrgGroupsLocators.groupTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Group is created
      var row = page.locator(OrgGroupsLocators.groupTableRows).locator(`//td/p[text()='${groupName}']`);
      await expect(row).toBeVisible();

      // Submitting the Application

      // 1. Clicking on the Actions button
      await row.locator("xpath=parent::td/preceding-sibling::td[3]/button").click();
      await page.locator(OrgGroupsLocators.viewDraftAppBtn).click();
      await page.waitForLoadState('load');

      // Select the Application
      await page.locator(OrgGroupsLocators.groupTableRows).locator("//td//input").check();

      await page.locator(OrgGroupsLocators.submitBtn).click();

      var okButton = page.locator(OrgGroupsLocators.okBtn);
      await okButton.waitFor({ state: "visible" });
      await okButton.click();

      // Navigating to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      await page.waitForLoadState('load');
      await page.locator(AllApplicationLocators.appTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Application is Submitted with the Status Pending
      var row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application is submitted with status Pending`);

      // Retrieving All Submitted Applications Data
      const subApp = await adminApi.PostRequest('/api/sc/v1/OrganizationGroup/get-all-applications', { "pageNumber": 1, "pageSize": 10, "searchTerm": visaData.orgName });
      const entryReferenceNo = subApp.jsonResponse.result.find((appId) => appId.organizationGroupName === groupName).entryReference;
      const subAppGlobalId = subApp.jsonResponse.result.find((appId) => appId.organizationGroupName === groupName).globalId;

      // Rejecting the Visa Request
      const approveResponse = await adminApi.PostRequest('/api/shared/v1/ExternalCallback/moi/submitted-app', { "entryReferenceNumber": entryReferenceNo, "status": "rejected", "rejectionReason": null, "isEditable": false, "visaApplication": null });
      expect(approveResponse.statusCode).toBe(200);

      await page.locator(NewApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Rejected']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Rejected`);

      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      //await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');
      
      await page.locator(AllApplicationLocators.editAppBtn).click();

      await page.locator(NewApplicationLocators.otherNationalitySelect).fill("No");
      await page.keyboard.press("Enter");

      await page.locator(NewApplicationLocators.updateApplicationBtn).click();

      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("Cannot proceed with rejected application.");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Can't Update Application When Rejected without Reason`);

      await page.getByText('Ok').click();
    } catch (error) {
      await page.waitForTimeout(10000);
      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    try {
      // Re-Applying for the Applicaiton         
      var groupName2 = await newApp.fill_Tourist_A4_Aplication(testInfo, data, visaData.orgName);
      // Clicking on Save as Draft button    
      await page.locator(NewApplicationLocators.saveAsDraftBtn).click();

      //Error Message is Displayed When Saving the Rejected Application as Draft
      var msg = 'A visa application draft already exists for this profile or passport. Please review your existing drafts before creating a new one.';
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe(msg);

      await newApp.attachScreenshot(testInfo, `The user Cannot apply again when it is Rejected.`);
    } catch (error) {
      // Deleting the Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Groups
      await adminApi.deleteGroup(visaData.orgName, groupName);
      await adminApi.deleteGroup(visaData.orgName, groupName2);
      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    // Deleting the Profile
    await adminApi.deleteCompleteProfile(groupName);
    // Deleting the Groups
    await adminApi.deleteGroup(visaData.orgName, groupName);
    await adminApi.deleteGroup(visaData.orgName, groupName2);

  });

  test('F1: Verify that the user will be blocked and for applying and updating the Application when it is Rejected without a Reason', async ({ page }, testInfo) => {

    var data = visaData.F1;

    // Fill and Save the Application as Draft
    var groupName = await newApp.fill_Tourist_F1_AplicationAsDraft(testInfo, data, visaData.orgName);
    try {

      // Navigating to Organization Groups Page
      await page.locator(OrgGroupsLocators.orgGroupsLeftMenu).click();
      await page.waitForLoadState('load');
      await page.locator(OrgGroupsLocators.groupTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Group is created
      var row = page.locator(OrgGroupsLocators.groupTableRows).locator(`//td/p[text()='${groupName}']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The group ${groupName} is created`);

      // Navigating to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      await page.waitForLoadState('load');
      await page.locator(OrgGroupsLocators.groupTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Application is created with status Draft
      var row = page.locator(OrgGroupsLocators.groupTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td/span[text()='Draft']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application is submitted as Draft status in group Name ${groupName}`);
    } catch (error) {
      // Deleting All Draft Applications
      await adminApi.deleteAllDraftApps(visaData.orgName);

      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    try {
      // Navigating to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      await page.waitForLoadState('load');
      await page.locator(AllApplicationLocators.appTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Application is created with status Draft
      var row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td/span[text()='Draft']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application is submitted as Draft status in group Name ${groupName}`);

      // Navigating to Organization Groups Page
      await page.locator(OrgGroupsLocators.orgGroupsLeftMenu).click();
      await page.waitForLoadState('load');
      await page.locator(OrgGroupsLocators.groupTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Group is created
      var row = page.locator(OrgGroupsLocators.groupTableRows).locator(`//td/p[text()='${groupName}']`);
      await expect(row).toBeVisible();

      // Submitting the Application

      // 1. Clicking on the Actions button
      await row.locator("xpath=parent::td/preceding-sibling::td[3]/button").click();
      await page.locator(OrgGroupsLocators.viewDraftAppBtn).click();
      await page.waitForLoadState('load');

      // Select the Application
      await page.locator(OrgGroupsLocators.groupTableRows).locator("//td//input").check();

      await page.locator(OrgGroupsLocators.submitBtn).click();

      var okButton = page.locator(OrgGroupsLocators.okBtn);
      await okButton.waitFor({ state: "visible" });
      await okButton.click();

      // Navigating to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      await page.waitForLoadState('load');
      await page.locator(AllApplicationLocators.appTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Application is Submitted with the Status Pending
      var row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application is submitted with status Pending`);

      // Retrieving All Submitted Applications Data
      const subApp = await adminApi.PostRequest('/api/sc/v1/OrganizationGroup/get-all-applications', { "pageNumber": 1, "pageSize": 10, "searchTerm": visaData.orgName });
      const entryReferenceNo = subApp.jsonResponse.result.find((appId) => appId.organizationGroupName === groupName).entryReference;
      const subAppGlobalId = subApp.jsonResponse.result.find((appId) => appId.organizationGroupName === groupName).globalId;

      // Rejecting the Visa Request
      const approveResponse = await adminApi.PostRequest('/api/shared/v1/ExternalCallback/moi/submitted-app', { "entryReferenceNumber": entryReferenceNo, "status": "rejected", "rejectionReason": null, "isEditable": false, "visaApplication": null });
      expect(approveResponse.statusCode).toBe(200);

      await page.locator(NewApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Rejected']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Rejected`);

      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');
      
      await page.locator(AllApplicationLocators.editAppBtn).click();

      await page.locator(NewApplicationLocators.otherNationalityNoOption).check();

      await page.locator(NewApplicationLocators.updateApplicationBtn).click();

      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("Cannot proceed with rejected application.");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Can't Update Application When Rejected without Reason`);

      await page.getByText('Ok').click();
    } catch (error) {
      await page.waitForTimeout(10000);
      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    try {
      // Re-Applying for the Applicaiton         
      var groupName2 = await newApp.fill_Tourist_F1_Aplication(testInfo, data, visaData.orgName);
      // Clicking on Save as Draft button    
      await page.locator(NewApplicationLocators.saveAsDraftBtn).click();

      //Error Message is Displayed When Saving the Rejected Application as Draft
      var msg = 'A visa application draft already exists for this profile or passport. Please review your existing drafts before creating a new one.';
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe(msg);

      await newApp.attachScreenshot(testInfo, `The user Cannot apply again when it is Rejected.`);

    } catch (error) {
      // Deleting the Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Groups
      await adminApi.deleteGroup(visaData.orgName, groupName);
      await adminApi.deleteGroup(visaData.orgName, groupName2);
    }
    // Deleting the Profile
    await adminApi.deleteCompleteProfile(groupName);
    // Deleting the Groups
    await adminApi.deleteGroup(visaData.orgName, groupName);
    await adminApi.deleteGroup(visaData.orgName, groupName2);

  });

  test('D1: Verify that the user will be blocked and for applying and updating the Application when it is Rejected without a Reason', async ({ page }, testInfo) => {

    var data = visaData.D1;

    // Fill and Save the Application as Draft
    var groupName = await newApp.fill_Diamond_D1_AplicationAsDraft(testInfo, data, visaData.orgName);
    try {

      // Navigating to Organization Groups Page
      await page.locator(OrgGroupsLocators.orgGroupsLeftMenu).click();
      await page.waitForLoadState('load');
      await page.locator(OrgGroupsLocators.groupTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Group is created
      var row = page.locator(OrgGroupsLocators.groupTableRows).locator(`//td/p[text()='${groupName}']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The group ${groupName} is created`);

      // Navigating to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      await page.waitForLoadState('load');
      await page.locator(OrgGroupsLocators.groupTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Application is created with status Draft
      var row = page.locator(OrgGroupsLocators.groupTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td/span[text()='Draft']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application is submitted as Draft status in group Name ${groupName}`);
    } catch (error) {
      // Deleting All Draft Applications
      await adminApi.deleteAllDraftApps(visaData.orgName);

      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    try {
      // Navigating to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      await page.waitForLoadState('load');
      await page.locator(AllApplicationLocators.appTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Application is created with status Draft
      var row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td/span[text()='Draft']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application is submitted as Draft status in group Name ${groupName}`);

      // Navigating to Organization Groups Page
      await page.locator(OrgGroupsLocators.orgGroupsLeftMenu).click();
      await page.waitForLoadState('load');
      await page.locator(OrgGroupsLocators.groupTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Group is created
      var row = page.locator(OrgGroupsLocators.groupTableRows).locator(`//td/p[text()='${groupName}']`);
      await expect(row).toBeVisible();

      // Submitting the Application

      // 1. Clicking on the Actions button
      await row.locator("xpath=parent::td/preceding-sibling::td[3]/button").click();
      await page.locator(OrgGroupsLocators.viewDraftAppBtn).click();
      await page.waitForLoadState('load');

      // Select the Application
      await page.locator(OrgGroupsLocators.groupTableRows).locator("//td//input").check();

      await page.locator(OrgGroupsLocators.submitBtn).click();

      var okButton = page.locator(OrgGroupsLocators.okBtn);
      await okButton.waitFor({ state: "visible" });
      await okButton.click();

      // Navigating to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      await page.waitForLoadState('load');
      await page.locator(AllApplicationLocators.appTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Application is Submitted with the Status Pending
      var row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application is submitted with status Pending`);

      // Retrieving All Submitted Applications Data
      const subApp = await adminApi.PostRequest('/api/sc/v1/OrganizationGroup/get-all-applications', { "pageNumber": 1, "pageSize": 10, "searchTerm": visaData.orgName });
      const entryReferenceNo = subApp.jsonResponse.result.find((appId) => appId.organizationGroupName === groupName).entryReference;
      const subAppGlobalId = subApp.jsonResponse.result.find((appId) => appId.organizationGroupName === groupName).globalId;

      // Rejecting the Visa Request
      const approveResponse = await adminApi.PostRequest('/api/shared/v1/ExternalCallback/moi/submitted-app', { "entryReferenceNumber": entryReferenceNo, "status": "rejected", "rejectionReason": null, "isEditable": false, "visaApplication": null });
      expect(approveResponse.statusCode).toBe(200);

      await page.locator(NewApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Rejected']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Rejected`);

      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');
      
      await page.locator(AllApplicationLocators.editAppBtn).click();

      await page.locator(NewApplicationLocators.otherNationalitySelect).fill("No");
      await page.keyboard.press("Enter");

      await page.locator(NewApplicationLocators.updateApplicationBtn).click();

      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("Cannot proceed with rejected application.");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Can't Update Application When Rejected without Reason`);

      await page.getByText('Ok').click();
    } catch (error) {
      await page.waitForTimeout(10000);
      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    try {

      // Re-Applying for the Applicaiton         
      var groupName2 = await newApp.fill_Diamond_D1_Aplication(testInfo, data, visaData.orgName);
      // Clicking on Save as Draft button    
      await page.locator(NewApplicationLocators.saveAsDraftBtn).click();

      //Error Message is Displayed When Saving the Rejected Application as Draft
      var msg = 'A visa application draft already exists for this profile or passport. Please review your existing drafts before creating a new one.';
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe(msg);

      await newApp.attachScreenshot(testInfo, `The user Cannot apply again when it is Rejected.`);

    }
    catch (error) {
      // Deleting the Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Groups
      await adminApi.deleteGroup(visaData.orgName, groupName);
      await adminApi.deleteGroup(visaData.orgName, groupName2);
      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }
    // Deleting the Profile
    await adminApi.deleteCompleteProfile(groupName);
    // Deleting the Groups
    await adminApi.deleteGroup(visaData.orgName, groupName);
    await adminApi.deleteGroup(visaData.orgName, groupName2);
  });

  test('D2: Verify that the user will be blocked and for applying and updating the Application when it is Rejected without a Reason', async ({ page }, testInfo) => {

    var data = visaData.D2;

    // Fill and Save the Application as Draft
    var groupName = await newApp.fill_Diamond_D2_AplicationAsDraft(testInfo, data, visaData.orgName);
    try {

      // Navigating to Organization Groups Page
      await page.locator(OrgGroupsLocators.orgGroupsLeftMenu).click();
      await page.waitForLoadState('load');
      await page.locator(OrgGroupsLocators.groupTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Group is created
      var row = page.locator(OrgGroupsLocators.groupTableRows).locator(`//td/p[text()='${groupName}']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The group ${groupName} is created`);

      // Navigating to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      await page.waitForLoadState('load');
      await page.locator(OrgGroupsLocators.groupTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Application is created with status Draft
      var row = page.locator(OrgGroupsLocators.groupTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td/span[text()='Draft']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application is submitted as Draft status in group Name ${groupName}`);
    } catch (error) {
      // Deleting All Draft Applications
      await adminApi.deleteAllDraftApps(visaData.orgName);

      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    try {
      // Navigating to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      await page.waitForLoadState('load');
      await page.locator(AllApplicationLocators.appTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Application is created with status Draft
      var row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td/span[text()='Draft']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application is submitted as Draft status in group Name ${groupName}`);

      // Navigating to Organization Groups Page
      await page.locator(OrgGroupsLocators.orgGroupsLeftMenu).click();
      await page.waitForLoadState('load');
      await page.locator(OrgGroupsLocators.groupTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Group is created
      var row = page.locator(OrgGroupsLocators.groupTableRows).locator(`//td/p[text()='${groupName}']`);
      await expect(row).toBeVisible();

      // Submitting the Application

      // 1. Clicking on the Actions button
      await row.locator("xpath=parent::td/preceding-sibling::td[3]/button").click();
      await page.locator(OrgGroupsLocators.viewDraftAppBtn).click();
      await page.waitForLoadState('load');

      // Select the Application
      await page.locator(OrgGroupsLocators.groupTableRows).locator("//td//input").check();

      await page.locator(OrgGroupsLocators.submitBtn).click();

      var okButton = page.locator(OrgGroupsLocators.okBtn);
      await okButton.waitFor({ state: "visible" });
      await okButton.click();

      // Navigating to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      await page.waitForLoadState('load');
      await page.locator(AllApplicationLocators.appTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Application is Submitted with the Status Pending
      var row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application is submitted with status Pending`);

      // Retrieving All Submitted Applications Data
      const subApp = await adminApi.PostRequest('/api/sc/v1/OrganizationGroup/get-all-applications', { "pageNumber": 1, "pageSize": 10, "searchTerm": visaData.orgName });
      const entryReferenceNo = subApp.jsonResponse.result.find((appId) => appId.organizationGroupName === groupName).entryReference;
      const subAppGlobalId = subApp.jsonResponse.result.find((appId) => appId.organizationGroupName === groupName).globalId;

      // Rejecting the Visa Request
      const approveResponse = await adminApi.PostRequest('/api/shared/v1/ExternalCallback/moi/submitted-app', { "entryReferenceNumber": entryReferenceNo, "status": "rejected", "rejectionReason": null, "isEditable": false, "visaApplication": null });
      expect(approveResponse.statusCode).toBe(200);

      await page.locator(NewApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Rejected']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Rejected`);

      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');
      
      await page.locator(AllApplicationLocators.editAppBtn).click();

      await page.locator(NewApplicationLocators.otherNationalitySelect).fill("No");
      await page.keyboard.press("Enter");

      await page.locator(NewApplicationLocators.updateApplicationBtn).click();

      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("Cannot proceed with rejected application.");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Can't Update Application When Rejected without Reason`);

      await page.getByText('Ok').click();
    } catch (error) {
      await page.waitForTimeout(10000);
      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    try {

      // Re-Applying for the Applicaiton         
      var groupName2 = await newApp.fill_Diamond_D2_Aplication(testInfo, data, visaData.orgName);
      // Clicking on Save as Draft button    
      await page.locator(NewApplicationLocators.saveAsDraftBtn).click();

      //Error Message is Displayed When Saving the Rejected Application as Draft
      var msg = 'A visa application draft already exists for this profile or passport. Please review your existing drafts before creating a new one.';
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe(msg);

      await newApp.attachScreenshot(testInfo, `The user Cannot apply again when it is Rejected.`);
    }
    catch (error) {
      // Deleting the Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Groups
      await adminApi.deleteGroup(visaData.orgName, groupName);
      await adminApi.deleteGroup(visaData.orgName, groupName2);
      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }


    // Deleting the Profile
    await adminApi.deleteCompleteProfile(groupName);
    // Deleting the Groups
    await adminApi.deleteGroup(visaData.orgName, groupName);
    await adminApi.deleteGroup(visaData.orgName, groupName2);

  });

  test('D3: Verify that the user will be blocked and for applying and updating the Application when it is Rejected without a Reason', async ({ page }, testInfo) => {

    var data = visaData.D3;

    // Fill and Save the Application as Draft
    var groupName = await newApp.fill_Diamond_D3_AplicationAsDraft(testInfo, data, visaData.orgName);
    try {

      // Navigating to Organization Groups Page
      await page.locator(OrgGroupsLocators.orgGroupsLeftMenu).click();
      await page.waitForLoadState('load');
      await page.locator(OrgGroupsLocators.groupTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Group is created
      var row = page.locator(OrgGroupsLocators.groupTableRows).locator(`//td/p[text()='${groupName}']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The group ${groupName} is created`);

      // Navigating to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      await page.waitForLoadState('load');
      await page.locator(OrgGroupsLocators.groupTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Application is created with status Draft
      var row = page.locator(OrgGroupsLocators.groupTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td/span[text()='Draft']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application is submitted as Draft status in group Name ${groupName}`);
    } catch (error) {
      // Deleting All Draft Applications
      await adminApi.deleteAllDraftApps(visaData.orgName);

      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    try {
      // Navigating to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      await page.waitForLoadState('load');
      await page.locator(AllApplicationLocators.appTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Application is created with status Draft
      var row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td/span[text()='Draft']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application is submitted as Draft status in group Name ${groupName}`);

      // Navigating to Organization Groups Page
      await page.locator(OrgGroupsLocators.orgGroupsLeftMenu).click();
      await page.waitForLoadState('load');
      await page.locator(OrgGroupsLocators.groupTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Group is created
      var row = page.locator(OrgGroupsLocators.groupTableRows).locator(`//td/p[text()='${groupName}']`);
      await expect(row).toBeVisible();

      // Submitting the Application

      // 1. Clicking on the Actions button
      await row.locator("xpath=parent::td/preceding-sibling::td[3]/button").click();
      await page.locator(OrgGroupsLocators.viewDraftAppBtn).click();
      await page.waitForLoadState('load');

      // Select the Application
      await page.locator(OrgGroupsLocators.groupTableRows).locator("//td//input").check();

      await page.locator(OrgGroupsLocators.submitBtn).click();

      var okButton = page.locator(OrgGroupsLocators.okBtn);
      await okButton.waitFor({ state: "visible" });
      await okButton.click();

      // Navigating to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      await page.waitForLoadState('load');
      await page.locator(AllApplicationLocators.appTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Application is Submitted with the Status Pending
      var row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application is submitted with status Pending`);

      // Retrieving All Submitted Applications Data
      const subApp = await adminApi.PostRequest('/api/sc/v1/OrganizationGroup/get-all-applications', { "pageNumber": 1, "pageSize": 10, "searchTerm": visaData.orgName });
      const entryReferenceNo = subApp.jsonResponse.result.find((appId) => appId.organizationGroupName === groupName).entryReference;
      const subAppGlobalId = subApp.jsonResponse.result.find((appId) => appId.organizationGroupName === groupName).globalId;

      // Rejecting the Visa Request
      const approveResponse = await adminApi.PostRequest('/api/shared/v1/ExternalCallback/moi/submitted-app', { "entryReferenceNumber": entryReferenceNo, "status": "rejected", "rejectionReason": null, "isEditable": false, "visaApplication": null });
      expect(approveResponse.statusCode).toBe(200);

      await page.locator(NewApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Rejected']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Rejected`);

      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');
      
      await page.locator(AllApplicationLocators.editAppBtn).click();

      await page.locator(NewApplicationLocators.otherNationalitySelect).fill("No");
      await page.keyboard.press("Enter");

      await page.locator(NewApplicationLocators.updateApplicationBtn).click();

      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("Cannot proceed with rejected application.");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Can't Update Application When Rejected without Reason`);

      await page.getByText('Ok').click();
    } catch (error) {
      await page.waitForTimeout(10000);
      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    try {
      // Re-Applying for the Applicaiton         
      var groupName2 = await newApp.fill_Diamond_D3_Aplication(testInfo, data, visaData.orgName);
      // Clicking on Save as Draft button    
      await page.locator(NewApplicationLocators.saveAsDraftBtn).click();

      //Error Message is Displayed When Saving the Rejected Application as Draft
      var msg = 'A visa application draft already exists for this profile or passport. Please review your existing drafts before creating a new one.';
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe(msg);

      await newApp.attachScreenshot(testInfo, `The user Cannot apply again when it is Rejected.`);
    }
    catch (error) {
      // Deleting the Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Groups
      await adminApi.deleteGroup(visaData.orgName, groupName);
      await adminApi.deleteGroup(visaData.orgName, groupName2);
      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    // Deleting the Profile
    await adminApi.deleteCompleteProfile(groupName);
    // Deleting the Groups
    await adminApi.deleteGroup(visaData.orgName, groupName);
    await adminApi.deleteGroup(visaData.orgName, groupName2);

  });


  test.afterEach(async ({ page }, testInfo) => {
    // Add any cleanup code if necessary
    console.log(`Test completed: ${testInfo.title} with status: ${testInfo.status}`);
    // For example, you might want to take a screenshot or log out
    await loginPage.attachScreenshot(testInfo, 'Test Completed');
    await adminApi.deleteAllProfiles();

  });

});