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
    const { data, headers } = await axios({
        data: request.data || {},
        method: request.method,
        url: request.url,
        headers: request.headers,
    });

    console.log(headers);


    return {
        data,
        headers
    };
};

module.exports = {
    createRequest,
    sendRequest,
};
