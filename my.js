import fs from 'fs';
import API from './src/Pages/api.js';
import {chromium} from 'playwright'; // correct for chromium.launch()


async function MyFunction(){    
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    var apiConfig = JSON.parse(fs.readFileSync('./src/utils/apiConfig.json', 'utf-8'));
    var visaData = JSON.parse(fs.readFileSync('./src/Resources/Visas.json', 'utf-8'));
    var adminApi = new API(page, apiConfig.baseUrl);    

    var credentials = JSON.parse(fs.readFileSync('./src/utils/userCreds.json', 'utf-8'));

    await adminApi.init(); // Initialize the API instance
    await adminApi.GetAccessToken(credentials.adminUser);

   await adminApi.deleteAllProfiles(visaData.orgName); 
   await adminApi.deleteAllDraftApps(visaData.orgName);
   await adminApi.deleteAllGroups(visaData.orgName);

    await browser.close();
}
await MyFunction();