const getDefaultHeaders = () => ([
    {
        name: 'Access-Control-Allow-Origin',
        value: '*',
    },
    {
        name: 'Access-Control-Allow-Credentials',
        value: 'true',
    },
    {
        name: 'Access-Control-Allow-Methods',
        value: 'GET,PUT,POST,DELETE'
    },
    {
        name: 'Access-Control-Allow-Headers',
        value: 'X-Requested-With, Accept, Origin, Referer, User-Agent, Content-Type, Authorization, X-Mindflash-SessionID'
    },
]);

const addHeaders = (res) => {
    const headers = getDefaultHeaders();

    for (const header of headers) {
        const currentHeader = res.get(header.name);
        if (!currentHeader) {
            res.set(header.name, header.value);
        } else if (Array.isArray(currentHeader)) {
            res.set(header.name, [...currentHeader, header.value]);
        } else {
            res.set(header.name, [currentHeader, header.value]);
        }
    }
};

module.exports = {
    addHeaders,
};
