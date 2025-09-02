import BasePage from './basePage';
import { test, expect } from '@playwright/test';
import { DashboardLocators } from '../Locators/dashboardLocators'
import { RequestsLocators } from '../Locators/requestsLocators'
import { EventsLocators } from '../Locators/eventsLocators'

class DashboardPage extends BasePage {
    constructor(page) {
        super(page);
        this.page = page;
    }

    async createAdditionalAdminRequest(testInfo) {
        var randomFiveDigit = this.generateRandomFiveDigit();
        var adminEmail = 'HMPAuto.Admin' + randomFiveDigit + '@yopmail.com';
        // Navigate to the Dashboard page
        await this.page.locator(DashboardLocators.dashboardLeftMenuBtn).click();

        // Opening dropdown and Select Additional Admin option    
        await this.page.locator(DashboardLocators.additionalRequestsSelect).click();
        await this.page.locator(DashboardLocators.options).locator("//li[text()='Additional Admin']").click();

        await this.page.waitForLoadState('load');
        await this.page.waitForLoadState('networkidle')
        await this.page.waitForTimeout(1000); // Wait for the page to load completely

        // Filling Admin Details
        await this.page.waitForSelector(DashboardLocators.firstNameTxt, { state: 'visible' });
        await this.page.locator(DashboardLocators.firstNameTxt).fill('HMPAuto');
        await this.page.locator(DashboardLocators.lastNameTxt).fill('Admin');
        await this.page.locator(DashboardLocators.nationalitySelectTxt).fill('Argentina');
        await this.page.keyboard.press('Enter');
        await this.page.locator(DashboardLocators.passportQidTxt).fill('123456789')
        await this.page.locator(DashboardLocators.emailAddressTxt).fill(adminEmail);
        await this.page.locator(DashboardLocators.contactNumberTxt).fill('1234567890');
        await this.page.locator(DashboardLocators.passportQidDoc).setInputFiles('./src/Resources/Passports/Algeria/Passport 1.jpg');

        await this.attachScreenshot(testInfo, 'Admin Data Fields are filled', true);

        await this.page.locator(DashboardLocators.submitBtn).click();
        await this.page.waitForTimeout(2000);
        await this.page.waitForLoadState('load');

        //Navigating to Requests Page
        await this.page.locator(RequestsLocators.requestsLeftMenuBtn).click();
        await this.page.waitForLoadState('domcontentloaded');

        var record = this.page.locator(RequestsLocators.requestsTableRows).locator("//td/p[text()='" + adminEmail + "']/ancestor::tr/td[7]/span")
        expect(await record.textContent()).toBe("Pending");
        await this.attachScreenshot(testInfo, 'Admin Request is created with the Status Pending', true);

        return adminEmail;
    }

    async createAdditionalRepresentativeRequest(testInfo) {

        var randomFiveDigit = this.generateRandomFiveDigit();
        var repEmail = 'HMPAuto.Rep' + randomFiveDigit + '@yopmail.com';
        // Navigate to the Dashboard page
        await this.page.locator(DashboardLocators.dashboardLeftMenuBtn).click();

        // Opening dropdown and Select Additional Representative option    
        await this.page.locator(DashboardLocators.additionalRequestsSelect).click();
        await this.page.locator(DashboardLocators.options).locator("//li[text()='Additional Representative']").click();

        await this.page.waitForLoadState('load');
        await this.page.waitForLoadState('networkidle')
        await this.page.waitForTimeout(1000); // Wait for the page to load completely

        // Filling Admin Details            
        await this.page.locator(DashboardLocators.adminSelectTxt).type('HMPAuto', { delay: 100 });
        await this.page.locator(DashboardLocators.adminSelectTxt).press('Enter');
        await this.page.locator(DashboardLocators.firstNameTxt).fill('HMPAuto');
        await this.page.locator(DashboardLocators.lastNameTxt).fill('Rep');
        await this.page.locator(DashboardLocators.nationalitySelectTxt).fill('Argentina');
        await this.page.locator(DashboardLocators.nationalitySelectTxt).press('Tab');
        await this.page.locator(DashboardLocators.passportQidTxt).fill('122334455');
        await this.page.locator(DashboardLocators.emailAddressTxt).fill(repEmail);
        await this.page.locator(DashboardLocators.contactNumberTxt).fill('1234567890');
        await this.page.locator(DashboardLocators.passportQidDoc).setInputFiles("./src/Resources/Permit.jpg");

        await this.attachScreenshot(testInfo, 'Representative Data Fields are filled', true);

        await this.page.locator(DashboardLocators.submitBtn).click();
        await this.page.waitForTimeout(2000);
        await this.page.waitForLoadState('load');

        //Navigating to Requests Page
        await this.page.locator(RequestsLocators.requestsLeftMenuBtn).click();
        await this.page.waitForLoadState('domcontentloaded');
        //Navigating to Representative Tab
        await this.page.locator(RequestsLocators.representativeTabBtn).click();
        await this.page.waitForLoadState('domcontentloaded');

        var record = this.page.locator(RequestsLocators.requestsTableRows).locator("//td/p[text()='" + repEmail + "']/ancestor::tr/td[7]/span")
        expect(await record.textContent()).toBe("Pending");
        await this.attachScreenshot(testInfo, 'Representative Request is created with the Status Pending', true);

        return repEmail;
    }

