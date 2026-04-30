const http = require('http'),
	https = require('https'),
	jwt = require('jsonwebtoken'),

	oauthUrl = process.env.OAUTH_URL,
	oauthClientId = process.env.OAUTH_CLIENT_ID,
	oauthClientSecret = process.env.OAUTH_CLIENT_SECRET,

	oidcUrl = process.env.OIDC_URL,
	oidcClientId = process.env.OIDC_CLIENT_ID,
	oidcClientSecret = process.env.OIDC_CLIENT_SECRET,
	oidcPemPublicKey = process.env.OIDC_PEM_PUBLIC_KEY,
	oidcPemPublicKeyWrap = `-----BEGIN PUBLIC KEY-----\n${oidcPemPublicKey}\n-----END PUBLIC KEY-----`;

let logger, externalRequest;

function onOauthTokenRequest(req, res) {

	res.set('Content-Type', 'application/json');

	if (!oauthUrl || !oauthUrl.length) {
		logger.error('Missing OAuth URL, set it using OAUTH_URL environment variable');
		res.send('{}');
		return;
	}

	const getTokenUrl = oauthUrl + '/token',
		clientCredentials = oauthClientId + ':' + oauthClientSecret,
		internalReqBodyData = getOauthBodyData(req.body);

	onAuthTokenRequest({res, getTokenUrl, clientCredentials, internalReqBodyData});
}

function getOauthBodyData(reqBody) {

	const grantType = 'password',
		scope = 'write',
		password = encodeURIComponent(reqBody.password),
		username = encodeURIComponent(reqBody.username);

	return `grant_type=${grantType}&username=${username}&password=${password}&scope=${scope}`;
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

function onOidcTokenRequest(req, res) {

	res.set('Content-Type', 'application/json');

	if (!oidcUrl || !oidcUrl.length) {
		logger.error('Missing OpenID URL, set it using OIDC_URL environment variable');
		res.send('{}');
		return;
	}

	const getTokenUrl = oidcUrl + '/token',
		clientCredentials = oidcClientId + ':' + oidcClientSecret,
		reqBody = req.body;

	let internalReqBodyData;

	if (!!reqBody.refresh_token) {
		internalReqBodyData = getOidcRefreshTokenBodyData(reqBody);
	} else {
		internalReqBodyData = getOidcPasswordBodyData(reqBody);
	}

	onAuthTokenRequest({res, getTokenUrl, clientCredentials, internalReqBodyData});
}

function getOidcPasswordBodyData(reqBody) {

	const grantType = 'password',
		password = encodeURIComponent(reqBody.password),
		username = encodeURIComponent(reqBody.username);

	return `grant_type=${grantType}&username=${username}&password=${password}`;
}

function getOidcRefreshTokenBodyData(reqBody) {

	const grantType = 'refresh_token',
		refreshToken = encodeURIComponent(reqBody.refresh_token);

	return `grant_type=${grantType}&refresh_token=${refreshToken}`;
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
		res = params.res,
		internalReqBodyData = params.internalReqBodyData;

	const bindParams = {
		originalRes: res,
		onError: onAuthTokenRequestError
	};

	const reqLibrary = getTokenUrl.indexOf('https') === -1 ? http : https;

	const internalReq = reqLibrary.request(getTokenUrl, options,
		externalRequest.onOwnRequestResponse.bind(this, bindParams));

	internalReq.on('error', onAuthTokenRequestError.bind(this, res));

	internalReq.write(internalReqBodyData);
	internalReq.end();
}

function onAuthTokenRequestError(originalRes, err) {

	if (this.statusCode < 500) {
		onAuthTokenClientError.bind(this)(originalRes, err);
		return;
	}

	externalRequest.onOwnRequestError.bind(this)(originalRes, err);
}

function onOidcRevokeRequest(req, res) {

	res.set('Content-Type', 'application/json');

	if (!oidcUrl || !oidcUrl.length) {
		logger.error('Missing OpenID URL, set it using OIDC_URL environment variable');
		res.send('{}');
		return;
	}

	const revokeTokenUrl = `${oidcUrl}/revoke`,
		clientCredentials = `${oidcClientId}:${oidcClientSecret}`,
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

	const internalReq = reqLibrary.request(revokeTokenUrl, options,
		externalRequest.onOwnRequestResponse.bind(this, bindParams));

	internalReq.on('error', onAuthTokenRevokeError.bind(this, res));

	internalReq.write(params.revokeTokenBodyData);
	internalReq.end();
}

function onAuthTokenRevokeError(originalRes, err) {

	if (this.statusCode < 500) {
		onAuthTokenClientError.bind(this)(originalRes, err);
		return;
	}

	externalRequest.onOwnRequestError.bind(this)(originalRes, err);
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

function onOidcTokenPayloadRequest(req, res) {

	const token = req.body.token;

	res.set('Content-Type', 'application/json');

	if (token?.length) {
		jwt.verify(token, oidcPemPublicKeyWrap, (err, decoded) => jwtVerifyCallback(err, decoded, res));
		return;
	}

	res.status(400).send({
		code: 'Client error',
		description: 'Something went wrong. Please, check your request and try again.'
	});

	logger.error('Missing "token" parameter at request body');
}

function jwtVerifyCallback(err, verifiedPayload, res) {

	if (!err) {
		res.send(verifiedPayload);
		return;
	}

	res.status(500).send({
		code: 'Server error',
		description: 'Something went wrong at server. Please, try again.'
	});

	const errorMessage = err instanceof Object ? err.toString() : err;
	logger.error(errorMessage);
}

module.exports = function(loggerParameter, externalRequestParameter) {

	logger = loggerParameter;
	externalRequest = externalRequestParameter;

	return {
		onOauthTokenRequest,
		onOauthRevokeRequest,
		onOidcTokenRequest,
		onOidcRevokeRequest,
		onOidcTokenPayloadRequest
	};
};
