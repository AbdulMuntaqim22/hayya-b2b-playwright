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

  test('Verify that Applicant Start Date Can be 30 days before Event Start Date', async ({ page }, testInfo) => {

    // Navigate to the Events page
    await page.locator(EventsLocators.eventLeftMenu).click();

    // Clicking on the Add Event button
    await page.locator(EventsLocators.addEventBtn).click();

    const date = new Date();
    date.setDate(date.getDate() - 30);
    const lastMonthDate = eventsPage.formatDate(date);

    const date2 = new Date();
    date2.setDate(date.getDate() - 31);
    const lastMonthDate2 = eventsPage.formatDate(date2);

    //filling Event Start Date
    await eventsPage.fillDatePicker(EventsLocators.eventStartDateTxt, eventsPage.formatDate(new Date()));

    //filling Applicants Arrival Date 30 days before Event Start Date
    await eventsPage.fillDatePicker(EventsLocators.applicantArrivalDateTxt, lastMonthDate);

    expect(await page.locator(EventsLocators.applicantArrivalDateTxt).getAttribute('value')).toBe(lastMonthDate);
    await loginPage.attachScreenshot(testInfo, 'Applicant Arrival Date can be 30 days before start Date', true);


    //filling Applicants Arrival Date 31 days before Event Start Date
    await eventsPage.fillDatePicker(EventsLocators.applicantArrivalDateTxt, lastMonthDate2);

    expect(await page.locator(EventsLocators.applicantArrivalDateTxt).getAttribute('value')).toBe(lastMonthDate2);
    expect(await page.locator(EventsLocators.applicantArrivalDateValidationTxt).textContent()).toBe("Arrival date must be within 30 days before the event start date");
    await loginPage.attachScreenshot(testInfo, 'Applicant Arrival Date cannot be before 31 days of start Date', true);
  });

  test('Verify that Applicant Departure Date Can be 30 days after Event End Date', async ({ page }, testInfo) => {

    // Navigate to the Events page
    await page.locator(EventsLocators.eventLeftMenu).click();

    // Clicking on the Add Event button
    await page.locator(EventsLocators.addEventBtn).click();

    const date = new Date();
    date.setDate(date.getDate() + 30);
    const eventEndDate = eventsPage.formatDate(date);

    date.setDate(date.getDate() + 30);
    const departureEndDate = eventsPage.formatDate(date);

    date.setDate(date.getDate() + 1);
    const departureEndDate2 = eventsPage.formatDate(date);

    //Entering Event start Date - Today
    await eventsPage.fillDatePicker(EventsLocators.eventStartDateTxt, eventsPage.formatDate(new Date()));

    //Entering Event End Date - 30 days from today
    await eventsPage.fillDatePicker(EventsLocators.eventEndDateTxt, eventEndDate);

    //Entering Applicant Arrival Date - Today
    await eventsPage.fillDatePicker(EventsLocators.applicantArrivalDateTxt, eventsPage.formatDate(new Date()));

    //Entering Applicants Departure Date 31 days After Event End Date
    await eventsPage.fillDatePicker(EventsLocators.applicantDepartureDateTxt, departureEndDate);

    expect(await page.locator(EventsLocators.applicantDepartureDateTxt).getAttribute('value')).toBe(departureEndDate);
    await loginPage.attachScreenshot(testInfo, 'Applicant Departure Date can be 30 days after Event End Date', true);


    //filling Applicants Departure Date 31 days After Event End Date
    await eventsPage.fillDatePicker(EventsLocators.applicantDepartureDateTxt, departureEndDate2);

    expect(await page.locator(EventsLocators.applicantDepartureDateTxt).getAttribute('value')).toBe(departureEndDate2);
    expect(await page.locator(EventsLocators.applicantDepartureDateValidationTxt).textContent()).toBe("Departure date must be within 30 days after the event end date");
    await loginPage.attachScreenshot(testInfo, 'Applicant Departure Date cannot be after 31 days of Event End Date', true);

  });

  test('Verify that Planned Application Start Date Can be 30 days before Event Start Date', async ({ page }, testInfo) => {

    // Navigate to the Events page
    await page.locator(EventsLocators.eventLeftMenu).click();

    // Clicking on the Add Event button
    await page.locator(EventsLocators.addEventBtn).click();

    const date = new Date();
    date.setDate(date.getDate() - 30);
    const lastMonthDate = eventsPage.formatDate(date);

    date.setDate(date.getDate() - 1);
    const lastMonthDate2 = eventsPage.formatDate(date);

    //filling Event Start Date
    await eventsPage.fillDatePicker(EventsLocators.eventStartDateTxt, eventsPage.formatDate(new Date()));

    //filling Planned Application Date 30 days before Event Start Date
    await eventsPage.fillDatePicker(EventsLocators.plannedAppStartDateTxt, lastMonthDate);

    expect(await page.locator(EventsLocators.plannedAppStartDateTxt).getAttribute('value')).toBe(lastMonthDate);
    await loginPage.attachScreenshot(testInfo, 'Planned Application Date can be 30 days before start Date', true);


    //filling Planned Application Date 31 days before Event Start Date
    await eventsPage.fillDatePicker(EventsLocators.plannedAppStartDateTxt, lastMonthDate2);

    expect(await page.locator(EventsLocators.plannedAppStartDateTxt).getAttribute('value')).toBe(lastMonthDate2);
    expect(await page.locator(EventsLocators.plannedAppStartDateTxtValdiation).textContent()).toBe("Planned application start date must be within 30 days before the event start date");
    await loginPage.attachScreenshot(testInfo, 'Planned Application Date cannot be 31 days before start Date', true);
  });

  test('Verify that Planned Application End Date Can be 1 day before the Event End Date', async ({ page }, testInfo) => {

    // Navigate to the Events page
    await page.locator(EventsLocators.eventLeftMenu).click();

    // Clicking on the Add Event button
    await page.locator(EventsLocators.addEventBtn).click();

    const date = new Date();
    date.setDate(date.getDate() + 30);
    const eventEndDate = eventsPage.formatDate(date);

    date.setDate(date.getDate() - 1);
    const plannnedEndDate = eventsPage.formatDate(date);

    date.setDate(date.getDate() + 2);
    const plannnedEndDate2 = eventsPage.formatDate(date);

    //Entering Event start Date - Today
    await eventsPage.fillDatePicker(EventsLocators.eventStartDateTxt, eventsPage.formatDate(new Date()));

    //Entering Event End Date - 30 days from today
    await eventsPage.fillDatePicker(EventsLocators.eventEndDateTxt, eventEndDate);

    //Entering Planned Application Date - Today
    await eventsPage.fillDatePicker(EventsLocators.plannedAppStartDateTxt, eventsPage.formatDate(new Date()));

    //Entering Planned Application Date 1 day before Event End Date
    await eventsPage.fillDatePicker(EventsLocators.plannedAppEndDateTxt, plannnedEndDate);

    expect(await page.locator(EventsLocators.plannedAppEndDateTxt).getAttribute('value')).toBe(plannnedEndDate);
    await loginPage.attachScreenshot(testInfo, 'Planned Application End Date can be before the Event End Date', true);


    //filling Planned Application End Date 1 day after Event End Date
    await eventsPage.fillDatePicker(EventsLocators.plannedAppEndDateTxt, plannnedEndDate2);

    expect(await page.locator(EventsLocators.plannedAppEndDateTxt).getAttribute('value')).toBe(plannnedEndDate2);
    expect(await page.locator(EventsLocators.plannedAppEndDateTxtValidation).textContent()).toBe("Planned application end date must be one day before the event end date");
    await loginPage.attachScreenshot(testInfo, 'Planned Application End Date cannot be after Event End Date', true);

    //filling Planned Application End Date same as Event End Date
    await eventsPage.fillDatePicker(EventsLocators.plannedAppEndDateTxt, eventEndDate);

    expect(await page.locator(EventsLocators.plannedAppEndDateTxt).getAttribute('value')).toBe(eventEndDate);
    expect(await page.locator(EventsLocators.plannedAppEndDateTxtValidation).textContent()).toBe("Planned application end date must be one day before the event end date");
    await loginPage.attachScreenshot(testInfo, 'Planned Application End Date cannot be same as Event End Date', true);

  });

  test('Verify that Film Permit Start Date Can be 90 days before the Event Start Date', async ({ page }, testInfo) => {

    const date = new Date();
    date.setDate(date.getDate() + 30);
    const eventEndDate = eventsPage.formatDate(date);

    date.setDate(date.getDate() - 1);
    const plannnedEndDate = eventsPage.formatDate(date);

    date.setDate(date.getDate() - 119);
    const filmStartDate = eventsPage.formatDate(date);

    date.setDate(date.getDate() - 1);
    const filmStartDate2 = eventsPage.formatDate(date);

    // Navigate to the Events page
    await page.locator(EventsLocators.eventLeftMenu).click();

    // Clicking on the Add Event button
    await page.locator(EventsLocators.addEventBtn).click();


    // Fill in the required fields
    await page.locator(EventsLocators.eventNameTxt).fill("New Event");
    await page.locator(EventsLocators.eventVisaQtnTxt).fill('5');
    await eventsPage.fillDatePicker(EventsLocators.eventStartDateTxt, eventsPage.formatDate(new Date()));
    await eventsPage.fillDatePicker(EventsLocators.eventEndDateTxt, eventEndDate);

    await eventsPage.fillTimePicker(EventsLocators.eventStartTimeTxt, "01", "00", "PM");
    await page.waitForTimeout(1000);
    await eventsPage.fillTimePicker(EventsLocators.eventEndTimeTxt, "05", "00", "PM");

    await page.locator(EventsLocators.eventLocationTxt).fill('Test Location');
    await page.locator(EventsLocators.eventDetailsTxt).fill('Test Event Details');


    await eventsPage.fillDatePicker(EventsLocators.applicantArrivalDateTxt, eventsPage.formatDate(new Date()));
    await eventsPage.fillDatePicker(EventsLocators.applicantDepartureDateTxt, eventEndDate);

    await eventsPage.fillDatePicker(EventsLocators.plannedAppStartDateTxt, eventsPage.formatDate(new Date()));
    await eventsPage.fillDatePicker(EventsLocators.plannedAppEndDateTxt, plannnedEndDate);

    await page.locator(EventsLocators.natureOfEventSelectTxt).click();
    await page.getByText('Entertainment').click();
    await page.locator(EventsLocators.sponsoringEntityTxt).fill('Test Entity');

    await page.locator(EventsLocators.authorizerLetterUpload).setInputFiles('./src/Resources/Passports/Algeria/Passport 1.jpg');
    await eventsPage.waitForLoaderToDisappear();
    await page.locator(EventsLocators.establishmentCardUpload).setInputFiles('./src/Resources/Passports/Algeria/Passport 1.jpg');
    await eventsPage.waitForLoaderToDisappear();

    await eventsPage.attachScreenshot(testInfo, 'Event Details Filled', true);
    await page.locator(EventsLocators.nextBtn).click();
    await page.waitForLoadState('domcontentloaded');

    await page.locator(EventsLocators.hmpCheckbox).check();
    await page.locator(EventsLocators.nextBtn).click();

    //Entering Film start Date 90 days before Event Start Date
    await eventsPage.fillDatePicker(EventsLocators.filmPermitStartDateTxt, filmStartDate);
    await page.locator(EventsLocators.nextBtn).click();

    expect(await page.locator(EventsLocators.filmPermitStartDateTxt).getAttribute('value')).toBe(filmStartDate);
    await loginPage.attachScreenshot(testInfo, 'Film Start Date can be 90 days before the Event Start Date', true);


    //Entering Film start Date 91 days before Event Start Date
    await eventsPage.fillDatePicker(EventsLocators.filmPermitStartDateTxt, filmStartDate2);
    await page.locator(EventsLocators.nextBtn).click();

    expect(await page.locator(EventsLocators.filmPermitStartDateTxt).getAttribute('value')).toBe(filmStartDate2);
    expect(await page.locator(EventsLocators.filmPermitStartDateTxtValidation).textContent()).toBe("Film permit start date must be within 90 days before the event start date");
    await loginPage.attachScreenshot(testInfo, 'Film Start Date cannot be 91 days before the Event Start Date', true);

  });

  test('Verify that Film Permit End Date Can be 1 day before the Event End Date', async ({ page }, testInfo) => {

    const date = new Date();
    date.setDate(date.getDate() + 30);
    const eventEndDate = eventsPage.formatDate(date);

    date.setDate(date.getDate() - 1);
    const plannnedEndDate = eventsPage.formatDate(date);
    
    const fimeEndDate = plannnedEndDate

    date.setDate(date.getDate() + 2);
    const filmEndDate2 = eventsPage.formatDate(date);

    // Navigate to the Events page
    await page.locator(EventsLocators.eventLeftMenu).click();

    // Clicking on the Add Event button
    await page.locator(EventsLocators.addEventBtn).click();


    // Fill in the required fields
    await page.locator(EventsLocators.eventNameTxt).fill("New Event");
    await page.locator(EventsLocators.eventVisaQtnTxt).fill('5');
    await eventsPage.fillDatePicker(EventsLocators.eventStartDateTxt, eventsPage.formatDate(new Date()));
    await eventsPage.fillDatePicker(EventsLocators.eventEndDateTxt, eventEndDate);

    await eventsPage.fillTimePicker(EventsLocators.eventStartTimeTxt, "01", "00", "PM");
    await page.waitForTimeout(1000);
    await eventsPage.fillTimePicker(EventsLocators.eventEndTimeTxt, "05", "00", "PM");

    await page.locator(EventsLocators.eventLocationTxt).fill('Test Location');
    await page.locator(EventsLocators.eventDetailsTxt).fill('Test Event Details');


    await eventsPage.fillDatePicker(EventsLocators.applicantArrivalDateTxt, eventsPage.formatDate(new Date()));
    await eventsPage.fillDatePicker(EventsLocators.applicantDepartureDateTxt, eventEndDate);

    await eventsPage.fillDatePicker(EventsLocators.plannedAppStartDateTxt, eventsPage.formatDate(new Date()));
    await eventsPage.fillDatePicker(EventsLocators.plannedAppEndDateTxt, plannnedEndDate);

    await page.locator(EventsLocators.natureOfEventSelectTxt).click();
    await page.getByText('Entertainment').click();
    await page.locator(EventsLocators.sponsoringEntityTxt).fill('Test Entity');

    await page.locator(EventsLocators.authorizerLetterUpload).setInputFiles('./src/Resources/Passports/Algeria/Passport 1.jpg');
    await eventsPage.waitForLoaderToDisappear();
    await page.locator(EventsLocators.establishmentCardUpload).setInputFiles('./src/Resources/Passports/Algeria/Passport 1.jpg');
    await eventsPage.waitForLoaderToDisappear();

    await eventsPage.attachScreenshot(testInfo, 'Event Details Filled', true);
    await page.locator(EventsLocators.nextBtn).click();
    await page.waitForLoadState('domcontentloaded');

    await page.locator(EventsLocators.hmpCheckbox).check();
    await page.locator(EventsLocators.nextBtn).click();

    //Entering Film start Date same as Event Start Date
    await eventsPage.fillDatePicker(EventsLocators.filmPermitStartDateTxt, eventsPage.formatDate(new Date()));

    //Entering Film End Date 1 day before Event End Date
    await eventsPage.fillDatePicker(EventsLocators.filmPermitEndDateTxt, fimeEndDate);
    await page.locator(EventsLocators.nextBtn).click();

    expect(await page.locator(EventsLocators.filmPermitEndDateTxt).getAttribute('value')).toBe(fimeEndDate);
    await loginPage.attachScreenshot(testInfo, 'Film End Date can be 1 day before the Event End Date', true);


    //Entering Film End Date same as Event End Date
    await eventsPage.fillDatePicker(EventsLocators.filmPermitEndDateTxt, eventEndDate);
    await page.locator(EventsLocators.nextBtn).click();

    expect(await page.locator(EventsLocators.filmPermitEndDateTxt).getAttribute('value')).toBe(eventEndDate);
    expect(await page.locator(EventsLocators.filmPermitEndDateTxtValidation).textContent()).toBe("Film permit end date must be one day before the event end date");
    await loginPage.attachScreenshot(testInfo, 'Film End Date cannot be same as Event End Date', true);

    //Entering Film End Date after Event End Date
    await eventsPage.fillDatePicker(EventsLocators.filmPermitEndDateTxt, filmEndDate2);
    await page.locator(EventsLocators.nextBtn).click();

    expect(await page.locator(EventsLocators.filmPermitEndDateTxt).getAttribute('value')).toBe(filmEndDate2);
    expect(await page.locator(EventsLocators.filmPermitEndDateTxtValidation).textContent()).toBe("Film permit end date must be one day before the event end date");
    await loginPage.attachScreenshot(testInfo, 'Film End Date cannot be after Event End Date', true);

  });

  test('Verify that Peak Period of Application Submission can be between Event Start and End Date', async ({ page }, testInfo) => {

    const date = new Date();
    date.setDate(date.getDate() + 30);
    const eventEndDate = eventsPage.formatDate(date);

    date.setDate(date.getDate() - 1);
    const plannnedEndDate = eventsPage.formatDate(date);

    date.setDate(date.getDate() - 30);
    const peakSubDate = eventsPage.formatDate(date);

    date.setDate(date.getDate() + 32);
    const peakSubDate2 = eventsPage.formatDate(date);

    // Navigate to the Events page
    await page.locator(EventsLocators.eventLeftMenu).click();

    // Clicking on the Add Event button
    await page.locator(EventsLocators.addEventBtn).click();


    // Fill in the required fields
    await page.locator(EventsLocators.eventNameTxt).fill("New Event");
    await page.locator(EventsLocators.eventVisaQtnTxt).fill('5');
    await eventsPage.fillDatePicker(EventsLocators.eventStartDateTxt, eventsPage.formatDate(new Date()));
    await eventsPage.fillDatePicker(EventsLocators.eventEndDateTxt, eventEndDate);

    await eventsPage.fillTimePicker(EventsLocators.eventStartTimeTxt, "01", "00", "PM");
    await page.waitForTimeout(1000);
    await eventsPage.fillTimePicker(EventsLocators.eventEndTimeTxt, "05", "00", "PM");

    await page.locator(EventsLocators.eventLocationTxt).fill('Test Location');
    await page.locator(EventsLocators.eventDetailsTxt).fill('Test Event Details');


    await eventsPage.fillDatePicker(EventsLocators.applicantArrivalDateTxt, eventsPage.formatDate(new Date()));
    await eventsPage.fillDatePicker(EventsLocators.applicantDepartureDateTxt, eventEndDate);

    await eventsPage.fillDatePicker(EventsLocators.plannedAppStartDateTxt, eventsPage.formatDate(new Date()));
    await eventsPage.fillDatePicker(EventsLocators.plannedAppEndDateTxt, plannnedEndDate);

    await page.locator(EventsLocators.natureOfEventSelectTxt).click();
    await page.getByText('Entertainment').click();
    await page.locator(EventsLocators.sponsoringEntityTxt).fill('Test Entity');

    await page.locator(EventsLocators.authorizerLetterUpload).setInputFiles('./src/Resources/Passports/Algeria/Passport 1.jpg');
    await eventsPage.waitForLoaderToDisappear();
    await page.locator(EventsLocators.establishmentCardUpload).setInputFiles('./src/Resources/Passports/Algeria/Passport 1.jpg');
    await eventsPage.waitForLoaderToDisappear();

    await eventsPage.attachScreenshot(testInfo, 'Event Details Filled', true);
    await page.locator(EventsLocators.nextBtn).click();
    await page.waitForLoadState('domcontentloaded');

    await page.locator(EventsLocators.hmpCheckbox).check();
    await page.locator(EventsLocators.nextBtn).click();

    //Entering Peak Application submission date before event start date    
    await eventsPage.fillDatePicker(EventsLocators.peakAppSubmissionPeriodTxt, peakSubDate);
    await page.locator(EventsLocators.nextBtn).click();

    expect(await page.locator(EventsLocators.peakAppSubmissionPeriodTxt).getAttribute('value')).toBe(peakSubDate);
    expect(await page.locator(EventsLocators.peakAppSubmissionPeriodTxtValidation).textContent()).toBe("Expected period must be between event start and end dates");
    await loginPage.attachScreenshot(testInfo, 'Peak Application Submission Period cannot be before Event Start Date', true);


    //Entering Peak Application submission date After Event End date    
    await eventsPage.fillDatePicker(EventsLocators.peakAppSubmissionPeriodTxt, peakSubDate2);
    await page.locator(EventsLocators.nextBtn).click();

    expect(await page.locator(EventsLocators.peakAppSubmissionPeriodTxt).getAttribute('value')).toBe(peakSubDate2);
    expect(await page.locator(EventsLocators.peakAppSubmissionPeriodTxtValidation).textContent()).toBe("Expected period must be between event start and end dates");
    await loginPage.attachScreenshot(testInfo, 'Peak Application Submission Period cannot be After Event End Date', true);

    //Entering Peak Application submission date same as event End date    
    await eventsPage.fillDatePicker(EventsLocators.peakAppSubmissionPeriodTxt, eventEndDate);
    await page.locator(EventsLocators.nextBtn).click();

    expect(await page.locator(EventsLocators.peakAppSubmissionPeriodTxt).getAttribute('value')).toBe(eventEndDate);
    await expect(page.locator(EventsLocators.peakAppSubmissionPeriodTxtValidation)).not.toBeAttached();
    await loginPage.attachScreenshot(testInfo, 'Peak Application Submission Period can be same as Event End Date', true);


    //Entering Peak Application submission date same as event start date    
    await eventsPage.fillDatePicker(EventsLocators.peakAppSubmissionPeriodTxt, eventsPage.formatDate(new Date()));
    await page.locator(EventsLocators.nextBtn).click();

    expect(await page.locator(EventsLocators.peakAppSubmissionPeriodTxt).getAttribute('value')).toBe(eventsPage.formatDate(new Date()));
    await expect(page.locator(EventsLocators.peakAppSubmissionPeriodTxtValidation)).not.toBeAttached();
    await loginPage.attachScreenshot(testInfo, 'Peak Application Submission Period can be same as Event Start Date', true);

  });

  test('Verify that the user can Navigate to Hayya Media Portal Section', async ({ page }, testInfo) => {

    const date = new Date();
    date.setDate(date.getDate() + 30);
    const eventEndDate = eventsPage.formatDate(date);

    date.setDate(date.getDate() - 1);
    const plannnedEndDate = eventsPage.formatDate(date);    

    // Navigate to the Events page
    await page.locator(EventsLocators.eventLeftMenu).click();

    // Clicking on the Add Event button
    await page.locator(EventsLocators.addEventBtn).click();


    // Fill in the required fields
    await page.locator(EventsLocators.eventNameTxt).fill("New Event");
    await page.locator(EventsLocators.eventVisaQtnTxt).fill('5');
    await eventsPage.fillDatePicker(EventsLocators.eventStartDateTxt, eventsPage.formatDate(new Date()));
    await eventsPage.fillDatePicker(EventsLocators.eventEndDateTxt, eventEndDate);

    await eventsPage.fillTimePicker(EventsLocators.eventStartTimeTxt, "01", "00", "PM");
    await page.waitForTimeout(1000);
    await eventsPage.fillTimePicker(EventsLocators.eventEndTimeTxt, "05", "00", "PM");

    await page.locator(EventsLocators.eventLocationTxt).fill('Test Location');
    await page.locator(EventsLocators.eventDetailsTxt).fill('Test Event Details');


    await eventsPage.fillDatePicker(EventsLocators.applicantArrivalDateTxt, eventsPage.formatDate(new Date()));
    await eventsPage.fillDatePicker(EventsLocators.applicantDepartureDateTxt, eventEndDate);

    await eventsPage.fillDatePicker(EventsLocators.plannedAppStartDateTxt, eventsPage.formatDate(new Date()));
    await eventsPage.fillDatePicker(EventsLocators.plannedAppEndDateTxt, plannnedEndDate);

    await page.locator(EventsLocators.natureOfEventSelectTxt).click();
    await page.getByText('Entertainment').click();
    await page.locator(EventsLocators.sponsoringEntityTxt).fill('Test Entity');

    await page.locator(EventsLocators.authorizerLetterUpload).setInputFiles('./src/Resources/Passports/Algeria/Passport 1.jpg');
    await eventsPage.waitForLoaderToDisappear();
    await page.locator(EventsLocators.establishmentCardUpload).setInputFiles('./src/Resources/Passports/Algeria/Passport 1.jpg');
    await eventsPage.waitForLoaderToDisappear();

    await eventsPage.attachScreenshot(testInfo, 'Event Details Filled', true);
    await page.locator(EventsLocators.nextBtn).click();
    await page.waitForLoadState('domcontentloaded');

    await page.locator(EventsLocators.hmpCheckbox).check();
    await page.locator(EventsLocators.nextBtn).click();

    //Verifying that the HMP related fields are displayed
    await expect(page.locator(EventsLocators.peakAppSubmissionPeriodTxt)).toBeVisible();
    await expect(page.locator(EventsLocators.requiredMediaApplicationsTxt)).toBeVisible();
    await expect(page.locator(EventsLocators.filmPermitStartDateTxt)).toBeVisible();
    await expect(page.locator(EventsLocators.filmPermitEndDateTxt)).toBeVisible();
    
    await loginPage.attachScreenshot(testInfo, 'The user can Navigate to HMP Page', true);

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

  test('Verify that the user can use the Contry Code in Contact Number field', async ({ page }, testInfo) => {

    const date = new Date();
    date.setDate(date.getDate() + 30);
    const eventEndDate = eventsPage.formatDate(date);

    date.setDate(date.getDate() - 1);
    const plannnedEndDate = eventsPage.formatDate(date);    

    // Navigate to the Events page
    await page.locator(EventsLocators.eventLeftMenu).click();

    // Clicking on the Add Event button
    await page.locator(EventsLocators.addEventBtn).click();


    // Fill in the required fields
    await page.locator(EventsLocators.eventNameTxt).fill("New Event");
    await page.locator(EventsLocators.eventVisaQtnTxt).fill('5');
    await eventsPage.fillDatePicker(EventsLocators.eventStartDateTxt, eventsPage.formatDate(new Date()));
    await eventsPage.fillDatePicker(EventsLocators.eventEndDateTxt, eventEndDate);

    await eventsPage.fillTimePicker(EventsLocators.eventStartTimeTxt, "01", "00", "PM");
    await page.waitForTimeout(1000);
    await eventsPage.fillTimePicker(EventsLocators.eventEndTimeTxt, "05", "00", "PM");

    await page.locator(EventsLocators.eventLocationTxt).fill('Test Location');
    await page.locator(EventsLocators.eventDetailsTxt).fill('Test Event Details');


    await eventsPage.fillDatePicker(EventsLocators.applicantArrivalDateTxt, eventsPage.formatDate(new Date()));
    await eventsPage.fillDatePicker(EventsLocators.applicantDepartureDateTxt, eventEndDate);

    await eventsPage.fillDatePicker(EventsLocators.plannedAppStartDateTxt, eventsPage.formatDate(new Date()));
    await eventsPage.fillDatePicker(EventsLocators.plannedAppEndDateTxt, plannnedEndDate);

    await page.locator(EventsLocators.natureOfEventSelectTxt).click();
    await page.getByText('Entertainment').click();
    await page.locator(EventsLocators.sponsoringEntityTxt).fill('Test Entity');

    await page.locator(EventsLocators.authorizerLetterUpload).setInputFiles('./src/Resources/Passports/Algeria/Passport 1.jpg');
    await eventsPage.waitForLoaderToDisappear();
    await page.locator(EventsLocators.establishmentCardUpload).setInputFiles('./src/Resources/Passports/Algeria/Passport 1.jpg');
    await eventsPage.waitForLoaderToDisappear();

    await eventsPage.attachScreenshot(testInfo, 'Event Details Filled', true);
    await page.locator(EventsLocators.nextBtn).click();
    await page.waitForLoadState('domcontentloaded');

    await page.locator(EventsLocators.hmpCheckbox).check();
    await page.locator(EventsLocators.nextBtn).click();

    //Entering Pakistan country code
    await page.locator(EventsLocators.adminContactNumberTxt).fill("+92");
    await expect(page.locator(EventsLocators.selectedFlag.replace("[X]", "Pakistan"))).toBeVisible();  
    await loginPage.attachScreenshot(testInfo, 'Pakistan Flag will be selected', true);

    //Entering Qatar country code
    await page.locator(EventsLocators.adminContactNumberTxt).fill("+97");
    await expect(page.locator(EventsLocators.selectedFlag.replace("[X]", "Qatar"))).toBeVisible();  
    await loginPage.attachScreenshot(testInfo, 'Qatar Flag will be selected', true);

    //Entering Iran country code
    await page.locator(EventsLocators.adminContactNumberTxt).fill("+98");
    await expect(page.locator(EventsLocators.selectedFlag.replace("[X]", "Iran"))).toBeVisible();  
    await loginPage.attachScreenshot(testInfo, 'Iran Flag will be selected', true);

  });

  test('Verify that the user cannot enter Invalid Email address in the field', async ({ page }, testInfo) => {

    const date = new Date();
    date.setDate(date.getDate() + 30);
    const eventEndDate = eventsPage.formatDate(date);

    date.setDate(date.getDate() - 1);
    const plannnedEndDate = eventsPage.formatDate(date);    

    // Navigate to the Events page
    await page.locator(EventsLocators.eventLeftMenu).click();

    // Clicking on the Add Event button
    await page.locator(EventsLocators.addEventBtn).click();


    // Fill in the required fields
    await page.locator(EventsLocators.eventNameTxt).fill("New Event");
    await page.locator(EventsLocators.eventVisaQtnTxt).fill('5');
    await eventsPage.fillDatePicker(EventsLocators.eventStartDateTxt, eventsPage.formatDate(new Date()));
    await eventsPage.fillDatePicker(EventsLocators.eventEndDateTxt, eventEndDate);

    await eventsPage.fillTimePicker(EventsLocators.eventStartTimeTxt, "01", "00", "PM");
    await page.waitForTimeout(1000);
    await eventsPage.fillTimePicker(EventsLocators.eventEndTimeTxt, "05", "00", "PM");

    await page.locator(EventsLocators.eventLocationTxt).fill('Test Location');
    await page.locator(EventsLocators.eventDetailsTxt).fill('Test Event Details');


    await eventsPage.fillDatePicker(EventsLocators.applicantArrivalDateTxt, eventsPage.formatDate(new Date()));
    await eventsPage.fillDatePicker(EventsLocators.applicantDepartureDateTxt, eventEndDate);

    await eventsPage.fillDatePicker(EventsLocators.plannedAppStartDateTxt, eventsPage.formatDate(new Date()));
    await eventsPage.fillDatePicker(EventsLocators.plannedAppEndDateTxt, plannnedEndDate);

    await page.locator(EventsLocators.natureOfEventSelectTxt).click();
    await page.getByText('Entertainment').click();
    await page.locator(EventsLocators.sponsoringEntityTxt).fill('Test Entity');

    await page.locator(EventsLocators.authorizerLetterUpload).setInputFiles('./src/Resources/Passports/Algeria/Passport 1.jpg');
    await eventsPage.waitForLoaderToDisappear();
    await page.locator(EventsLocators.establishmentCardUpload).setInputFiles('./src/Resources/Passports/Algeria/Passport 1.jpg');
    await eventsPage.waitForLoaderToDisappear();

    await eventsPage.attachScreenshot(testInfo, 'Event Details Filled', true);
    await page.locator(EventsLocators.nextBtn).click();
    await page.waitForLoadState('domcontentloaded');

    await page.locator(EventsLocators.hmpCheckbox).check();
    await page.locator(EventsLocators.nextBtn).click();

    //Entering invalid email address
    await page.locator(EventsLocators.adminEmailAddressTxt).fill("abc.com");
    expect(await page.locator(EventsLocators.adminEmailAddressTxtValidation).textContent()).toBe("Invalid email format")
    await loginPage.attachScreenshot(testInfo, 'Invalid Email', true);

    //Entering invalid email address special Characterts
    await page.locator(EventsLocators.adminEmailAddressTxt).fill("@#%^%^&,com");
    expect(await page.locator(EventsLocators.adminEmailAddressTxtValidation).textContent()).toBe("Invalid email format")
    await loginPage.attachScreenshot(testInfo, 'Invalid Email', true);

    //Entering invalid email address - only Numbers
    await page.locator(EventsLocators.adminEmailAddressTxt).fill("1251188@.com");
    expect(await page.locator(EventsLocators.adminEmailAddressTxtValidation).textContent()).toBe("Invalid email format")
    await loginPage.attachScreenshot(testInfo, 'Invalid Email', true);

    //Entering invalid email address - special characters with correct format
    await page.locator(EventsLocators.adminEmailAddressTxt).fill("abdul&muntaqim@gmail.com");
    expect(await page.locator(EventsLocators.adminEmailAddressTxtValidation).textContent()).toBe("Invalid email format")
    await loginPage.attachScreenshot(testInfo, 'Invalid Email', true);

  });

  test('Verify that the user can attached a passport Copy in Admin details section', async ({ page }, testInfo) => {

    const date = new Date();
    date.setDate(date.getDate() + 30);
    const eventEndDate = eventsPage.formatDate(date);

    date.setDate(date.getDate() - 1);
    const plannnedEndDate = eventsPage.formatDate(date);    

    // Navigate to the Events page
    await page.locator(EventsLocators.eventLeftMenu).click();

    // Clicking on the Add Event button
    await page.locator(EventsLocators.addEventBtn).click();


    // Fill in the required fields
    await page.locator(EventsLocators.eventNameTxt).fill("New Event");
    await page.locator(EventsLocators.eventVisaQtnTxt).fill('5');
    await eventsPage.fillDatePicker(EventsLocators.eventStartDateTxt, eventsPage.formatDate(new Date()));
    await eventsPage.fillDatePicker(EventsLocators.eventEndDateTxt, eventEndDate);

    await eventsPage.fillTimePicker(EventsLocators.eventStartTimeTxt, "01", "00", "PM");
    await page.waitForTimeout(1000);
    await eventsPage.fillTimePicker(EventsLocators.eventEndTimeTxt, "05", "00", "PM");

    await page.locator(EventsLocators.eventLocationTxt).fill('Test Location');
    await page.locator(EventsLocators.eventDetailsTxt).fill('Test Event Details');


    await eventsPage.fillDatePicker(EventsLocators.applicantArrivalDateTxt, eventsPage.formatDate(new Date()));
    await eventsPage.fillDatePicker(EventsLocators.applicantDepartureDateTxt, eventEndDate);

    await eventsPage.fillDatePicker(EventsLocators.plannedAppStartDateTxt, eventsPage.formatDate(new Date()));
    await eventsPage.fillDatePicker(EventsLocators.plannedAppEndDateTxt, plannnedEndDate);

    await page.locator(EventsLocators.natureOfEventSelectTxt).click();
    await page.getByText('Entertainment').click();
    await page.locator(EventsLocators.sponsoringEntityTxt).fill('Test Entity');

    await page.locator(EventsLocators.authorizerLetterUpload).setInputFiles('./src/Resources/Passports/Algeria/Passport 1.jpg');
    await eventsPage.waitForLoaderToDisappear();
    await page.locator(EventsLocators.establishmentCardUpload).setInputFiles('./src/Resources/Passports/Algeria/Passport 1.jpg');
    await eventsPage.waitForLoaderToDisappear();

    await eventsPage.attachScreenshot(testInfo, 'Event Details Filled', true);
    await page.locator(EventsLocators.nextBtn).click();
    await page.waitForLoadState('domcontentloaded');

    await page.locator(EventsLocators.hmpCheckbox).check();
    await page.locator(EventsLocators.nextBtn).click();

    // Attaching Passport Copy
    await page.locator(EventsLocators.adminPassportQidDoc).setInputFiles("./src/Resources/Passports/Palestine/Passport 2.jpg");
    await expect(page.locator("//div[@role='presentation']//img")).toBeVisible();
    await loginPage.attachScreenshot(testInfo, 'Passport/QID attached', true);   
    
    await page.getByText('Close').click();
  });

  test('Verify that the Name fields does not accept invalid characters or Numbers', async ({ page }, testInfo) => {

    const date = new Date();
    date.setDate(date.getDate() + 30);
    const eventEndDate = eventsPage.formatDate(date);

    date.setDate(date.getDate() - 1);
    const plannnedEndDate = eventsPage.formatDate(date);    

    // Navigate to the Events page
    await page.locator(EventsLocators.eventLeftMenu).click();

    // Clicking on the Add Event button
    await page.locator(EventsLocators.addEventBtn).click();


    // Fill in the required fields
    await page.locator(EventsLocators.eventNameTxt).fill("New Event");
    await page.locator(EventsLocators.eventVisaQtnTxt).fill('5');
    await eventsPage.fillDatePicker(EventsLocators.eventStartDateTxt, eventsPage.formatDate(new Date()));
    await eventsPage.fillDatePicker(EventsLocators.eventEndDateTxt, eventEndDate);

    await eventsPage.fillTimePicker(EventsLocators.eventStartTimeTxt, "01", "00", "PM");
    await page.waitForTimeout(1000);
    await eventsPage.fillTimePicker(EventsLocators.eventEndTimeTxt, "05", "00", "PM");

    await page.locator(EventsLocators.eventLocationTxt).fill('Test Location');
    await page.locator(EventsLocators.eventDetailsTxt).fill('Test Event Details');


    await eventsPage.fillDatePicker(EventsLocators.applicantArrivalDateTxt, eventsPage.formatDate(new Date()));
    await eventsPage.fillDatePicker(EventsLocators.applicantDepartureDateTxt, eventEndDate);

    await eventsPage.fillDatePicker(EventsLocators.plannedAppStartDateTxt, eventsPage.formatDate(new Date()));
    await eventsPage.fillDatePicker(EventsLocators.plannedAppEndDateTxt, plannnedEndDate);

    await page.locator(EventsLocators.natureOfEventSelectTxt).click();
    await page.getByText('Entertainment').click();
    await page.locator(EventsLocators.sponsoringEntityTxt).fill('Test Entity');

    await page.locator(EventsLocators.authorizerLetterUpload).setInputFiles('./src/Resources/Passports/Algeria/Passport 1.jpg');
    await eventsPage.waitForLoaderToDisappear();
    await page.locator(EventsLocators.establishmentCardUpload).setInputFiles('./src/Resources/Passports/Algeria/Passport 1.jpg');
    await eventsPage.waitForLoaderToDisappear();

    await eventsPage.attachScreenshot(testInfo, 'Event Details Filled', true);
    await page.locator(EventsLocators.nextBtn).click();
    await page.waitForLoadState('domcontentloaded');

    await page.locator(EventsLocators.hmpCheckbox).check();
    await page.locator(EventsLocators.nextBtn).click();

    // Entering Numbers in Name fields
    await page.locator(EventsLocators.adminFirstNameTxt).fill("12345");
    await page.locator(EventsLocators.adminMiddleNameTxt).fill("12345");
    await page.locator(EventsLocators.adminThirdNameTxt).fill("12345");
    await page.locator(EventsLocators.adminFourthNameTxt).fill("12345");
    await page.locator(EventsLocators.adminLastNameTxt).fill("12345");
    
    expect(await page.locator(EventsLocators.adminFirstNameTxt).getAttribute("value")).toBe("");
    expect(await page.locator(EventsLocators.adminMiddleNameTxt).getAttribute("value")).toBe("");
    expect(await page.locator(EventsLocators.adminThirdNameTxt).getAttribute("value")).toBe("");
    expect(await page.locator(EventsLocators.adminFourthNameTxt).getAttribute("value")).toBe("");
    expect(await page.locator(EventsLocators.adminLastNameTxt).getAttribute("value")).toBe("");
    await loginPage.attachScreenshot(testInfo, 'Name fields does not accept Numbers', true);   


    // Entering Special Characters in Name fields
    await page.locator(EventsLocators.adminFirstNameTxt).fill("!@#$%^&*()-");
    await page.locator(EventsLocators.adminMiddleNameTxt).fill("!@#$%^&*()-");
    await page.locator(EventsLocators.adminThirdNameTxt).fill("!@#$%^&*()-");
    await page.locator(EventsLocators.adminFourthNameTxt).fill("!@#$%^&*()-");
    await page.locator(EventsLocators.adminLastNameTxt).fill("!@#$%^&*()-");
    
    expect(await page.locator(EventsLocators.adminFirstNameTxt).getAttribute("value")).toBe("");
    expect(await page.locator(EventsLocators.adminMiddleNameTxt).getAttribute("value")).toBe("");
    expect(await page.locator(EventsLocators.adminThirdNameTxt).getAttribute("value")).toBe("");
    expect(await page.locator(EventsLocators.adminFourthNameTxt).getAttribute("value")).toBe("");
    expect(await page.locator(EventsLocators.adminLastNameTxt).getAttribute("value")).toBe("");
    await loginPage.attachScreenshot(testInfo, 'Name fields does not accept special characters', true);   


    // Entering string with Numbers and special characters in Name fields
    await page.locator(EventsLocators.adminFirstNameTxt).fill("Abdul1234#$%^");
    await page.locator(EventsLocators.adminMiddleNameTxt).fill("Abdul1234#$%^");
    await page.locator(EventsLocators.adminThirdNameTxt).fill("Abdul1234#$%^");
    await page.locator(EventsLocators.adminFourthNameTxt).fill("Abdul1234#$%^");
    await page.locator(EventsLocators.adminLastNameTxt).fill("Abdul1234#$%^");
    
    expect(await page.locator(EventsLocators.adminFirstNameTxt).getAttribute("value")).toBe("");
    expect(await page.locator(EventsLocators.adminMiddleNameTxt).getAttribute("value")).toBe("");
    expect(await page.locator(EventsLocators.adminThirdNameTxt).getAttribute("value")).toBe("");
    expect(await page.locator(EventsLocators.adminFourthNameTxt).getAttribute("value")).toBe("");
    expect(await page.locator(EventsLocators.adminLastNameTxt).getAttribute("value")).toBe("");
    await loginPage.attachScreenshot(testInfo, 'Name field does not accept string with Numbers or special Characters', true);   
    
  });

  
  test('Verify that the Review Event Request Functionality Works correctly', async ({ page }, testInfo) => {
    
    // Set event start and end dates
    const eventStart = new Date();    
    const eventEnd = new Date(eventStart);
    eventEnd.setDate(eventStart.getDate() + 10);
    const plannedStartDate = new Date(eventStart);
    const plannedEndDate = new Date(eventStart);
    plannedEndDate.setDate(eventStart.getDate() + 9);
    
    const randomFiveDigit = eventsPage.generateRandomFiveDigit();
    const eventName = 'Auto Event ' + randomFiveDigit;
    const eventLocation = 'Test Location';
    const eventDetails = 'Test Event Details';
    const sponsoringEntity = 'Test Entity';
    const natureOfEvent = 'Entertainment';
    const adminFirstName = 'HMPAuto';
    const adminLastName = 'Admin';
    const adminPassportQid = '122334455';
    const adminEmailAddress = 'HMPAuto.Admin' + randomFiveDigit + '@yopmail.com';
    const adminContactNumber = '1234567890';
    const adminNationality = 'Argentina';
    const quantity = '5';
    const mediaPersonQuantity = '3';

    // Navigate to the Events page
    await page.locator(EventsLocators.eventLeftMenu).click();

    // Clicking on the Add Event button
    await page.locator(EventsLocators.addEventBtn).click();    

    // Fill in the required fields
    await page.locator(EventsLocators.eventNameTxt).fill(eventName);
    await page.locator(EventsLocators.eventVisaQtnTxt).fill(quantity);
    await eventsPage.fillDatePicker(EventsLocators.eventStartDateTxt, eventsPage.formatDate(eventStart));
    await eventsPage.fillDatePicker(EventsLocators.eventEndDateTxt, eventsPage.formatDate(eventEnd));

    await eventsPage.fillTimePicker(EventsLocators.eventStartTimeTxt, "01","00","PM");
    await page.waitForTimeout(1000);
    await eventsPage.fillTimePicker(EventsLocators.eventEndTimeTxt,  "05","00","PM");

    await page.locator(EventsLocators.eventLocationTxt).fill(eventLocation);
    await page.locator(EventsLocators.eventDetailsTxt).fill(eventDetails);


    await eventsPage.fillDatePicker(EventsLocators.applicantArrivalDateTxt, eventsPage.formatDate(eventStart));
    await eventsPage.fillDatePicker(EventsLocators.applicantDepartureDateTxt, eventsPage.formatDate(eventEnd));    

    await eventsPage.fillDatePicker(EventsLocators.plannedAppStartDateTxt, eventsPage.formatDate(plannedStartDate));
    await eventsPage.fillDatePicker(EventsLocators.plannedAppEndDateTxt, eventsPage.formatDate(plannedEndDate));

    await page.locator(EventsLocators.natureOfEventSelectTxt).click();
    await page.getByText(natureOfEvent).click();
    await page.locator(EventsLocators.sponsoringEntityTxt).fill(sponsoringEntity);

    await page.locator(EventsLocators.authorizerLetterUpload).setInputFiles('./src/Resources/Passports/Algeria/Passport 1.jpg');
    await eventsPage.waitForLoaderToDisappear();
    await page.locator(EventsLocators.establishmentCardUpload).setInputFiles('./src/Resources/Passports/Algeria/Passport 1.jpg');
    await eventsPage.waitForLoaderToDisappear();    
    await eventsPage.attachScreenshot(testInfo, 'Event Details Filled', true);
    await page.locator(EventsLocators.nextBtn).click();
    await page.waitForLoadState('domcontentloaded');

    // Verify the HMP checkbox is displayed and check it
    await expect(page.locator(EventsLocators.hmpCheckbox)).toBeVisible();
    
    await page.locator(EventsLocators.hmpCheckbox).check();
    await page.locator(EventsLocators.nextBtn).click();

    
    // Add HMP Details
    await eventsPage.fillDatePicker(EventsLocators.peakAppSubmissionPeriodTxt, eventsPage.formatDate(eventStart));
    await page.waitForTimeout(1000); // Wait for the date picker to update      
    await eventsPage.fillDatePicker(EventsLocators.filmPermitStartDateTxt, eventsPage.formatDate(eventStart));
    await page.waitForTimeout(1000); // Wait for the date picker to update
    await eventsPage.fillDatePicker(EventsLocators.filmPermitEndDateTxt, eventsPage.formatDate(plannedEndDate));
    await page.waitForTimeout(1000); // Wait for the date picker to update
    await page.locator(EventsLocators.requiredMediaApplicationsTxt).fill(mediaPersonQuantity);

    // Entering HMP Admin Details        
    await page.locator(EventsLocators.adminFirstNameTxt).type(adminFirstName, {delay:100});  
    await page.locator(EventsLocators.adminLastNameTxt).type(adminLastName, {delay:100});    
    
    await page.locator(EventsLocators.adminPassportQidTxt).type(adminPassportQid, {delay:100});
    await page.locator(EventsLocators.adminEmailAddressTxt).type(adminEmailAddress, {delay:100});    
    await page.locator(EventsLocators.adminContactNumberTxt).fill(adminContactNumber);

    await page.locator(EventsLocators.adminPassportQidDoc).setInputFiles("./src/Resources/Permit.jpg");
    await page.getByText('Close').click();
    await page.locator(EventsLocators.adminNationalitySelectTxt).click();        
    await page.locator(EventsLocators.options).getByText(adminNationality).click();

    await page.locator(EventsLocators.nextBtn).click();
    await page.waitForLoadState('domcontentloaded');             

    //Entering Admin Details
    await page.locator(EventsLocators.adminFirstNameTxt).type(adminFirstName, {delay:100});  
    await page.locator(EventsLocators.adminLastNameTxt).type(adminLastName, {delay:100});    
    
    await page.locator(EventsLocators.adminPassportQidTxt).type(adminPassportQid, {delay:100});
    await page.locator(EventsLocators.adminEmailAddressTxt).type(adminEmailAddress, {delay:100});    
    await page.locator(EventsLocators.adminContactNumberTxt).fill(adminContactNumber);

    await page.locator(EventsLocators.adminPassportQidDoc).setInputFiles("./src/Resources/Permit.jpg");
    await page.getByText('Close').click();
    await page.locator(EventsLocators.adminNationalitySelectTxt).click();        
    await page.locator(EventsLocators.options).getByText(adminNationality).click();

    await page.locator(EventsLocators.nextBtn).click();
    await page.waitForLoadState('domcontentloaded');

    expect(await page.getByText("Event Name:").locator("xpath=./following-sibling::p").textContent()).toBe(eventName);
    expect(await page.getByText("Event Location:").locator("xpath=./following-sibling::p").textContent()).toBe(eventLocation);
    expect(await page.getByText("Event Details:").locator("xpath=./following-sibling::p").textContent()).toBe(eventDetails);
    expect(await page.getByText("Event Start Date:").locator("xpath=./following-sibling::p").textContent()).toBe(eventsPage.formatDate(eventStart, "dd-MM-yyyy"));
    expect(await page.getByText("Event End Date:").locator("xpath=./following-sibling::p").textContent()).toBe(eventsPage.formatDate(eventEnd, "dd-MM-yyyy"));
    expect(await page.getByText("Applicant Arrival Date:").locator("xpath=./following-sibling::p").textContent()).toBe(eventsPage.formatDate(eventStart, "dd-MM-yyyy"));
    expect(await page.getByText("Applicant Departure Date:").locator("xpath=./following-sibling::p").textContent()).toBe(eventsPage.formatDate(eventEnd, "dd-MM-yyyy"));
    expect(await page.getByText("Planned Application Start Date:").locator("xpath=./following-sibling::p").textContent()).toBe(eventsPage.formatDate(plannedStartDate, "dd-MM-yyyy"));
    expect(await page.getByText("Planned Application End Date:").locator("xpath=./following-sibling::p").textContent()).toBe(eventsPage.formatDate(plannedEndDate, "dd-MM-yyyy"));
    expect(await page.getByText("Visa Type:").locator("xpath=./following-sibling::p").textContent()).toBe("Conference & Event Visa");
    expect(await page.getByText("Required Event Visas:").locator("xpath=./following-sibling::p").textContent()).toBe(quantity);
    expect(await page.getByText("Expected Peak Period of Application Submission:").locator("xpath=./following-sibling::p").textContent()).toBe(eventsPage.formatDate(eventStart, "dd-MM-yyyy"));
    expect(await page.getByText("Film Permit Start Date:").locator("xpath=./following-sibling::p").textContent()).toBe(eventsPage.formatDate(eventStart, "dd-MM-yyyy"));
    expect(await page.getByText("Film Permit End Date:").locator("xpath=./following-sibling::p").textContent()).toBe(eventsPage.formatDate(plannedEndDate, "dd-MM-yyyy"));
    expect(await page.getByText("Required Media Applications:").locator("xpath=./following-sibling::p").textContent()).toBe(mediaPersonQuantity);
    expect(await page.getByText("Full Name:").locator("xpath=./following-sibling::p").textContent()).toBe(`${adminFirstName}    ${adminLastName}`);
    expect(await page.getByText("Nationality:").locator("xpath=./following-sibling::p").textContent()).toBe(adminNationality);
    expect(await page.getByText("Document Number:").locator("xpath=./following-sibling::p").textContent()).toBe(adminPassportQid);
    expect(await page.getByText("Email:").locator("xpath=./following-sibling::p").textContent()).toBe(adminEmailAddress);
    expect(await page.getByText("Contact:").locator("xpath=./following-sibling::p").textContent()).toBe(adminContactNumber);
    await loginPage.attachScreenshot(testInfo, 'The Review Page shows all the Filled Data Properly', true);   
    
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

    await eventsPage.fillTimePicker(EventsLocators.eventStartTimeTxt, "01", "00", "PM");
    await page.waitForTimeout(1000);
    await eventsPage.fillTimePicker(EventsLocators.eventEndTimeTxt, "05", "00", "PM");

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
    const eventDetails = await adminApi.PostRequest('/api/sc/v1/Event/requests', { "pageNumber": 1, "pageSize": 1, "searchTerm": eventName });
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
    const eventDetails = await adminApi.PostRequest('/api/sc/v1/Event/requests', { "pageNumber": 1, "pageSize": 1, "searchTerm": eventName });
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
    const eventDetails = await adminApi.PostRequest('/api/sc/v1/Event/requests', { "pageNumber": 1, "pageSize": 1, "searchTerm": eventName });
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
    const eventDetails = await adminApi.PostRequest('/api/sc/v1/Event/requests', { "pageNumber": 1, "pageSize": 1, "searchTerm": eventName });
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
    const eventDetails = await adminApi.PostRequest('/api/sc/v1/Event/requests', { "pageNumber": 1, "pageSize": 1, "searchTerm": eventName });
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
    const eventDetails = await adminApi.PostRequest('/api/sc/v1/Event/requests', { "pageNumber": 1, "pageSize": 1, "searchTerm": eventName });
    const myEventId = eventDetails.jsonResponse.result[0].globalId;

    // Rejecting the Event
    const approveResponse = await adminApi.PutRequest('/api/sc/v1/Event/requests/reject', { eventGlobalId: myEventId, rejectionReason: rejectReason });
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
    const eventDetails = await adminApi.PostRequest('/api/sc/v1/Event/requests', { "pageNumber": 1, "pageSize": 1, "searchTerm": eventName });
    const myEventId = eventDetails.jsonResponse.result[0].globalId;

    // Rejecting the Event
    const approveResponse = await adminApi.PutRequest('/api/sc/v1/Event/requests/reject', { eventGlobalId: myEventId, rejectionReason: rejectReason });
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
    const eventDetails = await adminApi.PostRequest('/api/sc/v1/Event/requests', { "pageNumber": 1, "pageSize": 1, "searchTerm": eventName });
    const myEventId = eventDetails.jsonResponse.result[0].globalId;

    // Rejecting the Event
    const approveResponse = await adminApi.PutRequest('/api/sc/v1/Event/requests/reject', { eventGlobalId: myEventId, rejectionReason: rejectReason });
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
    const eventDetails = await adminApi.PostRequest('/api/sc/v1/Event/requests', { "pageNumber": 1, "pageSize": 1, "searchTerm": eventName });
    const myEventId = eventDetails.jsonResponse.result[0].globalId;

    // Rejecting the Event
    const approveResponse = await adminApi.PutRequest('/api/sc/v1/Event/requests/reject', { eventGlobalId: myEventId, rejectionReason: rejectReason });
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
    const eventDetails = await adminApi.PostRequest('/api/sc/v1/Event/requests', { "pageNumber": 1, "pageSize": 1, "searchTerm": eventName });
    const myEventId = eventDetails.jsonResponse.result[0].globalId;

    // Rejecting the Event
    const approveResponse = await adminApi.PutRequest('/api/sc/v1/Event/requests/reject', { eventGlobalId: myEventId, rejectionReason: rejectReason });
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

    test('Verify that View Event Information button functionality', async ({ page }, testInfo) => {    
    // Navigate to the Events page
    await page.locator(EventsLocators.eventLeftMenu).click();    

    // clicking on the First Event Info Button
    await page.locator(EventsLocators.eventTable).locator("//tbody/tr/td/button").first().click();
    await page.waitForLoadState('domcontentloaded');
    
    // Ensure that the user is navigated to the Event Details Page
    expect(await page.locator("//h1").last().textContent()).toBe("Event Details");

    await loginPage.attachScreenshot(testInfo, "The user is navigated to the Event Details Page", true);    
  });



  test.afterEach(async ({ page }, testInfo) => {
    // Add any cleanup code if necessary
    console.log(`Test completed: ${testInfo.title} with status: ${testInfo.status}`);
    // For example, you might want to take a screenshot or log out
    await loginPage.attachScreenshot(testInfo, 'Test Completed');
  })

});