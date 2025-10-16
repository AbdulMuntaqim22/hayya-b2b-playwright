import { test, expect } from '@playwright/test';
const fs = require('fs');
import API from '../../Pages/api';
import LoginPage from '../../Pages/loginPage';
import NewApplicationPage from '../../Pages/newApplicationPage';
const { NewApplicationLocators } = require('../../Locators/newApplicationlocators');
const { AllApplicationLocators } = require('../../Locators/allApplicationLocators');
const { OrgGroupsLocators } = require('../../Locators/orgGroupsLocators');

test.describe.configure({ mode: 'parallel' }); 

test.describe('Bulk Upload Application Scenarios', () => {  
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
    await adminApi.deleteAllProfiles();

    // Logging in before each test    
    await loginPage.login(testInfo, credentials.requestorUsers.existingUser);     
  });

  test('Verify that the user can Submit a Bulk upload application for A1', async ({ page }, testInfo) => {
    var data = visaData.BulkUpload_A1;
    try {
      // Fill and Save the Application as Draft
      var groupName = await newApp.fill_Bulk_Upload(testInfo, data);

      // Navigating to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      await page.waitForLoadState('load');
      await page.locator(AllApplicationLocators.appTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Application is created with status Bulk-Draft
      var appRows = page.locator(OrgGroupsLocators.groupTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td/span[text()='Bulk Upload']`);
      var appRowCount = await appRows.count();
      for (let i = 0; i <= appRowCount; i++) {
        await expect(appRows.nth(i)).toBeVisible();
      }

      await newApp.attachScreenshot(testInfo, `The Bulk upload is processed ${groupName}`);

      // Navigating to Organization Groups Page
      await page.locator(OrgGroupsLocators.orgGroupsLeftMenu).waitFor({ state: "attached" });
      await page.waitForTimeout(2000);
      await page.locator(OrgGroupsLocators.orgGroupsLeftMenu).click();
      await page.locator(OrgGroupsLocators.header).waitFor({ state: "visible" });


      // Verifying that the Group is created
      var groupRow = page.locator(OrgGroupsLocators.groupTableRows).locator(`//td/p[text()='${groupName}']`);
      await expect(groupRow).toBeVisible({ timeout: 30000 });

      await newApp.attachScreenshot(testInfo, `The ${groupName} is created`);

      // Filling the Applications

      // 1. Clicking on the Actions button
      await groupRow.locator("xpath=parent::td/preceding-sibling::td[3]/button").click();
      await page.locator(OrgGroupsLocators.viewBulkSummaryBtn).click();
      await page.waitForLoadState('load');

      await page.locator(OrgGroupsLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');
      //For loop
      // Editing the Application
      await page.locator(OrgGroupsLocators.groupTableRows).nth(0).waitFor({ state: 'visible' });
      await page.waitForTimeout(2000);
      var totalApps = await page.locator(OrgGroupsLocators.groupTableRows).locator("//td//button").count();

      for (let i = 0; i < totalApps; i++) {
        await page.locator(OrgGroupsLocators.groupTableRows).locator("//td//button").nth(i).click();        

        // Selecting Purpose of Visit 
        await page.locator(NewApplicationLocators.visitTypeSelect).fill(data.A1.purposeOfVisit);
        await page.locator(NewApplicationLocators.visitTypeSelect).press('Enter');

        // Selecting Passport Type
        await page.locator(NewApplicationLocators.passportTypeSelect).fill(data.A1.passportType);
        await page.locator(NewApplicationLocators.passportTypeSelect).press('Enter');

        //Selecting Yes for Previous/Other Nationality Question
        if (data.A1.otherNationality) {
          await page.locator(NewApplicationLocators.otherNationalityYesOption).check();
        }
        else {
          await page.locator(NewApplicationLocators.otherNationalityNoOption).check();
        }

        // Selecting Country of Birth
        await page.locator(NewApplicationLocators.countryOfBirthSelect).fill(data.A1.country);
        await page.locator(NewApplicationLocators.countryOfBirthSelect).press('Enter');

        // Selecting Country of Residence
        await page.locator(NewApplicationLocators.countryOfResidenceSelect).fill(data.A1.countryOfResidence);
        await page.keyboard.press('Enter');

        // Entering Contact and Emergency Contact number
        await page.locator(NewApplicationLocators.contactNoTxt).fill(data.A1.contactNo);
        //await page.locator(NewApplicationLocators.emergencyContactNoTxt).fill(data.A1.emergencyNo);        

        // Clicking on Save as Draft button    
        await page.locator(NewApplicationLocators.updateApplicationBtn).click();
        await page.locator(NewApplicationLocators.continueBtn).click();
      }

      await page.locator(OrgGroupsLocators.orgGroupsLeftMenu).click();
      await groupRow.locator("xpath=parent::td/preceding-sibling::td[3]/button").click();
      await page.locator(OrgGroupsLocators.viewDraftAppBtn).click();      
      await page.waitForLoadState('domcontentloaded');

      await page.locator(OrgGroupsLocators.groupTableRows+ "/td//input").first().waitFor({ state: 'visible' });            
      await page.locator(OrgGroupsLocators.selectAllCheckbox).check();

      await page.locator(OrgGroupsLocators.submitBtn).click();
      await page.locator(OrgGroupsLocators.okBtn).click();
      
    }
    catch (error) {
      // Deleting All Draft Applications
      //await adminApi.deleteAllDraftApps(visaData.orgName);

      // Deleting the Group
      //await adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }
    try {

      // Navigating to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      await page.waitForLoadState('load');
      await page.locator(AllApplicationLocators.appTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Application is Submitted with the Status Pending
      appRows = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending']`);
      appRowCount = await appRows.count();
      for (let i = 0; i <= appRowCount; i++) {
        await expect(appRows.nth(i)).toBeVisible();
      }

      await newApp.attachScreenshot(testInfo, `The Application is submitted with status Pending`);

      // Retrieving All Submitted Applications Data
      const subApp = await adminApi.PostRequest('/api/sc/v1/OrganizationGroup/get-all-applications', { "pageNumber": 1, "pageSize": 10, "searchTerm": visaData.orgName });
      const entryReferenceNo = subApp.jsonResponse.result.filter((appId) => appId.organizationGroupName === groupName).map(app => app.entryReference);
      const subAppGlobalId = subApp.jsonResponse.result.filter((appId) => appId.organizationGroupName === groupName).map(app => app.globalId);


      // Approving the Visa Request for each app
      for (let i = 0; i < entryReferenceNo.length; i++) {
        const approveResponse = await adminApi.PostRequest('/api/shared/v1/ExternalCallback/moi/submitted-app', { "entryReferenceNumber": entryReferenceNo[i], "status": "approved", "rejectionReason": null, "isEditable": false });
        expect(approveResponse.statusCode).toBe(200);
      }

      await page.locator(NewApplicationLocators.refreshBtn).click();
      appRows = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Payment']`);
      appRowCount = await appRows.count();
      for (let i = 0; i <= appRowCount; i++) {
        await expect(appRows.nth(i)).toBeVisible();
      }

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Payment`);

      // Updating the Payment Status for Each App
      for (let i = 0; i < subAppGlobalId.length; i++) {
        const paymentApproveRes = await adminApi.PostRequest(`/api/sc/v1/Workflow/advance-workflow/${subAppGlobalId[i]}?password=1yteBz@LeV8OBi$muRD`);
        expect(paymentApproveRes.statusCode).toBe(200);
      }

      await page.locator(AllApplicationLocators.refreshBtn).click();
      appRows = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Entry Visa']`);
      appRowCount = await appRows.count();
      for (let i = 0; i <= appRowCount; i++) {
        await expect(appRows.nth(i)).toBeVisible();
      }

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Entry Visa`);

      // Updating the Payment Status for each App
      for (let i = 0; i < entryReferenceNo.length; i++) {
        const approveAppResponse = await adminApi.PostRequest(`/api/shared/v1/ExternalCallback/moi/visa-permit`, { entryReferenceNumber: entryReferenceNo[i], visaNumber: newApp.generateRandomFiveDigit() + '12', visaEntryType: 1, visaStartDate: "2025-07-15T21:44:58.147Z", visaEndDate: "2025-07-15T21:44:58.147Z", issueDate: "2025-07-15T21:44:58.147Z", lastEntryDate: "2025-07-15T21:44:58.147Z" });
        expect(approveAppResponse.statusCode).toBe(200);
      }

      await page.locator(AllApplicationLocators.refreshBtn).click();
      appRows = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Approved']`);
      appRowCount = await appRows.count();
      for (let i = 0; i <= appRowCount; i++) {
        await expect(appRows.nth(i)).toBeVisible();
      }

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Approved`);      

    }
    catch (error) {
      await page.waitForTimeout(10000);
      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    // Deleting Complete Profile
    await adminApi.deleteCompleteProfile(groupName);
    // Deleting the Group
    await adminApi.deleteGroup(visaData.orgName, groupName)
  });

  test('Verify that the user can Submit a Bulk upload application for A2', async ({ page }, testInfo) => {
    var data = visaData.BulkUpload_A2;

    try {
      // Fill and Save the Application as Draft
      var groupName = await newApp.fill_Bulk_Upload(testInfo, data);    
      // Navigating to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      await page.waitForLoadState('load');
      await page.locator(OrgGroupsLocators.groupTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Application is created with status Bulk-Draft
      var appRows = page.locator(OrgGroupsLocators.groupTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td/span[text()='Bulk Upload']`);
      var appRowCount = await appRows.count();
      for (let i = 0; i <= appRowCount; i++) {
        await expect(appRows.nth(i)).toBeVisible();
      }

      await newApp.attachScreenshot(testInfo, `The Bulk upload is processed ${groupName}`);

      // Navigating to Organization Groups Page
      await page.locator(OrgGroupsLocators.orgGroupsLeftMenu).waitFor({ state: "attached" });
      await page.waitForTimeout(2000);
      await page.locator(OrgGroupsLocators.orgGroupsLeftMenu).click();
      await page.locator(OrgGroupsLocators.header).waitFor({ state: "visible" });


      // Verifying that the Group is created
      var groupRow = page.locator(OrgGroupsLocators.groupTableRows).locator(`//td/p[text()='${groupName}']`);
      await expect(groupRow).toBeVisible({ timeout: 30000 });

      await newApp.attachScreenshot(testInfo, `The ${groupName} is created`);

      // Filling the Applications

      // 1. Clicking on the Actions button
      await groupRow.locator("xpath=parent::td/preceding-sibling::td[3]/button").click();
      await page.locator(OrgGroupsLocators.viewBulkSummaryBtn).click();
      await page.waitForLoadState('load');

      await page.locator(OrgGroupsLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');
      //For loop
      // Editing the Application
      await page.locator(OrgGroupsLocators.groupTableRows).nth(0).waitFor({ state: 'visible' });
      await page.waitForTimeout(2000);
      var totalApps = await page.locator(OrgGroupsLocators.groupTableRows).locator("//td//button").count();

      for (let i = 0; i < totalApps; i++) {
        await page.locator(OrgGroupsLocators.groupTableRows).locator("//td//button").nth(i).click();        

        // Selecting Purpose of Visit 
        await page.locator(NewApplicationLocators.visitTypeSelect).fill(data.A2.purposeOfVisit);
        await page.locator(NewApplicationLocators.visitTypeSelect).press('Enter');

        // Selecting Passport Type
        await page.locator(NewApplicationLocators.passportTypeSelect).fill(data.A2.passportType);
        await page.locator(NewApplicationLocators.passportTypeSelect).press('Enter');

        // Selecting Job Title
        await page.locator(NewApplicationLocators.jobTitleSelect).fill(data.A2.jobTitle);
        await page.locator(NewApplicationLocators.jobTitleSelect).press('Enter');

        // Selecting Yes for Previous/Other Nationality Question
        if (data.A2.otherNationality) {
          await page.locator(NewApplicationLocators.otherNationalitySelect).fill('Yes');
        }
        else {
          await page.locator(NewApplicationLocators.otherNationalitySelect).fill('No');
        }
        await page.keyboard.press('Enter');

        // // Selecting Country of Birth
        // await page.locator(NewApplicationLocators.countryOfBirthSelect).fill(data.A2.country);
        // await page.locator(NewApplicationLocators.countryOfBirthSelect).press('Enter');

        // Selecting Country of Residence
        await page.locator(NewApplicationLocators.countryOfResidenceSelect).fill(data.A2.countryOfResidence);
        await page.keyboard.press('Enter');

        // Uploading Resident Permit
        // await page.locator(NewApplicationLocators.residentPermitFront).setInputFiles(data.A2.residentPermitFront);
        // await page.locator(NewApplicationLocators.residentPermitFront).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });
        // await page.locator(NewApplicationLocators.residentPermitBack).setInputFiles(data.A2.residentPermitBack);
        // await page.locator(NewApplicationLocators.residentPermitBack).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

        // Entering Contact and Emergency Contact number
        await page.locator(NewApplicationLocators.contactNoTxt).fill(data.A2.contactNo);
        //await page.locator(NewApplicationLocators.emergencyContactNoTxt).fill(data.A2.emergencyNo);

        // Clicking on Save as Draft button    
        await page.locator(NewApplicationLocators.updateApplicationBtn).click();
        await page.locator(NewApplicationLocators.continueBtn).click();
      }

      await page.locator(OrgGroupsLocators.orgGroupsLeftMenu).click();
      await groupRow.locator("xpath=parent::td/preceding-sibling::td[3]/button").click();
      await page.locator(OrgGroupsLocators.viewDraftAppBtn).click();      
      await page.waitForLoadState('domcontentloaded');

      await page.locator(OrgGroupsLocators.groupTableRows+ "/td//input").first().waitFor({ state: 'visible' });            
      await page.locator(OrgGroupsLocators.selectAllCheckbox).check();

      await page.locator(OrgGroupsLocators.submitBtn).click();
      await page.locator(OrgGroupsLocators.okBtn).click();
    }
    catch (error) {
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

      // Verifying that the Application is Submitted with the Status Pending
      appRows = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending']`);
      appRowCount = await appRows.count();
      for (let i = 0; i <= appRowCount; i++) {
        await expect(appRows.nth(i)).toBeVisible();
      }

      await newApp.attachScreenshot(testInfo, `The Application is submitted with status Pending`);

      // Retrieving All Submitted Applications Data
      const subApp = await adminApi.PostRequest('/api/sc/v1/OrganizationGroup/get-all-applications', { "pageNumber": 1, "pageSize": 10, "searchTerm": visaData.orgName });
      const entryReferenceNo = subApp.jsonResponse.result.filter((appId) => appId.organizationGroupName === groupName).map(app => app.entryReference);
      const subAppGlobalId = subApp.jsonResponse.result.filter((appId) => appId.organizationGroupName === groupName).map(app => app.globalId);


      // Approving the Visa Request for each app
      for (let i = 0; i < entryReferenceNo.length; i++) {
        const approveResponse = await adminApi.PostRequest('/api/shared/v1/ExternalCallback/moi/submitted-app', { "entryReferenceNumber": entryReferenceNo[i], "status": "approved", "rejectionReason": null, "isEditable": false });
        expect(approveResponse.statusCode).toBe(200);
      }

      await page.locator(NewApplicationLocators.refreshBtn).click();
      appRows = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Payment']`);
      appRowCount = await appRows.count();
      for (let i = 0; i <= appRowCount; i++) {
        await expect(appRows.nth(i)).toBeVisible();
      }

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Payment`);

      // Updating the Payment Status for Each App
      for (let i = 0; i < subAppGlobalId.length; i++) {
        const paymentApproveRes = await adminApi.PostRequest(`/api/sc/v1/Workflow/advance-workflow/${subAppGlobalId[i]}?password=1yteBz@LeV8OBi$muRD`);
        expect(paymentApproveRes.statusCode).toBe(200);
      }

      await page.locator(AllApplicationLocators.refreshBtn).click();
      appRows = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Entry Visa']`);
      appRowCount = await appRows.count();
      for (let i = 0; i <= appRowCount; i++) {
        await expect(appRows.nth(i)).toBeVisible();
      }

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Entry Visa`);

      var dateTimeNow = new Date().toISOString();
      // Updating the Payment Status for each App
      for (let i = 0; i < entryReferenceNo.length; i++) {
        const approveAppResponse = await adminApi.PostRequest(`/api/shared/v1/ExternalCallback/moi/visa-permit`, { entryReferenceNumber: entryReferenceNo[i], visaNumber: newApp.generateRandomFiveDigit() + '12', visaEntryType: 1, visaStartDate: dateTimeNow, visaEndDate: dateTimeNow, issueDate: dateTimeNow, lastEntryDate: dateTimeNow });
        expect(approveAppResponse.statusCode).toBe(200);
      }

      await page.locator(AllApplicationLocators.refreshBtn).click();
      appRows = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Approved']`);
      appRowCount = await appRows.count();
      for (let i = 0; i <= appRowCount; i++) {
        await expect(appRows.nth(i)).toBeVisible();
      }

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

  test('Verify that the user can Submit a Bulk upload application for A3', async ({ page }, testInfo) => {
    //var visaNum = newApp.generateRandomFiveDigit() + '12';
    var data = visaData.BulkUpload_A3;
    try {
      // Fill and Save the Application as Draft
      var groupName = await newApp.fill_Bulk_Upload(testInfo, data,);

      // Navigating to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      await page.waitForLoadState('load');
      await page.locator(OrgGroupsLocators.groupTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Application is created with status Bulk-Draft
      var appRows = page.locator(OrgGroupsLocators.groupTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td/span[text()='Bulk Upload']`);
      var appRowCount = await appRows.count();
      for (let i = 0; i <= appRowCount; i++) {
        await expect(appRows.nth(i)).toBeVisible();
      }

      await newApp.attachScreenshot(testInfo, `The Bulk upload is processed ${groupName}`);

      // Navigating to Organization Groups Page
      await page.locator(OrgGroupsLocators.orgGroupsLeftMenu).waitFor({ state: "attached" });
      await page.waitForTimeout(2000);
      await page.locator(OrgGroupsLocators.orgGroupsLeftMenu).click();
      await page.locator(OrgGroupsLocators.header).waitFor({ state: "visible" });


      // Verifying that the Group is created
      var groupRow = page.locator(OrgGroupsLocators.groupTableRows).locator(`//td/p[text()='${groupName}']`);
      await expect(groupRow).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The ${groupName} is created`);

      // Filling the Applications

      // 1. Clicking on the Actions button
      await groupRow.locator("xpath=parent::td/preceding-sibling::td[3]/button").click();
      await page.locator(OrgGroupsLocators.viewBulkSummaryBtn).click();
      await page.waitForLoadState('load');

      await page.locator(OrgGroupsLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');
      //For loop
      // Editing the Application
      await page.locator(OrgGroupsLocators.groupTableRows).nth(0).waitFor({ state: 'visible' });
      await page.waitForTimeout(2000);
      var totalApps = await page.locator(OrgGroupsLocators.groupTableRows).locator("//td//button").count();

      for (let i = 0; i < totalApps; i++) {
        await page.locator(OrgGroupsLocators.groupTableRows).locator("//td//button").nth(i).click();        

        // Selecting Purpose of Visit 
        await page.locator(NewApplicationLocators.visitTypeSelect).fill(data.A3.purposeOfVisit);
        await page.locator(NewApplicationLocators.visitTypeSelect).press('Enter');

        // Selecting Passport Type
        await page.locator(NewApplicationLocators.passportTypeSelect).fill(data.A3.passportType);
        await page.locator(NewApplicationLocators.passportTypeSelect).press('Enter');

        // Selecting Job Title
        // await page.locator(NewApplicationLocators.jobTitleSelect).fill(data.A3.jobTitle);
        // await page.locator(NewApplicationLocators.jobTitleSelect).press('Enter');

        // Selecting Yes for Previous/Other Nationality Question
        if (data.A3.otherNationality) {
          await page.locator(NewApplicationLocators.otherNationalitySelect).fill('Yes');
        }
        else {
          await page.locator(NewApplicationLocators.otherNationalitySelect).fill('No');
        }

        await page.keyboard.press('Enter');

        // Selecting Expiry Data
        await newApp.fillDatePicker(NewApplicationLocators.expDateTxt,"30/01/2045");        

        // Selecting Country of Residence
        await page.locator(NewApplicationLocators.countryOfResidenceSelect).fill(data.A3.countryOfResidence);
        await page.keyboard.press('Enter');

        // Uploading Schengen Documents
        //await page.locator(NewApplicationLocators.schengenFrontDoc).setInputFiles(data.A3.schengenFront);
        //await page.locator(NewApplicationLocators.schengenFrontDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });
        await page.locator(NewApplicationLocators.schengenBackDoc).setInputFiles(data.A3.schengenBack);
        await page.locator(NewApplicationLocators.schengenBackDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

        // Entering Contact and Emergency Contact number
        await page.locator(NewApplicationLocators.contactNoTxt).fill(data.A3.contactNo);
        //await page.locator(NewApplicationLocators.emergencyContactNoTxt).fill(data.A3.emergencyNo);

        // Clicking on Save as Draft button    
        await page.locator(NewApplicationLocators.updateApplicationBtn).click();
        await page.locator(NewApplicationLocators.continueBtn).click();
      }

      await page.locator(OrgGroupsLocators.orgGroupsLeftMenu).click();
      await groupRow.locator("xpath=parent::td/preceding-sibling::td[3]/button").click();
      await page.locator(OrgGroupsLocators.viewDraftAppBtn).click();      
      await page.waitForLoadState('domcontentloaded');

      await page.locator(OrgGroupsLocators.groupTableRows+ "/td//input").first().waitFor({ state: 'visible' });            
      await page.locator(OrgGroupsLocators.selectAllCheckbox).check();

      await page.locator(OrgGroupsLocators.submitBtn).click();
      await page.locator(OrgGroupsLocators.okBtn).click();
    }
    catch (error) {
      // Deleting All Draft Applications
      await adminApi.deleteAllDraftApps(visaData.orgName);

      // Deleting the Group
      await adminApi.deleteGroup(visaData.orgName, groupName);

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    try {

      //var continueButton = page.locator(OrgGroupsLocators.continueBtn);
      //await continueButton.click();
      // Navigating to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      await page.waitForLoadState('load');
      await page.locator(AllApplicationLocators.appTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Application is Submitted with the Status Pending
      appRows = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending']`);
      appRowCount = await appRows.count();
      for (let i = 0; i <= appRowCount; i++) {
        await expect(appRows.nth(i)).toBeVisible();
      }

      await newApp.attachScreenshot(testInfo, `The Application is submitted with status Pending`);

      // Retrieving All Submitted Applications Data
      const subApp = await adminApi.PostRequest('/api/sc/v1/OrganizationGroup/get-all-applications', { "pageNumber": 1, "pageSize": 10, "searchTerm": visaData.orgName });
      const entryReferenceNo = subApp.jsonResponse.result.filter((appId) => appId.organizationGroupName === groupName).map(app => app.entryReference);
      const subAppGlobalId = subApp.jsonResponse.result.filter((appId) => appId.organizationGroupName === groupName).map(app => app.globalId);


      // Approving the Visa Request for each app
      for (let i = 0; i < entryReferenceNo.length; i++) {
        const approveResponse = await adminApi.PostRequest('/api/shared/v1/ExternalCallback/moi/submitted-app', { "entryReferenceNumber": entryReferenceNo[i], "status": "approved", "rejectionReason": null, "isEditable": false });
        expect(approveResponse.statusCode).toBe(200);
      }

      await page.locator(NewApplicationLocators.refreshBtn).click();
      appRows = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Payment']`);
      appRowCount = await appRows.count();
      for (let i = 0; i <= appRowCount; i++) {
        await expect(appRows.nth(i)).toBeVisible();
      }

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Payment`);

      // Updating the Payment Status for Each App
      for (let i = 0; i < subAppGlobalId.length; i++) {
        const paymentApproveRes = await adminApi.PostRequest(`/api/sc/v1/Workflow/advance-workflow/${subAppGlobalId[i]}?password=1yteBz@LeV8OBi$muRD`);
        expect(paymentApproveRes.statusCode).toBe(200);
      }

      await page.locator(AllApplicationLocators.refreshBtn).click();
      appRows = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Entry Visa']`);
      appRowCount = await appRows.count();
      for (let i = 0; i <= appRowCount; i++) {
        await expect(appRows.nth(i)).toBeVisible();
      }

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Entry Visa`);
      
      // Updating the Payment Status for each App
      for (let i = 0; i < entryReferenceNo.length; i++) {
        const approveAppResponse = await adminApi.PostRequest(`/api/shared/v1/ExternalCallback/moi/visa-permit`, { entryReferenceNumber: entryReferenceNo[i], visaNumber: newApp.generateRandomFiveDigit() + '12', visaEntryType: 1, visaStartDate: "2025-07-15T21:44:58.147Z", visaEndDate: "2025-07-15T21:44:58.147Z", issueDate: "2025-07-15T21:44:58.147Z", lastEntryDate: "2025-07-15T21:44:58.147Z" });
        expect(approveAppResponse.statusCode).toBe(200);
      }

      await page.locator(AllApplicationLocators.refreshBtn).click();
      appRows = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Approved']`);
      appRowCount = await appRows.count();
      for (let i = 0; i <= appRowCount; i++) {
        await expect(appRows.nth(i)).toBeVisible();
      }

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Approved`);      
    } catch (error) {
      await page.waitForTimeout(10000);
      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    // Deleting the Profile
    await adminApi.deleteCompleteProfile(groupName);
    // Deleting the Group
    await adminApi.deleteGroup(visaData.orgName, groupName);
  });

  test('Verify that the user can Submit a Bulk upload application for D1 For Passport', async ({ page }, testInfo) => {
    var data = visaData.BulkUpload_D1;
    try {
      // Fill and Save the Application as Draft
      var groupName = await newApp.fill_Bulk_Upload(testInfo, data);

      // Navigating to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      await page.waitForLoadState('domcontentloaded');
      await page.locator(OrgGroupsLocators.groupTableRows).first().waitFor({ state: 'visible', timeout: 30000 });

      // Verifying that the Application is created with status Bulk-Draft
      var appRows = page.locator(OrgGroupsLocators.groupTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td/span[text()='Bulk Upload']`);
      var appRowCount = await appRows.count();
      console.log(`Total Rows: ${appRowCount}`);
      for (let i = 0; i < appRowCount; i++) {
        await expect(appRows.nth(i)).toBeVisible();
      }

      await newApp.attachScreenshot(testInfo, `The Bulk upload is processed ${groupName}`);

      // Navigating to Organization Groups Page
      await page.locator(OrgGroupsLocators.orgGroupsLeftMenu).waitFor({ state: "attached" });
      await page.waitForTimeout(2000);
      await page.locator(OrgGroupsLocators.orgGroupsLeftMenu).click();
      await page.locator(OrgGroupsLocators.header).waitFor({ state: "visible" });


      // Verifying that the Group is created
      var groupRow = page.locator(OrgGroupsLocators.groupTableRows).locator(`//td/p[text()='${groupName}']`);
      await expect(groupRow).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The ${groupName} is created`);

      // Filling the Applications

      // 1. Clicking on the Actions button
      await groupRow.locator("xpath=parent::td/preceding-sibling::td[3]/button").click();

      await page.locator(OrgGroupsLocators.viewBulkSummaryBtn).click();
      await page.waitForLoadState('load');

      await page.locator(OrgGroupsLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');
      //For loop
      // Editing the Application
      await page.locator(OrgGroupsLocators.groupTableRows).nth(0).waitFor({ state: 'visible' });
      await page.waitForTimeout(2000);
      var totalApps = await page.locator(OrgGroupsLocators.groupTableRows).locator("//td//button").count();

      for (let i = 0; i < totalApps; i++) {
        await page.locator(OrgGroupsLocators.groupTableRows).locator("//td//button").nth(i).click();        


        // Selecting Occupation Type
        await page.locator(NewApplicationLocators.occupationTypeSelect).fill(data.D1.occupationType);
        await page.locator(NewApplicationLocators.occupationTypeSelect).press('Enter')

        // Selecting Passport Type
        await page.locator(NewApplicationLocators.passportTypeSelect).fill(data.D1.passportType);
        await page.locator(NewApplicationLocators.passportTypeSelect).press('Enter');

        // Setting Issue Date
        await newApp.fillDatePicker(NewApplicationLocators.issueDateTxt, '16/07/2025');

        // Selecting Country of Birth
        await page.locator(NewApplicationLocators.countryOfBirthSelect).fill(data.D1.country);
        await page.locator(NewApplicationLocators.countryOfBirthSelect).press('Enter');

        // Selecting Country of Residence
        await page.locator(NewApplicationLocators.countryOfResidenceSelect).fill(data.D1.countryOfResidence);
        await page.keyboard.press('Enter');

        // Selecting the Job Title
        await page.locator(NewApplicationLocators.jobTitleSelect).fill(data.D1.jobTitle);
        await page.locator(NewApplicationLocators.jobTitleSelect).press('Enter');

        // Selecting Yes for Previous/Other Nationality Question
        if (data.D1.otherNationality) {
          await page.locator(NewApplicationLocators.otherNationalitySelect).fill("Yes");
        }
        else {
          await page.locator(NewApplicationLocators.otherNationalitySelect).fill("No");
        }
        await page.keyboard.press('Enter');

        // Selecting Marital Status
        await page.locator(NewApplicationLocators.maritalStatusSelect).fill(data.D1.maritalStatus);
        await page.locator(NewApplicationLocators.maritalStatusSelect).press('Enter');

        // Entering Place Of Birth
        await page.locator(NewApplicationLocators.placeOfBirthTxt).fill(data.D1.placeOfBirth);

        // uploading Candidate Approval Doc
        await page.locator(NewApplicationLocators.candidateApprovalDoc).setInputFiles(data.D1.candidateApprovalDoc);
        await page.locator(NewApplicationLocators.candidateApprovalDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

        // Entering Contact and Emergency Contact number
        await page.locator(NewApplicationLocators.contactNoTxt).fill(data.D1.contactNo);
        //await page.locator(NewApplicationLocators.emergencyContactNoTxt).fill(data.D1.emergencyNo);

        // // Filling Relationship
        // await page.locator("//label[text()='Relationship']/following-sibling::div//input").fill("Brother");
        // await page.locator("//label[text()='Relationship']/following-sibling::div//input").press('Enter');
        
        // Clicking on Save as Draft button    
        await page.locator(NewApplicationLocators.updateApplicationBtn).click();
        await page.locator(NewApplicationLocators.continueBtn).click();
      }

      await page.locator(OrgGroupsLocators.orgGroupsLeftMenu).click();
      await groupRow.locator("xpath=parent::td/preceding-sibling::td[3]/button").click();
      await page.locator(OrgGroupsLocators.viewDraftAppBtn).click();      
      await page.waitForLoadState('domcontentloaded');

      await page.locator(OrgGroupsLocators.groupTableRows+ "/td//input").first().waitFor({ state: 'visible' });            
      await page.locator(OrgGroupsLocators.selectAllCheckbox).check();

      await page.locator(OrgGroupsLocators.submitBtn).click();
      await page.locator(OrgGroupsLocators.okBtn).click();

    }

    catch (error) {
      // Deleting All Draft Applications
      await adminApi.deleteAllDraftApps(visaData.orgName);

      // Deleting the Group
      adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }
    try {
      // Navigating to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      await page.waitForLoadState('load');
      await page.locator(AllApplicationLocators.appTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Application is Submitted with the Status Pending
      appRows = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending']`);
      appRowCount = await appRows.count();
      for (let i = 0; i <= appRowCount; i++) {
        await expect(appRows.nth(i)).toBeVisible();
      }

      await newApp.attachScreenshot(testInfo, `The Application is submitted with status Pending`);

      // Retrieving All Submitted Applications Data
      const subApp = await adminApi.PostRequest('pi/sc/v1/OrganizationGroup/get-all-applications', { "pageNumber": 1, "pageSize": 10, "searchTerm": visaData.orgName });
      const entryReferenceNo = subApp.jsonResponse.result.filter((appId) => appId.organizationGroupName === groupName).map(app => app.entryReference);
      const subAppGlobalId = subApp.jsonResponse.result.filter((appId) => appId.organizationGroupName === groupName).map(app => app.globalId);


      // Approving the Visa Request for each app
      for (let i = 0; i < entryReferenceNo.length; i++) {
        const approveResponse = await adminApi.PostRequest('/api/shared/v1/ExternalCallback/moi/submitted-app', { "entryReferenceNumber": entryReferenceNo[i], "status": "approved", "rejectionReason": null, "isEditable": false });
        expect(approveResponse.statusCode).toBe(200);
      }

      await page.locator(NewApplicationLocators.refreshBtn).click();
      appRows = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Payment']`);
      appRowCount = await appRows.count();
      for (let i = 0; i <= appRowCount; i++) {
        await expect(appRows.nth(i)).toBeVisible();
      }

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Payment`);

      // Updating the Payment Status for Each App
      for (let i = 0; i < subAppGlobalId.length; i++) {
        const paymentApproveRes = await adminApi.PostRequest(`/api/sc/v1/Workflow/advance-workflow/${subAppGlobalId[i]}?password=1yteBz@LeV8OBi$muRD`);
        expect(paymentApproveRes.statusCode).toBe(200);
      }

      await page.locator(AllApplicationLocators.refreshBtn).click();
      appRows = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Entry Visa']`);
      appRowCount = await appRows.count();
      for (let i = 0; i <= appRowCount; i++) {
        await expect(appRows.nth(i)).toBeVisible();
      }

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Entry Visa`);

      // Updating the Payment Status for each App
      for (let i = 0; i < entryReferenceNo.length; i++) {
        const approveAppResponse = await adminApi.PostRequest(`/api/shared/v1/ExternalCallback/moi/visa-permit`, { entryReferenceNumber: entryReferenceNo[i], visaNumber: newApp.generateRandomFiveDigit() + '12', visaEntryType: 0, visaStartDate: "2025-07-15T21:44:58.147Z", visaEndDate: "2025-07-15T21:44:58.147Z", issueDate: "2025-07-15T21:44:58.147Z", lastEntryDate: "2025-07-15T21:44:58.147Z" });
        expect(approveAppResponse.statusCode).toBe(200);
      }

      appRows = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Approved']`);
      appRowCount = await appRows.count();
      for (let i = 0; i <= appRowCount; i++) {
        await expect(appRows.nth(i)).toBeVisible();
      }

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Approved`);
      let profileId;
      // Getting Application Data for each Submitted Application
      appRowCount = await appRows.count();
      for (let i = 0; i < subAppGlobalId.length; i++) {
        getAppData = await adminApi.GetRequest(`/api/b2b/v1/OrganizationGroup/get-application-by-id/${subAppGlobalId}`);
        profileId.push(getAppData.result.find((appId) => appId.organizationGroupName === groupName).userProfileId);
      }
    } catch (error) {
      await page.waitForTimeout(10000);
      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }
    // Deleting the Profile
    await adminApi.deleteCompleteProfile(groupName);
    // Deleting the Group
    await adminApi.deleteGroup(visaData.orgName, groupName);
  });

  test('Verify that the user can Submit a Bulk upload application for D2 For Passport', async ({ page }, testInfo) => {
    var data = visaData.BulkUpload_D2;

    try {
      // Fill and Save the Application as Draft
      var groupName = await newApp.fill_Bulk_Upload(testInfo, data);      
      // Navigating to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      await page.waitForLoadState('load');
      await page.locator(OrgGroupsLocators.groupTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Application is created with status Bulk-Draft
      var row = page.locator(OrgGroupsLocators.groupTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td/span[text()='Bulk Upload']`);
      const rowCount = await row.count();
      for (let i = 0; i < rowCount; i++) {
        await expect(row.nth(i)).toBeVisible();
      }

      await newApp.attachScreenshot(testInfo, `The Bulk upload is processed ${groupName}`);

      // Navigating to Organization Groups Page      
      await page.locator(OrgGroupsLocators.orgGroupsLeftMenu).waitFor({ state: "attached" });
      await page.waitForTimeout(2000);
      await page.locator(OrgGroupsLocators.orgGroupsLeftMenu).click();
      await page.locator(OrgGroupsLocators.header).waitFor({ state: "visible" });


      // Verifying that the Group is created
      var groupRow = page.locator(OrgGroupsLocators.groupTableRows).locator(`//td/p[text()='${groupName}']`);
      await expect(groupRow).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The ${groupName} is created`);

      // Filling the Applications

      // 1. Clicking on the Actions button
      await groupRow.locator("xpath=parent::td/preceding-sibling::td[3]/button").click();
      await page.locator(OrgGroupsLocators.viewBulkSummaryBtn).click();
      await page.waitForLoadState('load');

      await page.locator(OrgGroupsLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');
      //For loop
      // Editing the Application
      await page.locator(OrgGroupsLocators.groupTableRows).nth(0).waitFor({ state: 'visible' });
      await page.waitForTimeout(2000);
      var totalApps = await page.locator(OrgGroupsLocators.groupTableRows).locator("//td//button").count();

      for (let i = 0; i < totalApps; i++) {
        await page.locator(OrgGroupsLocators.groupTableRows).locator("//td//button").nth(i).click();        


        // Selecting Occupation Type
        await page.locator(NewApplicationLocators.occupationTypeSelect).fill(data.D2.occupationType);
        await page.locator(NewApplicationLocators.occupationTypeSelect).press('Enter');

        // Selecting Purpose of Visit 
        await page.locator(NewApplicationLocators.visitTypeSelect).fill(data.D2.purposeOfVisit);
        await page.locator(NewApplicationLocators.visitTypeSelect).press('Enter')

        // Selecting Passport Type
        await page.locator(NewApplicationLocators.passportTypeSelect).fill(data.D2.passportType);
        await page.locator(NewApplicationLocators.passportTypeSelect).press('Enter');

        // Setting Issue Date
        await newApp.fillDatePicker(NewApplicationLocators.issueDateTxt, '16/07/2025');

        // Selecting Country of Birth
        await page.locator(NewApplicationLocators.countryOfBirthSelect).fill(data.D2.country);
        await page.locator(NewApplicationLocators.countryOfBirthSelect).press('Enter');

        // Selecting Country of Residence
        await page.locator(NewApplicationLocators.countryOfResidenceSelect).fill(data.D2.countryOfResidence);
        await page.locator(NewApplicationLocators.countryOfResidenceSelect).press('Enter');

        // Selecting Previous/Other Nationality Question
        if (data.D2.otherNationality) {
          await page.locator(NewApplicationLocators.otherNationalitySelect).fill('Yes');
        }
        else {
          await page.locator(NewApplicationLocators.otherNationalitySelect).fill('No');
        }
        await page.keyboard.press('Enter');

        // Entering Place Of Birth
        await page.locator(NewApplicationLocators.placeOfBirthTxt).fill(data.D2.placeOfBirth);

        // Uploading Police Clearance Doc
        await page.locator(NewApplicationLocators.policeClearanceDoc).setInputFiles(data.D2.policeClearanceDoc);
        await page.locator(NewApplicationLocators.policeClearanceDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

        // Uploading Authenticated Degree Doc
        await page.locator(NewApplicationLocators.degreeDoc).setInputFiles(data.D2.degreeDoc);
        await page.locator(NewApplicationLocators.degreeDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

        // Uploading Sectoral Endorsement Letter Doc
        await page.locator(NewApplicationLocators.sectoralEndorsementDoc).setInputFiles(data.D2.sectoralEndorsementDoc);
        await page.locator(NewApplicationLocators.sectoralEndorsementDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

        // Uploading Valid International license to practice Medicine Doc
        await page.locator(NewApplicationLocators.medLicenseDoc).setInputFiles(data.D2.medLicenseDoc);
        await page.locator(NewApplicationLocators.medLicenseDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

        // Uploading CV (including proof of experience)
        await page.locator(NewApplicationLocators.cvDoc).setInputFiles(data.D2.cvDoc);
        await page.locator(NewApplicationLocators.cvDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

        // Uploading Case Research Report
        await page.locator(NewApplicationLocators.caseResearchDoc).setInputFiles(data.D2.caseResearchDoc);
        await page.locator(NewApplicationLocators.caseResearchDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

        // Uploading Certificate of Good Standing
        await page.locator(NewApplicationLocators.goodStandingCertDoc).setInputFiles(data.D2.goodStandingCertDoc);
        await page.locator(NewApplicationLocators.goodStandingCertDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

        // Uploading Personal Bank Statement (Last 3 months)
        await page.locator(NewApplicationLocators.bankStatementDoc).setInputFiles(data.D2.bankStatementDoc);
        await page.locator(NewApplicationLocators.bankStatementDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

        // Uploading Job Contract or Offer letter from Hiring entity
        await page.locator(NewApplicationLocators.offerLetterDoc).setInputFiles(data.D2.offerLetterDoc);
        await page.locator(NewApplicationLocators.offerLetterDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

        // Entering Contact and Emergency Contact number
        await page.locator(NewApplicationLocators.contactNoTxt).fill(data.D2.contactNo);
        //await page.locator(NewApplicationLocators.emergencyContactNoTxt).fill(data.D2.emergencyNo);

        // Clicking on Save as Draft button    
        await page.locator(NewApplicationLocators.updateApplicationBtn).click();
        await page.locator(NewApplicationLocators.continueBtn).click();
      }

      await page.locator(OrgGroupsLocators.orgGroupsLeftMenu).click();
      await groupRow.locator("xpath=parent::td/preceding-sibling::td[3]/button").click();
      await page.locator(OrgGroupsLocators.viewDraftAppBtn).click();      
      await page.waitForLoadState('domcontentloaded');

      await page.locator(OrgGroupsLocators.groupTableRows+ "/td//input").first().waitFor({ state: 'visible' });            
      await page.locator(OrgGroupsLocators.selectAllCheckbox).check();

      await page.locator(OrgGroupsLocators.submitBtn).click();
      await page.locator(OrgGroupsLocators.okBtn).click();

      
    }
    catch (error) {
      // Deleting All Draft Applications
      await adminApi.deleteAllDraftApps(visaData.orgName);

      // Deleting the Group
      adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }
    try {
      // Navigating to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      await page.waitForLoadState('load');
      await page.locator(AllApplicationLocators.appTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Application is Submitted with the Status Pending
      appRows = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending']`);
      appRowCount = await appRows.count();
      for (let i = 0; i <= appRowCount; i++) {
        await expect(appRows.nth(i)).toBeVisible();
      }

      await newApp.attachScreenshot(testInfo, `The Application is submitted with status Pending`);

      // Retrieving All Submitted Applications Data
      const subApp = await adminApi.PostRequest('/api/sc/v1/OrganizationGroup/get-all-applications', { "pageNumber": 1, "pageSize": 10, "searchTerm": visaData.orgName });
      const entryReferenceNo = subApp.jsonResponse.result.filter((appId) => appId.organizationGroupName === groupName).map(app => app.entryReference);
      const subAppGlobalId = subApp.jsonResponse.result.filter((appId) => appId.organizationGroupName === groupName).map(app => app.globalId);


      // Approving the Visa Request for each app
      for (let i = 0; i < entryReferenceNo.length; i++) {
        const approveResponse = await adminApi.PostRequest('/api/shared/v1/ExternalCallback/moi/submitted-app', { "entryReferenceNumber": entryReferenceNo[i], "status": "approved", "rejectionReason": null, "isEditable": false });
        expect(approveResponse.statusCode).toBe(200);
      }

      await page.locator(NewApplicationLocators.refreshBtn).click();
      appRows = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Payment']`);
      appRowCount = await appRows.count();
      for (let i = 0; i <= appRowCount; i++) {
        await expect(appRows.nth(i)).toBeVisible();
      }

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Payment`);

      // Updating the Payment Status for Each App
      for (let i = 0; i < subAppGlobalId.length; i++) {
        const paymentApproveRes = await adminApi.PostRequest(`/api/sc/v1/Workflow/advance-workflow/${subAppGlobalId[i]}?password=1yteBz@LeV8OBi$muRD`);
        expect(paymentApproveRes.statusCode).toBe(200);
      }

      await page.locator(AllApplicationLocators.refreshBtn).click();
      appRows = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Entry Visa']`);
      appRowCount = await appRows.count();
      for (let i = 0; i <= appRowCount; i++) {
        await expect(appRows.nth(i)).toBeVisible();
      }

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Entry Visa`);

      // Updating the Payment Status for each App
      for (let i = 0; i < entryReferenceNo.length; i++) {
        const approveAppResponse = await adminApi.PostRequest(`/api/shared/v1/ExternalCallback/moi/visa-permit`, { entryReferenceNumber: entryReferenceNo[i], visaNumber: newApp.generateRandomFiveDigit() + '12', visaEntryType: 0, visaStartDate: "2025-07-15T21:44:58.147Z", visaEndDate: "2025-07-15T21:44:58.147Z", issueDate: "2025-07-15T21:44:58.147Z", lastEntryDate: "2025-07-15T21:44:58.147Z" });
        expect(approveAppResponse.statusCode).toBe(200);
      }

      appRows = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Approved']`);
      appRowCount = await appRows.count();
      for (let i = 0; i <= appRowCount; i++) {
        await expect(appRows.nth(i)).toBeVisible();
      }

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Approved`);
      let profileId;
      // Getting Application Data for each Submitted Application
      appRowCount = await appRows.count();
      for (let i = 0; i < subAppGlobalId.length; i++) {
        getAppData = await adminApi.GetRequest(`/api/b2b/v1/OrganizationGroup/get-application-by-id/${subAppGlobalId}`);
        profileId.push(getAppData.result.find((appId) => appId.organizationGroupName === groupName).userProfileId);
      }
    } catch (error) {
      await page.waitForTimeout(10000);
      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }
    // Deleting the Profile
    await adminApi.deleteCompleteProfile(groupName);
    // Deleting the Group
    await adminApi.deleteGroup(visaData.orgName, groupName);
  });

  test('Verify that the user can Submit a Bulk upload application for D3 For Passport', async ({ page }, testInfo) => {
    var data = visaData.BulkUpload_D3;

    try {
      // Fill and Save the Application as Draft
      var groupName = await newApp.fill_Bulk_Upload(testInfo, data,);
      // Navigating to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      await page.waitForLoadState('load');
      await page.locator(OrgGroupsLocators.groupTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Application is created with status Bulk-Draft
      var row = page.locator(OrgGroupsLocators.groupTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td/span[text()='Bulk Upload']`);
      const rowCount = await row.count();
      for (let i = 0; i < rowCount; i++) {
        await expect(row.nth(i)).toBeVisible();
      }

      await newApp.attachScreenshot(testInfo, `The Bulk upload is processed ${groupName}`);

      // Navigating to Organization Groups Page
      await page.locator(OrgGroupsLocators.orgGroupsLeftMenu).waitFor({ state: "attached" });
      await page.waitForTimeout(2000);
      await page.locator(OrgGroupsLocators.orgGroupsLeftMenu).click();
      await page.locator(OrgGroupsLocators.header).waitFor({ state: "visible" });


      // Verifying that the Group is created
      var groupRow = page.locator(OrgGroupsLocators.groupTableRows).locator(`//td/p[text()='${groupName}']`);
      await expect(groupRow).toBeVisible();

      await newApp.attachScreenshot(testInfo, `The ${groupName} is created`);

      // Filling the Applications

      // 1. Clicking on the Actions button
      await groupRow.locator("xpath=parent::td/preceding-sibling::td[3]/button").click();
      await page.locator(OrgGroupsLocators.viewBulkSummaryBtn).click();
      await page.waitForLoadState('load');

      await page.locator(OrgGroupsLocators.viewDetailsBtn).click();
      await page.waitForLoadState('load');
      //For loop
      // Editing the Application
      await page.locator(OrgGroupsLocators.groupTableRows).nth(0).waitFor({ state: 'visible' });
      await page.waitForTimeout(2000);
      var totalApps = await page.locator(OrgGroupsLocators.groupTableRows).locator("//td//button").count();

      for (let i = 0; i < totalApps; i++) {
        await page.locator(OrgGroupsLocators.groupTableRows).locator("//td//button").nth(i).click();        

        // Selecting Occupation Type
        await page.locator(NewApplicationLocators.occupationTypeSelect).fill(data.D3.occupationType);
        await page.locator(NewApplicationLocators.occupationTypeSelect).press('Enter');

        // Selecting Purpose of Visit 
        await page.locator(NewApplicationLocators.visitTypeSelect).fill(data.D3.purposeOfVisit);
        await page.locator(NewApplicationLocators.visitTypeSelect).press('Enter')

        // Selecting Passport Type
        await page.locator(NewApplicationLocators.passportTypeSelect).fill(data.D3.passportType);
        await page.locator(NewApplicationLocators.passportTypeSelect).press('Enter');

        // Setting Issue Date
        await newApp.fillDatePicker(NewApplicationLocators.issueDateTxt, '16/07/2025');

        // Selecting Country of Birth
        await page.locator(NewApplicationLocators.countryOfBirthSelect).fill(data.D3.country);
        await page.locator(NewApplicationLocators.countryOfBirthSelect).press('Enter');

        // Selecting Country of Residence
        await page.locator(NewApplicationLocators.countryOfResidenceSelect).fill(data.D3.countryOfResidence);
        await page.locator(NewApplicationLocators.countryOfResidenceSelect).press('Enter');

        // Selecting Previous/Other Nationality Question
        if (data.D3.otherNationality) {
          await page.locator(NewApplicationLocators.otherNationalitySelect).fill('Yes');
        }
        else {
          await page.locator(NewApplicationLocators.otherNationalitySelect).fill('No');
        }
        await page.keyboard.press('Enter');

        // Entering Place Of Birth
        await page.locator(NewApplicationLocators.placeOfBirthTxt).fill(data.D3.placeOfBirth);

        // Uploading Police Clearance Doc
        await page.locator(NewApplicationLocators.policeClearanceDoc).setInputFiles(data.D3.policeClearanceDoc);
        await page.locator(NewApplicationLocators.policeClearanceDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

        // Uploading Authenticated Degree Doc
        await page.locator(NewApplicationLocators.degreeDoc).setInputFiles(data.D3.degreeDoc);
        await page.locator(NewApplicationLocators.degreeDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

        // Uploading CV (including proof of experience)
        await page.locator(NewApplicationLocators.cvDoc).setInputFiles(data.D3.cvDoc);
        await page.locator(NewApplicationLocators.cvDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

        // Uploading Case Research Report
        await page.locator(NewApplicationLocators.caseResearchDoc).setInputFiles(data.D3.caseResearchDoc);
        await page.locator(NewApplicationLocators.caseResearchDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

        // Uploading Personal Bank Statement (Last 3 months)
        await page.locator(NewApplicationLocators.bankStatementDoc).setInputFiles(data.D3.bankStatementDoc);
        await page.locator(NewApplicationLocators.bankStatementDoc).locator("xpath=following-sibling::div//img[@alt='Preview']").waitFor({ state: "visible" });

        // Clicking on Save as Draft button    
        await page.locator(NewApplicationLocators.updateApplicationBtn).click();
        await page.locator(NewApplicationLocators.continueBtn).click();
      }

      await page.locator(OrgGroupsLocators.orgGroupsLeftMenu).click();
      await groupRow.locator("xpath=parent::td/preceding-sibling::td[3]/button").click();
      await page.locator(OrgGroupsLocators.viewDraftAppBtn).click();      
      await page.waitForLoadState('domcontentloaded');

      await page.locator(OrgGroupsLocators.groupTableRows+ "/td//input").first().waitFor({ state: 'visible' });            
      await page.locator(OrgGroupsLocators.selectAllCheckbox).check();

      await page.locator(OrgGroupsLocators.submitBtn).click();
      await page.locator(OrgGroupsLocators.okBtn).click(); 
    }
    catch (error) {
      // Deleting All Draft Applications
      await adminApi.deleteAllDraftApps(visaData.orgName);

      // Deleting the Group
      adminApi.deleteGroup(visaData.orgName, groupName)

      throw new Error(`Test failed :${error instanceof Error ? error.stack : error}`);
    }

    try {
      // Navigating to All Applications Page
      await page.locator(AllApplicationLocators.allAppLeftMenuBtn).click();
      await page.waitForLoadState('load');
      await page.locator(AllApplicationLocators.appTableRows).first().waitFor({ state: 'visible' });

      // Verifying that the Application is Submitted with the Status Pending
      appRows = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending']`);
      appRowCount = await appRows.count();
      for (let i = 0; i <= appRowCount; i++) {
        await expect(appRows.nth(i)).toBeVisible();
      }

      await newApp.attachScreenshot(testInfo, `The Application is submitted with status Pending`);

      // Retrieving All Submitted Applications Data
      const subApp = await adminApi.PostRequest('/api/sc/v1/OrganizationGroup/get-all-applications', { "pageNumber": 1, "pageSize": 10, "searchTerm": visaData.orgName });
      const entryReferenceNo = subApp.jsonResponse.result.filter((appId) => appId.organizationGroupName === groupName).map(app => app.entryReference);
      const subAppGlobalId = subApp.jsonResponse.result.filter((appId) => appId.organizationGroupName === groupName).map(app => app.globalId);


      // Approving the Visa Request for each app
      for (let i = 0; i < entryReferenceNo.length; i++) {
        const approveResponse = await adminApi.PostRequest('/api/shared/v1/ExternalCallback/moi/submitted-app', { "entryReferenceNumber": entryReferenceNo[i], "status": "approved", "rejectionReason": null, "isEditable": false });
        expect(approveResponse.statusCode).toBe(200);
      }

      await page.locator(NewApplicationLocators.refreshBtn).click();
      appRows = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Payment']`);
      appRowCount = await appRows.count();
      for (let i = 0; i <= appRowCount; i++) {
        await expect(appRows.nth(i)).toBeVisible();
      }

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Payment`);

      // Updating the Payment Status for Each App
      for (let i = 0; i < subAppGlobalId.length; i++) {
        const paymentApproveRes = await adminApi.PostRequest(`/api/sc/v1/Workflow/advance-workflow/${subAppGlobalId[i]}?password=1yteBz@LeV8OBi$muRD`);
        expect(paymentApproveRes.statusCode).toBe(200);
      }

      await page.locator(AllApplicationLocators.refreshBtn).click();
      appRows = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Pending Entry Visa']`);
      appRowCount = await appRows.count();
      for (let i = 0; i <= appRowCount; i++) {
        await expect(appRows.nth(i)).toBeVisible();
      }

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Pending Entry Visa`);

      // Updating the Payment Status for each App
      for (let i = 0; i < entryReferenceNo.length; i++) {
        const approveAppResponse = await adminApi.PostRequest(`/api/shared/v1/ExternalCallback/moi/visa-permit`, { entryReferenceNumber: entryReferenceNo[i], visaNumber: newApp.generateRandomFiveDigit() + '12', visaEntryType: 0, visaStartDate: "2025-07-15T21:44:58.147Z", visaEndDate: "2025-07-15T21:44:58.147Z", issueDate: "2025-07-15T21:44:58.147Z", lastEntryDate: "2025-07-15T21:44:58.147Z" });
        expect(approveAppResponse.statusCode).toBe(200);
      }

      appRows = page.locator(AllApplicationLocators.appTableRows).locator(`//td/p[text()='${groupName}']/parent::td/preceding-sibling::td[15]/span[text()='Approved']`);
      appRowCount = await appRows.count();
      for (let i = 0; i <= appRowCount; i++) {
        await expect(appRows.nth(i)).toBeVisible();
      }

      await newApp.attachScreenshot(testInfo, `The Application Status changed to Approved`);
      let profileId;
      // Getting Application Data for each Submitted Application
      appRowCount = await appRows.count();
      for (let i = 0; i < subAppGlobalId.length; i++) {
        getAppData = await adminApi.GetRequest(`/api/b2b/v1/OrganizationGroup/get-application-by-id/${subAppGlobalId}`);
        profileId.push(getAppData.result.find((appId) => appId.organizationGroupName === groupName).userProfileId);
      }
    } catch (error) {
      await page.waitForTimeout(10000);
      // Deleting Complete Profile
      await adminApi.deleteCompleteProfile(groupName);
      // Deleting the Group
      adminApi.deleteGroup(visaData.orgName, groupName)

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