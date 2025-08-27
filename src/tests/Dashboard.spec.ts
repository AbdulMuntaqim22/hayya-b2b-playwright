import { test, expect } from '@playwright/test';
import fs from 'fs';
import LoginPage from '../Pages/loginPage';
import DashboardPage from '../Pages/dashboardPage';
import EventsPage from '../Pages/eventsPage';
import API from '../Pages/api';
import { RequestsLocators } from '../Locators/requestsLocators'
import { EventsLocators } from '../Locators/eventsLocators'
import { OrganizationLocators } from '../Locators/organizationLocators'


test.describe('Dashboard Page Scenarios', () => {
  /** @type {LoginPage} */
  var loginPage;
  var dashPage: DashboardPage;
  /** @type {EventsPage} */
  var eventsPage: EventsPage;
  let credentials;
  let apiConfig;
  /** @type {API} */
  let adminApi;
  let adminUserData;
  test.beforeEach(async ({ page }, testInfo) => {
    loginPage = new LoginPage(page);
    dashPage = new DashboardPage(page);
    eventsPage = new EventsPage(page);
    credentials = JSON.parse(fs.readFileSync('./src/utils/userCreds.json', 'utf-8'));
    apiConfig = JSON.parse(fs.readFileSync('./src/utils/apiConfig.json', 'utf-8'));

    adminApi = new API(page, apiConfig.baseUrl);
    await adminApi.init(); // Initialize the API instance

    adminUserData = await adminApi.GetAccessToken(credentials.adminUser);

    // Logging in before each test    
    await loginPage.login(testInfo, credentials.requestorUsers.existingUser);
  });

  test('Verify that the user can Request an Additional Admin and When its Approved it is displayed on Organization Details Page as Active', async ({ page }, testInfo) => {

    var adminEmail = await dashPage.createAdditionalAdminRequest(testInfo)

    // Fetching All Admin Request Details
    const adminRequests = await adminApi.GetRequest('/api/sc/v1/Organization/requests/admins');
    const adminGlobalId = adminRequests.result.find((req) => req.email === adminEmail).globalId;

    // Approving the Admin Request
    const approveResponse = await adminApi.PutRequest(`/api/sc/v1/Organization/requests/adminrep/approve/${adminGlobalId}`);
    expect(approveResponse.statusCode).toBe(200);

    await page.waitForTimeout(1000); // Wait for the page to update
    await page.locator(RequestsLocators.refreshBtn).click();
    await page.waitForLoadState('domcontentloaded');

    //Verifying that the Status is changed to Approved
    var record = page.locator(RequestsLocators.requestsTableRows).locator("//td/p[text()='" + adminEmail + "']/ancestor::tr/td[7]/span")
    expect(await record.textContent()).toBe("Approved");
    await loginPage.attachScreenshot(testInfo, 'Admin Request Status changed to Approved', true);

    // Navigating to Organization Page
    await page.locator(OrganizationLocators.organizationLeftMenuBtn).click();
    await page.waitForLoadState('load');

    // Validating the New Admin Email is showing as ACTIVE
    const email = page.locator(OrganizationLocators.emailTxt.replace('{AdminEmail}',adminEmail));
    await email.scrollIntoViewIfNeeded();  
    await expect(email).toBeVisible();
    
    var isActiveElement= email.locator("xpath=/ancestor::div[contains(@class,'grid')]/preceding-sibling::div//span");
    expect(await isActiveElement.textContent()).toBe("Active");

    
    await loginPage.attachScreenshot(testInfo, `Approved Admin ${adminEmail} Details are showing on Organization Page as Active`, true);
  });

  test('Verify that the user can Request an Additional Admin and When its Rejected it is displayed on Organization Details Page as InActive', async ({ page }, testInfo) => {

    const rejectReason = "For Test Reason it is Rejected";
    var adminEmail = await dashPage.createAdditionalAdminRequest(testInfo)
    // Fetching All Admin Request Details
    const adminRequests = await adminApi.GetRequest('/api/sc/v1/Organization/requests/admins');
    const adminGlobalId = adminRequests.result.find((req) => req.email === adminEmail).globalId;

    // Rejecting the Admin Request
    const approveResponse = await adminApi.PutRequest('/api/sc/v1/Organization/requests/adminrep/reject', { adminRepId: adminGlobalId, rejectionReason: rejectReason });
    expect(approveResponse.statusCode).toBe(200);

    await page.waitForTimeout(1000); // Wait for the page to update
    await page.locator(RequestsLocators.refreshBtn).click();
    await page.waitForLoadState('domcontentloaded');

    //Verifying that the Status is changed to Rejected
    var record = page.locator(RequestsLocators.requestsTableRows).locator("//td/p[text()='" + adminEmail + "']/ancestor::tr/td[7]/span")
    expect(await record.textContent()).toBe("Rejected");
    await loginPage.attachScreenshot(testInfo, 'Admin Request Status changed to Approved', true);

    // Navigating to Organization Page
    await page.locator(OrganizationLocators.organizationLeftMenuBtn).click();
    await page.waitForLoadState('load');

    // Validating the New Admin Email is showing as In ACTIVE
    const email = page.locator(OrganizationLocators.emailTxt.replace('{AdminEmail}',adminEmail));
    await email.scrollIntoViewIfNeeded();  
    await expect(email).toBeVisible();
    
    var isActiveElement= email.locator("xpath=/ancestor::div[contains(@class,'grid')]/preceding-sibling::div//span");
    expect(await isActiveElement.textContent()).toBe("In active");        

    await loginPage.attachScreenshot(testInfo, `Rejected Admin ${adminEmail} Details are showing on Organization Page as Inactive`, true);
  });

  test('Verify that the user can Request an Additional Representative and When its Approved it is displayed on Organization Details Page as Active', async ({ page }, testInfo) => {

    var repEmail = await dashPage.createAdditionalRepresentativeRequest(testInfo)

    // Fetching All Representatives Request Details
    const repRequests = await adminApi.GetRequest('/api/sc/v1/Organization/requests/reps');
    const repGlobalId = repRequests.result.find((req) => req.email === repEmail).globalId;

    // Approving the Representative Request
    const approveResponse = await adminApi.PutRequest(`/api/sc/v1/Organization/requests/adminrep/approve/${repGlobalId}`);
    expect(approveResponse.statusCode).toBe(200);

    await page.waitForTimeout(1000); // Wait for the page to update
    await page.locator(RequestsLocators.refreshBtn).click();
    await page.waitForLoadState('domcontentloaded');

    //Verifying that the Status is changed to Approved
    var record = page.locator(RequestsLocators.requestsTableRows).locator("//td/p[text()='" + repEmail + "']/ancestor::tr/td[7]/span")
    expect(await record.textContent()).toBe("Approved");
    await loginPage.attachScreenshot(testInfo, `${repEmail} Representative Request Status changed to Approved`, true);

    // Navigating to Organization Page
    await page.locator(OrganizationLocators.organizationLeftMenuBtn).click();
    await page.waitForLoadState('load');

    // Validating the New Admin Email is showing as ACTIVE
    const email = page.locator(OrganizationLocators.emailTxt.replace('{AdminEmail}',repEmail));
    await email.scrollIntoViewIfNeeded();  
    await expect(email).toBeVisible();
    
    var isActiveElement= email.locator("xpath=/ancestor::div[contains(@class,'grid')]/preceding-sibling::div//span");
    expect(await isActiveElement.textContent()).toBe("In active");        

    await loginPage.attachScreenshot(testInfo, `Rejected Admin ${repEmail} Details are showing on Organization Page as Active`, true);    
  });

  test('Verify that the user can Request an Additional Representative and When its Rejected it is NOT displayed on Organization Details Page', async ({ page }, testInfo) => {
    const rejectReason = "For Test Reason it is Rejected";
    var repEmail = await dashPage.createAdditionalRepresentativeRequest(testInfo)

    // Fetching All Representatives Request Details
    const repRequests = await adminApi.GetRequest('/api/sc/v1/Organization/requests/reps');
    const repGlobalId = repRequests.result.find((req) => req.email === repEmail).globalId;

    // Rejecting the Representative Request
    const approveResponse = await adminApi.PutRequest('/api/sc/v1/Organization/requests/adminrep/reject', { adminRepId: repGlobalId, rejectionReason: rejectReason });
    expect(approveResponse.statusCode).toBe(200);

    await page.waitForTimeout(1000); // Wait for the page to update
    await page.locator(RequestsLocators.refreshBtn).click();  
    await page.waitForLoadState('domcontentloaded');

    //Verifying that the Status is changed to Rejected
    var record = page.locator(RequestsLocators.requestsTableRows).locator("//td/p[text()='" + repEmail + "']/ancestor::tr/td[7]/span")
    expect(await record.textContent()).toBe("Rejected");
    await loginPage.attachScreenshot(testInfo, `${repEmail} Representative Request Status changed to Rejected`, true);

    // Navigating to Organization Page
    await page.locator(OrganizationLocators.organizationLeftMenuBtn).click();
    await page.waitForLoadState('load');

    // Validating the New Admin Email is showing as In ACTIVE
    const email = page.locator(OrganizationLocators.emailTxt.replace('{AdminEmail}',repEmail));
    await email.scrollIntoViewIfNeeded();  
    await expect(email).toBeVisible();
    
    var isActiveElement= email.locator("xpath=/ancestor::div[contains(@class,'grid')]/preceding-sibling::div//span");
    expect(await isActiveElement.textContent()).toBe("In active");        

    await loginPage.attachScreenshot(testInfo, `Rejected Admin ${repEmail} Details are showing on Organization Page as Inactive`, true);
  });

  test('Verify that the user can Request Additional Visa Quota and When its Approved it is displayed on Organization Details Page', async ({ page }, testInfo) => {
    const quantity= '05';    

    //#region  Creating and Approving the Event
    // Navigate to the Events page
    await page.locator(EventsLocators.eventLeftMenu).click();
    // Creating an Event First with Visa Quantity 05
    var eventName = await eventsPage.createEvent(testInfo);

    // Fetching All Event Details to retrieve the Event ID    
    const eventDetails = await adminApi.PostRequest('/api/sc/v1/Event/requests',{"pageNumber": 1,"pageSize": 1,"searchTerm": eventName });
    const myEventId = eventDetails.jsonResponse.result[0].globalId;

    // Approving the Event
    const approveEventResponse = await adminApi.PutRequest(`/api/sc/v1/Event/requests/approve/${myEventId}`);
    expect(approveEventResponse.statusCode).toBe(200);

    //#endregion

    // Create Visa Request
    await dashPage.createVisaQuotaRequest(testInfo, eventName, quantity);

    // Fetching All Visa Quota Requests Details
    const visaRequests = await adminApi.GetRequest('/api/sc/v1/Organization/requests/visaquota');
    const visaGlobalId = visaRequests.result.find((req) => req.visaType === eventName).globalId;

    // Approving the Visa Quota Request
    const approveVisaResponse = await adminApi.PutRequest(`/api/sc/v1/Organization/requests/visaquota/approve/${visaGlobalId}`);
    expect(approveVisaResponse.statusCode).toBe(200);

    await page.waitForTimeout(1000); // Wait for the page to update
    await page.locator(RequestsLocators.refreshBtn).click();
    await page.waitForLoadState('domcontentloaded');
    
    //Verifying that the Status is changed to Approved    
    const rows = page.locator(RequestsLocators.requestsTableRows).locator(`//td//p[text()='${eventName}']/ancestor::tr/td[7]/span`);
    await page.waitForTimeout(2000);
    const count = await rows.count();
    
    for (let i = 0; i < count; i++) {
      const status = await rows.nth(i).textContent();
      expect(status).toBe("Approved");
    }
    await loginPage.attachScreenshot(testInfo, `${eventName} Visa Quota Request Status changed to Approved`, true);

    // Navigating to Organization Page
    await page.locator(OrganizationLocators.organizationLeftMenuBtn).click();
    await page.waitForLoadState('load');

    // Validating the New Requested Quota is Displaying
    const element = page.locator(`//div[text()='${eventName}']/ancestor::div[2]/following-sibling::div/span[2]`);
    await element.scrollIntoViewIfNeeded();
    expect(await element.textContent()).toBe("10"); //The Event got approved with Quantity 5, we requested additional 5 so it would be 10 now

    await loginPage.attachScreenshot(testInfo, `Visa Quota for ${eventName} is Displaying on Organization Page`, true);
  });

   test('Verify that the user can Request Additional Visa Quota and When its Rejected it is NOT displayed on Organization Details Page', async ({ page }, testInfo) => {
    const quantity= '05';    
    const rejectReason = "For Test Reason it is Rejected";    

    //#region  Creating and Approving the Event
    // Navigate to the Events page
    await page.locator(EventsLocators.eventLeftMenu).click();
    // Creating an Event First with Visa Quantity 05
    var eventName = await eventsPage.createEvent(testInfo);

    // Fetching All Event Details to retrieve the Event ID
    const eventDetails = await adminApi.PostRequest('/api/sc/v1/Event/requests',{"pageNumber": 1,"pageSize": 1,"searchTerm": eventName });
    const myEventId = eventDetails.jsonResponse.result[0].globalId;

    // Approving the Event
    const approveEventResponse = await adminApi.PutRequest(`/api/sc/v1/Event/requests/approve/${myEventId}`);
    expect(approveEventResponse.statusCode).toBe(200);

    //#endregion

    // Create Visa Request
    await dashPage.createVisaQuotaRequest(testInfo, eventName, quantity);

    // Fetching All Visa Quota Requests Details
    const visaRequests = await adminApi.GetRequest('/api/sc/v1/Organization/requests/visaquota');
    const visaGlobalId = visaRequests.result.find((req) => req.visaType === eventName).globalId;

    // Rejecting the Visa Quota Request
    const approveVisaResponse = await adminApi.PutRequest(`/api/sc/v1/Organization/requests/visaquota/reject/${visaGlobalId}`,{ visaQuotaId: visaGlobalId, rejectionReason: rejectReason });
    expect(approveVisaResponse.statusCode).toBe(200);

    await page.waitForTimeout(1000); // Wait for the page to update
    await page.locator(RequestsLocators.refreshBtn).click();
    await page.waitForLoadState('domcontentloaded');
    
    //Verifying that the Status is changed to Rejected    
    const rows = page.locator(RequestsLocators.requestsTableRows).locator(`//td//p[text()='${eventName}']/ancestor::tr/td[6]/span`);
    await page.waitForTimeout(2000);
    const count = await rows.count();
    
    let rejectedCount = 0;
        for (let i = 0; i < count; i++) {
            const status = await rows.nth(i).textContent();
            if (status === "Rejected") {
                rejectedCount++;
                // Optionally, scroll into view or take a screenshot here
                await rows.nth(i).scrollIntoViewIfNeeded();
            }
        }

    expect(rejectedCount).toBe(1);
    await loginPage.attachScreenshot(testInfo, `${eventName} Visa Quota Request Status changed to Rejected`, true);

    // Navigating to Organization Page
    await page.locator(OrganizationLocators.organizationLeftMenuBtn).click();
    await page.waitForLoadState('load');

    // Validating the New Requested Quota is NOT Displaying
    const element = page.locator(`//div[text()='${eventName}']/ancestor::div[2]/following-sibling::div/span[2]`);
    await element.scrollIntoViewIfNeeded();
    expect(await element.textContent()).toBe("5"); //The Event got approved with Quantity 5, we requested additional 5 and it got Rejected so it would be 05

    await loginPage.attachScreenshot(testInfo, `Visa Quota for ${eventName} is NOT Updated on Organization Page`, true);
  });

  test('Verify that the user can Request Additional Visa Type Request and When its Approved it is displayed on Organization Details Page', async ({ page }, testInfo) => {
    const quantity= '10';    
    const visaType = "Test V1 B2B";

    // Create New Visa Request
    await dashPage.createNewVisaQuotaRequest(testInfo, visaType, quantity);

    // Fetching All Visa Quota Requests Details
    const visaRequests = await adminApi.GetRequest('/api/sc/v1/Organization/requests/visaquota');
    const visaGlobalId = visaRequests.result.find((req) => req.visaType === visaType && req.requestedQuota).globalId;

    // Approving the Visa Quota Request
    const approveVisaResponse = await adminApi.PutRequest(`/api/sc/v1/Organization/requests/visaquota/approve/${visaGlobalId}`);
    expect(approveVisaResponse.statusCode).toBe(200);

    await page.waitForTimeout(1000); // Wait for the page to update
    await page.locator(RequestsLocators.refreshBtn).click();
    await page.waitForLoadState('domcontentloaded');
    
    //Verifying that the Status is changed to Approved    
    const row = page.locator(RequestsLocators.requestsTableRows).locator(`//td/p[text()='${visaType}']/ancestor::tr/td[6]/span[text()='Approved']`);
    
    await expect(row).toBeVisible({timeout: 30000});
    
    await loginPage.attachScreenshot(testInfo, `${visaType} Visa Request Status changed to Approved`, true);

    // Navigating to Organization Page
    await page.locator(OrganizationLocators.organizationLeftMenuBtn).click();
    await page.waitForLoadState('load');

    // Validating the New Requested Quota is Displaying
    const element = page.locator(`//div[text()='${visaType}']/ancestor::div[2]/following-sibling::div/span[2]`);
    await element.scrollIntoViewIfNeeded();
    expect(await element.textContent()).toBe(quantity);

    await loginPage.attachScreenshot(testInfo, `Visa Quota for ${visaType} Visa Type is Displaying on Organization Page`, true);
  });

  test('Verify that the user can Request Additional Visa Type Request and When its Rejected it is NOT displayed on Organization Details Page', async ({ page }, testInfo) => {
    const quantity= '10';    
    const visaType = "Diamond Hayya Investor";
    const rejectReason = "For Test Reason it is Rejected";    

    // Create New Visa Request
    await dashPage.createNewVisaQuotaRequest(testInfo, visaType, quantity);

    // Fetching All Visa Quota Requests Details
    const visaRequests = await adminApi.GetRequest('/api/sc/v1/Organization/requests/visaquota');
    const visaGlobalId = visaRequests.result.find((req) => req.visaType === visaType && req.requestedQuota).globalId;
    
    // Rejecting the Visa Quota Request
    const rejectVisaResponse = await adminApi.PutRequest(`/api/sc/v1/Organization/requests/visaquota/reject/${visaGlobalId}`,{ visaQuotaId: visaGlobalId, rejectionReason: rejectReason });
    expect(rejectVisaResponse.statusCode).toBe(200);

    await page.waitForTimeout(1000); // Wait for the page to update
    await page.locator(RequestsLocators.refreshBtn).click();
    await page.waitForLoadState('domcontentloaded');
    
    //Verifying that the Status is changed to Rejected    
    const row = page.locator(RequestsLocators.requestsTableRows).locator(`//td/p[text()='${visaType}']/ancestor::tr/td[6]/span[text()='Rejected']`);
    
    await expect(row).toBeVisible();
    
    await loginPage.attachScreenshot(testInfo, `${visaType} Visa Request Status changed to Rejected`, true);

    // Navigating to Organization Page
    await page.locator(OrganizationLocators.organizationLeftMenuBtn).click();
    await page.waitForLoadState('load');
    await page.locator(OrganizationLocators.emailTxt).first().waitFor({state:"visible"});

    // Validating the New Requested Quota is NOT Displaying
    const element = page.locator(`//div[text()='${visaType}']/ancestor::div[2]/following-sibling::div/span[2]`);    
    await expect(element).not.toBeVisible();

    await loginPage.attachScreenshot(testInfo, `Visa Quota for ${visaType} Visa Type is NOT Displaying on Organization Page`, true);
  });

  test('Verify that the user can Request Additional HMP Service and When its Approved it is displayed on ', async ({ page }, testInfo) => {
    const quantity= '10';    

    //#region  Creating and Approving the Event without HMP
    // Navigate to the Events page
    await page.locator(EventsLocators.eventLeftMenu).click();
    // Creating an Event First with Visa Quantity 05
    var eventName = await eventsPage.createEvent(testInfo, false, '5');

    // Fetching All Event Details to retrieve the Event ID
    const eventDetails = await adminApi.PostRequest('/api/sc/v1/Event/requests',{"pageNumber": 1,"pageSize": 1,"searchTerm": eventName });
    const myEventId = eventDetails.jsonResponse.result[0].globalId;

    // Approving the Event
    const approveEventResponse = await adminApi.PutRequest(`/api/sc/v1/Event/requests/approve/${myEventId}`);
    expect(approveEventResponse.statusCode).toBe(200);

    // Verify the Event is created with a Approved Status
    await page.locator(RequestsLocators.refreshBtn).click();
    const event = page.locator(EventsLocators.eventTable).locator("//tbody/tr/td//p[text()='" + eventName + "']/ancestor::tr/td[7]/span");

    await expect(event).toBeVisible();
    await expect(event).toHaveText('Approved');
    await dashPage.attachScreenshot(testInfo, 'Event Created Successfully with the status Approved', true);

    //#endregion

    // Create Visa Request
    await dashPage.createAdditionalHMPServiceRequest(testInfo, eventName, quantity);

    // Fetching All Visa Quota Requests Details
    const hmpRequest = await adminApi.GetRequest('/api/sc/v1/Event/requests/hmp');
    const hmpGlobalId = hmpRequest.result.find((req) => req.eventName === eventName).globalId;

    // Approving the HMP Request for Event
    const approveVisaResponse = await adminApi.PutRequest(`/api/sc/v1/Event/requests/hmp/approve/${hmpGlobalId}`);
    expect(approveVisaResponse.statusCode).toBe(200);

    await page.waitForTimeout(1000); // Wait for the page to update
    await page.locator(RequestsLocators.refreshBtn).click();
    await page.waitForLoadState('domcontentloaded');
    
    //Verifying that the Status is changed to Approved    
    const rows = page.locator(RequestsLocators.requestsTableRows).locator(`//td/p[text()='${eventName}']/ancestor::tr/td[5]/span`);
    const count = await rows.count();
    
    for (let i = 0; i < count; i++) {
      const status = await rows.nth(i).textContent();
      expect(status).toBe("Approved");
    }
    await loginPage.attachScreenshot(testInfo, `${eventName} HMP Request Status changed to Approved`, true);

    // Navigating to Organization Page
    await page.locator(OrganizationLocators.organizationLeftMenuBtn).click();
    await page.waitForLoadState('load');

    // Validating the New HMP Request is Displaying
    

    await loginPage.attachScreenshot(testInfo, `Visa Quota for ${eventName} is Displaying on Organization Page`, true);
  });

  test('Verify that the user can Request Additional HMP Service and When its Rejected it is displayed on ', async ({ page }, testInfo) => {
    const quantity= '10';    
    const rejectReason = "For Test Reason it is Rejected";    

    //#region  Creating and Approving the Event without HMP
    // Navigate to the Events page
    await page.locator(EventsLocators.eventLeftMenu).click();
    // Creating an Event First with Visa Quantity 05
    var eventName = await eventsPage.createEvent(testInfo, false, '5');

    // Fetching All Event Details to retrieve the Event ID
    const eventDetails = await adminApi.PostRequest('/api/sc/v1/Event/requests',{"pageNumber": 1,"pageSize": 1,"searchTerm": eventName });
    const myEventId = eventDetails.jsonResponse.result[0].globalId;

    // Approving the Event
    const approveEventResponse = await adminApi.PutRequest(`/api/sc/v1/Event/requests/approve/${myEventId}`);
    expect(approveEventResponse.statusCode).toBe(200);

    // Verify the Event is created with a Approved Status
    await page.locator(RequestsLocators.refreshBtn).click();
    const event = page.locator(EventsLocators.eventTable).locator("//tbody/tr/td//p[text()='" + eventName + "']/ancestor::tr/td[7]/span");

    await expect(event).toBeVisible();
    await expect(event).toHaveText('Approved');
    await dashPage.attachScreenshot(testInfo, 'Event Created Successfully with the status Approved', true);

    //#endregion

    // Create Visa Request
    await dashPage.createAdditionalHMPServiceRequest(testInfo, eventName, quantity);

    // Fetching All Visa Quota Requests Details
    const hmpRequest = await adminApi.GetRequest('/api/sc/v1/Event/requests/hmp');
    const hmpGlobalId = hmpRequest.result.find((req) => req.eventName === eventName).globalId;

    // Rejecting the HMP Request for Event
    const rejectVisaResponse = await adminApi.PutRequest('/api/sc/v1/Event/requests/hmp/reject',{eventHmptGlobalId:hmpGlobalId, rejectionReason:rejectReason});
    expect(rejectVisaResponse.statusCode).toBe(200);

    await page.waitForTimeout(1000); // Wait for the page to update
    await page.locator(RequestsLocators.refreshBtn).click();
    await page.waitForLoadState('domcontentloaded');
    
    //Verifying that the Status is changed to Rejected    
    const rows = page.locator(RequestsLocators.requestsTableRows).locator(`//td/p[text()='${eventName}']/ancestor::tr/td[5]/span`);
    const count = await rows.count();
    
     let rejectedCount = 0;
        for (let i = 0; i < count; i++) {
            const status = await rows.nth(i).textContent();
            if (status === "Rejected") {
                rejectedCount++;
                // Optionally, scroll into view or take a screenshot here
                await rows.nth(i).scrollIntoViewIfNeeded();
            }
        }

    expect(rejectedCount).toBe(1);
    await loginPage.attachScreenshot(testInfo, `${eventName} HMP Request Status changed to Rejected`, true);

    // Navigating to Organization Page
    await page.locator(OrganizationLocators.organizationLeftMenuBtn).click();
    await page.waitForLoadState('load');

    // Validating the New HMP Request Quota is NOT Displaying
    
    await loginPage.attachScreenshot(testInfo, );
  });

  test.afterEach(async ({ page }, testInfo) => {
    // Add any cleanup code if necessary
    console.log(`Test completed: ${testInfo.title} with status: ${testInfo.status}`);
    // For example, you might want to take a screenshot or log out
    await loginPage.attachScreenshot(testInfo, 'Test Completed');
  })

});