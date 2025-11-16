import { test, expect } from '@playwright/test';
const fs = require('fs');
import API from '../../Pages/api';
import LoginPage from '../../Pages/loginPage';
const { AllApplicationLocators } = require('../../Locators/allApplicationLocators');

test.describe.configure({ mode: 'parallel' }); 

test.describe('All Applications Page', () => {  
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

  test('Verify that All Applications Page has the correct Column Names', async ({ page }, testInfo) => {

    await page.click(AllApplicationLocators.allAppLeftMenuBtn);
    await page.waitForSelector(AllApplicationLocators.allAppPageTitle);

    const expectedColumnNames = [
        'Action',
        'Application Date',
        'First Name',
        'Last Name',
        'Application Number',
        'Status',
        'Hayya Number',
        'Entry Reference Number',
        'Email ID',
        'Created By',
        'Visit Category',
        'Visa Type',
        'Conference', 
        'Nationality',
        'Passport Number',
        'Qatar ID',
        'Submission Type',
        'Border Status',
        'Has Accreditation',
        'Accreditation Card Status',
        'No of Dependents',
        'Organization Group Name',
    ];
   
    let tableHeaders = page.locator(AllApplicationLocators.appTableHeader);
    const headerCount = await tableHeaders.count();
    for (let i = 0; i < headerCount; i++) {
        let headerName = tableHeaders.nth(i);
        await expect(headerName).toHaveText(expectedColumnNames[i]);
    }

    await loginPage.attachScreenshot(testInfo, page, 'All Applications Column Names are correct');

  });

    test.afterEach(async ({ }, testInfo) => {
    // For example, you might want to take a screenshot or log out
    await loginPage.attachScreenshot(testInfo, 'Test Completed');    

    // Add any cleanup code if necessary
    console.log(`Test completed: ${testInfo.title} with status: ${testInfo.status}`);

  });
});
