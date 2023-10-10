const http = require('http'),
	https = require('https'),

	oauthUrl = process.env.OAUTH_URL,
	oauthClientId = process.env.OAUTH_CLIENT_ID,
	oauthClientSecret = process.env.OAUTH_CLIENT_SECRET,
	configUrl = process.env.CONFIG_URL,
	sitemapUrl = process.env.SITEMAP_URL,

	configExpirationMs = 3600000,
	sitemapExpirationMs = 36000000;

let logger, configContent, configLastUpdated, sitemapContent, sitemapLastUpdated;

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

		const originalRes = nestedBindParams.originalRes,
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

	const internalUrl = this.req.protocol + '//' + this.req.host + this.req.path,
		internalRequestMessage = `INTERNAL ${this.req.method} ${internalUrl} ${this.statusCode}`;

	logger.info(internalRequestMessage);
}

function onOwnRequestError(originalRes, err) {

	originalRes.set('Content-Type', 'application/json');

	originalRes.status(500).send({
		code: 'Server error',
		description: 'Something went wrong at server. Please, try again.'
	});

	const errorMessage = err instanceof Object ? err.toString() : err;
	logger.error(errorMessage);
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

	const internalReq = reqLibrary.request(getTokenUrl, options, onOwnRequestResponse.bind(this,
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

	onOwnRequestError.bind(this)(originalRes, err);
}

function onConfigRequest(req, res) {

	res.set('Content-Type', 'application/json');

	const currTimestamp = Date.now();

	if (!configContent || !configContent.length || req.query.forceRefresh ||
		configLastUpdated < currTimestamp - configExpirationMs) {

		const afterResponseCallback = (status, content) => configContent = status ? content : '',
			reqLibrary = configUrl.indexOf('https') === -1 ? http : https;

		const internalReq = reqLibrary.request(configUrl, onOwnRequestResponse.bind(this, {
			originalRes: res,
			afterResponse: afterResponseCallback
		}));

		internalReq.on('error', onOwnRequestError.bind(this, res));

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
		const afterResponseCallback = (status, content) => sitemapContent = status ? content : '',
			reqLibrary = sitemapUrl.indexOf('https') === -1 ? http : https;

		const internalReq = reqLibrary.request(sitemapUrl, onOwnRequestResponse.bind(this, {
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

module.exports = function(loggerParameter) {

	logger = loggerParameter;

	return {
		onOauthTokenRequest: onOauthTokenRequest,
		onConfigRequest: onConfigRequest,
		onSitemapRequest: onSitemapRequest
	};
};
