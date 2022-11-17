import { auth } from './firebase.js'

// const apiURL = !!process?.env.API_URL ? process?.env.API_URL.replace(/\/$/, "") : 'http://localhost:8080';

// zapi calls the API with auth token if logged in
export default async function zapi(path, np = { method: 'GET', body: {}, formData: null, headers: {} }) {
    let headers = np.headers;
    if (!headers) {
        headers = {}
    }
    if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json'
    }
    let user = auth.currentUser;
    console.log("CURRENT USER:", user)
    if (user != null && !headers['Authorization']) {
        let token = await user.getIdToken();
        headers['Authorization'] = "Bearer " + token;
    }
    let data = {
        method: np.method,
        headers: headers
    };
    if (np.formData) {
        data.body = np.formData
        delete headers['Content-Type'] // see https://github.com/github/fetch/issues/505#issuecomment-293064470
    } else if (!(np.method === 'GET' || np.method === 'HEAD')) {
        data.body = JSON.stringify(np.body);
    }
    try {
        let response = await fetch(apiURL + path, data);
        console.log("RESPONSE STATUS:", response.status)
        switch (response.status) {
            case 413: // too large
                throw new ApiError(response.status, "Request too large")
        }
        let j = await response.json();
        if (response.status >= 400) {
            // then we got an error
            throw new ApiError(response.status, j.error.message);
        }
        return j;
    } catch (e) {
        console.log("CAUGHT ERROR:", e)
        throw e
    }
}

export const registerAsset = formData => zapi('/v1/assets', {
    method: 'POST', body: {}, formData
})
//     axios.post(`${apiURL}/v1/assets`, {
//     name,
//     description,
//     equity,
//     seeking,
//     location,
//     category,
//     valuation,
//     sharePrice
// })

// export const getAssets = () => zapi('/v1/assets', {
//     method: 'GET'
// })

export const getAssets = uid => zapi(`/v1/assets/${uid}`)

export const getAsset = id => zapi(`/v1/assets/info/${id}`)

export const addOrganization = formData => zapi('/v1/organizations', {
    method: 'POST', body: {}, formData
})

export const getOrganizations = email => zapi(`/v1/organizations/user/${email}`)

export const getOrganizationAssets = orgid => zapi(`/v1/organizations/${orgid}/assets`)

export const getOrganization = id => zapi(`/v1/organizations/${id}`)

export const getOrganizationUsers = orgid => zapi(`/v1/users/${orgid}`)

export const getAdminOrgs = email => zapi(`/v1/organizations/admin/${email}`)

export const inviteUser = (orgid, email) => zapi(`/v1/organizations/${orgid}`, { method: 'POST', body: { email } })

export const leaveOrg = (orgid, email) => zapi(`/v1/organizations/${orgid}`, { method: 'DELETE', body: { email } })

export const tokenize = (id, walletAddress) => zapi('/v1/assets/tokenize', { method: 'POST', body: { id, walletAddress } })

export const completeTokenize = (id, tokenId) => zapi('/v1/assets/tokenize', { method: 'PUT', body: { id, tokenId } })

class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }

    toString() {
        return `${this.message}`;
    }
}

export { zapi };

