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
  var loginPage;
  var newApp;
  let credentials;
  let apiConfig;
  let adminUserData;
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
    await adminApi.deleteAllProfiles(visaData.orgName);

    // Logging in before each test    
    await loginPage.login(testInfo, credentials.requestorUsers.existingUser);
  });

  test('A1: Verify that the user will be blocked and for applying and updating the Application when it is Rejected without a Reason', async ({ page }, testInfo) => {

    var data = visaData.A1;

    // Fill and Save the Application as Draft
    var groupName = await newApp.fill_Tourist_A1_AplicationAsDraft(testInfo, data, visaData.orgName);


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


    await page.locator(NewApplicationLocators.updateApplicationBtn).click();

    var oneDayLater = newApp.getDateJsonObject({ days: 1 });

    expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe(`Cannot update rejected application. Please retry after ${oneDayLater.day} ${oneDayLater.monthStr} ${oneDayLater.year}.`);
    await page.waitForTimeout(1000);
    await newApp.attachScreenshot(testInfo, `The user Can't Update Application When Rejected without Reason`);

    await page.getByText('Ok').click();


    // Re-Applying for the Applicaiton         
    await newApp.fill_Tourist_A1_Aplication(testInfo, data, visaData.orgName);
    // Clicking on Save as Draft button    
    await page.locator(NewApplicationLocators.saveAsDraftBtn).click();
    var oneMonthLater = newApp.getDateJsonObject({ days: 30 });

    //Error Message is Displayed When Saving the Rejected Application as Draft
    var msg = `Cannot apply for visa at this moment, please retry after ${oneMonthLater.day}/${oneMonthLater.month}/${oneMonthLater.year}.`;
    expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe(msg);
    await newApp.attachScreenshot(testInfo, `The user Cannot apply again when it is Rejected.`);

    // Deleting the Profile
    await adminApi.deleteCompleteProfile(groupName);

  });

  test('A2: Verify that the user will be blocked and for applying and updating the Application when it is Rejected without a Reason', async ({ page }, testInfo) => {

    var data = visaData.A2;

    // Fill and Save the Application as Draft
    var groupName = await newApp.fill_Tourist_A2_AplicationAsDraft(testInfo, data, visaData.orgName);

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

    await page.locator(NewApplicationLocators.updateApplicationBtn).click();

    var oneDaylater = newApp.getDateJsonObject({ days: 1 });

    expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe(`Cannot update rejected application. Please retry after ${oneDaylater.day} ${oneDaylater.monthStr} ${oneDaylater.year}.`);
    await page.waitForTimeout(1000);
    await newApp.attachScreenshot(testInfo, `The user Can't Update Application When Rejected without Reason`);

    await page.getByText('Ok').click();

    var oneMonthLater = newApp.getDateJsonObject({ days: 30 });

    // Re-Applying for the Applicaiton         
    await newApp.fill_Tourist_A2_Aplication(testInfo, data, visaData.orgName);
    // Clicking on Save as Draft button    
    await page.locator(NewApplicationLocators.saveAsDraftBtn).click();

    //Error Message is Displayed When Saving the Rejected Application as Draft
    var msg = `Cannot apply for visa at this moment, please retry after ${oneMonthLater.day}/${oneMonthLater.month}/${oneMonthLater.year}.`;
    expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe(msg);

    await newApp.attachScreenshot(testInfo, `The user Cannot apply again when it is Rejected.`);


    // Deleting the Profile
    await adminApi.deleteCompleteProfile(groupName);

  });

  test('A3: Verify that the user will be blocked and for applying and updating the Application when it is Rejected without a Reason', async ({ page }, testInfo) => {

    var data = visaData.A3;

    // Fill and Save the Application as Draft
    var groupName = await newApp.fill_Tourist_A3_AplicationAsDraft(testInfo, data, visaData.orgName);

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

    var oneDayLater = newApp.getDateJsonObject({ days: 1 });

    expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe(`Cannot update rejected application. Please retry after ${oneDayLater.day} ${oneDayLater.monthStr} ${oneDayLater.year}.`);
    await page.waitForTimeout(1000);
    await newApp.attachScreenshot(testInfo, `The user Can't Update Application When Rejected without Reason`);

    await page.getByText('Ok').click();
    var oneMonthLater = newApp.getDateJsonObject({ days: 30 });

    // Re-Applying for the Applicaiton         
    await newApp.fill_Tourist_A3_Aplication(testInfo, data, visaData.orgName);
    // Clicking on Save as Draft button    
    await page.locator(NewApplicationLocators.saveAsDraftBtn).click();

    //Error Message is Displayed When Saving the Rejected Application as Draft
    var msg = `Cannot apply for visa at this moment, please retry after ${oneMonthLater.day}/${oneMonthLater.month}/${oneMonthLater.year}.`;
    expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe(msg);

    await newApp.attachScreenshot(testInfo, `The user Cannot apply again when it is Rejected.`);


    // Deleting the Profile
    await adminApi.deleteCompleteProfile(groupName);


  });

  test('A4: Verify that the user will be blocked and for applying and updating the Application when it is Rejected without a Reason', async ({ page }, testInfo) => {

    var data = visaData.A4;

    // Fill and Save the Application as Draft
    var groupName = await newApp.fill_Tourist_A4_AplicationAsDraft(testInfo, data, visaData.orgName);

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

    await page.locator(NewApplicationLocators.updateApplicationBtn).click();

    var oneDayLater = newApp.getDateJsonObject({ days: 1 });

    expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe(`Cannot update rejected application. Please retry after ${oneDayLater.day} ${oneDayLater.monthStr} ${oneDayLater.year}.`);
    await page.waitForTimeout(1000);
    await newApp.attachScreenshot(testInfo, `The user Can't Update Application When Rejected without Reason`);

    await page.getByText('Ok').click();

    var oneMonthLater = newApp.getDateJsonObject({ days: 30 });
    // Re-Applying for the Applicaiton         
    await newApp.fill_Tourist_A4_Aplication(testInfo, data, visaData.orgName);
    // Clicking on Save as Draft button    
    await page.locator(NewApplicationLocators.saveAsDraftBtn).click();

    //Error Message is Displayed When Saving the Rejected Application as Draft
    var msg = `Cannot apply for visa at this moment, please retry after ${oneMonthLater.day}/${oneMonthLater.month}/${oneMonthLater.year}.`;
    expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe(msg);

    await newApp.attachScreenshot(testInfo, `The user Cannot apply again when it is Rejected.`);

    // Deleting the Profile
    await adminApi.deleteCompleteProfile(groupName);

  });

  test('F1: Verify that the user will be blocked and for applying and updating the Application when it is Rejected without a Reason', async ({ page }, testInfo) => {

    var data = visaData.F1;

    // Fill and Save the Application as Draft
    var groupName = await newApp.fill_Tourist_F1_AplicationAsDraft(testInfo, data, visaData.orgName);

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

    await page.locator(NewApplicationLocators.updateApplicationBtn).click();

    var oneDayLater = newApp.getDateJsonObject({ days: 1 });

    expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe(`Cannot update rejected application. Please retry after ${oneDayLater.day} ${oneDayLater.monthStr} ${oneDayLater.year}.`);
    await page.waitForTimeout(1000);
    await newApp.attachScreenshot(testInfo, `The user Can't Update Application When Rejected without Reason`);

    await page.getByText('Ok').click();
    var oneMonthLater = newApp.getDateJsonObject({ days: 30 });

    // Re-Applying for the Applicaiton         
    await newApp.fill_Tourist_F1_Aplication(testInfo, data, visaData.orgName);
    // Clicking on Save as Draft button    
    await page.locator(NewApplicationLocators.saveAsDraftBtn).click();

    //Error Message is Displayed When Saving the Rejected Application as Draft
    var msg = `Cannot apply for visa at this moment, please retry after ${oneMonthLater.day}/${oneMonthLater.month}/${oneMonthLater.year}.`;
    expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe(msg);

    await newApp.attachScreenshot(testInfo, `The user Cannot apply again when it is Rejected.`);


    // Deleting the Profile
    await adminApi.deleteCompleteProfile(groupName);

  });

  test('D1: Verify that the user will be blocked and for applying and updating the Application when it is Rejected without a Reason', async ({ page }, testInfo) => {

    var data = visaData.D1;

    // Fill and Save the Application as Draft
    var groupName = await newApp.fill_Diamond_D1_AplicationAsDraft(testInfo, data, visaData.orgName);

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

    await page.locator(NewApplicationLocators.updateApplicationBtn).click();

    var oneMonthLater = newApp.getDateJsonObject({ days: 30 });

    expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe(`Cannot update rejected application. Please retry after ${oneMonthLater.day} ${oneMonthLater.monthStr} ${oneMonthLater.year}.`);
    await page.waitForTimeout(1000);
    await newApp.attachScreenshot(testInfo, `The user Can't Update Application When Rejected without Reason`);

    await page.getByText('Ok').click();

    // Re-Applying for the Applicaiton         
    await newApp.fill_Diamond_D1_Aplication(testInfo, data, visaData.orgName);
    // Clicking on Save as Draft button    
    await page.locator(NewApplicationLocators.saveAsDraftBtn).click();

    //Error Message is Displayed When Saving the Rejected Application as Draft
    var msg = `Cannot apply for visa at this moment, please retry after ${oneMonthLater.day}/${oneMonthLater.month}/${oneMonthLater.year}.`;
    expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe(msg);

    await newApp.attachScreenshot(testInfo, `The user Cannot apply again when it is Rejected.`);


    // Deleting the Profile
    await adminApi.deleteCompleteProfile(groupName);
  });

  test('D2: Verify that the user will be blocked and for applying and updating the Application when it is Rejected without a Reason', async ({ page }, testInfo) => {

    var data = visaData.D2;

    // Fill and Save the Application as Draft
    var groupName = await newApp.fill_Diamond_D2_AplicationAsDraft(testInfo, data, visaData.orgName);

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

    await page.locator(NewApplicationLocators.updateApplicationBtn).click();

    var oneMonthLater = newApp.getDateJsonObject({ days: 30 });

    expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe(`Cannot update rejected application. Please retry after ${oneMonthLater.day} ${oneMonthLater.monthStr} ${oneMonthLater.year}.`);
    await page.waitForTimeout(1000);
    await newApp.attachScreenshot(testInfo, `The user Can't Update Application When Rejected without Reason`);

    await page.getByText('Ok').click();
    // Re-Applying for the Applicaiton         
    await newApp.fill_Diamond_D2_Aplication(testInfo, data, visaData.orgName);
    // Clicking on Save as Draft button    
    await page.locator(NewApplicationLocators.saveAsDraftBtn).click();

    //Error Message is Displayed When Saving the Rejected Application as Draft
    var msg = `Cannot apply for visa at this moment, please retry after ${oneMonthLater.day}/${oneMonthLater.month}/${oneMonthLater.year}.`;
    expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe(msg);

    await newApp.attachScreenshot(testInfo, `The user Cannot apply again when it is Rejected.`);


    // Deleting the Profile
    await adminApi.deleteCompleteProfile(groupName);

  });

  test('D3: Verify that the user will be blocked and for applying and updating the Application when it is Rejected without a Reason', async ({ page }, testInfo) => {

    var data = visaData.D3;

    // Fill and Save the Application as Draft
    var groupName = await newApp.fill_Diamond_D3_AplicationAsDraft(testInfo, data, visaData.orgName);

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

    await page.locator(NewApplicationLocators.updateApplicationBtn).click();

    var oneMonthLater = newApp.getDateJsonObject({ days: 30 });

    expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe(`Cannot update rejected application. Please retry after ${oneMonthLater.day} ${oneMonthLater.monthStr} ${oneMonthLater.year}.`);
    await page.waitForTimeout(1000);
    await newApp.attachScreenshot(testInfo, `The user Can't Update Application When Rejected without Reason`);

    await page.getByText('Ok').click();

    // Re-Applying for the Applicaiton         
    var groupName2 = await newApp.fill_Diamond_D3_Aplication(testInfo, data, visaData.orgName);
    // Clicking on Save as Draft button    
    await page.locator(NewApplicationLocators.saveAsDraftBtn).click();

    //Error Message is Displayed When Saving the Rejected Application as Draft
    var msg = `Cannot apply for visa at this moment, please retry after ${oneMonthLater.day}/${oneMonthLater.month}/${oneMonthLater.year}.`;
    expect(await page.locator(NewApplicationLocators.errorDialogMsg).textContent()).toBe(msg);

    await newApp.attachScreenshot(testInfo, `The user Cannot apply again when it is Rejected.`);


    // Deleting the Profile
    await adminApi.deleteCompleteProfile(groupName);

  });


  test.afterEach(async ({ page }, testInfo) => {
    // Add any cleanup code if necessary
    console.log(`Test completed: ${testInfo.title} with status: ${testInfo.status}`);
    // For example, you might want to take a screenshot or log out
    await loginPage.attachScreenshot(testInfo, 'Test Completed');
    await adminApi.deleteAllProfiles(visaData.orgName);
    await adminApi.deleteAllGroups(visaData.orgName);

  });

});