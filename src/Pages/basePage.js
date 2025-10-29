import { expect, testInfo } from '@playwright/test';

class BasePage {
  constructor(page) {
    this.page = page;
  }
  formatDate(date, format) {
  if (!(date instanceof Date) || isNaN(date)) {
    throw new Error("Invalid date object");
  }

  // Default format using your existing logic
  if (!format) {
    return date.toLocaleDateString('en-GB');
  }

  const map = {
    dd: String(date.getDate()).padStart(2, '0'),
    MM: String(date.getMonth() + 1).padStart(2, '0'),
    yyyy: date.getFullYear(),
    yy: String(date.getFullYear()).slice(-2),
    HH: String(date.getHours()).padStart(2, '0'),
    mm: String(date.getMinutes()).padStart(2, '0'),
    ss: String(date.getSeconds()).padStart(2, '0'),
    MMM: date.toLocaleString('en-GB', { month: 'short' }),
    MMMM: date.toLocaleString('en-GB', { month: 'long' }),
  };

  return format.replace(/dd|MM|yyyy|yy|HH|mm|ss|MMM|MMMM/g, (match) => map[match]);
}


  generateRandomFiveDigit() {
    return Math.floor(10000 + Math.random() * 90000).toString();
  }

  async fillDatePicker(locator, date) {
    await this.page.waitForSelector(locator, { state: 'visible' });
    await this.page.$eval(locator, (element, eventStart) => {
      element.setAttribute('value', eventStart);
      element?.dispatchEvent(new Event('input', { bubbles: true }));
      element?.dispatchEvent(new Event('change', { bubbles: true }));
    }, date);
  }

  async fillTimePicker(locator, hour, minute, ampm) {
    await this.page.waitForSelector(locator, { state: 'visible' });
    await this.page.click(locator);
    await this.page.waitForSelector('[role="dialog"]');
    await this.page.click(`//li[@role='option' and text()='${hour}']`, { force: true });
    await this.page.click(locator);
    await this.page.click(`//li[@role='option' and text()='${minute}']`, { force: true });
    await this.page.click(locator);
    await this.page.click(`//li[@role='option' and text()='${ampm}']`, { force: true });
    //await this.page.click('//button[text()="OK"]');
  }

  async waitForLoaderToDisappear() {
    // Wait for the loader/overlay to be detached from DOM (not visible)
    try{await this.page.waitForSelector('.loader-overlay', { state: 'detached' });}
    catch{}
  }

  /**
 * Waits until a table column value changes to the expected value.
 * Reloads the page until the value matches or max retries is hit.
 *
 * @param page - Playwright Page object
 * @param url - The page URL to reload
 * @param selector - Selector for the table cell (e.g., column)
 * @param expectedValue - The value to wait for
 * @param maxRetries - Number of reload attempts (default 10)
 * @param delayMs - Delay between retries in milliseconds (default 3000)
 */
  async reloadUntilValueChanges(selector, expectedValue, maxRetries= 15, delayMs= 3000) {
    let currentValue = '';
    let retries = 0;

    while (retries < maxRetries) {      
      try {
        await this.page.waitForSelector(selector, { timeout: 5000 });
        currentValue = await this.page.locator(selector).textContent();
        console.log(`Attempt ${retries + 1}: ${currentValue?.trim()}`);
      } catch (err) {
        console.warn(`Attempt ${retries + 1}: Failed to read selector ${selector}`);
      }

      if (currentValue?.trim() === expectedValue) {
        console.log(`Expected value "${expectedValue}" matched.`);
        return currentValue.trim();
      }
      else{
        await this.page.reload();
        await this.page.waitForLoadState('load');
      }

      retries++;
      await this.page.waitForTimeout(delayMs);
    }

    throw new Error(
      `Value did not match after ${maxRetries} attempts. Last value: "${currentValue?.trim()}"`
    );
  }



  async attachScreenshot(testInfo, name = 'screenshot', fullPage = true) {
    const screenshot = await this.page.screenshot({ path: `./screenshots/${name}.png`, fullPage: fullPage });

    await testInfo.attach(name, {
      body: screenshot,
      contentType: 'image/png',
    });
  }

  // Function to get a date object from a custom date string
  getDateJsonObject({ days = 0, months = 0, years = 0 } = {}){
    var now = new Date();
      var futureDate = new Date(Date.UTC(
        now.getFullYear() + years,
        now.getMonth() + months,
        now.getDate() + days,
        now.getHours(),
      ));

      // Shift to Qatar timezone (UTC+3)
      futureDate.setHours(futureDate.getHours() - 5);

      var day = futureDate.getUTCDate().toString().padStart(2, '0');
      var month = futureDate.toLocaleString('default', { month: 'short' }).slice(0, 3);
      var year = futureDate.getUTCFullYear();

      return {"day":day, "monthStr":month,"month":futureDate.getMonth()+1, "year":year};
  }
}
export default BasePage;