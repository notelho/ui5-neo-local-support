const { Base64 } = require('js-base64');

const defaultHeaders = require('../constants/default-headers');

const applyDefaultHeaders = response => {
    for (const header of defaultHeaders) {
        applyCustomHeader(response, header.name, header.value);
    }
};

const applyCustomHeader = (response, headerProp, headerValue) => {
    const currentValue = response.get(headerProp);
    if (!currentValue) {
        response.set(headerProp, headerValue);
    } else if (Array.isArray(currentValue)) {
        response.set(headerProp, [...currentValue, ...headerValue]);
    } else {
        response.set(headerProp, [currentValue, headerValue]);
    }
};

const createAuthorizationHeader = (destination) => {
    const headers = {};
    const credentials = destination.credentials;
    if (credentials) {
        const user = credentials.user;
        const pass = credentials.password;
        const auth = Base64.encode(`${user}:${pass}`);
        headers['Authorization'] = `Basic ${auth}`;
    }
    return headers;
};

module.exports = {
    applyDefaultHeaders,
    applyCustomHeader,
    createAuthorizationHeader,
};