    // For Existing Visa Type
    async createVisaQuotaRequest(testInfo, eventName, qty) {
        // Navigate to the Dashboard page
        await this.page.locator(DashboardLocators.dashboardLeftMenuBtn).click();

        // Opening dropdown and Select Visa Quota option    
        await this.page.locator(DashboardLocators.additionalRequestsSelect).click();
        await this.page.locator(DashboardLocators.options).locator("//li[text()='Visa Quota']").click();

        await this.page.waitForLoadState('load');
        await this.page.waitForLoadState('networkidle')
        await this.page.waitForTimeout(1000); // Wait for the page to load complete

        // Selecting the Event
        await this.page.locator(DashboardLocators.visaQuota_selectVisaTypeSelect).click();
        await this.page.locator(DashboardLocators.options).locator("//li[text()='" + eventName + "']").click();

        await this.page.locator(DashboardLocators.visaQuota_noOfVisaTxt).fill(qty);
        await this.page.locator(DashboardLocators.addBtn).click();

        await this.attachScreenshot(testInfo, `Visa Request details added for ${eventName}`);

        await this.page.locator(DashboardLocators.submitBtn).click();
        console.log(`Visa Request details added for ${eventName} is submitted`);

        //Navigating to Requests Page
        await this.page.locator(RequestsLocators.requestsLeftMenuBtn).click();
        await this.page.waitForLoadState('domcontentloaded');

        await this.page.locator(RequestsLocators.visaQuotaTabBtn).click();
        await this.page.locator(RequestsLocators.requestsTableRows).nth(0).waitFor({ state: "visible" });
        await this.page.waitForTimeout(1000);


        // Find all rows for this Event Name
        const rows = this.page.locator(RequestsLocators.requestsTableRows).locator(`//td//p[text()='${eventName}']/ancestor::tr/td[6]/span`);
        await this.page.waitForTimeout(3000);
        const count = await rows.count();

        let pendingCount = 0;
        for (let i = 0; i < count; i++) {
            const status = await rows.nth(i).textContent();
            if (status === "Pending") {
                pendingCount++;
                // Optionally, scroll into view or take a screenshot here
                await rows.nth(i).scrollIntoViewIfNeeded();
            }
        }

        expect(pendingCount).toBe(1);
        await this.attachScreenshot(testInfo, `${eventName} Visa Quota Request is created with the Status Pending`, true);
    }

    // For New Visa Type
    async createNewVisaQuotaRequest(testInfo, visaName, qty) {
        // Navigate to the Dashboard page
        await this.page.locator(DashboardLocators.dashboardLeftMenuBtn).click();

        // Opening dropdown and Select New Visa Service option    
        await this.page.locator(DashboardLocators.additionalRequestsSelect).click();
        await this.page.locator(DashboardLocators.options).locator("//li[text()='New Visa Service']").click();

        await this.page.waitForLoadState('load');
        await this.page.waitForLoadState('networkidle')
        await this.page.waitForTimeout(1000); // Wait for the page to load complete

        // Selecting the Event
        await this.page.locator(DashboardLocators.newVisaSer_selectVisaTypeSelect).click();
        await this.page.locator(DashboardLocators.options).locator("//li[text()='" + visaName + "']").click();

        await this.page.locator(DashboardLocators.newVisaSer_noOfVisaTxt).fill(qty);
        await this.page.locator(DashboardLocators.addBtn).click();

        await this.attachScreenshot(testInfo, `New Visa Request details added for ${visaName} Visa`);

        await this.page.locator(DashboardLocators.submitBtn).click();
        console.log(`New Visa Request for ${visaName} is submitted`);

        //Navigating to Requests Page
        await this.page.locator(RequestsLocators.requestsLeftMenuBtn).click();
        await this.page.waitForLoadState('domcontentloaded');

        await this.page.locator(RequestsLocators.visaQuotaTabBtn).click();
        await this.page.locator(RequestsLocators.requestsTableRows).nth(0).waitFor({ state: "visible" });
        await this.page.waitForTimeout(1000);


        // Find all rows for this Visa Name Name
        const row = this.page.locator(RequestsLocators.requestsTableRows).locator(`//td/p[text()='${visaName}']/ancestor::tr/td[6]/span[text()='Pending']`);
        await expect(row).toBeVisible();
        await this.attachScreenshot(testInfo, `${visaName} Visa Request is created with the Status Pending`, true);
    }

