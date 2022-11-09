let express = require('express'),
	bodyParser = require('body-parser'),
	fs = require('fs'),
	path = require('path'),
	http = require('http'),
	https = require('https');

let logger, params, version, robotsContent, sitemapContent, sitemapLastUpdated,
	oauthUrl = process.env.OAUTH_URL,
	oauthClientId = process.env.OAUTH_CLIENT_ID,
	oauthClientSecret = process.env.OAUTH_CLIENT_SECRET,
	production = !!parseInt(process.env.PRODUCTION, 10),
	apiUrl = process.env.API_URL,
	sitemapUrl = process.env.SITEMAP_URL;

function getLang(req) {

	return req && req.headers && req.headers['content-language'] || params.lang;
}

function onGeneralRequest(req, res) {

	res.render('index', {
		useBuilt: params.useBuilt,
		lang: getLang(req)
	});
}

function onEnvRequest(_req, res) {

	res.send({
		version: version,
		useBuilt: params.useBuilt,
		debug: params.debug,
		apiUrl: apiUrl,
		production: production
	});
}

function onActivateAccountRequest(req, res) {

	res.render('activateAccount', {
		useBuilt: params.useBuilt,
		lang: getLang(req),
		apiUrl: apiUrl,
		token: req.params.token
	});
}

function onNoSupportBrowserRequest(req, res) {

	res.render('noSupportBrowser', {
		useBuilt: params.useBuilt,
		lang: getLang(req)
	});
}

function on404Request(_req, res) {

	res.status(404);
	res.render('404', { useBuilt: params.useBuilt });
}

function onOwnRequestResponse(bindParams, internalRes) {

	let chunks = [];

	internalRes.on('data', (function(nestedChunks, chunk) {

		nestedChunks.push(chunk);
	}).bind(this, chunks));

	internalRes.on('end', (function(nestedBindParams, nestedChunks) {

		let content = "";

		for (let i = 0; i < nestedChunks.length; i++) {
			content += nestedChunks[i].toString();
		}

		let originalRes = nestedBindParams.originalRes,
			onSuccess = nestedBindParams.onSuccess || onOwnRequestSuccess,
			onError = nestedBindParams.onError || onOwnRequestError,
			afterResponse = nestedBindParams.afterResponse;

		if (this.statusCode < 400) {
			onSuccess.bind(this)(originalRes, content);
		} else {
			onError.bind(this)(originalRes, content);
		}

		if (afterResponse) {
			afterResponse(this.statusCode, content);
		}
	}).bind(internalRes, bindParams, chunks));
}

function onOwnRequestSuccess(originalRes, content) {

	originalRes.status(this.statusCode).send(content);

	let internalUrl = this.req.protocol + '//' + this.req.host + this.req.path,
		internalRequestMessage = `INTERNAL ${this.req.method} ${internalUrl} ${this.statusCode}`;

	logger.info(internalRequestMessage);
}

function onOwnRequestError(originalRes, err) {

	originalRes.set('Content-Type', 'application/json');

	originalRes.status(500).send({
		code: 'Server error',
		description: 'Something went wrong at server. Please, try again.'
	});

	let errorMessage = err instanceof Object ? err.toString() : err;
	logger.error(errorMessage);
}

function onSitemapRequest(_req, res) {

	res.set('Content-Type', 'text/xml');

	let currTimestamp = Date.now();

	if (!sitemapContent || !sitemapContent.length || sitemapLastUpdated < currTimestamp - 300000) {
		let afterResponseCallback = (status, content) => sitemapContent = status ? content : '';

		let internalReq = https.request(sitemapUrl, onOwnRequestResponse.bind(this, {
			originalRes: res,
			afterResponse: afterResponseCallback
		}));

		internalReq.on('error', onOwnRequestError.bind(this, res));

		internalReq.end();

		sitemapLastUpdated = currTimestamp;
	} else {
		res.send(sitemapContent);
	}
}

function onRobotsRequest(req, res) {

	res.set('Content-Type', 'text/plain');

	if (!robotsContent || !robotsContent.length) {
		robotsContent = 'User-agent: *\n';

		if (production) {
			let sitemapPath = 'https://' + req.hostname + '/sitemap.xml',
				sitemapLine = 'Sitemap: ' + sitemapPath;

			robotsContent += 'Allow: /\n\n' + sitemapLine;
		} else {
			robotsContent += 'Disallow: /';
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

	let body = req.body,
		password = body.password,
		username = body.username,

		getTokenUrl = oauthUrl + '/token',
		clientCredentials = oauthClientId + ':' + oauthClientSecret,
		base64ClientCredentials = Buffer.from(clientCredentials).toString('base64'),

		reqLibrary = getTokenUrl.indexOf('https') === -1 ? http : https;

	let options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': 'Basic ' + base64ClientCredentials
		}
	};

	let bindParams = {
		originalRes: res,
		onError: onOauthRequestError
	};

	let internalReq = reqLibrary.request(getTokenUrl, options, onOwnRequestResponse.bind(this, bindParams));

	internalReq.on('error', onOauthRequestError.bind(this, res));

	let bodyData = 'grant_type=password&username=' + username + '&password=' + password + '&scope=write';
	internalReq.write(bodyData);
	internalReq.end();
}

function onOauthRequestError(originalRes, err) {

	let error = JSON.parse(err),
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

	onOwnRequestError.bind(this)(originalRes, err);
}

function exposeRoutes(app) {

	app.get('/env', onEnvRequest)
		.get('/activateAccount/:token', onActivateAccountRequest)
		.get('/noSupportBrowser', onNoSupportBrowserRequest)
		.get('/404', on404Request)
		.get('/sitemap.xml', onSitemapRequest)
		.get('/robots.txt', onRobotsRequest)
		.get(/.*\/jquery.js/, onNullableRequest)
		.get(/.*/, onGeneralRequest)
		.post('/oauth/token', onOauthTokenRequest)
		.use(onUnknownRequest);
}

function exposeContents(app, directoryName) {

	let pathOptions = {
		maxAge: 600000,
		index: false
	};

	let exposedPath = path.join(__dirname, '..', directoryName),
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

	return {
		exposeApp: expose
	};
};
