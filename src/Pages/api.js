import { request, expect } from '@playwright/test';

class API {
  constructor(page,baseURL) {    
    this.page = page;
    this.baseURL = baseURL;
    this.requestContext = null;
    this.token = null;
  }

  // Initialize request context
  async init() {
    this.requestContext = await request.newContext({
      baseURL: this.baseURL,
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
        // 'X-Source-Type': 'b2b',
        // 'X-Consumer-Type':'web',
        // 'User-Agent': 'PostmanRuntime/7.32.3' 
      },
    });
  }

  // Get access token (Example implementation)
async GetAccessToken(credentials) {
  // First, login and get the token
  const response = await this.requestContext.post("/api/shared/v1/Auth/login", {
    data: { "email": credentials.email, "password": credentials.encryptedPassword },
  });

  if (response.ok()) {
    const responseBody = await response.json();
    this.token = responseBody.result.access_token;

    // Dispose the old context
    await this.requestContext.dispose();

    // Create a new context with Authorization header
    this.requestContext = await request.newContext({
      baseURL: this.baseURL,
      extraHTTPHeaders: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',         
      },
    });

    return responseBody;
  } else {
    throw new Error(`Token request failed with status ${response.status()}`);
  }
}

  // GET request
  async GetRequest(endpoint, params = {}) {
    const response = await this.requestContext.get(endpoint, {
      params,
    });
    return await this._handleResponse(response);
  }

  // POST request
  async PostRequest(endpoint, payload) {
    const response = await this.requestContext.post(endpoint, {
      headers: {
        'X-Source-Type': 'b2b',
        'X-Consumer-Type':'web',
        'User-Agent': 'PostmanRuntime/7.32.3' 
      },      
      data: payload,
    });
    return { statusCode: response.status(), jsonResponse: await this._handleResponse(response)}
  }

  // PUT request
  async PutRequest(endpoint, payload) {
    const response = await this.requestContext.put(endpoint, {
      data: payload,
    });
    return { statusCode: response.status(), jsonResponse: await this._handleResponse(response)}
  }

  // DELETE request
  async DeleteRequest(endpoint) {
    const response = await this.requestContext.delete(endpoint);
    return { statusCode: response.status(), jsonResponse: await this._handleResponse(response)}
  }

  async DeleteRequestWithPayload(endpoint, payload) {
    const response = await this.requestContext.delete(endpoint,{
      data: payload
    });
    return { statusCode: response.status(), jsonResponse: await this._handleResponse(response)}
  }

  // Helper to handle response and errors
  async _handleResponse(response) {
    var jsonResponse = await response.json();
    if (jsonResponse.success) {
      return await response.json();
    } else {
      const body = await response.text();
      throw new Error(`Request failed [${response.status()}]: ${body}`);
    }
  }

  // Delete All Draft Application
  async deleteAllDraftApps(orgName){
    // Fetching All Organizations
    const orgs = await this.GetRequest(`/api/sc/v1/Organization/get-all?PageNumber=1&PageSize=10&SearchTerm=${orgName}`);
    const orgId = orgs.result[0].globalId;

    // Fetching All Draft Applications
    const draftApps = await this.PostRequest('/api/shared/v1/HayyaApplication/get-draft-applications', { "organizationGlobalId": orgId });

    const draftAppId = draftApps.jsonResponse.result.map(app => app.globalId);
    if (!draftAppId) throw new Error('No draft application with globalId found');
    console.log(draftAppId);

    // Deleting the Application
    const approveResponse = await this.PostRequest('/api/shared/v1/HayyaApplication/delete-draft-visa-application', draftAppId);
    expect(approveResponse.statusCode).toBe(200);
  }

  async deleteGroup(orgName, groupName){
    // Fetching All Organizations
    const orgs = await this.GetRequest(`/api/sc/v1/Organization/get-all?PageNumber=1&PageSize=10&SearchTerm=${orgName}`);
    const orgId = orgs.result[0].globalId;

    // Fetching All Groups Under an Organization
    const groups = await this.PostRequest('/api/b2b/v1/OrganizationGroup/get-all', { "organizationId": orgId });
    const groupId = groups.jsonResponse.result[0].organizationGroupDtos.find((group) => group.organizationGroupName === groupName).globalId;

    // Deleting the Group
    const delGroup = await this.DeleteRequestWithPayload('/api/b2b/v1/OrganizationGroup/delete-org-groups', [groupId]);
    expect(delGroup.statusCode).toBe(200);
  }

  async deleteAllGroups(){
    // Fetching All Organizations
    const orgs = await this.GetRequest(`/api/sc/v1/Organization/get-all?PageNumber=1&PageSize=50&SearchTerm=Test Automation`);
    const orgId = orgs.result[0].globalId;

    // Fetching All Groups Under an Organization
    const groups = await this.PostRequest('/api/b2b/v1/OrganizationGroup/get-all', { "organizationId": orgId });
    
    // Extract all group IDs from the response
    const groupIds = groups.jsonResponse.result[0].organizationGroupDtos.map(obj => obj.globalId);

    if(groupIds.length != 0){
      // Deleting all Groups
      const delGroup = await this.DeleteRequestWithPayload('/api/b2b/v1/OrganizationGroup/delete-org-groups', groupIds);
      expect(delGroup.statusCode).toBe(200);
    }    
  }

  async deleteCompleteProfile(groupName){
    let profileId=[];
    // Retrieving All Submitted Applications Data
    const subApp = await this.PostRequest('/api/sc/v1/OrganizationGroup/get-all-applications', { "pageNumber": 1, "pageSize": 10, "searchTerm": "Test Automation" });
    const subAppGlobalId = subApp.jsonResponse.result.filter((appId) => appId.organizationGroupName === groupName).map(app => app.globalId);
    for (let i = 0; i < subAppGlobalId.length; i++) {
      let getAppData = await this.GetRequest(`/api/b2b/v1/OrganizationGroup/get-application-by-id/${subAppGlobalId[i]}`);
      profileId.push(getAppData.result.userProfileId);
    }

    if(profileId.length != 0){
      // Deleting the Profile
      const delProfile = await this.DeleteRequestWithPayload('/api/b2c/v1/UserProfile/delete-complete-profile', profileId);
      expect(delProfile.statusCode).toBe(200);
    }
  }

  async deleteAllProfiles(){
    let profileId=[];
    // Retrieving All Submitted Applications Data
    const subApp = await this.PostRequest('/api/sc/v1/OrganizationGroup/get-all-applications', { "pageNumber": 1, "pageSize": 10, "searchTerm": "Test Automation" });
    const subAppGlobalId = subApp.jsonResponse.result.map(app => app.globalId);
    for (let i = 0; i < subAppGlobalId.length; i++) {
      let getAppData = await this.GetRequest(`/api/b2b/v1/OrganizationGroup/get-application-by-id/${subAppGlobalId[i]}`);
      profileId.push(getAppData.result.userProfileId);
    }
    if(profileId.length != 0){
      // Deleting the Profile
      const delProfile = await this.DeleteRequestWithPayload('/api/b2c/v1/UserProfile/delete-complete-profile', profileId);
      expect(delProfile.statusCode).toBe(200);
    }    
  }

  async approveApplication(entryReferenceNo){
    // Approving the Visa Request
    const approveResponse = await this.PostRequest('/api/shared/v1/ExternalCallback/moi/submitted-app', { "entryReferenceNumber": entryReferenceNo, "status": "approved", "rejectionReason": null, "isEditable": false, "visaApplication": null });
    expect(approveResponse.statusCode).toBe(200);
  }
  async updatePaymentStatus(subAppGlobalId){
    // Updating the Payment Status
    const paymentApproveRes = await this.PostRequest(`/api/sc/v1/Workflow/advance-workflow/${subAppGlobalId}?password=1yteBz@LeV8OBi$muRD`);
    expect(paymentApproveRes.statusCode).toBe(200);
  }

  async updateEntryVisa(entryReferenceNo, vNumber){
    const approveAppResponse = await this.PostRequest(`/api/shared/v1/ExternalCallback/moi/visa-permit`, { entryReferenceNumber: entryReferenceNo, visaNumber: vNumber, visaEntryType: 0, visaStartDate: "2025-07-15T21:44:58.147Z", visaEndDate: "2025-07-15T21:44:58.147Z", issueDate: "2025-07-15T21:44:58.147Z", lastEntryDate: "2025-07-15T21:44:58.147Z" });
    expect(approveAppResponse.statusCode).toBe(200);
  }

  async updateBorderStatus(entryReferenceNo, status){
    const response = await this.PutRequest(`/api/shared/v1/HayyaApplication/update-border-status`, { entryReferenceNumber: entryReferenceNo, borderStatus: status, expirationDateTime:"2025-07-15T21:44:58.147Z"});
    expect(response.statusCode).toBe(200);
  }

  async triggerMOIProcesses(){
    const response = await this.PostRequest(`/api/sc/v1/Workflow/trigger-jobs-for-moi-processes?password=Q7PnTITkKjCqX6v^%23Zf`);
    expect(response.statusCode).toBe(200);
  }

  async triggerConsumedJob(){
    const response = await this.PostRequest(`/api/sc/v1/Workflow/consumed-job`);
    expect(response.statusCode).toBe(200);
    await this.page.waitForTimeout(15000);
  }
}

export default API;
