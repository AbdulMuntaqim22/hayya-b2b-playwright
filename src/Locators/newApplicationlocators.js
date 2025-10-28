export const NewApplicationLocators = {
    newAppLeftMenuBtn: "//div[@role='button']//span[text()='New Application']",
    manualAppBtn: "//div[text()='Manual Application']/ancestor::div[1]/following-sibling::div/span",
    bulkUploadBtn: "//div[text()='Bulk Upload']/ancestor::div[1]/following-sibling::div/span",
    eventSelect: "#eventId",
    visaCategorySelect: "#visaTypeId",
    visaTypeSelect: "#visitTypeId",
    groupNameTxt: "#groupName",
    internationalApplicantOptionCheckbox: "//span[text()='International Applicant']/preceding-sibling::div//input[@name='applicantTypeAnswerId']",
    qatarResidentOptionCheckbox: "//span[text()='Qatar Resident']/preceding-sibling::div//input[@name='applicantTypeAnswerId']",
    accommodationDetailsTxt: "#accommodationDetails",
    options: "//ul[@role='listbox']",
    nextBtn: "//button[text()='Next']",
    uploadZipFile: "#file-upload",
    personalPhoto: "//label[text()='Personal Photo']/following-sibling::div/input",
    passportImage: "//label[text()='Passport Image']/following-sibling::div/input",
    passportNumTxt: "//label[text()='Passport Number']/following-sibling::input",
    emailTxt: "//label[text()='Email']/following-sibling::input",
    visitTypeSelect: "//label[text()='Visit Type']/following-sibling::div//input",    
    passportTypeSelect: "//label[text()='Passport Type']/following-sibling::div//input",
    expDateTxt: "//label[text()='Exp Date']/following-sibling::div//input",
    issueDateTxt: "//label[text()='Issue Date']/following-sibling::div//input",
    residenceExpDateTxt: "(//label[text()='Exp Date']/following-sibling::div//input)[2]",
    dobTxt: "//label[text()='Date of Birth']/following-sibling::div//input",
    countryIssuingPassportSelect: "//label[text()='Country Issuing Passport']/following-sibling::div//input",
    jobTitleSelect: "//label[text()='Select Job Title']/following-sibling::div//input",
    nationalitySelect: "//label[text()='Nationality']/following-sibling::div//input",
    countryOfBirthSelect: "//label[text()='Country of Birth']/following-sibling::div//input",
    countryOfResidenceSelect: "//label[text()='Country of Residency']/following-sibling::div//input",
    gccCountryOfResidenceSelect: "//label[text()='GCC Country of Residency']/following-sibling::div//input",
    otherNationalityCountrySelect: "//label[text()='Other Nationality']/following-sibling::div//input",    
    otherNationalitySelect: "//label[text()='Do you have previous/other nationality?']/following-sibling::div//input",
    otherNationalityYesOption: "//label/span[text()='Yes']/preceding-sibling::div/input",
    otherNationalityNoOption: "//label/span[text()='No']/preceding-sibling::div/input",
    residencyTypeCheckbox: "//span[text()='Residency']/preceding-sibling::div//input[@name='selecttype']",
    visaTypeA3Checkbox: "//span[text()='Visa']/preceding-sibling::div//input[@name='selecttype']",

    previousOtherCitizenshipSelect: "//label[text()='Previous/Other Citizenship']/following-sibling::div//input",

    toastMsg: "//div[contains(@class,'toast') and @role='alert']",

    maleOption: "//label/span[text()='Male']/preceding-sibling::div/input",
    femaleOption: "//label/span[text()='Female']/preceding-sibling::div/input",

    firstNameTxt: "//label[text()='First Name']/following-sibling::input",
    middleNameTxt: '//label[text()="Middle Name/Father\'s Name"]/following-sibling::input',
    thirdNameTxt: "//label[text()='Third Name']/following-sibling::input",
    fourthNameTxt: "//label[text()='Fourth Name']/following-sibling::input",
    lastNameTxt: "//label[text()='Last Name']/following-sibling::input",

    firstArabicNameTxt: "//label[text()='First Arabic Name']/following-sibling::input",
    secondArabicNameTxt: '//label[text()="Second Arabic Name"]/following-sibling::input',
    thirdArabicNameTxt: "//label[text()='Third Arabic Name']/following-sibling::input",
    fourthArabicNameTxt: "//label[text()='Fourth Arabic Name']/following-sibling::input",
    lastArabicNameTxt: "//label[text()='Last Arabic Name']/following-sibling::input",

    contactNoTxt: "//label[text()='Contact Number']/following-sibling::div//input",
    emergencyContactNameTxt: "//label[text()='Emergency Contact Name']/following-sibling::input",
    emergencyContactNoTxt: "//label[text()='Emergency Contact Number']/following-sibling::div//input",

    bookedAccommodationOption: "//label/span[text()='Booked Accommodation']/preceding-sibling::div/input",
    hostedByFamilyOption: "//label/span[text()='Hosted By Family & Friends']/preceding-sibling::div/input",
    
    accommodationDetailsTxt2: "//label[text()='Accommodation Details']/following-sibling::input",

    save_AddDependentBtn: "//button[text()='Save & Add Dependant']",
    updateApplicationBtn: "//button[text()='Update Application']",
    saveAsDraftBtn: "//button[text()='Save As Draft']",
    continueBtn: "//button[text()='Continue']",

    frontSideDoc: "//label[text()='Upload Front Side']/following-sibling::div//input",
    backSideDoc: "//label[text()='Upload Back Side']/following-sibling::div//input",
    candidateApprovalDoc: "//label[text()='Candidate Approval']/following-sibling::div//input",
    policeClearanceDoc: "//label[text()='Police Clearance from country of residence']/following-sibling::div//input",
    degreeDoc: "//label[text()='Authenticated Degree']/following-sibling::div//input",
    sectoralEndorsementDoc: "//label[text()='Sectoral Endorsement Letter']/following-sibling::div//input",
    medLicenseDoc: "//label[text()='Valid International license to practice Medicine']/following-sibling::div//input",
    cvDoc: "//label[text()='CV (including proof of experience)']/following-sibling::div//input",
    caseResearchDoc: "//label[text()='Case Research Report']/following-sibling::div//input",
    goodStandingCertDoc: "//label[text()='Certificate of Good Standing']/following-sibling::div//input",
    bankStatementDoc: "//label[text()='Personal Bank Statement (Last 3 months)']/following-sibling::div//input",
    offerLetterDoc: "//label[text()='Job Contract or Offer letter from Hiring entity']/following-sibling::div//input",



    residentPermitFront: "//label[text()='Resident permit document']/following-sibling::div//input",
    residentPermitBack: "//label[text()='Upload Back Side']/following-sibling::div//input",

    refreshBtn: "//img[@title='Refresh']",
    occupationTypeSelect: "//label[text()='Occupation Type']/following-sibling::div//input",
    maritalStatusSelect: "//label[text()='Marital Status']/following-sibling::div//input",
    placeOfBirthTxt: "//label[text()='Place Of Birth']/following-sibling::input",

    uploadZipFile: "//input[@id='file-upload' and @accept='.zip']",
    submitBtn: "//button[text()='Submit']",
    tableRows: "//table/tbody/tr",
    qidOption : "//input[@value='qid']",
    passportOption: "//input[@value='passport']",

    errorDialogMsg: "//div[@role='dialog']/h2[text()='Error']/parent::div//p",
    successDialogMsg: "(//div/h2[text()='Successful']/parent::div//p)[1]",


};