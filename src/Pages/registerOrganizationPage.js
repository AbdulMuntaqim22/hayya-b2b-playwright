import { expect, testInfo } from '@playwright/test';
import { RegisterOrganizationLocators } from '../Locators/registerOrganizationLocators';
import BasePage from './basePage';
import fs from 'fs';

class RegisterOrganizationPage extends BasePage {
    constructor(page) {
        super(page);
        this.page = page;
    }
    
    async fillRegisterOrganizationForm(data) {
        // Filling Organization Name
        await this.page.fill(RegisterOrganizationLocators.orgNameTxt, data.orgName);
        
        // Filling Establishment Number
        await this.page.fill(RegisterOrganizationLocators.establishmentNoTxt, data.establishmentNo);
        
        // Filling Establishment Card Expiry Date
        await this.page.fill(RegisterOrganizationLocators.establishmentExpDateTxt, data.establishmentExpDate);
        
        // Filling Requestor Name
        await this.page.fill(RegisterOrganizationLocators.requestorNameTxt, data.requestorName);
        
        // Filling Job Title
        await this.page.locator(RegisterOrganizationLocators.jobTitleTxt).fill(data.jobTitle);
        await this.page.locator(RegisterOrganizationLocators.jobTitleTxt).press('Enter'); // Press Enter to select the job title
        
        // Selecting Requestor's Nationality
        await this.page.locator(RegisterOrganizationLocators.requestorNationalitySelect).fill(data.requestorNationality);
        await this.page.locator(RegisterOrganizationLocators.requestorNationalitySelect).press('Enter');

        // Filling Requestor's QID Number
        await this.page.fill(RegisterOrganizationLocators.requestorsQatarIDTxt, data.requestorsQatarID);

        // Filling Requestor Date of Birth
        await this.page.fill(RegisterOrganizationLocators.requestorDobTxt, data.requestorDob);

        //Filling Requestor's Contact Number
        await this.page.fill(RegisterOrganizationLocators.requestorsContactNumTxt, data.requestorsContactNum);

        // Filling Organization's Authorized Signatory Name
        await this.page.fill(RegisterOrganizationLocators.orgAuthorizedSignatoryNameTxt, data.orgAuthorizedSignatoryName);

        // Filling Signatory QID
        await this.page.fill(RegisterOrganizationLocators.signatoryQatarIDTxt, data.signatoryQatarID);

        // Filling Signatory Contact Number
        await this.page.fill(RegisterOrganizationLocators.signatoryContactNumTxt, data.signatoryContactNum);

        // uploading Authorizer Letter
        await this.page.setInputFiles(RegisterOrganizationLocators.authorizerLetterUpload, data.authorizerLetterPath);

        // uploading Establishment Card Image
        await this.page.setInputFiles(RegisterOrganizationLocators.establishmentCardUpload, data.establishmentCardPath);

        await this.attachScreenshot(testInfo, 'Register Organization Form Filled', true);

        // clicking on the verify button
        await this.page.click(RegisterOrganizationLocators.verifyBtn);

        await expect(this.page.getByText('Organization Details')).toBeVisible();
    }
}

export default RegisterOrganizationPage;