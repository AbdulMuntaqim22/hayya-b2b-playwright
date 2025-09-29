import { test, expect } from '@playwright/test';
const fs = require('fs');
import API from '../../Pages/api';
import LoginPage from '../../Pages/loginPage';
import NewApplicationPage from '../../Pages/newApplicationPage';
const { NewApplicationLocators } = require('../../Locators/newApplicationlocators');
const { AllApplicationLocators } = require('../../Locators/allApplicationLocators');
const { OrgGroupsLocators } = require('../../Locators/orgGroupsLocators');

test.describe.configure({ mode: 'parallel' }); 

test.describe('Manual Application Scenarios: Approved', () => {
  /** @type {LoginPage} */
  var loginPage;
  /** @type {NewApplicationPage} */
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

  test('Verify that the user can Submit a Tourist: A1 Visa Application and can get the Visa Permit', async ({ page }, testInfo) => {

    var data = visaData.A1;

    // Fill and Save the Application as Draft
    var groupName = await newApp.fill_Tourist_A1_AplicationAsDraft(testInfo, data,visaData.orgName);
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

      // Approving the Visa Request
      const approveResponse = await adminApi.PostRequest('/api/shared/v1/ExternalCallback/moi/submitted-app', { "entryReferenceNumber": entryReferenceNo, "status": "approved", "rejectionReason": null, "isEditable": false, "visaApplication": null });
      expect(approveResponse.statusCode).toBe(200);

      await page.locator(NewApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Payment']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Payment`);

      // Updating the Payment Status
      const paymentApproveRes = await adminApi.PostRequest(`/api/sc/v1/Workflow/advance-workflow/${subAppGlobalId}?password=1yteBz@LeV8OBi$muRD`);
      expect(paymentApproveRes.statusCode).toBe(200);

      await page.locator(AllApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Entry Visa']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Entry Visa`);

      // Updating the Visa Permit
      const approveAppResponse = await adminApi.PostRequest(`/api/shared/v1/ExternalCallback/moi/visa-permit`, { entryReferenceNumber: entryReferenceNo, visaNumber: newApp.generateRandomFiveDigit() + '12', visaEntryType: 0, visaStartDate: "2025-07-15T21:44:58.147Z", visaEndDate: "2025-07-15T21:44:58.147Z", issueDate: "2025-07-15T21:44:58.147Z", lastEntryDate: "2025-07-15T21:44:58.147Z" });
      expect(approveAppResponse.statusCode).toBe(200);

      await page.locator(AllApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Approved']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Approved`);
    } catch (error) {
      await page.waitForTimeout(10000);
      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    // Deleting the Profile
    await adminApi.deleteCompleteProfile(groupName);
    // Deleting the Group
    await adminApi.deleteGroup(visaData.orgName, groupName);

  });

  test('Verify that the user can Submit a Tourist: A2 Visa Application and can get the Visa Permit', async ({ page }, testInfo) => {
    var data = visaData.A2;

    // Fill and Save the Application as Draft
    var groupName = await newApp.fill_Tourist_A2_AplicationAsDraft(testInfo, data,visaData.orgName);

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

      // Approving the Visa Request
      const approveResponse = await adminApi.PostRequest('/api/shared/v1/ExternalCallback/moi/submitted-app', { "entryReferenceNumber": entryReferenceNo, "status": "approved", "rejectionReason": null, "isEditable": false, "visaApplication": null });
      expect(approveResponse.statusCode).toBe(200);

      await page.locator(NewApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Payment']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Payment`);

      // Updating the Payment Status
      const paymentApproveRes = await adminApi.PostRequest(`/api/sc/v1/Workflow/advance-workflow/${subAppGlobalId}?password=1yteBz@LeV8OBi$muRD`);
      expect(paymentApproveRes.statusCode).toBe(200);

      await page.locator(AllApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Entry Visa']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Entry Visa`);

      // Updating the Payment Status
      const approveAppResponse = await adminApi.PostRequest(`/api/shared/v1/ExternalCallback/moi/visa-permit`, { entryReferenceNumber: entryReferenceNo, visaNumber: newApp.generateRandomFiveDigit() + '12', visaEntryType: 0, visaStartDate: "2025-07-15T21:44:58.147Z", visaEndDate: "2025-07-15T21:44:58.147Z", issueDate: "2025-07-15T21:44:58.147Z", lastEntryDate: "2025-07-15T21:44:58.147Z" });
      expect(approveAppResponse.statusCode).toBe(200);

      await page.locator(AllApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Approved']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Approved`);
    } catch (error) {
      await page.waitForTimeout(10000);
      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    // Deleting the Profile
    await adminApi.deleteCompleteProfile(groupName);
    // Deleting the Group
    await adminApi.deleteGroup(visaData.orgName, groupName);


  });

  test('Verify that the user can Submit a Tourist: A3 Visa Application and can get the Visa Permit', async ({ page }, testInfo) => {
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

      // Approving the Visa Request
      const approveResponse = await adminApi.PostRequest('/api/shared/v1/ExternalCallback/moi/submitted-app', { "entryReferenceNumber": entryReferenceNo, "status": "approved", "rejectionReason": null, "isEditable": false, "visaApplication": null });
      expect(approveResponse.statusCode).toBe(200);

      await page.locator(NewApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Payment']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Payment`);

      // Updating the Payment Status
      const paymentApproveRes = await adminApi.PostRequest(`/api/sc/v1/Workflow/advance-workflow/${subAppGlobalId}?password=1yteBz@LeV8OBi$muRD`);
      expect(paymentApproveRes.statusCode).toBe(200);

      await page.locator(AllApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Entry Visa']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Entry Visa`);

      // Updating the Payment Status
      const approveAppResponse = await adminApi.PostRequest(`/api/shared/v1/ExternalCallback/moi/visa-permit`, { entryReferenceNumber: entryReferenceNo, visaNumber: newApp.generateRandomFiveDigit() + '12', visaEntryType: 0, visaStartDate: "2025-07-15T21:44:58.147Z", visaEndDate: "2025-07-15T21:44:58.147Z", issueDate: "2025-07-15T21:44:58.147Z", lastEntryDate: "2025-07-15T21:44:58.147Z" });
      expect(approveAppResponse.statusCode).toBe(200);

      await page.locator(AllApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Approved']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Approved`);
    } catch (error) {
      await page.waitForTimeout(10000);
      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    // Deleting the Profile
    await adminApi.deleteCompleteProfile(groupName);
    // Deleting the Group
    await adminApi.deleteGroup(visaData.orgName, groupName);


  });

  test('Verify that the user can Submit a Tourist: A4 Visa Application and can get the Visa Permit', async ({ page }, testInfo) => {
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

      // Approving the Visa Request
      const approveResponse = await adminApi.PostRequest('/api/shared/v1/ExternalCallback/moi/submitted-app', { "entryReferenceNumber": entryReferenceNo, "status": "approved", "rejectionReason": null, "isEditable": false, "visaApplication": null });
      expect(approveResponse.statusCode).toBe(200);

      await page.locator(NewApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Payment']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Payment`);

      // Updating the Payment Status
      const paymentApproveRes = await adminApi.PostRequest(`/api/sc/v1/Workflow/advance-workflow/${subAppGlobalId}?password=1yteBz@LeV8OBi$muRD`);
      expect(paymentApproveRes.statusCode).toBe(200);

      await page.locator(AllApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Entry Visa']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Entry Visa`);

      // Updating the Payment Status
      const approveAppResponse = await adminApi.PostRequest(`/api/shared/v1/ExternalCallback/moi/visa-permit`, { entryReferenceNumber: entryReferenceNo, visaNumber: newApp.generateRandomFiveDigit() + '12', visaEntryType: 0, visaStartDate: "2025-07-15T21:44:58.147Z", visaEndDate: "2025-07-15T21:44:58.147Z", issueDate: "2025-07-15T21:44:58.147Z", lastEntryDate: "2025-07-15T21:44:58.147Z" });
      expect(approveAppResponse.statusCode).toBe(200);

      await page.locator(AllApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Approved']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Approved`);
    } catch (error) {
      await page.waitForTimeout(10000);
      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    // Deleting the Profile
    await adminApi.deleteCompleteProfile(groupName);
    // Deleting the Group
    await adminApi.deleteGroup(visaData.orgName, groupName);

  });

  test('Verify that the user can Submit a Tourist: F1 Visa Application and can get the Visa Permit', async ({ page }, testInfo) => {
    var data = visaData.F1;

    // Fill and Save the Application as Draft
    var groupName = await newApp.fill_Tourist_F1_AplicationAsDraft(testInfo, data,visaData.orgName);

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

      // Approving the Visa Request
      const approveResponse = await adminApi.PostRequest('/api/shared/v1/ExternalCallback/moi/submitted-app', { "entryReferenceNumber": entryReferenceNo, "status": "approved", "rejectionReason": null, "isEditable": false, "visaApplication": null });
      expect(approveResponse.statusCode).toBe(200);

      await page.locator(NewApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Payment']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Payment`);

      // Updating the Payment Status
      const paymentApproveRes = await adminApi.PostRequest(`/api/sc/v1/Workflow/advance-workflow/${subAppGlobalId}?password=1yteBz@LeV8OBi$muRD`);
      expect(paymentApproveRes.statusCode).toBe(200);

      await page.locator(AllApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Entry Visa']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Entry Visa`);

      // Updating the Payment Status
      const approveAppResponse = await adminApi.PostRequest(`/api/shared/v1/ExternalCallback/moi/visa-permit`, { entryReferenceNumber: entryReferenceNo, visaNumber: newApp.generateRandomFiveDigit + '12', visaEntryType: 0, visaStartDate: "2025-07-15T21:44:58.147Z", visaEndDate: "2025-07-15T21:44:58.147Z", issueDate: "2025-07-15T21:44:58.147Z", lastEntryDate: "2025-07-15T21:44:58.147Z" });
      expect(approveAppResponse.statusCode).toBe(200);

      await page.locator(AllApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Approved']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Approved`);
    } catch (error) {
      await page.waitForTimeout(10000);
      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    // Deleting the Profile
    await adminApi.deleteCompleteProfile(groupName);
    // Deleting the Group
    await adminApi.deleteGroup(visaData.orgName, groupName);

  });

  test('Verify that the user can Submit a Diamond: D1 Visa Application and can get the Visa Permit', async ({ page }, testInfo) => {

    var data = visaData.D1;

    // Fill and Save the Application as Draft
    var groupName = await newApp.fill_Diamond_D1_AplicationAsDraft(testInfo, data,visaData.orgName);

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

      // Approving the Visa Request
      const approveResponse = await adminApi.PostRequest('/api/shared/v1/ExternalCallback/moi/submitted-app', { "entryReferenceNumber": entryReferenceNo, "status": "approved", "rejectionReason": null, "isEditable": false, "visaApplication": null });
      expect(approveResponse.statusCode).toBe(200);

      await page.locator(NewApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Payment']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Payment`);

      // Updating the Payment Status
      const paymentApproveRes = await adminApi.PostRequest(`/api/sc/v1/Workflow/advance-workflow/${subAppGlobalId}?password=1yteBz@LeV8OBi$muRD`);
      expect(paymentApproveRes.statusCode).toBe(200);

      await page.locator(AllApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Entry Visa']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Entry Visa`);

      // Updating the Payment Status
      const approveAppResponse = await adminApi.PostRequest(`/api/shared/v1/ExternalCallback/moi/visa-permit`, { entryReferenceNumber: entryReferenceNo, visaNumber: newApp.generateRandomFiveDigit() + '12', visaEntryType: 0, visaStartDate: "2025-07-15T21:44:58.147Z", visaEndDate: "2025-07-15T21:44:58.147Z", issueDate: "2025-07-15T21:44:58.147Z", lastEntryDate: "2025-07-15T21:44:58.147Z" });
      expect(approveAppResponse.statusCode).toBe(200);

      await page.locator(AllApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Approved']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Approved`);
    } catch (error) {
      await page.waitForTimeout(10000);
      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    // Deleting the Profile
    await adminApi.deleteCompleteProfile(groupName);
    // Deleting the Group
    await adminApi.deleteGroup(visaData.orgName, groupName);

  });

  test('Verify that the user can Submit a Diamond: D2 Visa Application and can get the Visa Permit', async ({ page }, testInfo) => {

    var data = visaData.D2;

    // Fill and Save the Application as Draft
    var groupName = await newApp.fill_Diamond_D2_AplicationAsDraft(testInfo, data,visaData.orgName);

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

      // Approving the Visa Request
      const approveResponse = await adminApi.PostRequest('/api/shared/v1/ExternalCallback/moi/submitted-app', { "entryReferenceNumber": entryReferenceNo, "status": "approved", "rejectionReason": null, "isEditable": false, "visaApplication": null });
      expect(approveResponse.statusCode).toBe(200);

      await page.locator(NewApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Payment']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Payment`);

      // Updating the Payment Status
      const paymentApproveRes = await adminApi.PostRequest(`/api/sc/v1/Workflow/advance-workflow/${subAppGlobalId}?password=1yteBz@LeV8OBi$muRD`);
      expect(paymentApproveRes.statusCode).toBe(200);

      await page.locator(AllApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Entry Visa']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Entry Visa`);

      // Updating the Payment Status
      const approveAppResponse = await adminApi.PostRequest(`/api/shared/v1/ExternalCallback/moi/visa-permit`, { entryReferenceNumber: entryReferenceNo, visaNumber: newApp.generateRandomFiveDigit() + '12', visaEntryType: 0, visaStartDate: "2025-07-15T21:44:58.147Z", visaEndDate: "2025-07-15T21:44:58.147Z", issueDate: "2025-07-15T21:44:58.147Z", lastEntryDate: "2025-07-15T21:44:58.147Z" });
      expect(approveAppResponse.statusCode).toBe(200);

      await page.locator(AllApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Approved']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Approved`);
    } catch (error) {
      await page.waitForTimeout(10000);
      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    // Deleting the Profile
    await adminApi.deleteCompleteProfile(groupName);
    // Deleting the Group
    await adminApi.deleteGroup(visaData.orgName, groupName);

  });

  test('Verify that the user can Submit a Diamond: D3 Visa Application and can get the Visa Permit', async ({ page }, testInfo) => {

    var data = visaData.D3;

    // Fill and Save the Application as Draft
    var groupName = await newApp.fill_Diamond_D3_AplicationAsDraft(testInfo, data,visaData.orgName);

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

      // Approving the Visa Request
      const approveResponse = await adminApi.PostRequest('/api/shared/v1/ExternalCallback/moi/submitted-app', { "entryReferenceNumber": entryReferenceNo, "status": "approved", "rejectionReason": null, "isEditable": false, "visaApplication": null });
      expect(approveResponse.statusCode).toBe(200);

      await page.locator(NewApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Payment']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Payment`);

      // Updating the Payment Status
      const paymentApproveRes = await adminApi.PostRequest(`/api/sc/v1/Workflow/advance-workflow/${subAppGlobalId}?password=1yteBz@LeV8OBi$muRD`);
      expect(paymentApproveRes.statusCode).toBe(200);

      await page.locator(AllApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Entry Visa']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Entry Visa`);

      // Updating the Payment Status
      const approveAppResponse = await adminApi.PostRequest(`/api/shared/v1/ExternalCallback/moi/visa-permit`, { entryReferenceNumber: entryReferenceNo, visaNumber: newApp.generateRandomFiveDigit() + '12', visaEntryType: 0, visaStartDate: "2025-07-15T21:44:58.147Z", visaEndDate: "2025-07-15T21:44:58.147Z", issueDate: "2025-07-15T21:44:58.147Z", lastEntryDate: "2025-07-15T21:44:58.147Z" });
      expect(approveAppResponse.statusCode).toBe(200);

      await page.locator(AllApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Approved']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Approved`);
    } catch (error) {
      await page.waitForTimeout(10000);
      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    // Deleting the Profile
    await adminApi.deleteCompleteProfile(groupName);
    // Deleting the Group
    await adminApi.deleteGroup(visaData.orgName, groupName);

  });


  test.afterEach(async ({ page }, testInfo) => {
    // Add any cleanup code if necessary
    console.log(`Test completed: ${testInfo.title} with status: ${testInfo.status}`);
    // For example, you might want to take a screenshot or log out
    await loginPage.attachScreenshot(testInfo, 'Test Completed');
    await adminApi.deleteAllProfiles();

  });

});