import { test, expect } from '@playwright/test';
const fs = require('fs');
import API from '../../Pages/api';
import LoginPage from '../../Pages/loginPage';
const { OrganizationLocators } = require('../../Locators/organizationLocators');

test.describe.configure({ mode: 'parallel' }); 

test.describe('Organizations Page', () => {  
  var loginPage;    
  let credentials;
  let apiConfig;    
  let adminApi;
  let adminUserData;  
  test.beforeEach(async ({ page }, testInfo) => {    
    
    apiConfig = JSON.parse(fs.readFileSync('./src/utils/apiConfig.json', 'utf-8'));
    adminApi = new API(page, apiConfig.baseUrl);
    loginPage = new LoginPage(page);    

    credentials = JSON.parse(fs.readFileSync('./src/utils/userCreds.json', 'utf-8'));

    await adminApi.init(); // Initialize the API instance
    adminUserData = await adminApi.GetAccessToken(credentials.adminUser);    

    // Logging in before each test    
    await loginPage.login(testInfo, credentials.requestorUsers.existingUser);
  });

  test('Verify that the Requester can see Visa Quota, Event and Visa Types', async ({ page }, testInfo) => {

    await page.click(OrganizationLocators.organizationLeftMenuBtn);
    await page.waitForSelector(OrganizationLocators.orgDetails);

    // Verify Visa Quota fields are visible
    let totalVisaQuota = await page.locator(OrganizationLocators.visaQuotas).count();

    for (let i = 0; i < totalVisaQuota; i++) {
      let title = page.locator(OrganizationLocators.visaQuotas).nth(i).locator('//span/div');
      let totalQuota = page.locator(OrganizationLocators.visaQuotas).nth(i).locator("//span/p[contains(text(),'Total Quota:')]/b");
      let distributedQuota = page.locator(OrganizationLocators.visaQuotas).nth(i).locator("//span/p[contains(text(),'Distributed Quota:')]/b");
      let consumedQuota = page.locator(OrganizationLocators.visaQuotas).nth(i).locator("//span/p[contains(text(),'Consumed Quota:')]/b");

      // enusuring all fields are visible and not null
      await expect(title).toBeVisible();      
      await expect(totalQuota).toBeVisible();
      await expect(distributedQuota).toBeVisible();
      await expect(consumedQuota).toBeVisible();

      expect(await title.textContent()).not.toBeNull();
      expect(await totalQuota.textContent()).not.toBeNull();
      expect(await distributedQuota.textContent()).not.toBeNull();
      expect(await consumedQuota.textContent()).not.toBeNull();    
    }

    // Verify Requested Visa Quota and Event fields are visible
    let totalRequestedVisaQuota = await page.locator(OrganizationLocators.requestedVisaQuotas).count();

    for (let i = 0; i < totalRequestedVisaQuota; i++) {
      let visaTypeAbbreviation = page.locator(OrganizationLocators.requestedVisaQuotas).nth(i).locator("//div[@title]");
      let noOfApplicants = page.locator(OrganizationLocators.requestedVisaQuotas).nth(i).locator("//div/span[contains(text(),'No of Applicants')]/following-sibling::span");
      let visaTypeTitle = page.locator(OrganizationLocators.requestedVisaQuotas).nth(i).locator("//div[1]/div/div[2]");      

      // enusuring all fields are visible and not null
      await expect(visaTypeAbbreviation).toBeVisible();      
      await expect(noOfApplicants).toBeVisible();
      await expect(visaTypeTitle).toBeVisible();      

      expect(await visaTypeAbbreviation.textContent()).not.toBeNull();
      expect(await noOfApplicants.textContent()).not.toBeNull();
      expect(await visaTypeTitle.textContent()).not.toBeNull(); 
    }

    // Verify Admins fields are visible
    let totalAdmins = await page.locator(OrganizationLocators.admins).count();
    for (let i = 0; i < totalAdmins; i++) {
      let isActive = page.locator(OrganizationLocators.representatives).nth(i).locator("//span");
      let firstName = page.locator(OrganizationLocators.admins).nth(i).locator("//p[text()='First Name']/following-sibling::p");
      let lastName = page.locator(OrganizationLocators.admins).nth(i).locator("//p[text()='Last Name']/following-sibling::p");
      let contact = page.locator(OrganizationLocators.admins).nth(i).locator("//p[text()='Contact']/following-sibling::p");
      let nationality = page.locator(OrganizationLocators.admins).nth(i).locator("//p[text()='Nationality']/following-sibling::p");
      let status = page.locator(OrganizationLocators.admins).nth(i).locator("//p[text()='Status']/following-sibling::p");
      let email = page.locator(OrganizationLocators.admins).nth(i).locator("//p[text()='Email']/following-sibling::p");

      // enusuring all fields are visible
      await expect(isActive).toBeVisible();
      await expect(firstName).toBeVisible();      
      await expect(lastName).toBeVisible();
      await expect(contact).toBeVisible();
      await expect(nationality).toBeVisible();
      await expect(status).toBeVisible();
      await expect(email).toBeVisible();      

      // enusuring all fields are not null
      expect(await isActive.textContent()).not.toBeNull();
      expect(await firstName.textContent()).not.toBeNull();
      expect(await lastName.textContent()).not.toBeNull();
      expect(await contact.textContent()).not.toBeNull();
      expect(await nationality.textContent()).not.toBeNull();
      expect(await status.textContent()).not.toBeNull();
      expect(await email.textContent()).not.toBeNull();      
    }



    // Verify Admins fields are visible
    let totalRepresentatives = await page.locator(OrganizationLocators.representatives).count();
    for (let i = 0; i < totalRepresentatives; i++) {
      let isActive = page.locator(OrganizationLocators.representatives).nth(i).locator("//span");
      let firstName = page.locator(OrganizationLocators.representatives).nth(i).locator("//p[text()='First Name']/following-sibling::p");
      let lastName = page.locator(OrganizationLocators.representatives).nth(i).locator("//p[text()='Last Name']/following-sibling::p");
      let contact = page.locator(OrganizationLocators.representatives).nth(i).locator("//p[text()='Contact']/following-sibling::p");
      let nationality = page.locator(OrganizationLocators.representatives).nth(i).locator("//p[text()='Nationality']/following-sibling::p");
      let status = page.locator(OrganizationLocators.representatives).nth(i).locator("//p[text()='Status']/following-sibling::p");
      let email = page.locator(OrganizationLocators.representatives).nth(i).locator("//p[text()='Email']/following-sibling::p");

      // enusuring all fields are visible
      await expect(isActive).toBeVisible();
      await expect(firstName).toBeVisible();      
      await expect(lastName).toBeVisible();
      await expect(contact).toBeVisible();
      await expect(nationality).toBeVisible();
      await expect(status).toBeVisible();
      await expect(email).toBeVisible();      

      // enusuring all fields are not null
      expect(await isActive.textContent()).not.toBeNull();
      expect(await firstName.textContent()).not.toBeNull();
      expect(await lastName.textContent()).not.toBeNull();
      expect(await contact.textContent()).not.toBeNull();
      expect(await nationality.textContent()).not.toBeNull();
      expect(await status.textContent()).not.toBeNull();
      expect(await email.textContent()).not.toBeNull();      
    }
    await loginPage.attachScreenshot(testInfo, "Organization Page displays Visa Quota, Requested Visa Quota, Events, Admins and Representatives",true);

  });

   test.afterEach(async ({ }, testInfo) => {
    // For example, you might want to take a screenshot or log out
    await loginPage.attachScreenshot(testInfo, 'Test Completed');    

    // Add any cleanup code if necessary
    console.log(`Test completed: ${testInfo.title} with status: ${testInfo.status}`);

  });
});
