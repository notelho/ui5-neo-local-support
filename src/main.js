const { Base64 } = require('js-base64');
const path = require('path');

const { createRequest, sendRequest } = require('./helpers/http/request');
const { addHeaders } = require('./helpers/http/response');

const getNeoAppRoute = (routes, url) => {
    for (const route of routes) {
        if (url.includes(route.path)) {
            return route;
        }
    }

    return false;
};

/**
 * Custom UI5 Server middleware
 *
 * @param {Object} parameters Parameters
 * @param {Object} parameters.resources Resource collections
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.all Reader or Collection to read resources of the
 *                                        root project and its dependencies
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.rootProject Reader or Collection to read resources of
 *                                        the project the server is started in
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.dependencies Reader or Collection to read resources of
 *                                        the projects dependencies
 * @param {Object} parameters.options Options
 * @param {string} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @param {string} [parameters.options.configuration.destination_path] Absolute Path in local system to find the set of destinations file
 * @param {string} [parameters.options.configuration.debug] If set, Logs messages for which calls are being proxied & from where
 * @return {function} Middleware function to use
 */
const createMiddleware = ({ resources, options }) => {
    const routes = require(resources.rootProject._readers[0]._project.path + '/neo-app.json')['routes'];
    const destinations = require(path.resolve(resources.rootProject._readers[0]._project.path, 'destinations.json'));

    return async (req, res, next) => {
        try {
            addHeaders(res);

            if (req.method === 'OPTIONS') {
                res.status(200);
                next();
                return;
            }

            const neoAppRoute = getNeoAppRoute(routes, req.url);
            if (!neoAppRoute) {
                next();
                return;
            }

            const destination = destinations[neoAppRoute.target.name];
            if (destination) {
                const uri = req.url.includes('/resources') ? req.url.split('/resources/')[1] : neoAppRoute.target.entryPath;

                let headers = {};
                if (destination.credentials) {
                    const credentials = Base64.encode(`${destination.credentials.user}:${destination.credentials.password}`);
                    headers = {
                        Authorization: `Basic ${credentials}`
                    };
                }

                const request = createRequest({
                    method: req.method,
                    url: `${destination.uri}${uri}`,
                    data: req.body,
                    headers
                });

                const { data, headers: responseHeaders } = await sendRequest(request);

                for (const header in responseHeaders) {
                    const currentHeader = res.get(header);
                    if (!currentHeader) {
                        res.set(header, responseHeaders[header]);
                    } else if (Array.isArray(currentHeader)) {
                        res.set(header, [...currentHeader, responseHeaders[header]]);
                    } else {
                        res.set(header, [currentHeader, responseHeaders[header]]);
                    }
                }

                res.status(200).send(data);
            }

            next();
        } catch (err) {
            next(err);
        }
    };
};

module.exports = createMiddleware;
