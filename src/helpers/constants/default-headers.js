const defaultHeaders = [
    { name: 'Access-Control-Allow-Origin', value: '*', },
    { name: 'Access-Control-Allow-Credentials', value: 'true', },
    { name: 'Access-Control-Allow-Methods', value: 'GET,PUT,POST,DELETE' },
    { name: 'Access-Control-Allow-Headers', value: 'X-Requested-With, Accept, Origin, Referer, User-Agent, Content-Type, Authorization, X-Mindflash-SessionID' },
];

module.exports = defaultHeaders;
