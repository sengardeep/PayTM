import { getAuthToken } from './auth';

const API_BASE_PATH = '/api/v1';

const parseResponseBody = async (response) => {
    try {
        return await response.json();
    } catch {
        return null;
    }
};

const getErrorMessage = (payload) => {
    if (!payload) {
        return 'Request failed';
    }

    if (typeof payload.message === 'string' && payload.message.trim()) {
        return payload.message;
    }

    if (Array.isArray(payload._errors) && payload._errors[0]) {
        return payload._errors[0];
    }

    for (const value of Object.values(payload)) {
        if (value && typeof value === 'object' && Array.isArray(value._errors) && value._errors[0]) {
            return value._errors[0];
        }
    }

    return 'Request failed';
};

export const apiRequest = async (path, options = {}) => {
    const {
        method = 'GET',
        body,
        headers = {},
        withAuth = false,
    } = options;

    const requestHeaders = {
        ...headers,
    };

    if (body !== undefined) {
        requestHeaders['Content-Type'] = 'application/json';
    }

    if (withAuth) {
        const token = getAuthToken();
        if (!token) {
            const authError = new Error('Please sign in to continue');
            authError.status = 401;
            throw authError;
        }

        requestHeaders.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_PATH}${path}`, {
        method,
        headers: requestHeaders,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const responseBody = await parseResponseBody(response);

    if (!response.ok) {
        const requestError = new Error(getErrorMessage(responseBody));
        requestError.status = response.status;
        requestError.payload = responseBody;
        throw requestError;
    }

    return responseBody;
};
