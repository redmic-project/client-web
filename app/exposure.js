var express = require('express'),
	fs = require('fs'),
	path = require('path'),
	request = require('request');

var params, app, version,
	publicHostname = process.env.PUBLIC_HOSTNAME,
	oauthClientSecret = process.env.OAUTH_CLIENT_SECRET;

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
		debug: params.debug
	});
}

function onResettingRequest(req, res) {

	res.render('resetting', {
		useBuilt: params.useBuilt,
		lang: getLang(req),
		token: req.param('token')
	});
}

function onActivateAccountRequest(req, res) {

	res.render('activateAccount', {
		useBuilt: params.useBuilt,
		lang: getLang(req),
		token: req.param('token')
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

	var query = req.query,

		clientId = query.clientid,
		password = query.password,
		username = query.username,

		clientCredentials = clientId + ':' + oauthClientSecret,
		base64ClientCredentials = Buffer.from(clientCredentials).toString('base64'),

		url = publicHostname + '/api/oauth/token',
		authorization = 'Basic ' + base64ClientCredentials,
		body = "grant_type=password&username=" + username + "&password=" + password + "&scope=write",

		options = {
			url: url,
			method: 'POST',
			body: body,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': authorization
			}
		};

	request(options, (function(res, error, response, body) {

		res.statusCode = response.statusCode;
		res.send(body);
	}).bind(this, res));
}

function exposeRoutes() {

	app.get(
		/^((?!\/(activateAccount|resetting|noSupportBrowser|404|sitemap.xml|robots.txt|node_modules|env|.*\/jquery.js)))(\/.*)$/,
		onGeneralRequest)

		.get('/env', onEnvRequest)

		.get('/resetting/:token', onResettingRequest)

		.get('/activateAccount/:token', onActivateAccountRequest)

		.get('/noSupportBrowser', onNoSupportBrowserRequest)

		.get('/404', on404Request)

		.get('/sitemap.xml', onSitemapRequest)

		.get('/robots.txt', onRobotsRequest)

		.get(/.*\/jquery.js/, onJqueryRequest)

		.post('/oauth/token', onOauthTokenRequest)

		.use(onUnknownRequest);
}

function exposeContents(directoryName) {

	var pathOptions = {
		maxAge: 600000,
		index: false
	};

	var exposedPath = path.join(__dirname, '..', directoryName),
		servedPath = express['static'](exposedPath, pathOptions);

	app.use(servedPath)
		.use('/' + directoryName, servedPath);
}

function expose(appParameter) {

	app = appParameter;

	if (params.useBuilt) {
		exposeContents('dist');
	} else {
		require('./styles')(app);
		exposeContents('public');
		exposeContents('tests');
		exposeContents('node_modules');
	}

	app.set('view engine', 'pug')
		.set('views', path.join(__dirname, '..', 'views'));

	exposeRoutes();
}

module.exports = function(paramsParameter, versionParameter) {

	params = paramsParameter;
	version = versionParameter;

	return {
		exposeApp: expose
	};
};
