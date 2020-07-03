const axios = require('axios');

const createRequest = ({ data = {}, method, url, headers = {} }) => {
    return {
        data,
        headers,
        method,
        url,
    };
};

const sendRequest = async (request) => {
    const { data } = await axios({
        data: request.data || {},
        method: request.method,
        url: request.url,
        headers: request.headers,
    });

    return data;
};

module.exports = {
    createRequest,
    sendRequest,
};