    async createAdditionalHMPServiceRequest(testInfo, eventName, qty) {
        var randomDigits = this.generateRandomFiveDigit();
        const filmStart = new Date();
        const filmEnd = new Date(filmStart);      
        const peakPeriod = new Date(filmStart);      
        filmEnd.setDate(filmStart.getDate() + 10);
        peakPeriod.setDate(filmStart.getDate() + 2);
        // Navigate to the Dashboard page
        await this.page.locator(DashboardLocators.dashboardLeftMenuBtn).click();

        // Opening dropdown and Select Additional Service option    
        await this.page.locator(DashboardLocators.additionalRequestsSelect).click();
        await this.page.locator(DashboardLocators.options).locator("//li[text()='Additional Service']").click();

        // Selecting the Event
        await this.page.locator(DashboardLocators.eventsSelect).waitFor({ state: "visible" });
        await this.page.locator(DashboardLocators.eventsSelect).click();
        await this.page.locator(DashboardLocators.options).locator("//li[text()='" + eventName + "']").click();

        // Selecting HMP option
        await this.page.locator(DashboardLocators.hmpRadioBtn).check();
        await this.page.locator(DashboardLocators.proceedBtn).click();

        // Add HMP Details
        await this.fillDatePicker(EventsLocators.peakAppSubmissionPeriodTxt, this.formatDate(peakPeriod));
        await this.page.waitForTimeout(1000); // Wait for the date picker to update      
        await this.fillDatePicker(EventsLocators.filmPermitStartDateTxt, this.formatDate(filmStart));
        await this.page.waitForTimeout(1000); // Wait for the date picker to update
        await this.fillDatePicker(EventsLocators.filmPermitEndDateTxt, this.formatDate(filmEnd));
        await this.page.waitForTimeout(1000); // Wait for the date picker to update
        await this.page.locator(EventsLocators.requiredMediaApplicationsTxt).fill('3');

        // Entering Event Admin Details        
        await this.page.locator(EventsLocators.adminFirstNameTxt).type('HMPAuto', { delay: 100 });
        await this.page.locator(EventsLocators.adminLastNameTxt).type('Admin', { delay: 100 });

        await this.page.locator(EventsLocators.adminPassportQidTxt).type('122334455', { delay: 100 });
        await this.page.locator(EventsLocators.adminEmailAddressTxt).type('HMPAuto.Admin' + randomDigits + '@yopmail.com', { delay: 100 });
        await this.page.locator(EventsLocators.adminContactNumberTxt).type('1234567890', { delay: 100 });

        //await this.page.locator(EventsLocators.adminPassportQidDoc).setInputFiles("./src/Resources/Permit.jpg");
        await this.page.locator(EventsLocators.adminNationalitySelectTxt).click();
        await this.page.locator(EventsLocators.options).locator("//span[text()='Argentina']").click();

        await this.page.locator(EventsLocators.nextBtn).click();
        await this.page.waitForLoadState('domcontentloaded');

        //Navigating to Requests Page
        await this.page.locator(RequestsLocators.requestsLeftMenuBtn).click();
        await this.page.waitForLoadState('domcontentloaded');

        await this.page.locator(RequestsLocators.servicesTabBtn).click();
        await this.page.locator(RequestsLocators.requestsTableRows).nth(0).waitFor({ state: "visible" });
        await this.page.waitForTimeout(1000);


        // Find all rows for this Event Name
        const rows = this.page.locator(RequestsLocators.requestsTableRows).locator(`//td/p[text()='${eventName}']/ancestor::tr/td[5]/span`);
        const count = await rows.count();

        let pendingCount = 0;
        for (let i = 0; i < count; i++) {
            const status = await rows.nth(i).textContent();
            if (status === "Pending") {
                pendingCount++;
                // Optionally, scroll into view or take a screenshot here
                await rows.nth(i).scrollIntoViewIfNeeded();
            }
        }

        expect(pendingCount).toBe(1);
        await this.attachScreenshot(testInfo, `${eventName} HMP Request is created with the Status Pending`, true);
    }
}

export default DashboardPage;