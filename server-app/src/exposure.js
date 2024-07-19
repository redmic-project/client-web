const express = require('express'),
	bodyParser = require('body-parser'),
	path = require('path'),

	production = !!parseInt(process.env.PRODUCTION, 10),
	apiUrl = process.env.API_URL;

let logger, params, version, robotsContent, externalRequest;

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

function exposeRoutes(app) {

	app.get('/activateAccount/:token', onActivateAccountRequest)
		.get('/noSupportBrowser', onNoSupportBrowserRequest)
		.get('/404', on404Request)
		.get('/config', externalRequest.onConfigRequest)
		.get('/sitemap.xml', externalRequest.onSitemapRequest)
		.get('/robots.txt', onRobotsRequest)
		.get(/.*\/jquery.js/, onNullableRequest)
		.get(/.*/, onGeneralRequest)
		.post('/oauth/token', externalRequest.onOauthTokenRequest)
		.use(onUnknownRequest);
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
