const TOKEN_STORAGE_KEY = 'paytm_token';
const DISPLAY_NAME_STORAGE_KEY = 'paytm_display_name';

export const getAuthToken = () => localStorage.getItem(TOKEN_STORAGE_KEY) || '';

export const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
    }
};

export const getDisplayName = () => localStorage.getItem(DISPLAY_NAME_STORAGE_KEY) || '';

export const setDisplayName = (name) => {
    if (name) {
        localStorage.setItem(DISPLAY_NAME_STORAGE_KEY, name);
    }
};

export const saveSession = ({ token, displayName }) => {
    setAuthToken(token);
    setDisplayName(displayName);
};

export const clearSession = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(DISPLAY_NAME_STORAGE_KEY);
};

export const isAuthenticated = () => Boolean(getAuthToken());
