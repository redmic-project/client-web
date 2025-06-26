const http = require('http'),
	https = require('https'),

	oauthUrl = process.env.OAUTH_URL,
	oauthClientId = process.env.OAUTH_CLIENT_ID,
	oauthClientSecret = process.env.OAUTH_CLIENT_SECRET,

	oidUrl = process.env.OID_URL,
	oidClientId = process.env.OID_CLIENT_ID,
	oidClientSecret = process.env.OID_CLIENT_SECRET,

	configUrl = process.env.CONFIG_URL,
	configExpirationMs = 3600000,

	sitemapUrl = process.env.SITEMAP_URL,
	sitemapExpirationMs = 36000000;

let logger, configContent, configLastUpdated, sitemapContent, sitemapLastUpdated;

function onOwnRequestResponse(bindParams, internalRes) {

	let chunks = [];

	internalRes.on('data', (function(nestedChunks, chunk) {

		nestedChunks.push(chunk);
	}).bind(this, chunks));

	internalRes.on('end', (function(nestedBindParams, nestedChunks) {

		let content = '';

		for (let i = 0; i < nestedChunks.length; i++) {
			content += nestedChunks[i].toString();
		}

		const originalRes = nestedBindParams.originalRes,
			onSuccess = nestedBindParams.onSuccess || onOwnRequestSuccess,
			onError = nestedBindParams.onError || onOwnRequestError,
			afterResponse = nestedBindParams.afterResponse,
			successful = this.statusCode < 400;

		if (successful) {
			onSuccess.bind(this)(originalRes, content);
		} else {
			onError.bind(this)(originalRes, content);
		}

		if (afterResponse) {
			afterResponse(successful, content);
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

	if (!oauthUrl || !oauthUrl.length) {
		logger.error('Missing OAuth URL, set it using OAUTH_URL environment variable');
		res.send('{}');
		return;
	}

	const getTokenUrl = oauthUrl + '/token',
		clientCredentials = oauthClientId + ':' + oauthClientSecret,
		scope = 'write';

	onAuthTokenRequest({req, res, getTokenUrl, clientCredentials, scope});
}

function onOidTokenRequest(req, res) {

	res.set('Content-Type', 'application/json');

	if (!oidUrl || !oidUrl.length) {
		logger.error('Missing OpenID URL, set it using OID_URL environment variable');
		res.send('{}');
		return;
	}

	const getTokenUrl = oidUrl + '/token',
		clientCredentials = oidClientId + ':' + oidClientSecret;

	onAuthTokenRequest({req, res, getTokenUrl, clientCredentials});
}

function onAuthTokenRequest(params) {

	const base64ClientCredentials = Buffer.from(params.clientCredentials).toString('base64');

	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': 'Basic ' + base64ClientCredentials
		}
	};

	const getTokenUrl = params.getTokenUrl,
		req = params.req,
		res = params.res,
		scope = params.scope;

	const bindParams = {
		originalRes: res,
		onError: onAuthTokenRequestError
	};

	const reqLibrary = getTokenUrl.indexOf('https') === -1 ? http : https,
		internalReq = reqLibrary.request(getTokenUrl, options, onOwnRequestResponse.bind(this, bindParams));

	internalReq.on('error', onAuthTokenRequestError.bind(this, res));

	const body = req.body,
		password = encodeURIComponent(body.password),
		username = encodeURIComponent(body.username);

	let bodyData = `grant_type=password&username=${username}&password=${password}`;

	if (scope && scope.length) {
		bodyData += `&scope=${scope}`;
	}

	internalReq.write(bodyData);
	internalReq.end();
}

function onAuthTokenRequestError(originalRes, err) {

	if (this.statusCode < 500) {
		onAuthTokenClientError.bind(this)(originalRes, err);
		return;
	}

	onOwnRequestError.bind(this)(originalRes, err);
}

function onOauthRevokeRequest(req, res) {

	res.set('Content-Type', 'application/json');

	if (!oauthUrl || !oauthUrl.length) {
		logger.error('Missing OAuth URL, set it using OAUTH_URL environment variable');
		res.send('{}');
		return;
	}

	const revokeTokenUrl = `${oauthUrl}/token/revoke`,
		tokenToRevoke = req.body.token,
		revokeTokenBodyData = `{"token":"${tokenToRevoke}"}`;

	const revokeTokenHeaders = {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${tokenToRevoke}`
	};

	onAuthTokenRevoke({res, revokeTokenUrl, revokeTokenHeaders, revokeTokenBodyData});
}

function onOidRevokeRequest(req, res) {

	res.set('Content-Type', 'application/json');

	if (!oidUrl || !oidUrl.length) {
		logger.error('Missing OpenID URL, set it using OID_URL environment variable');
		res.send('{}');
		return;
	}

	const revokeTokenUrl = `${oidUrl}/revoke`,
		clientCredentials = `${oidClientId}:${oidClientSecret}`,
		base64ClientCredentials = Buffer.from(clientCredentials).toString('base64'),
		tokenToRevoke = req.body.token,
		revokeTokenBodyData = `token=${tokenToRevoke}`;

	const revokeTokenHeaders = {
		'Content-Type': 'application/x-www-form-urlencoded',
		'Authorization': `Basic ${base64ClientCredentials}`
	};

	onAuthTokenRevoke({res, revokeTokenUrl, revokeTokenHeaders, revokeTokenBodyData});
}

function onAuthTokenRevoke(params) {

	const options = {
		method: 'POST',
		headers: params.revokeTokenHeaders
	};

	const revokeTokenUrl = params.revokeTokenUrl,
		res = params.res;

	const bindParams = {
		originalRes: res,
		onError: onAuthTokenRevokeError
	};

	const reqLibrary = revokeTokenUrl.indexOf('https') === -1 ? http : https;

	const internalReq = reqLibrary.request(revokeTokenUrl, options, onOwnRequestResponse.bind(this, bindParams));

	internalReq.on('error', onAuthTokenRevokeError.bind(this, res));

	internalReq.write(params.revokeTokenBodyData);
	internalReq.end();
}

function onAuthTokenRevokeError(originalRes, err) {

	if (this.statusCode < 500) {
		onAuthTokenClientError.bind(this)(originalRes, err);
		return;
	}

	onOwnRequestError.bind(this)(originalRes, err);
}

function onAuthTokenClientError(originalRes, err) {

	const error = JSON.parse(err);

	originalRes.set('Content-Type', 'application/json');

	originalRes.status(this.statusCode).send({
		code: error.error,
		description: error.error_description
	});

	logger.error(err);
}

function onConfigRequest(req, res) {

	res.set('Content-Type', 'application/json');

	if (!configContent || !configContent.length || req.query.forceRefresh ||
		configLastUpdated < Date.now() - configExpirationMs) {

		const afterResponseCallback = (successful, content) => {

			if (!successful) {
				configContent = '';
				return;
			}

			configContent = content;
			configLastUpdated = Date.now();
		};

		if (!configUrl || !configUrl.length) {
			logger.error('Missing config URL, set it using CONFIG_URL environment variable');
			res.send('{}');
			return;
		}

		const reqLibrary = configUrl.indexOf('https') === -1 ? http : https;

		const internalReq = reqLibrary.request(configUrl, onOwnRequestResponse.bind(this, {
			originalRes: res,
			afterResponse: afterResponseCallback
		}));

		internalReq.on('error', onOwnRequestError.bind(this, res));

		internalReq.end();
	} else {
		res.send(configContent);
	}
}

function onSitemapRequest(_req, res) {

	res.set('Content-Type', 'text/xml');

	if (!sitemapContent || !sitemapContent.length || sitemapLastUpdated < Date.now() - sitemapExpirationMs) {
		const afterResponseCallback = (successful, content) => {

			if (!successful) {
				sitemapContent = '';
				return;
			}

			sitemapContent = content;
			sitemapLastUpdated = Date.now();
		};

		if (!sitemapUrl || !sitemapUrl.length) {
			logger.error('Missing sitemap URL, set it using SITEMAP_URL environment variable');

			const emptySitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset ' +
				'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml"/>';

			res.send(emptySitemap);
			return;
		}

		const reqLibrary = sitemapUrl.indexOf('https') === -1 ? http : https;

		const internalReq = reqLibrary.request(sitemapUrl, onOwnRequestResponse.bind(this, {
			originalRes: res,
			afterResponse: afterResponseCallback
		}));

		internalReq.on('error', onOwnRequestError.bind(this, res));

		internalReq.end();
	} else {
		res.send(sitemapContent);
	}
}

module.exports = function(loggerParameter) {

	logger = loggerParameter;

	return {
		onOauthTokenRequest: onOauthTokenRequest,
		onOauthRevokeRequest: onOauthRevokeRequest,
		onOidTokenRequest: onOidTokenRequest,
		onOidRevokeRequest: onOidRevokeRequest,
		onConfigRequest: onConfigRequest,
		onSitemapRequest: onSitemapRequest
	};
};
