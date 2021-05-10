var express = require('express'),
	bodyParser = require('body-parser'),
	fs = require('fs'),
	path = require('path'),
	http = require('http'),
	https = require('https');

var logger, params, version,
	oauthUrl = process.env.OAUTH_URL,
	oauthClientSecret = process.env.OAUTH_CLIENT_SECRET,
	production = !!parseInt(process.env.PRODUCTION, 10),
	apiUrl = process.env.API_URL;

function getLang(req) {

	return req && req.headers && req.headers['content-language'] || params.lang;
}

function onGeneralRequest(req, res) {

	res.render('index', {
		useBuilt: params.useBuilt,
		lang: getLang(req)
	});
}

function onEnvRequest(req, res) {

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

function on404Request(req, res) {

	res.status(404);
	res.render('404', { useBuilt: params.useBuilt });
}

function onSitemapRequest(req, res) {

	var fileData = fs.readFileSync('sitemap.xml', 'ascii');

	res.set('Content-Type', 'text/xml');
	res.send(fileData);
}

function onRobotsRequest(req, res) {

	var fileData = fs.readFileSync('robots.txt', 'utf8');

	res.set('Content-Type', 'text/plain');
	res.send(fileData);
}

function onJqueryRequest(req, res) {

	res.set('Content-Type', 'application/json');
	res.send('{}');
}

function onUnknownRequest(req, res, next) {

	res.redirect('/404');
}

function onOauthTokenRequest(req, res) {

	var body = req.body,

		clientId = body.clientid,
		password = body.password,
		username = body.username,

		getTokenUrl = oauthUrl + '/token',
		clientCredentials = clientId + ':' + oauthClientSecret,
		base64ClientCredentials = Buffer.from(clientCredentials).toString('base64'),

		options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': 'Basic ' + base64ClientCredentials
			}
		},

		reqLibrary = getTokenUrl.indexOf('https') === -1 ? http : https,
		internalReq = reqLibrary.request(getTokenUrl, options, (function(originalRes, internalRes) {

			var chunks = [];

			internalRes.on('data', (function(nestedChunks, chunk) {

				nestedChunks.push(chunk);
			}).bind(this, chunks));

			internalRes.on('end', (function(nestedOriginalRes, nestedChunks) {

				var content = "";
				for (var i = 0; i < nestedChunks.length; i++) {
					content += nestedChunks[i].toString();
				}
				nestedOriginalRes.status(this.statusCode).send(content);
			}).bind(internalRes, originalRes, chunks));
		}).bind(this, res));

	internalReq.on('error', (function(originalRes, err) {

		logger.error(err);
		originalRes.sendStatus(500);
	}).bind(this, res));

	var bodyData = 'grant_type=password&username=' + username + '&password=' + password + '&scope=write';
	internalReq.write(bodyData);
	internalReq.end();
}

function exposeRoutes(app) {

	app.get(
		/^((?!\/(activateAccount|resetting|noSupportBrowser|404|sitemap.xml|robots.txt|node_modules|env|.*\/jquery.js)))(\/.*)$/,
		onGeneralRequest)

		.get('/env', onEnvRequest)

		.get('/activateAccount/:token', onActivateAccountRequest)

		.get('/noSupportBrowser', onNoSupportBrowserRequest)

		.get('/404', on404Request)

		.get('/sitemap.xml', onSitemapRequest)

		.get('/robots.txt', onRobotsRequest)

		.get(/.*\/jquery.js/, onJqueryRequest)

		.post('/oauth/token', onOauthTokenRequest)

		.use(onUnknownRequest);
}

function exposeContents(app, directoryName) {

	var pathOptions = {
		maxAge: 600000,
		index: false
	};

	var exposedPath = path.join(__dirname, '..', directoryName),
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
