import { expect, testInfo } from '@playwright/test';
import { LoginLocators } from '../Locators/loginLocators';
import BasePage from './basePage';
import fs from 'fs';

class LoginPage extends BasePage {
    constructor(page) {
        super(page);
        this.page = page;
    }

    async login(testInfo, {email, password}) {        
        
        await this.page.goto('');

        // filling email
        await this.page.fill(LoginLocators.emailTxt, email);

        // filling password
        await this.page.fill(LoginLocators.passwordTxt, password);

        // clicking login button
        await this.page.click(LoginLocators.loginBtn);

        let otpVisible = false;
        try{
            await this.page.locator(LoginLocators.otp1).waitFor({state:'visible',timeout: 20000 });
            otpVisible = true;
        }
        catch (error) {
            otpVisible = false;
        }

        if(otpVisible){
            const otp = await this.extractOTP(email);
            
            await this.page.locator(LoginLocators.otp1).fill(otp[0]);
            await this.page.locator(LoginLocators.otp2).fill(otp[1]);
            await this.page.locator(LoginLocators.otp3).fill(otp[2]);
            await this.page.locator(LoginLocators.otp4).fill(otp[3]);
            await this.page.locator(LoginLocators.otp5).fill(otp[4]);
            await this.page.locator(LoginLocators.otp6).fill(otp[5]);

            await this.page.click(LoginLocators.verifyBtn);
            await this.page.click(LoginLocators.continueBtn);
        }
        
        // waiting for navigation to complete
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForLoadState('domcontentloaded');

        // verifying successful login
        await expect(this.page.locator(LoginLocators.profileIconBtn)).toBeVisible();

        // attaching screenshot
        await this.attachScreenshot(testInfo, 'Login Successfull', false);
    }

    async extractOTP(email) {
        const context = this.page.context();          // Get context from existing page
        const newTab = await context.newPage();  // Open new tab

        newTab.setDefaultTimeout(30000); // Set timeout for the new tab
        await newTab.goto("https://yopmail.com", { waitUntil: 'load' });  // Navigate to URL
        await newTab.locator(LoginLocators.yopMailTxt).fill(email); // Fill in the email input
        await newTab.locator(LoginLocators.refreshBtn).click(); // Press Enter to submit 
        var content = await newTab.frameLocator(LoginLocators.mailIframe).locator(LoginLocators.mailContent).textContent();               

        const otpMatch = content.match(/\b\d{6}\b/);

        if (otpMatch) {
            const otp = otpMatch[0];
            console.log("Extracted OTP:", otp);
        } else {
            console.log("OTP not found.");
        }

        await newTab.close();
        return otpMatch ? otpMatch[0] : null;        
    }
}

export default LoginPage;