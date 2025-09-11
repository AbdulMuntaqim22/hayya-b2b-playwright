import { expect, testInfo } from '@playwright/test';
import { LoginLocators } from '../Locators/loginLocators';
import { EventsLocators } from '../Locators/eventsLocators';
import BasePage from './basePage';
import fs from 'fs';

class EventsPage extends BasePage {
  constructor(page) {
    super(page);
    this.page = page;
  }


  async expectDateAccepted(locator, date) {
    await this.fillDatePicker(locator, date);
    expect(await this.page.locator(locator).inputValue()).toBe(date);
  }


  async createEvent(testInfo, hmp=true, qty="5") {

    // Clicking on the Add Event button
    await this.page.locator(EventsLocators.addEventBtn).click();

    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(2000); // Wait for the page to load completely

    // Set event start and end dates
    const eventStart = new Date();
    const eventEnd = new Date(eventStart);
    const plannedEndDate = new Date(eventStart);
    plannedEndDate.setDate(eventStart.getDate() + 9);
    eventEnd.setDate(eventStart.getDate() + 10);
    const randomFiveDigit = this.generateRandomFiveDigit();
    const eventName = 'Auto Event ' + randomFiveDigit;

    // Fill in the required fields
    await this.page.locator(EventsLocators.eventNameTxt).fill(eventName);
    await this.page.locator(EventsLocators.eventVisaQtnTxt).fill(qty);
    await this.fillDatePicker(EventsLocators.eventStartDateTxt, this.formatDate(eventStart));
    await this.fillDatePicker(EventsLocators.eventEndDateTxt, this.formatDate(eventEnd));

    await this.fillTimePicker(EventsLocators.eventStartTimeTxt, "01","00","PM");
    await this.page.waitForTimeout(1000);
    await this.fillTimePicker(EventsLocators.eventEndTimeTxt,  "05","00","PM");

    await this.page.locator(EventsLocators.eventLocationTxt).fill('Test Location');
    await this.page.locator(EventsLocators.eventDetailsTxt).fill('Test Event Details');


    await this.fillDatePicker(EventsLocators.applicantArrivalDateTxt, this.formatDate(eventStart));
    await this.fillDatePicker(EventsLocators.applicantDepartureDateTxt, this.formatDate(eventEnd));    

    await this.fillDatePicker(EventsLocators.plannedAppStartDateTxt, this.formatDate(eventStart));
    await this.fillDatePicker(EventsLocators.plannedAppEndDateTxt, this.formatDate(plannedEndDate));

    await this.page.locator(EventsLocators.natureOfEventSelectTxt).click();
    await this.page.getByText('Entertainment').click();
    await this.page.locator(EventsLocators.sponsoringEntityTxt).fill('Test Entity');

    await this.page.locator(EventsLocators.authenticateDegreeUpload).setInputFiles('./src/Resources/Passports/Algeria/Passport 1.jpg');
    await this.waitForLoaderToDisappear();
    await this.page.locator(EventsLocators.cvUpload).setInputFiles('./src/Resources/Passports/Algeria/Passport 1.jpg');
    await this.waitForLoaderToDisappear();
    await this.page.locator(EventsLocators.policeClearanceCertificateUpload).setInputFiles('./src/Resources/Passports/Algeria/Passport 1.jpg');
    await this.waitForLoaderToDisappear();
    await this.page.locator(EventsLocators.sectoralEndoresementUpload).setInputFiles('./src/Resources/Passports/Algeria/Passport 1.jpg');
    await this.waitForLoaderToDisappear();
    await this.page.waitForTimeout(5000);
    await this.attachScreenshot(testInfo, 'Event Details Filled', true);
    await this.page.locator(EventsLocators.nextBtn).click();
    await this.page.waitForLoadState('domcontentloaded');

    // Verify the HMP checkbox is displayed and check it
    await expect(this.page.locator(EventsLocators.hmpCheckbox)).toBeVisible();

    if(hmp){
      await this.page.locator(EventsLocators.hmpCheckbox).check();
    }    
    await this.page.locator(EventsLocators.nextBtn).click();

    if(hmp){
      // Add HMP Details
      await this.fillDatePicker(EventsLocators.peakAppSubmissionPeriodTxt, this.formatDate(eventStart));
      await this.page.waitForTimeout(1000); // Wait for the date picker to update      
      await this.fillDatePicker(EventsLocators.filmPermitStartDateTxt, this.formatDate(eventStart));
      await this.page.waitForTimeout(1000); // Wait for the date picker to update
      await this.fillDatePicker(EventsLocators.filmPermitEndDateTxt, this.formatDate(plannedEndDate));
      await this.page.waitForTimeout(1000); // Wait for the date picker to update
      await this.page.locator(EventsLocators.requiredMediaApplicationsTxt).fill('3');

      // Entering Event Admin Details        
      await this.page.locator(EventsLocators.adminFirstNameTxt).type('HMPAuto', {delay:100});  
      await this.page.locator(EventsLocators.adminLastNameTxt).type('Admin', {delay:100});    
      
      await this.page.locator(EventsLocators.adminPassportQidTxt).type('122334455', {delay:100});
      await this.page.locator(EventsLocators.adminEmailAddressTxt).type('HMPAuto.Admin' + randomFiveDigit + '@yopmail.com', {delay:100});    
      await this.page.locator(EventsLocators.adminContactNumberTxt).type('1234567890', {delay:100});

      //await this.page.locator(EventsLocators.adminPassportQidDoc).setInputFiles("./src/Resources/Permit.jpg");
      await this.page.locator(EventsLocators.adminNationalitySelectTxt).click();        
      await this.page.locator(EventsLocators.options).locator("//span[text()='Argentina']").click();

      await this.page.locator(EventsLocators.nextBtn).click();
      await this.page.waitForLoadState('domcontentloaded');
    }    

    // Entering HMP Admin Details        
    await this.page.locator(EventsLocators.adminFirstNameTxt).type('HMPAuto', {delay:100});  
    await this.page.locator(EventsLocators.adminLastNameTxt).type('Admin', {delay:100});    
    
    await this.page.locator(EventsLocators.adminPassportQidTxt).type('122334455', {delay:100});
    await this.page.locator(EventsLocators.adminEmailAddressTxt).type('HMPAuto.Admin' + randomFiveDigit + '@yopmail.com', {delay:100});    
    await this.page.locator(EventsLocators.adminContactNumberTxt).type('1234567890', {delay:100});

    //await this.page.locator(EventsLocators.adminPassportQidDoc).setInputFiles("./src/Resources/Permit.jpg");
    await this.page.locator(EventsLocators.adminNationalitySelectTxt).click();        
    await this.page.locator(EventsLocators.options).locator("//span[text()='Argentina']").click();

    await this.page.locator(EventsLocators.nextBtn).click();
    await this.page.waitForLoadState('domcontentloaded');

    //submitting the form
    await this.page.locator(EventsLocators.submitApplicationBtn).click();
    await this.page.locator(EventsLocators.continueBtn).click();

    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(1000); // Wait for the page to load completely

    // Verify the Event is created with a Pending Status
    const event = this.page.locator(EventsLocators.eventTable).locator("//tbody/tr/td//p[text()='" + eventName + "']/ancestor::tr/td[7]/span");

    await expect(event).toBeVisible();
    await expect(event).toHaveText('Pending');
    await this.attachScreenshot(testInfo, 'Event Created Successfully with the status Pending', true);

    return eventName;
  }
}

export default EventsPage;