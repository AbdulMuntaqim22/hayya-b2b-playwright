import { test, expect } from '@playwright/test';
import fs from 'fs';
import LoginPage from '../Pages/loginPage';
import EventsPage from '../Pages/eventsPage';
import API from '../Pages/api';
import { EventsLocators } from '../Locators/eventsLocators';
import { NewApplicationLocators } from '../Locators/newApplicationlocators'
import { DashboardLocators } from '../Locators/dashboardLocators'
import { OrganizationLocators } from '../Locators/organizationLocators'


test.describe('Events Page Scenarios', () => {
  /** @type {LoginPage} */  
  var loginPage;
  /** @type {EventsPage} */
  var eventsPage: EventsPage;
  let credentials;
  let apiConfig;
  /** @type {API} */
  let b2bApi;
  let b2bUserData;
  /** @type {API} */
  let adminApi;
  let adminUserData;
  test.beforeEach(async ({ page }, testInfo) => {
    loginPage = new LoginPage(page);
    eventsPage = new EventsPage(page);
    credentials = JSON.parse(fs.readFileSync('./src/utils/userCreds.json', 'utf-8'));
    apiConfig = JSON.parse(fs.readFileSync('./src/utils/apiConfig.json', 'utf-8'));

    b2bApi = new API(page, apiConfig.baseUrl);
    await b2bApi.init(); // Initialize the API instance
    adminApi = new API(page, apiConfig.baseUrl);
    await adminApi.init(); // Initialize the API instance    
    adminUserData = await adminApi.GetAccessToken(credentials.adminUser);

    // Logging in before each test    
    await loginPage.login(testInfo, credentials.requestorUsers.existingUser);
  });

  test('Verify the Following fields are displayed', async ({ page }, testInfo) => {

    // Navigate to the Events page
    await page.locator(EventsLocators.eventLeftMenu).click();

    // Clicking on the Add Event button
    await page.locator(EventsLocators.addEventBtn).click();

    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000); // Wait for the page to load completely

    // Verify the fields are displayed
    await expect(page.locator(EventsLocators.eventNameTxt)).toBeVisible();
    await expect(page.locator(EventsLocators.eventVisaQtnTxt)).toBeVisible();
    await expect(page.locator(EventsLocators.eventStartDateTxt)).toBeVisible();
    await expect(page.locator(EventsLocators.eventEndDateTxt)).toBeVisible();
    await expect(page.locator(EventsLocators.eventStartTimeTxt)).toBeVisible();
    await expect(page.locator(EventsLocators.eventEndTimeTxt)).toBeVisible();
    await expect(page.locator(EventsLocators.eventLocationTxt)).toBeVisible();
    await expect(page.locator(EventsLocators.eventDetailsTxt)).toBeVisible();
    await expect(page.locator(EventsLocators.applicantArrivalDateTxt)).toBeVisible();
    await expect(page.locator(EventsLocators.applicantDepartureDateTxt)).toBeVisible();  
    await expect(page.locator(EventsLocators.plannedAppStartDateTxt)).toBeVisible();  
    await expect(page.locator(EventsLocators.plannedAppEndDateTxt)).toBeVisible();  
    await expect(page.locator(EventsLocators.natureOfEventSelectTxt)).toBeVisible();
    await expect(page.locator(EventsLocators.sponsoringEntityTxt)).toBeVisible();
    // await expect(page.locator(EventsLocators.authenticateDegreeUpload)).toBeAttached();
    // await expect(page.locator(EventsLocators.cvUpload)).toBeAttached();
    // await expect(page.locator(EventsLocators.policeClearanceCertificateUpload)).toBeAttached();
    // await expect(page.locator(EventsLocators.sectoralEndoresementUpload)).toBeAttached();
    await expect(page.locator(EventsLocators.authorizerLetterUpload)).toBeAttached();
    await expect(page.locator(EventsLocators.establishmentCardUpload)).toBeAttached();
    await loginPage.attachScreenshot(testInfo, 'Events Page Fields', true);
  });

  test('Verify that all the fields are required', async ({ page }, testInfo) => {

    // Navigate to the Events page
    await page.locator(EventsLocators.eventLeftMenu).click();

    // Clicking on the Add Event button
    await page.locator(EventsLocators.addEventBtn).click();

    // Clicking on the Next button without filling any fields
    await page.locator(EventsLocators.nextBtn).click();

    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000); // Wait for the page to load completely

    // Verify the fields are displayed
    expect(await page.locator(EventsLocators.eventNameValidationTxt).textContent()).toBe("Event Name is required");
    expect(await page.locator(EventsLocators.eventVisaQtnValidationTxt).innerHTML()).toBe("Number of Required Visas&nbsp;for&nbsp;the&nbsp;Event");
    expect(await page.locator(EventsLocators.eventStartDateValidationTxt).textContent()).toBe("Event Start Date is required");
    expect(await page.locator(EventsLocators.eventEndDateValidationTxt).textContent()).toBe("Event End Date is required");
    expect(await page.locator(EventsLocators.eventStartTimeValidationTxt).textContent()).toBe("Event Start Time is required");
    expect(await page.locator(EventsLocators.eventEndTimeValidationTxt).textContent()).toBe("Event End Time is required");
    expect(await page.locator(EventsLocators.eventLocationValidationTxt).textContent()).toBe("Event Location is required");
    expect(await page.locator(EventsLocators.eventDetailsValidationTxt).textContent()).toBe("Event details are required");
    expect(await page.locator(EventsLocators.applicantArrivalDateValidationTxt).textContent()).toBe("Applicant's Arrival Date is required");
    expect(await page.locator(EventsLocators.applicantDepartureDateValidationTxt).textContent()).toBe("Applicant's Departure Date is required");
    expect(await page.locator(EventsLocators.plannedAppStartDateTxtValdiation).textContent()).toBe("Planned Application Start Date is required  ");
    expect(await page.locator(EventsLocators.plannedAppEndDateTxtValidation).textContent()).toBe("Planned Application End Date is required");
    expect(await page.locator(EventsLocators.natureOfEventValidationTxt).textContent()).toBe("Nature of Event is required");
    expect(await page.locator(EventsLocators.sponsoringEntityValidationTxt).textContent()).toBe("Sponsoring Entity is required");
    expect(await page.locator(EventsLocators.authorizerLetterValidationTxt).textContent()).toBe("Authorizer letter  is required");
    expect(await page.locator(EventsLocators.establishmentCardValidationTxt).textContent()).toBe("Establishment Card Image is required");
    //expect(await page.locator(EventsLocators.cvValidationTxt).textContent()).toBe("CV is required");
    //expect(await page.locator(EventsLocators.policeClearanceCertificateValidationTxt).textContent()).toBe("Police Clearance from country of residence is required");
    //expect(await page.locator(EventsLocators.sectoralEndoresementValidationTxt).textContent()).toBe("Sectoral Endorsement Letter is required");
    await loginPage.attachScreenshot(testInfo, 'Events Page Fields are Required', true);
  });

  test('Verify that when Other is selected in Nature of Event the Specify nature field is displayed and required', async ({ page }, testInfo) => {

    // Navigate to the Events page
    await page.locator(EventsLocators.eventLeftMenu).click();

    // Clicking on the Add Event button
    await page.locator(EventsLocators.addEventBtn).click();

    await page.locator(EventsLocators.natureOfEventSelectTxt).click();
    await page.getByText('Other').click();

    //Verifying the Specify Nature of Event field is displayed
    await expect(page.locator(EventsLocators.specifyNatureOfEventTxt)).toBeVisible();

    // Clicking on the Next button without filling any fields 
    await page.locator(EventsLocators.nextBtn).click();

    //Verifying the Specify Nature of Event field is required
    expect(await page.locator(EventsLocators.specifyNatureOfEventValidationTxt).textContent()).toBe("Nature of Event is required");

    await loginPage.attachScreenshot(testInfo, 'Specify Nature of Event field is displayed and required when Other is Selected', true);
  });

    test('Verify the Next button functionality', async ({ page }, testInfo) => {

    // Navigate to the Events page
    await page.locator(EventsLocators.eventLeftMenu).click();

    // Clicking on the Add Event button
    await page.locator(EventsLocators.addEventBtn).click();

    await page.locator(EventsLocators.natureOfEventSelectTxt).click();
    await page.getByText('Other').click();

    //Verifying the Specify Nature of Event field is displayed
    await expect(page.locator(EventsLocators.specifyNatureOfEventTxt)).toBeVisible();

    // Clicking on the Next button without filling any fields 
    await page.locator(EventsLocators.nextBtn).click();

    //Verifying the Specify Nature of Event field is required
    expect(await page.locator(EventsLocators.specifyNatureOfEventValidationTxt).textContent()).toBe("Nature of Event is required");

    await loginPage.attachScreenshot(testInfo, 'Specify Nature of Event field is displayed and required when Other is Selected', true);
  });

  test('Verify that the user can submit the Event Request and see its status', async ({ page }, testInfo) => {
    // Navigate to the Events page
    await page.locator(EventsLocators.eventLeftMenu).click();

    // Clicking on the Add Event button
    await page.locator(EventsLocators.addEventBtn).click();

    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000); // Wait for the page to load completely

    // Set event start and end dates
    const eventStart = new Date();
    const eventEnd = new Date(eventStart);
    const plannedEndDate = new Date(eventStart);
    plannedEndDate.setDate(eventStart.getDate() + 9);
    eventEnd.setDate(eventStart.getDate() + 10);
    const randomFiveDigit = eventsPage.generateRandomFiveDigit();
    const eventName = 'Auto Event ' + randomFiveDigit;

    // Fill in the required fields
    await page.locator(EventsLocators.eventNameTxt).fill(eventName);
    await page.locator(EventsLocators.eventVisaQtnTxt).fill('5');
    await eventsPage.fillDatePicker(EventsLocators.eventStartDateTxt, eventsPage.formatDate(eventStart));
    await eventsPage.fillDatePicker(EventsLocators.eventEndDateTxt, eventsPage.formatDate(eventEnd));

    await eventsPage.fillTimePicker(EventsLocators.eventStartTimeTxt, "01","00","PM");
    await page.waitForTimeout(1000);
    await eventsPage.fillTimePicker(EventsLocators.eventEndTimeTxt,  "05","00","PM");

    await page.locator(EventsLocators.eventLocationTxt).fill('Test Location');
    await page.locator(EventsLocators.eventDetailsTxt).fill('Test Event Details');


    await eventsPage.fillDatePicker(EventsLocators.applicantArrivalDateTxt, eventsPage.formatDate(eventStart));
    await eventsPage.fillDatePicker(EventsLocators.applicantDepartureDateTxt, eventsPage.formatDate(eventEnd));    

    await eventsPage.fillDatePicker(EventsLocators.plannedAppStartDateTxt, eventsPage.formatDate(eventStart));
    await eventsPage.fillDatePicker(EventsLocators.plannedAppEndDateTxt, eventsPage.formatDate(plannedEndDate));

    await page.locator(EventsLocators.natureOfEventSelectTxt).click();
    await page.getByText('Entertainment').click();
    await page.locator(EventsLocators.sponsoringEntityTxt).fill('Test Entity');

    await page.locator(EventsLocators.authorizerLetterUpload).setInputFiles('./src/Resources/Passports/Algeria/Passport 1.jpg');
    await eventsPage.waitForLoaderToDisappear();
    await page.locator(EventsLocators.establishmentCardUpload).setInputFiles('./src/Resources/Passports/Algeria/Passport 1.jpg');
    await eventsPage.waitForLoaderToDisappear();    
    await eventsPage.attachScreenshot(testInfo, 'Event Details Filled', true);
    await page.locator(EventsLocators.nextBtn).click();  

    // Navigated to the Next Page
    await expect(page.locator(EventsLocators.conferenceVisaCheckbox)).toBeVisible();
    await expect(page.locator(EventsLocators.privateEventCheckbox)).toBeVisible();
    await expect(page.locator(EventsLocators.accredAndPermitCheckbox)).toBeVisible();
    await expect(page.locator(EventsLocators.hmpCheckbox)).toBeVisible();
    await eventsPage.attachScreenshot(testInfo, 'Navigated to Next Page', true);

    await page.locator(EventsLocators.nextBtn).click(); 
    await expect(page.locator(EventsLocators.adminFirstNameTxt)).toBeVisible();
    await expect(page.locator(EventsLocators.adminMiddleNameTxt)).toBeVisible();
    await expect(page.locator(EventsLocators.adminThirdNameTxt)).toBeVisible();
    await expect(page.locator(EventsLocators.adminFourthNameTxt)).toBeVisible();
    await expect(page.locator(EventsLocators.adminLastNameTxt)).toBeVisible();
    await expect(page.locator(EventsLocators.adminEmailAddressTxt)).toBeVisible();
    await expect(page.locator(EventsLocators.adminContactNumberTxt)).toBeVisible();
    await expect(page.locator(EventsLocators.adminPassportQidDoc)).toBeAttached();

    await eventsPage.attachScreenshot(testInfo, 'Navigated to Admin Details Page', true);

    await loginPage.attachScreenshot(testInfo, `${eventName} is created with status Approved`)
  });

  test('Verify that when the Event is Approved the user can see it in Manual Application form', async ({ page }, testInfo) => {
    // Navigate to the Events page
    await page.locator(EventsLocators.eventLeftMenu).click();

    //creating the Event
    const eventName = await eventsPage.createEvent(testInfo, true);

    // Fetching All Event Details to retrieve the Event ID
    const eventDetails = await adminApi.PostRequest('/api/sc/v1/Event/requests',{"pageNumber": 1,"pageSize": 1,"searchTerm": eventName });
    const myEventId = eventDetails.jsonResponse.result[0].globalId;

    // Approving the Event
    const approveResponse = await adminApi.PutRequest(`/api/sc/v1/Event/requests/approve/${myEventId}`);
    expect(approveResponse.statusCode).toBe(200);

    await page.waitForTimeout(1000); // Wait for the page to update
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Verify the Event is created with a Approved Status
    const event = page.locator(EventsLocators.eventTable).locator("//tbody/tr/td//p[text()='" + eventName + "']/ancestor::tr/td[7]/span")
    // Verifying the Event Status is Approved
    expect(await event.textContent()).toBe('Approved');   

    await loginPage.attachScreenshot(testInfo, `${eventName} is created with status Approved`);

    // Navigating to New application Page
    await page.locator(NewApplicationLocators.newAppLeftMenuBtn).click();
    await page.waitForLoadState('domcontentloaded');

    // Opening Manual Application form
    await page.locator(NewApplicationLocators.manualAppBtn).click();

    // expanding the Event dropdown
    await page.locator(NewApplicationLocators.eventSelect).click();

    await page.waitForTimeout(1000);

    await expect(page.locator(NewApplicationLocators.options).locator("//li[text()='" + eventName + "']")).toBeVisible();

    await loginPage.attachScreenshot(testInfo, `${eventName} event is displayed in the dropdown`);

  });

  test('Verify that when the Event is Approved the user can see it in Bulk Application form', async ({ page }, testInfo) => {
    // Navigate to the Events page
    await page.locator(EventsLocators.eventLeftMenu).click();

    //creating the Event
    const eventName = await eventsPage.createEvent(testInfo, true);

    // Fetching All Event Details to retrieve the Event ID
    const eventDetails = await adminApi.PostRequest('/api/sc/v1/Event/requests',{"pageNumber": 1,"pageSize": 1,"searchTerm": eventName });
    const myEventId = eventDetails.jsonResponse.result[0].globalId;

    // Approving the Event
    const approveResponse = await adminApi.PutRequest(`/api/sc/v1/Event/requests/approve/${myEventId}`);
    expect(approveResponse.statusCode).toBe(200);

    await page.waitForTimeout(1000); // Wait for the page to update
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Verify the Event is created with a Approved Status
    const event = page.locator(EventsLocators.eventTable).locator("//tbody/tr/td//p[text()='" + eventName + "']/ancestor::tr/td[7]/span")
    // Verifying the Event Statu is Approved
    expect(await event.textContent()).toBe('Approved');   
    
    await loginPage.attachScreenshot(testInfo, `${eventName} is created with status Approved`);

    // Navigating to New application Page
    await page.locator(NewApplicationLocators.newAppLeftMenuBtn).click();
    await page.waitForLoadState('domcontentloaded');

    // Opening Manual Application form
    await page.locator(NewApplicationLocators.manualAppBtn).click();

    // expanding the Event dropdown
    await page.locator(NewApplicationLocators.eventSelect).click();

    await page.waitForTimeout(1000);

    await expect(page.locator(NewApplicationLocators.options).locator("//li[text()='" + eventName + "']")).toBeVisible();

    await loginPage.attachScreenshot(testInfo, `${eventName} event is displayed in the dropdown`);

  });

  test('Verify that when the Event is Approved the user can see it in Additional Service field', async ({ page }, testInfo) => {
    // Navigate to the Events page
    await page.locator(EventsLocators.eventLeftMenu).click();

    //creating the Event
    const eventName = await eventsPage.createEvent(testInfo, true);

    // Fetching All Event Details to retrieve the Event ID
    const eventDetails = await adminApi.PostRequest('/api/sc/v1/Event/requests',{"pageNumber": 1,"pageSize": 1,"searchTerm": eventName });
    const myEventId = eventDetails.jsonResponse.result[0].globalId;

    // Approving the Event
    const approveResponse = await adminApi.PutRequest(`/api/sc/v1/Event/requests/approve/${myEventId}`);
    expect(approveResponse.statusCode).toBe(200);

    await page.waitForTimeout(1000); // Wait for the page to update
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Verify the Event is created with a Approved Status
    const event = page.locator(EventsLocators.eventTable).locator("//tbody/tr/td//p[text()='" + eventName + "']/ancestor::tr/td[7]/span")
    // Verifying the Event Statu is Approved
    expect(await event.textContent()).toBe('Approved');   
    
    await loginPage.attachScreenshot(testInfo, `${eventName} is created with status Approved`);

    // Navigating to Dashboard
    await page.locator(DashboardLocators.dashboardLeftMenuBtn).click();
    await page.waitForLoadState('domcontentloaded');

    // Opening dropdown and Select Additional Service option    
    await page.locator(DashboardLocators.additionalRequestsSelect).click();
    await page.locator(DashboardLocators.options).locator("//li[text()='Additional Service']").click();

    await page.waitForTimeout(1000);

    // expanding the Event dropdown
    await page.locator(DashboardLocators.eventsSelect).click();

    await page.waitForTimeout(1000);

    await expect(page.locator(DashboardLocators.options).locator("//li[text()='" + eventName + "']")).toBeVisible();

    await loginPage.attachScreenshot(testInfo, `${eventName} event is displayed in the dropdown`);

  });

  test('Verify that when the Event is Approved the user can see it in Visa Quota field', async ({ page }, testInfo) => {
    // Navigate to the Events page
    await page.locator(EventsLocators.eventLeftMenu).click();

    //creating the Event
    const eventName = await eventsPage.createEvent(testInfo, true);

    // Fetching All Event Details to retrieve the Event ID
    const eventDetails = await adminApi.PostRequest('/api/sc/v1/Event/requests',{"pageNumber": 1,"pageSize": 1,"searchTerm": eventName });
    const myEventId = eventDetails.jsonResponse.result[0].globalId;

    // Approving the Event
    const approveResponse = await adminApi.PutRequest(`/api/sc/v1/Event/requests/approve/${myEventId}`);
    expect(approveResponse.statusCode).toBe(200);

    await page.waitForTimeout(1000); // Wait for the page to update
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Verify the Event is created with a Approved Status
    const event = page.locator(EventsLocators.eventTable).locator("//tbody/tr/td//p[text()='" + eventName + "']/ancestor::tr/td[7]/span")
    // Verifying the Event Statu is Approved
    expect(await event.textContent()).toBe('Approved');   
    
    await loginPage.attachScreenshot(testInfo, `${eventName} is created with status Approved`);

    // Navigating to Dashboard
    await page.locator(DashboardLocators.dashboardLeftMenuBtn).click();
    await page.waitForLoadState('domcontentloaded');

    // Opening dropdown and Select Visa Quota option    
    await page.locator(DashboardLocators.additionalRequestsSelect).click();
    await page.locator(DashboardLocators.options).locator("//li[text()='Visa Quota']").click();

    await page.waitForTimeout(1000);

    // expanding the Select Visa Type dropdown
    await page.locator(DashboardLocators.visaQuota_selectVisaTypeSelect).click();

    await page.waitForTimeout(1000);

    await expect(page.locator(DashboardLocators.options).locator("//li[text()='" + eventName + "']")).toBeVisible();

    await loginPage.attachScreenshot(testInfo, `${eventName} event is displayed in the dropdown`);

  });

  test('Verify that when the Event is Approved the user can see it Organization Page', async ({ page }, testInfo) => {
    // Navigate to the Events page
    await page.locator(EventsLocators.eventLeftMenu).click();

    //creating the Event
    const eventName = await eventsPage.createEvent(testInfo, true);

    // Fetching All Event Details to retrieve the Event ID
    const eventDetails = await adminApi.PostRequest('/api/sc/v1/Event/requests',{"pageNumber": 1,"pageSize": 1,"searchTerm": eventName });
    const myEventId = eventDetails.jsonResponse.result[0].globalId;

    // Approving the Event
    const approveResponse = await adminApi.PutRequest(`/api/sc/v1/Event/requests/approve/${myEventId}`);
    expect(approveResponse.statusCode).toBe(200);

    await page.waitForTimeout(1000); // Wait for the page to update
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Verify the Event is created with a Approved Status
    const event = page.locator(EventsLocators.eventTable).locator("//tbody/tr/td//p[text()='" + eventName + "']/ancestor::tr/td[7]/span")
    // Verifying the Event Statu is Approved
    expect(await event.textContent()).toBe('Approved');   
    
    await loginPage.attachScreenshot(testInfo, `${eventName} is created with status Approved`);

  // Navigating to Organization Page  
    await page.locator(OrganizationLocators.organizationLeftMenuBtn).click();
    await page.waitForLoadState('domcontentloaded');

    // Validating the New Event is Displaying
    const element = page.locator(`//div[text()='${eventName}']/ancestor::div[2]/following-sibling::div/span[2]`);
    await element.scrollIntoViewIfNeeded();
    expect(await element.textContent()).toBe("05"); //The Event got approved with Quantity 5

    await loginPage.attachScreenshot(testInfo, `${eventName} event is displayed in the Organization Page`);

  });

  test('Verify that when the Event is Rejected the user cannot see it in Manual Application form', async ({ page }, testInfo) => {
    const rejectReason = "For Test Reason it is Rejected";
    // Navigate to the Events page
    await page.locator(EventsLocators.eventLeftMenu).click();

    //creating the Event
    const eventName = await eventsPage.createEvent(testInfo);

    // Fetching All Event Details to retrieve the Event ID
    const eventDetails = await adminApi.PostRequest('/api/sc/v1/Event/requests',{"pageNumber": 1,"pageSize": 1,"searchTerm": eventName });
    const myEventId = eventDetails.jsonResponse.result[0].globalId;

    // Rejecting the Event
    const approveResponse = await adminApi.PutRequest('/api/sc/v1/Event/requests/reject',{eventGlobalId: myEventId, rejectionReason: rejectReason});
    expect(approveResponse.statusCode).toBe(200);

    await page.waitForTimeout(1000); // Wait for the page to update
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Verify the Event is created with a Rejected Status
    const event = page.locator(EventsLocators.eventTable).locator("//tbody/tr/td//p[text()='" + eventName + "']/ancestor::tr/td[7]/span")
    // Verifying the Event Status is Rejected
    expect(await event.textContent()).toBe('Rejected');   

    await loginPage.attachScreenshot(testInfo, `${eventName} is created with status Rejected`);

    // Navigating to New application Page
    await page.locator(NewApplicationLocators.newAppLeftMenuBtn).click();
    await page.waitForLoadState('domcontentloaded');

    // Opening Manual Application form
    await page.locator(NewApplicationLocators.manualAppBtn).click();

    // expanding the Event dropdown
    await page.locator(NewApplicationLocators.eventSelect).click();

    await page.waitForTimeout(1000);

    await expect(page.locator(NewApplicationLocators.options).locator("//li[text()='" + eventName + "']")).not.toBeVisible();

    await loginPage.attachScreenshot(testInfo, `${eventName} event is NOT displayed in the dropdown`);

  });

  test('Verify that when the Event is Rejected the user cannot see it in Bulk Application form', async ({ page }, testInfo) => {
    const rejectReason = "For Test Reason it is Rejected";
    
    // Navigate to the Events page
    await page.locator(EventsLocators.eventLeftMenu).click();

    //creating the Event
    const eventName = await eventsPage.createEvent(testInfo);

    // Fetching All Event Details to retrieve the Event ID
    const eventDetails = await adminApi.PostRequest('/api/sc/v1/Event/requests',{"pageNumber": 1,"pageSize": 1,"searchTerm": eventName });
    const myEventId = eventDetails.jsonResponse.result[0].globalId;

    // Rejecting the Event
    const approveResponse = await adminApi.PutRequest('/api/sc/v1/Event/requests/reject',{eventGlobalId: myEventId, rejectionReason: rejectReason});
    expect(approveResponse.statusCode).toBe(200);

    await page.waitForTimeout(1000); // Wait for the page to update
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Verify the Event is created with a Rejected Status
    const event = page.locator(EventsLocators.eventTable).locator("//tbody/tr/td//p[text()='" + eventName + "']/ancestor::tr/td[7]/span")
    // Verifying the Event Status is Rejected
    expect(await event.textContent()).toBe('Rejected');   
    
    await loginPage.attachScreenshot(testInfo, `${eventName} is created with status Rejected`);

    // Navigating to New application Page
    await page.locator(NewApplicationLocators.newAppLeftMenuBtn).click();
    await page.waitForLoadState('domcontentloaded');

    // Opening Manual Application form
    await page.locator(NewApplicationLocators.manualAppBtn).click();

    // expanding the Event dropdown
    await page.locator(NewApplicationLocators.eventSelect).click();

    await page.waitForTimeout(1000);

    await expect(page.locator(NewApplicationLocators.options).locator("//li[text()='" + eventName + "']")).not.toBeVisible();

    await loginPage.attachScreenshot(testInfo, `${eventName} event is NOT displayed in the dropdown`);

  });

  test('Verify that when the Event is Rejected the user cannot see it in Additional Service field', async ({ page }, testInfo) => {
  const rejectReason = "For Test Reason it is Rejected";
  // Navigate to the Events page
  await page.locator(EventsLocators.eventLeftMenu).click();

  //creating the Event
  const eventName = await eventsPage.createEvent(testInfo, false);

  // Fetching All Event Details to retrieve the Event ID
  const eventDetails = await adminApi.PostRequest('/api/sc/v1/Event/requests',{"pageNumber": 1,"pageSize": 1,"searchTerm": eventName });
  const myEventId = eventDetails.jsonResponse.result[0].globalId;

  // Rejecting the Event
  const approveResponse = await adminApi.PutRequest('/api/sc/v1/Event/requests/reject',{eventGlobalId: myEventId, rejectionReason: rejectReason});
  expect(approveResponse.statusCode).toBe(200);

  await page.waitForTimeout(1000); // Wait for the page to update
  await page.reload();
  await page.waitForLoadState('domcontentloaded');

  // Verify the Event is created with a Rejected Status
  const event = page.locator(EventsLocators.eventTable).locator("//tbody/tr/td//p[text()='" + eventName + "']/ancestor::tr/td[7]/span")
  // Verifying the Event Status is Rejected
  expect(await event.textContent()).toBe('Rejected');   
  
  await loginPage.attachScreenshot(testInfo, `${eventName} is created with status Rejected`);

  // Navigating to Dashboard
  await page.locator(DashboardLocators.dashboardLeftMenuBtn).click();
  await page.waitForLoadState('domcontentloaded');

  // Opening dropdown and Select Additional Service option    
  await page.locator(DashboardLocators.additionalRequestsSelect).click();
  await page.locator(DashboardLocators.options).locator("//li[text()='Additional Service']").click();

  await page.waitForTimeout(1000);

  // expanding the Event dropdown
  await page.locator(DashboardLocators.eventsSelect).click();

  await page.waitForTimeout(1000);

  await expect(page.locator(DashboardLocators.options).locator("//li[text()='" + eventName + "']")).not.toBeVisible();

  await loginPage.attachScreenshot(testInfo, `${eventName} event is NOT displayed in the dropdown`);

  });

  test('Verify that when the Event is Rejected the user cannot see it in Visa Quota field', async ({ page }, testInfo) => {
  const rejectReason = "For Test Reason it is Rejected";
  // Navigate to the Events page
  await page.locator(EventsLocators.eventLeftMenu).click();

  //creating the Event
  const eventName = await eventsPage.createEvent(testInfo, false);

  // Fetching All Event Details to retrieve the Event ID
  const eventDetails = await adminApi.PostRequest('/api/sc/v1/Event/requests',{"pageNumber": 1,"pageSize": 1,"searchTerm": eventName });
  const myEventId = eventDetails.jsonResponse.result[0].globalId;

  // Rejecting the Event
  const approveResponse = await adminApi.PutRequest('/api/sc/v1/Event/requests/reject',{eventGlobalId: myEventId, rejectionReason: rejectReason});
  expect(approveResponse.statusCode).toBe(200);

  await page.waitForTimeout(1000); // Wait for the page to update
  await page.reload();
  await page.waitForLoadState('domcontentloaded');

  // Verify the Event is created with a Rejected Status
  const event = page.locator(EventsLocators.eventTable).locator("//tbody/tr/td//p[text()='" + eventName + "']/ancestor::tr/td[7]/span")
  // Verifying the Event Status is Rejected
  expect(await event.textContent()).toBe('Rejected');   
  
  await loginPage.attachScreenshot(testInfo, `${eventName} is created with status Rejected`);

  // Navigating to Dashboard
  await page.locator(DashboardLocators.dashboardLeftMenuBtn).click();
  await page.waitForLoadState('domcontentloaded');

  // Opening dropdown and Select Visa Quota option    
  await page.locator(DashboardLocators.additionalRequestsSelect).click();
  await page.locator(DashboardLocators.options).locator("//li[text()='Visa Quota']").click();

  await page.waitForTimeout(1000);

  // expanding the Select Visa Type dropdown
  await page.locator(DashboardLocators.visaQuota_selectVisaTypeSelect).click();

  await page.waitForTimeout(1000);

  await expect(page.locator(DashboardLocators.options).locator("//li[text()='" + eventName + "']")).not.toBeVisible();

  await loginPage.attachScreenshot(testInfo, `${eventName} event is NOT displayed in the dropdown`);

  });

  test('Verify that when the Event is Rejected the user cannot see it in Organization Page', async ({ page }, testInfo) => {
  const rejectReason = "For Test Reason it is Rejected";
  // Navigate to the Events page
  await page.locator(EventsLocators.eventLeftMenu).click();

  //creating the Event
  const eventName = await eventsPage.createEvent(testInfo);

  // Fetching All Event Details to retrieve the Event ID
  const eventDetails = await adminApi.PostRequest('/api/sc/v1/Event/requests',{"pageNumber": 1,"pageSize": 1,"searchTerm": eventName });
  const myEventId = eventDetails.jsonResponse.result[0].globalId;

  // Rejecting the Event
  const approveResponse = await adminApi.PutRequest('/api/sc/v1/Event/requests/reject',{eventGlobalId: myEventId, rejectionReason: rejectReason});
  expect(approveResponse.statusCode).toBe(200);

  await page.waitForTimeout(1000); // Wait for the page to update
  await page.reload();
  await page.waitForLoadState('domcontentloaded');

  // Verify the Event is created with a Rejected Status
  const event = page.locator(EventsLocators.eventTable).locator("//tbody/tr/td//p[text()='" + eventName + "']/ancestor::tr/td[7]/span")
  // Verifying the Event Status is Rejected
  expect(await event.textContent()).toBe('Rejected');   
  
  await loginPage.attachScreenshot(testInfo, `${eventName} is created with status Rejected`);

  // Navigating to Organization Page
  await page.locator(OrganizationLocators.organizationLeftMenuBtn).click();
  await page.waitForLoadState('domcontentloaded');
  await page.locator(OrganizationLocators.orgDetails).first().waitFor({ state: 'visible' });

  // Validating the New Event is NOT Displaying
  const element = page.locator(`//div[text()='${eventName}']/ancestor::div[2]/following-sibling::div/span[2]`);  
  await expect(element).not.toBeVisible(); 
  
  await loginPage.attachScreenshot(testInfo, `${eventName} event is NOT displayed in the Organization Page`);

  });



  test.afterEach(async ({ page }, testInfo) => {
    // Add any cleanup code if necessary
    console.log(`Test completed: ${testInfo.title} with status: ${testInfo.status}`);
    // For example, you might want to take a screenshot or log out
    await loginPage.attachScreenshot(testInfo, 'Test Completed');
  })

});