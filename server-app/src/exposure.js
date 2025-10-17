const express = require('express'),
	path = require('path'),
	bodyParser = require('body-parser');

let params, commonCallbacks, dataCallbacks, authCallbacks;

function expose(app) {

	app.use(express.urlencoded({ extended: false }));

	if (!params.useBuilt) {
		require('./styles')(app);
		exposeContents(app, 'node_modules');
	}

	exposeContents(app, 'client-app');

	app.set('view engine', 'pug')
		.set('views', path.join(__dirname, '..', 'views'));

	exposeRoutes(app);
}

function exposeContents(app, directoryName) {

	const pathOptions = {
		maxAge: 600000,
		index: false
	};

	const exposedPath = path.join(__dirname, '../..', directoryName),
		staticPropName = 'static',
		servedPath = express[staticPropName](exposedPath, pathOptions);

	app.use(servedPath)
		.use('/' + directoryName, servedPath);
}

function exposeRoutes(app) {

	app.get('/activateAccount/:token', commonCallbacks.onActivateAccountRequest)
		.get('/noSupportBrowser', commonCallbacks.onNoSupportBrowserRequest)
		.get('/404', commonCallbacks.on404Request)
		.get('/robots.txt', commonCallbacks.onRobotsRequest)
		.get('/config', dataCallbacks.onConfigRequest)
		.get('/sitemap.xml', dataCallbacks.onSitemapRequest)
		.get(/^.+\.js$/, commonCallbacks.onNullableJsRequest)
		.get(/.*/, commonCallbacks.onGeneralRequest)
		.post('/oauth/revoke', bodyParser.json(), authCallbacks.onOauthRevokeRequest)
		.post('/oauth/token', authCallbacks.onOauthTokenRequest)
		.post('/oid/revoke', bodyParser.json(), authCallbacks.onOidRevokeRequest)
		.post('/oid/token', authCallbacks.onOidTokenRequest)
		.post('/oid/refresh', bodyParser.json(), authCallbacks.onOidTokenRequest)
		.post('/oid/payload', bodyParser.json(), authCallbacks.onOidTokenPayloadRequest)
		.use(commonCallbacks.onUnknownRequest);
}

module.exports = function(loggerParameter, paramsParameter, versionParameter) {

	const externalRequest = require('./externalRequest')(loggerParameter);

	params = paramsParameter;

	commonCallbacks = require('./common-callbacks')(loggerParameter, params, versionParameter);
	dataCallbacks = require('./data-callbacks')(loggerParameter, externalRequest);
	authCallbacks = require('./auth-callbacks')(loggerParameter, externalRequest);

	return {
		exposeApp: expose
	};
};
