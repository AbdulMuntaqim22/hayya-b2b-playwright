import { test, expect } from '@playwright/test';
const fs = require('fs');
import API from '../../Pages/api';
import LoginPage from '../../Pages/loginPage';
import NewApplicationPage from '../../Pages/newApplicationPage';
const { NewApplicationLocators } = require('../../Locators/newApplicationlocators');
const { AllApplicationLocators } = require('../../Locators/allApplicationLocators');
const { OrgGroupsLocators } = require('../../Locators/orgGroupsLocators');

test.describe.configure({ mode: 'parallel' }); 

test.describe('Manual Application Scenarios - Update Application', () => {
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

  test.only('A1: Verify that the user can update the Application when it is in Pending Payment Status and when Approved with Valid Status and Outside Qatar', async ({ page }, testInfo) => {
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

      // Verifying that the User cannot Update Application in Pending Status
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("This visa application status is not eligible for editing.");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Can't Update Application When it is in Pending Status`);
      await page.getByText('Ok').click();

      // Navigating back to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();

      // Retrieving All Submitted Applications Data
      const subApp = await adminApi.PostRequest('/api/sc/v1/OrganizationGroup/get-all-applications', { "pageNumber": 1, "pageSize": 10, "searchTerm": visaData.orgName });
      const entryReferenceNo = subApp.jsonResponse.result.find((appId) => appId.organizationGroupName === groupName).entryReference;
      const subAppGlobalId = subApp.jsonResponse.result.find((appId) => appId.organizationGroupName === groupName).globalId;





      // Approving the Visa Request
      await adminApi.approveApplication(entryReferenceNo);

      await page.locator(NewApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Payment']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Payment`);

      // Verifying that the User can Update Application in Pending Payment Status
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      await expect(page.locator(NewApplicationLocators.errorDialogMsg)).not.toBeAttached();
      expect(await page.locator(NewApplicationLocators.successDialogMsg).textContent()).toBe("Application Updated Successfully");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Can Update Application When it is in Pending Payment Status`);
      await page.locator(NewApplicationLocators.continueBtn).click();

      // Navigating back to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();




      // Approving the Visa Request
      await adminApi.approveApplication(entryReferenceNo);

      // Updating the Payment Status
      await adminApi.updatePaymentStatus(subAppGlobalId);

      await page.locator(AllApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Entry Visa']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Entry Visa`);

      // Verifying that the User cannot Update Application in Pending Entry Visa Status
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("This visa application status is not eligible for editing.");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Cannot Update Application When it is in Pending entry Visa Status`);
      await page.getByText('Ok').click();

      // Navigating back to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();




      // Updating the Visa Entry
      await adminApi.updateEntryVisa(entryReferenceNo, newApp.generateRandomFiveDigit() + '12');

      await page.locator(AllApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Approved']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Approved`);

      // Verifying that the User can Update Application in Approved when Border status is N/A
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      await expect(page.locator(NewApplicationLocators.errorDialogMsg)).not.toBeAttached();
      expect(await page.locator(NewApplicationLocators.successDialogMsg).textContent()).toBe("Application Updated Successfully");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Can Update Application When it is in Approved Status and Border Status is NA`);
      await page.locator(NewApplicationLocators.continueBtn).click();


      // Approving the Visa Request
      await adminApi.approveApplication(entryReferenceNo);

      // Updating the Visa Entry
      await adminApi.updateEntryVisa(entryReferenceNo, newApp.generateRandomFiveDigit() + '12');

      // Updating Border Status to Outside Qatar
      await adminApi.updateBorderStatus(entryReferenceNo, "Outside Qatar");
      await adminApi.triggerMOIProcesses();      

      // Verifying that the User can Update Application in Approved when Border status is Outside Qatar
      await page.locator(AllApplicationLocators.refreshBtn).click();
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      await expect(page.locator(NewApplicationLocators.errorDialogMsg)).not.toBeAttached();
      expect(await page.locator(NewApplicationLocators.successDialogMsg).textContent()).toBe("Application Updated Successfully");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Can Update Application When it is in Approved Status and Border Status is Outside Qatar`);
      await page.locator(NewApplicationLocators.continueBtn).click();



      // Approving the Visa Request
      await adminApi.approveApplication(entryReferenceNo);

      // Updating the Visa Entry
      await adminApi.updateEntryVisa(entryReferenceNo, newApp.generateRandomFiveDigit() + '12');

      // Updating Border Status to Outside Qatar
      await adminApi.updateBorderStatus(entryReferenceNo, "Inside Qatar");
      await adminApi.triggerConsumedJob();
      await adminApi.triggerMOIProcesses();

      // Verifying that the User can Update Application in Approved when Border status is Inside Qatar
      await page.locator(AllApplicationLocators.refreshBtn).click();
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("Cannot update a visa application that has already been consumed.");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Cannot Update Application When it the Border Status is Inside Qatar`);
      await page.getByText('Ok').click();

      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

    } catch (error) {

      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }



  });

  test('A2: Verify that the user can update the Application when it is in Pending Payment Status and when Approved with Valid Status and Outside Qatar', async ({ page }, testInfo) => {
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

      // Verifying that the User cannot Update Application in Pending Status
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("This visa application status is not eligible for editing.");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Can't Update Application When it is in Pending Status`);
      await page.getByText('Ok').click();

      // Navigating back to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();

      // Retrieving All Submitted Applications Data
      const subApp = await adminApi.PostRequest('/api/sc/v1/OrganizationGroup/get-all-applications', { "pageNumber": 1, "pageSize": 10, "searchTerm": visaData.orgName });
      const entryReferenceNo = subApp.jsonResponse.result.find((appId) => appId.organizationGroupName === groupName).entryReference;
      const subAppGlobalId = subApp.jsonResponse.result.find((appId) => appId.organizationGroupName === groupName).globalId;





      // Approving the Visa Request
      await adminApi.approveApplication(entryReferenceNo);

      await page.locator(NewApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Payment']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Payment`);

      // Verifying that the User can Update Application in Pending Payment Status
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      await expect(page.locator(NewApplicationLocators.errorDialogMsg)).not.toBeAttached();
      expect(await page.locator(NewApplicationLocators.successDialogMsg).textContent()).toBe("Application Updated Successfully");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Can Update Application When it is in Pending Payment Status`);
      await page.locator(NewApplicationLocators.continueBtn).click();

      // Navigating back to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();




      // Approving the Visa Request
      await adminApi.approveApplication(entryReferenceNo);

      // Updating the Payment Status
      await adminApi.updatePaymentStatus(subAppGlobalId);

      await page.locator(AllApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Entry Visa']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Entry Visa`);

      // Verifying that the User cannot Update Application in Pending Entry Visa Status
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("This visa application status is not eligible for editing.");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Cannot Update Application When it is in Pending entry Visa Status`);
      await page.getByText('Ok').click();

      // Navigating back to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();




      // Updating the Visa Entry
      await adminApi.updateEntryVisa(entryReferenceNo, newApp.generateRandomFiveDigit() + '12');

      await page.locator(AllApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Approved']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Approved`);

      // Verifying that the User can Update Application in Approved when Border status is N/A
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      await expect(page.locator(NewApplicationLocators.errorDialogMsg)).not.toBeAttached();
      expect(await page.locator(NewApplicationLocators.successDialogMsg).textContent()).toBe("Application Updated Successfully");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Can Update Application When it is in Approved Status and Border Status is NA`);
      await page.locator(NewApplicationLocators.continueBtn).click();


      // Approving the Visa Request
      await adminApi.approveApplication(entryReferenceNo);

      // Updating the Visa Entry
      await adminApi.updateEntryVisa(entryReferenceNo, newApp.generateRandomFiveDigit() + '12');

      // Updating Border Status to Outside Qatar
      await adminApi.updateBorderStatus(entryReferenceNo, "Outside Qatar");
      await adminApi.triggerMOIProcesses();

      // Verifying that the User can Update Application in Approved when Border status is Outside Qatar
      await page.locator(AllApplicationLocators.refreshBtn).click();
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      await expect(page.locator(NewApplicationLocators.errorDialogMsg)).not.toBeAttached();
      expect(await page.locator(NewApplicationLocators.successDialogMsg).textContent()).toBe("Application Updated Successfully");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Can Update Application When it is in Approved Status and Border Status is Outside Qatar`);
      await page.locator(NewApplicationLocators.continueBtn).click();



      // Approving the Visa Request
      await adminApi.approveApplication(entryReferenceNo);

      // Updating the Visa Entry
      await adminApi.updateEntryVisa(entryReferenceNo, newApp.generateRandomFiveDigit() + '12');

      // Updating Border Status to Outside Qatar
      await adminApi.updateBorderStatus(entryReferenceNo, "Inside Qatar");
      await adminApi.triggerConsumedJob();
      await adminApi.triggerMOIProcesses();

      // Verifying that the User can Update Application in Approved when Border status is Inside Qatar
      await page.locator(AllApplicationLocators.refreshBtn).click();
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("Cannot update a visa application that has already been consumed.");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Cannot Update Application When it the Border Status is Inside Qatar`);
      await page.getByText('Ok').click();

      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

    } catch (error) {

      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }



  });

  test('A3: Verify that the user can update the Application when it is in Pending Payment Status and when Approved with Valid Status and Outside Qatar', async ({ page }, testInfo) => {
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

      // Verifying that the User cannot Update Application in Pending Status
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);    
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("This visa application status is not eligible for editing.");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Can't Update Application When it is in Pending Status`);
      await page.getByText('Ok').click();

      // Navigating back to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();

      // Retrieving All Submitted Applications Data
      const subApp = await adminApi.PostRequest('/api/sc/v1/OrganizationGroup/get-all-applications', { "pageNumber": 1, "pageSize": 10, "searchTerm": visaData.orgName });
      const entryReferenceNo = subApp.jsonResponse.result.find((appId) => appId.organizationGroupName === groupName).entryReference;
      const subAppGlobalId = subApp.jsonResponse.result.find((appId) => appId.organizationGroupName === groupName).globalId;





      // Approving the Visa Request
      await adminApi.approveApplication(entryReferenceNo);

      await page.locator(NewApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Payment']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Payment`);

      // Verifying that the User can Update Application in Pending Payment Status
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      await expect(page.locator(NewApplicationLocators.errorDialogMsg)).not.toBeAttached();
      expect(await page.locator(NewApplicationLocators.successDialogMsg).textContent()).toBe("Application Updated Successfully");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Can Update Application When it is in Pending Payment Status`);
      await page.locator(NewApplicationLocators.continueBtn).click();

      // Navigating back to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();




      // Approving the Visa Request
      await adminApi.approveApplication(entryReferenceNo);

      // Updating the Payment Status
      await adminApi.updatePaymentStatus(subAppGlobalId);

      await page.locator(AllApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Entry Visa']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Entry Visa`);

      // Verifying that the User cannot Update Application in Pending Entry Visa Status
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("This visa application status is not eligible for editing.");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Cannot Update Application When it is in Pending entry Visa Status`);
      await page.getByText('Ok').click();

      // Navigating back to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();




      // Updating the Visa Entry
      await adminApi.updateEntryVisa(entryReferenceNo, newApp.generateRandomFiveDigit() + '12');

      await page.locator(AllApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Approved']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Approved`);

      // Verifying that the User can Update Application in Approved when Border status is N/A
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      await expect(page.locator(NewApplicationLocators.errorDialogMsg)).not.toBeAttached();
      expect(await page.locator(NewApplicationLocators.successDialogMsg).textContent()).toBe("Application Updated Successfully");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Can Update Application When it is in Approved Status and Border Status is NA`);
      await page.locator(NewApplicationLocators.continueBtn).click();


      // Approving the Visa Request
      await adminApi.approveApplication(entryReferenceNo);

      // Updating the Visa Entry
      await adminApi.updateEntryVisa(entryReferenceNo, newApp.generateRandomFiveDigit() + '12');

      // Updating Border Status to Outside Qatar
      await adminApi.updateBorderStatus(entryReferenceNo, "Outside Qatar");
      await adminApi.triggerMOIProcesses();

      // Verifying that the User can Update Application in Approved when Border status is Outside Qatar
      await page.locator(AllApplicationLocators.refreshBtn).click();
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      await expect(page.locator(NewApplicationLocators.errorDialogMsg)).not.toBeAttached();
      expect(await page.locator(NewApplicationLocators.successDialogMsg).textContent()).toBe("Application Updated Successfully");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Can Update Application When it is in Approved Status and Border Status is Outside Qatar`);
      await page.locator(NewApplicationLocators.continueBtn).click();



      // Approving the Visa Request
      await adminApi.approveApplication(entryReferenceNo);

      // Updating the Visa Entry
      await adminApi.updateEntryVisa(entryReferenceNo, newApp.generateRandomFiveDigit() + '12');

      // Updating Border Status to Outside Qatar
      await adminApi.updateBorderStatus(entryReferenceNo, "Inside Qatar");
      await adminApi.triggerConsumedJob();
      await adminApi.triggerMOIProcesses();

      // Verifying that the User can Update Application in Approved when Border status is Inside Qatar
      await page.locator(AllApplicationLocators.refreshBtn).click();
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("Cannot update a visa application that has already been consumed.");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Cannot Update Application When it the Border Status is Inside Qatar`);
      await page.getByText('Ok').click();

      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

    } catch (error) {

      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }



  });

  test('A4: Verify that the user can update the Application when it is in Pending Payment Status and when Approved with Valid Status and Outside Qatar', async ({ page }, testInfo) => {
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

      // Verifying that the User cannot Update Application in Pending Status
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();      
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("This visa application status is not eligible for editing.");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Can't Update Application When it is in Pending Status`);
      await page.getByText('Ok').click();

      // Navigating back to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();

      // Retrieving All Submitted Applications Data
      const subApp = await adminApi.PostRequest('/api/sc/v1/OrganizationGroup/get-all-applications', { "pageNumber": 1, "pageSize": 10, "searchTerm": visaData.orgName });
      const entryReferenceNo = subApp.jsonResponse.result.find((appId) => appId.organizationGroupName === groupName).entryReference;
      const subAppGlobalId = subApp.jsonResponse.result.find((appId) => appId.organizationGroupName === groupName).globalId;





      // Approving the Visa Request
      await adminApi.approveApplication(entryReferenceNo);

      await page.locator(NewApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Payment']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Payment`);

      // Verifying that the User can Update Application in Pending Payment Status
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();      
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      await expect(page.locator(NewApplicationLocators.errorDialogMsg)).not.toBeAttached();
      expect(await page.locator(NewApplicationLocators.successDialogMsg).textContent()).toBe("Application Updated Successfully");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Can Update Application When it is in Pending Payment Status`);
      await page.locator(NewApplicationLocators.continueBtn).click();

      // Navigating back to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();




      // Approving the Visa Request
      await adminApi.approveApplication(entryReferenceNo);

      // Updating the Payment Status
      await adminApi.updatePaymentStatus(subAppGlobalId);

      await page.locator(AllApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Entry Visa']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Entry Visa`);

      // Verifying that the User cannot Update Application in Pending Entry Visa Status
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();      
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("This visa application status is not eligible for editing.");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Cannot Update Application When it is in Pending entry Visa Status`);
      await page.getByText('Ok').click();

      // Navigating back to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();




      // Updating the Visa Entry
      await adminApi.updateEntryVisa(entryReferenceNo, newApp.generateRandomFiveDigit() + '12');

      await page.locator(AllApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Approved']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Approved`);

      // Verifying that the User can Update Application in Approved when Border status is N/A
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();      
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      await expect(page.locator(NewApplicationLocators.errorDialogMsg)).not.toBeAttached();
      expect(await page.locator(NewApplicationLocators.successDialogMsg).textContent()).toBe("Application Updated Successfully");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Can Update Application When it is in Approved Status and Border Status is NA`);
      await page.locator(NewApplicationLocators.continueBtn).click();


      // Approving the Visa Request
      await adminApi.approveApplication(entryReferenceNo);

      // Updating the Visa Entry
      await adminApi.updateEntryVisa(entryReferenceNo, newApp.generateRandomFiveDigit() + '12');

      // Updating Border Status to Outside Qatar
      await adminApi.updateBorderStatus(entryReferenceNo, "Outside Qatar");
      await adminApi.triggerMOIProcesses();

      // Verifying that the User can Update Application in Approved when Border status is Outside Qatar
      await page.locator(AllApplicationLocators.refreshBtn).click();
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();      
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      await expect(page.locator(NewApplicationLocators.errorDialogMsg)).not.toBeAttached();
      expect(await page.locator(NewApplicationLocators.successDialogMsg).textContent()).toBe("Application Updated Successfully");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Can Update Application When it is in Approved Status and Border Status is Outside Qatar`);
      await page.locator(NewApplicationLocators.continueBtn).click();



      // Approving the Visa Request
      await adminApi.approveApplication(entryReferenceNo);

      // Updating the Visa Entry
      await adminApi.updateEntryVisa(entryReferenceNo, newApp.generateRandomFiveDigit() + '12');

      // Updating Border Status to Outside Qatar
      await adminApi.updateBorderStatus(entryReferenceNo, "Inside Qatar");
      await adminApi.triggerConsumedJob();
      await adminApi.triggerMOIProcesses();

      // Verifying that the User can Update Application in Approved when Border status is Inside Qatar
      await page.locator(AllApplicationLocators.refreshBtn).click();
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();      
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("Cannot update a visa application that has already been consumed.");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Cannot Update Application When it the Border Status is Inside Qatar`);
      await page.getByText('Ok').click();

      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

    } catch (error) {

      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }



  });

  test('F1: Verify that the user can update the Application when it is in Pending Payment Status and when Approved with Valid Status and Outside Qatar', async ({ page }, testInfo) => {
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

      // Verifying that the User cannot Update Application in Pending Status
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("This visa application status is not eligible for editing.");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Can't Update Application When it is in Pending Status`);
      await page.getByText('Ok').click();

      // Navigating back to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();

      // Retrieving All Submitted Applications Data
      const subApp = await adminApi.PostRequest('/api/sc/v1/OrganizationGroup/get-all-applications', { "pageNumber": 1, "pageSize": 10, "searchTerm": visaData.orgName });
      const entryReferenceNo = subApp.jsonResponse.result.find((appId) => appId.organizationGroupName === groupName).entryReference;
      const subAppGlobalId = subApp.jsonResponse.result.find((appId) => appId.organizationGroupName === groupName).globalId;





      // Approving the Visa Request
      await adminApi.approveApplication(entryReferenceNo);

      await page.locator(NewApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Payment']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Payment`);

      // Verifying that the User can Update Application in Pending Payment Status
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      await expect(page.locator(NewApplicationLocators.errorDialogMsg)).not.toBeAttached();
      expect(await page.locator(NewApplicationLocators.successDialogMsg).textContent()).toBe("Application Updated Successfully");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Can Update Application When it is in Pending Payment Status`);
      await page.locator(NewApplicationLocators.continueBtn).click();

      // Navigating back to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();




      // Approving the Visa Request
      await adminApi.approveApplication(entryReferenceNo);

      // Updating the Payment Status
      await adminApi.updatePaymentStatus(subAppGlobalId);

      await page.locator(AllApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Entry Visa']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Entry Visa`);

      // Verifying that the User cannot Update Application in Pending Entry Visa Status
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("This visa application status is not eligible for editing.");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Cannot Update Application When it is in Pending entry Visa Status`);
      await page.getByText('Ok').click();

      // Navigating back to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();




      // Updating the Visa Entry
      await adminApi.updateEntryVisa(entryReferenceNo, newApp.generateRandomFiveDigit() + '12');

      await page.locator(AllApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Approved']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Approved`);

      // Verifying that the User can Update Application in Approved when Border status is N/A
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      await expect(page.locator(NewApplicationLocators.errorDialogMsg)).not.toBeAttached();
      expect(await page.locator(NewApplicationLocators.successDialogMsg).textContent()).toBe("Application Updated Successfully");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Can Update Application When it is in Approved Status and Border Status is NA`);
      await page.locator(NewApplicationLocators.continueBtn).click();


      // Approving the Visa Request
      await adminApi.approveApplication(entryReferenceNo);

      // Updating the Visa Entry
      await adminApi.updateEntryVisa(entryReferenceNo, newApp.generateRandomFiveDigit() + '12');

      // Updating Border Status to Outside Qatar
      await adminApi.updateBorderStatus(entryReferenceNo, "Outside Qatar");
      await adminApi.triggerMOIProcesses();

      // Verifying that the User can Update Application in Approved when Border status is Outside Qatar
      await page.locator(AllApplicationLocators.refreshBtn).click();
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      await expect(page.locator(NewApplicationLocators.errorDialogMsg)).not.toBeAttached();
      expect(await page.locator(NewApplicationLocators.successDialogMsg).textContent()).toBe("Application Updated Successfully");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Can Update Application When it is in Approved Status and Border Status is Outside Qatar`);
      await page.locator(NewApplicationLocators.continueBtn).click();



      // Approving the Visa Request
      await adminApi.approveApplication(entryReferenceNo);

      // Updating the Visa Entry
      await adminApi.updateEntryVisa(entryReferenceNo, newApp.generateRandomFiveDigit() + '12');

      // Updating Border Status to Outside Qatar
      await adminApi.updateBorderStatus(entryReferenceNo, "Inside Qatar");
      await adminApi.triggerConsumedJob();
      await adminApi.triggerMOIProcesses();

      // Verifying that the User can Update Application in Approved when Border status is Inside Qatar
      await page.locator(AllApplicationLocators.refreshBtn).click();
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("Cannot update a visa application that has already been consumed.");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Cannot Update Application When it the Border Status is Inside Qatar`);
      await page.getByText('Ok').click();

      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

    } catch (error) {

      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }



  });

  test('D1: Verify that the user can update the Application when it is in Pending Payment Status and when Approved with Valid Status and Outside Qatar', async ({ page }, testInfo) => {
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

      // Verifying that the User cannot Update Application in Pending Status
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("This visa application status is not eligible for editing.");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Can't Update Application When it is in Pending Status`);
      await page.getByText('Ok').click();

      // Navigating back to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();

      // Retrieving All Submitted Applications Data
      const subApp = await adminApi.PostRequest('/api/sc/v1/OrganizationGroup/get-all-applications', { "pageNumber": 1, "pageSize": 10, "searchTerm": visaData.orgName });
      const entryReferenceNo = subApp.jsonResponse.result.find((appId) => appId.organizationGroupName === groupName).entryReference;
      const subAppGlobalId = subApp.jsonResponse.result.find((appId) => appId.organizationGroupName === groupName).globalId;





      // Approving the Visa Request
      await adminApi.approveApplication(entryReferenceNo);

      await page.locator(NewApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Payment']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Payment`);

      // Verifying that the User can Update Application in Pending Payment Status
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      await expect(page.locator(NewApplicationLocators.errorDialogMsg)).not.toBeAttached();
      expect(await page.locator(NewApplicationLocators.successDialogMsg).textContent()).toBe("Application Updated Successfully");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Can Update Application When it is in Pending Payment Status`);
      await page.locator(NewApplicationLocators.continueBtn).click();

      // Navigating back to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();




      // Approving the Visa Request
      await adminApi.approveApplication(entryReferenceNo);

      // Updating the Payment Status
      await adminApi.updatePaymentStatus(subAppGlobalId);

      await page.locator(AllApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Entry Visa']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Entry Visa`);

      // Verifying that the User cannot Update Application in Pending Entry Visa Status
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("This visa application status is not eligible for editing.");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Cannot Update Application When it is in Pending entry Visa Status`);
      await page.getByText('Ok').click();

      // Navigating back to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();




      // Updating the Visa Entry
      await adminApi.updateEntryVisa(entryReferenceNo, newApp.generateRandomFiveDigit() + '12');

      await page.locator(AllApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Approved']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Approved`);

      // Verifying that the User can Update Application in Approved when Border status is N/A
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("Cannot update approved application in Diamond category");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Cannot Update Application When it is in Approved Status and Border Status is NA`);
      await page.getByText('Ok').click();

      // Navigating back to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();

    
      // Updating Border Status to Outside Qatar
      await adminApi.updateBorderStatus(entryReferenceNo, "Outside Qatar");
      await adminApi.triggerMOIProcesses();

      // Verifying that the User can Update Application in Approved when Border status is Outside Qatar
      await page.locator(AllApplicationLocators.refreshBtn).click();
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("Cannot update approved application in Diamond category");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Cannot Update Application When it is in Approved Status and Border Status is Outside Qatar`);
      await page.getByText('Ok').click();

      // Navigating back to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();

      // Updating Border Status to Outside Qatar
      await adminApi.updateBorderStatus(entryReferenceNo, "Inside Qatar");
      await adminApi.triggerConsumedJob();
      await adminApi.triggerMOIProcesses();

      // Verifying that the User can Update Application in Approved when Border status is Inside Qatar
      await page.locator(AllApplicationLocators.refreshBtn).click();
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("Cannot update approved application in Diamond category");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Cannot Update Application When it is in Approved Status and Border Status is Inside Qatar`);
      await page.getByText('Ok').click();

      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

    } catch (error) {

      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }



  });

  test('D2: Verify that the user can update the Application when it is in Pending Payment Status and when Approved with Valid Status and Outside Qatar', async ({ page }, testInfo) => {
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

      // Verifying that the User cannot Update Application in Pending Status
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("This visa application status is not eligible for editing.");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Can't Update Application When it is in Pending Status`);
      await page.getByText('Ok').click();

      // Navigating back to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();

      // Retrieving All Submitted Applications Data
      const subApp = await adminApi.PostRequest('/api/sc/v1/OrganizationGroup/get-all-applications', { "pageNumber": 1, "pageSize": 10, "searchTerm": visaData.orgName });
      const entryReferenceNo = subApp.jsonResponse.result.find((appId) => appId.organizationGroupName === groupName).entryReference;
      const subAppGlobalId = subApp.jsonResponse.result.find((appId) => appId.organizationGroupName === groupName).globalId;





      // Approving the Visa Request
      await adminApi.approveApplication(entryReferenceNo);

      await page.locator(NewApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Payment']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Payment`);

      // Verifying that the User can Update Application in Pending Payment Status
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      await expect(page.locator(NewApplicationLocators.errorDialogMsg)).not.toBeAttached();
      expect(await page.locator(NewApplicationLocators.successDialogMsg).textContent()).toBe("Application Updated Successfully");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Can Update Application When it is in Pending Payment Status`);
      await page.locator(NewApplicationLocators.continueBtn).click();

      // Navigating back to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();




      // Approving the Visa Request
      await adminApi.approveApplication(entryReferenceNo);

      // Updating the Payment Status
      await adminApi.updatePaymentStatus(subAppGlobalId);

      await page.locator(AllApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Entry Visa']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Entry Visa`);

      // Verifying that the User cannot Update Application in Pending Entry Visa Status
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("This visa application status is not eligible for editing.");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Cannot Update Application When it is in Pending entry Visa Status`);
      await page.getByText('Ok').click();

      // Navigating back to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();




      // Updating the Visa Entry
      await adminApi.updateEntryVisa(entryReferenceNo, newApp.generateRandomFiveDigit() + '12');

      await page.locator(AllApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Approved']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Approved`);

      // Verifying that the User can Update Application in Approved when Border status is N/A
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("Cannot update approved application in Diamond category");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Cannot Update Application When it is in Approved Status and Border Status is NA`);
      await page.getByText('Ok').click();

      // Navigating back to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      

      // Updating Border Status to Outside Qatar
      await adminApi.updateBorderStatus(entryReferenceNo, "Outside Qatar");
      await adminApi.triggerMOIProcesses();

      // Verifying that the User can Update Application in Approved when Border status is Outside Qatar
      await page.locator(AllApplicationLocators.refreshBtn).click();
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      await expect(page.locator(NewApplicationLocators.errorDialogMsg)).not.toBeAttached();
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("Cannot update approved application in Diamond category");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Cannot Update Application When it is in Approved Status and Border Status is Outside Qatar`);
      await page.getByText('Ok').click();

      // Navigating back to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      

      // Updating Border Status to Outside Qatar
      await adminApi.updateBorderStatus(entryReferenceNo, "Inside Qatar");
      await adminApi.triggerConsumedJob();
      await adminApi.triggerMOIProcesses();

      // Verifying that the User can Update Application in Approved when Border status is Inside Qatar
      await page.locator(AllApplicationLocators.refreshBtn).click();
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("Cannot update approved application in Diamond category");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Cannot Update Application When it is in Approved Status and Border Status is Inside Qatar`);
      await page.getByText('Ok').click();

      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

    } catch (error) {

      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }



  });

  test('D3: Verify that the user can update the Application when it is in Pending Payment Status and when Approved with Valid Status and Outside Qatar', async ({ page }, testInfo) => {
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

      // Verifying that the User cannot Update Application in Pending Status
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("This visa application status is not eligible for editing.");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Can't Update Application When it is in Pending Status`);
      await page.getByText('Ok').click();

      // Navigating back to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();

      // Retrieving All Submitted Applications Data
      const subApp = await adminApi.PostRequest('/api/sc/v1/OrganizationGroup/get-all-applications', { "pageNumber": 1, "pageSize": 10, "searchTerm": visaData.orgName });
      const entryReferenceNo = subApp.jsonResponse.result.find((appId) => appId.organizationGroupName === groupName).entryReference;
      const subAppGlobalId = subApp.jsonResponse.result.find((appId) => appId.organizationGroupName === groupName).globalId;





      // Approving the Visa Request
      await adminApi.approveApplication(entryReferenceNo);

      await page.locator(NewApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Payment']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Payment`);

      // Verifying that the User can Update Application in Pending Payment Status
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      await expect(page.locator(NewApplicationLocators.errorDialogMsg)).not.toBeAttached();
      expect(await page.locator(NewApplicationLocators.successDialogMsg).textContent()).toBe("Application Updated Successfully");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Can Update Application When it is in Pending Payment Status`);
      await page.locator(NewApplicationLocators.continueBtn).click();

      // Navigating back to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();




      // Approving the Visa Request
      await adminApi.approveApplication(entryReferenceNo);

      // Updating the Payment Status
      await adminApi.updatePaymentStatus(subAppGlobalId);

      await page.locator(AllApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Entry Visa']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Entry Visa`);

      // Verifying that the User cannot Update Application in Pending Entry Visa Status
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("This visa application status is not eligible for editing.");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Cannot Update Application When it is in Pending entry Visa Status`);
      await page.getByText('Ok').click();

      // Navigating back to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();




      // Updating the Visa Entry
      await adminApi.updateEntryVisa(entryReferenceNo, newApp.generateRandomFiveDigit() + '12');

      await page.locator(AllApplicationLocators.refreshBtn).click();
      row = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Approved']`);
      await expect(row).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Approved`);

      // Verifying that the User can Update Application in Approved when Border status is N/A
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("Cannot update approved application in Diamond category");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Cannot Update Application When it is in Approved Status and Border Status is NA`);
      await page.getByText('Ok').click();

      // Navigating back to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();

      


      // Updating Border Status to Outside Qatar
      await adminApi.updateBorderStatus(entryReferenceNo, "Outside Qatar");
      await adminApi.triggerMOIProcesses();

      // Verifying that the User can Update Application in Approved when Border status is Outside Qatar
      await page.locator(AllApplicationLocators.refreshBtn).click();
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("Cannot update approved application in Diamond category");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Cannot Update Application When it is in Approved Status and Border Status is Outside Qatar`);
      await page.getByText('Ok').click();

      // Navigating back to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();



      // Approving the Visa Request
      await adminApi.approveApplication(entryReferenceNo);

      // Updating the Visa Entry
      await adminApi.updateEntryVisa(entryReferenceNo, newApp.generateRandomFiveDigit() + '12');

      // Updating Border Status to Outside Qatar
      await adminApi.updateBorderStatus(entryReferenceNo, "Inside Qatar");
      await adminApi.triggerConsumedJob();
      await adminApi.triggerMOIProcesses();

      // Verifying that the User can Update Application in Approved when Border status is Inside Qatar
      await page.locator(AllApplicationLocators.refreshBtn).click();
      await row.locator("xpath=parent::td/preceding-sibling::td[5]/button").click();
      await page.locator(AllApplicationLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');

      await newApp.update_Submitted_Application(testInfo, data);
      expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe("Cannot update approved application in Diamond category");
      await page.waitForTimeout(1000);
      await newApp.attachScreenshot(testInfo, `The user Cannot Update Application When it is in Approved Status and Border Status is Inside Qatar`);
      await page.getByText('Ok').click();

      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

    } catch (error) {

      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }



  });



  test.afterEach(async ({ page }, testInfo) => {
    // Add any cleanup code if necessary
    console.log(`Test completed: ${testInfo.title} with status: ${testInfo.status}`);
    // For example, you might want to take a screenshot or log out
    await loginPage.attachScreenshot(testInfo, 'Test Completed');
    await adminApi.deleteAllProfiles();

  });

});