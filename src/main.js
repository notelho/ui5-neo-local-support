const path = require('path');

const { applyDefaultHeaders, createAuthorizationHeader, applyCustomHeader } = require('./helpers/http/header');
const { createRequest, sendRequest } = require('./helpers/http/request');

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

    console.log(routes);
    console.log(destinations);

    return async (req, res, next) => {
        try {
            applyDefaultHeaders(res);

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

                console.log('dest: ' + uri);

                const customHeader = createAuthorizationHeader(destination);

                const request = createRequest({
                    method: req.method,
                    url: `${destination.uri}${uri}`,
                    data: req.body,
                    headers: customHeader
                });

                console.log('headers');
                const { data, headers } = await sendRequest(request);

                for (const property in headers) {
                    console.log('===================================================');
                    // console.log('-------------');
                    // console.log(property + ' - ' + headers[property]);
                    // console.log('-------------');
                    applyCustomHeader(res, property, headers[property]);
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
