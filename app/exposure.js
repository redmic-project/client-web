const express = require('express'),
	bodyParser = require('body-parser'),
	path = require('path'),
	http = require('http'),
	https = require('https'),

	oauthUrl = process.env.OAUTH_URL,
	oauthClientId = process.env.OAUTH_CLIENT_ID,
	oauthClientSecret = process.env.OAUTH_CLIENT_SECRET,
	production = !!parseInt(process.env.PRODUCTION, 10),
	apiUrl = process.env.API_URL,
	configUrl = process.env.CONFIG_URL,
	sitemapUrl = process.env.SITEMAP_URL,

	configExpirationMs = 3600000,
	sitemapExpirationMs = 36000000;

let logger, params, version, robotsContent, configContent, configLastUpdated, sitemapContent, sitemapLastUpdated,
	externalRequest;

function getLang(req) {

	return req && req.headers && req.headers['content-language'] || params.lang;
}

function getEnv(req) {

	return {
		version: version,
		useBuilt: params.useBuilt,
		debug: params.debug,
		apiUrl: apiUrl,
		production: production,
		lang: getLang(req)
	};
}

function onGeneralRequest(req, res) {

	res.render('index', {
		env: getEnv(req)
	});
}

function onActivateAccountRequest(req, res) {

	res.render('activateAccount', {
		env: getEnv(req),
		token: req.params.token
	});
}

function onNoSupportBrowserRequest(req, res) {

	res.render('noSupportBrowser', {
		env: getEnv(req)
	});
}

function on404Request(req, res) {

	res.status(404);
	res.render('404', {
		env: getEnv(req)
	});
}

function onConfigRequest(req, res) {

	res.set('Content-Type', 'application/json');

	const currTimestamp = Date.now();

	if (!configContent || !configContent.length || req.forceRefresh ||
		configLastUpdated < currTimestamp - configExpirationMs) {

		const afterResponseCallback = (status, content) => configContent = status ? content : '';

		const internalReq = https.request(configUrl, externalRequest.onOwnRequestResponse.bind(this, {
			originalRes: res,
			afterResponse: afterResponseCallback
		}));

		internalReq.on('error', externalRequest.onOwnRequestError.bind(this, res));

		internalReq.end();

		configLastUpdated = currTimestamp;
	} else {
		res.send(configContent);
	}
}

function onSitemapRequest(_req, res) {

	res.set('Content-Type', 'text/xml');

	const currTimestamp = Date.now();

	if (!sitemapContent || !sitemapContent.length || sitemapLastUpdated < currTimestamp - sitemapExpirationMs) {
		const afterResponseCallback = (status, content) => sitemapContent = status ? content : '';

		const internalReq = https.request(sitemapUrl, externalRequest.onOwnRequestResponse.bind(this, {
			originalRes: res,
			afterResponse: afterResponseCallback
		}));

		internalReq.on('error', externalRequest.onOwnRequestError.bind(this, res));

		internalReq.end();

		sitemapLastUpdated = currTimestamp;
	} else {
		res.send(sitemapContent);
	}
}

function onRobotsRequest(req, res) {

	res.set('Content-Type', 'text/plain');

	if (!robotsContent || !robotsContent.length) {
		const userAgentLine = 'User-agent: *\n';

		robotsContent = userAgentLine;

		if (production) {
			const apiPath = '/api',
				disallowApiLine = 'Disallow: ' + apiPath + '\n',
				allowAllLine = 'Allow: /\n',
				sitemapPath = 'https://' + req.hostname + '/sitemap.xml',
				sitemapLine = 'Sitemap: ' + sitemapPath;

			robotsContent += disallowApiLine + allowAllLine + '\n' + sitemapLine;
		} else {
			const disallowAllLine = 'Disallow: /';

			robotsContent += disallowAllLine;
		}
	}

	res.send(robotsContent);
}

function onNullableRequest(_req, res) {

	res.set('Content-Type', 'application/json');
	res.send('{}');
}

function onUnknownRequest(_req, res, _next) {

	res.redirect('/404');
}

function onOauthTokenRequest(req, res) {

	res.set('Content-Type', 'application/json');

	const getTokenUrl = oauthUrl + '/token',
		reqLibrary = getTokenUrl.indexOf('https') === -1 ? http : https;

	const clientCredentials = oauthClientId + ':' + oauthClientSecret,
		base64ClientCredentials = Buffer.from(clientCredentials).toString('base64');

	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': 'Basic ' + base64ClientCredentials
		}
	};

	const bindParams = {
		originalRes: res,
		onError: onOauthRequestError
	};

	const internalReq = reqLibrary.request(getTokenUrl, options, externalRequest.onOwnRequestResponse.bind(this,
		bindParams));

	internalReq.on('error', onOauthRequestError.bind(this, res));

	const body = req.body,
		password = encodeURIComponent(body.password),
		username = encodeURIComponent(body.username),
		bodyData = 'grant_type=password&username=' + username + '&password=' + password + '&scope=write';

	internalReq.write(bodyData);
	internalReq.end();
}

function onOauthRequestError(originalRes, err) {

	const error = JSON.parse(err),
		errorType = error.error,
		errorDescription = error.error_description;

	if (errorType === 'invalid_grant') {
		originalRes.set('Content-Type', 'application/json');

		originalRes.status(401).send({
			code: errorType,
			description: errorDescription
		});

		logger.error(err);

		return;
	}

	externalRequest.onOwnRequestError.bind(this)(originalRes, err);
}

function exposeRoutes(app) {

	app.get('/activateAccount/:token', onActivateAccountRequest)
		.get('/noSupportBrowser', onNoSupportBrowserRequest)
		.get('/404', on404Request)
		.get('/config', onConfigRequest)
		.get('/sitemap.xml', onSitemapRequest)
		.get('/robots.txt', onRobotsRequest)
		.get(/.*\/jquery.js/, onNullableRequest)
		.get(/.*/, onGeneralRequest)
		.post('/oauth/token', onOauthTokenRequest)
		.use(onUnknownRequest);
}

function exposeContents(app, directoryName) {

	const pathOptions = {
		maxAge: 600000,
		index: false
	};

	const exposedPath = path.join(__dirname, '..', directoryName),
		staticPropName = 'static',
		servedPath = express[staticPropName](exposedPath, pathOptions);

	app.use(servedPath)
		.use('/' + directoryName, servedPath);
}

function expose(app) {

	app.use(bodyParser.urlencoded({ extended: false }));

	if (params.useBuilt) {
		exposeContents(app, 'dist');
	} else {
		require('./styles')(app);
		exposeContents(app, 'public');
		exposeContents(app, 'node_modules');
	}

	app.set('view engine', 'pug')
		.set('views', path.join(__dirname, '..', 'views'));

	exposeRoutes(app);
}

module.exports = function(loggerParameter, paramsParameter, versionParameter) {

	logger = loggerParameter;
	params = paramsParameter;
	version = versionParameter;

	externalRequest = require('./externalRequest')(logger);

	return {
		exposeApp: expose
	};
};
