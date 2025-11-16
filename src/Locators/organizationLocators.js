export const OrganizationLocators = {
    organizationLeftMenuBtn: "//div[@role='button']//span[text()='Organization']",
    emailTxt: "//p[text()='Email']/following-sibling::p[text()='{AdminEmail}']",
    orgDetails: "#registration-details-content",
    visaQuotas: "//h6[text()='Visa Quota']/ancestor::h3/following-sibling::div//div[contains(@class,'MuiGrid-item')]",
    requestedVisaQuotas: "//h6[text()='Requested Visa Quota']/ancestor::h3/following-sibling::div//div[contains(@class,'flex-wrap')]/div",
    admins: "//h6[text()='Admins & Representatives']/ancestor::h3/following-sibling::div//div[@class='mb-6']",
    representatives: "//h6[text()='Admins & Representatives']/ancestor::h3/following-sibling::div//h3[text()='Representatives']/following-sibling::div"
    
};