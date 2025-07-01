define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/Deferred'
	, 'dojo/promise/all'
	, 'src/redmicConfig'
	, 'src/util/Credentials'
], function(
	declare
	, lang
	, Deferred
	, PromiseAll
	, redmicConfig
	, Credentials
) {

	return declare(null, {
		//	summary:
		//		Lógica relativa al inicio de sesión del usuario.

		constructor: function(args) {

			this.config = {
				_oauthLoginTarget: redmicConfig.services.getOauthToken,
				_oidLoginTarget: redmicConfig.services.getOidToken
			};

			lang.mixin(this, this.config, args);
		},

		_userLogin: function(loginData) {

			this._prepareTokenPromise();
			this._getToken(loginData);
		},

		_prepareTokenPromise: function() {

			this._getTokenDfds = {};

			this._getTokenDfds[this._oauthLoginTarget] = new Deferred();
			this._getTokenDfds[this._oidLoginTarget] = new Deferred();

			PromiseAll(Object.values(this._getTokenDfds)).then(
				lang.hitch(this, this._onGotTokensSuccess),
				lang.hitch(this, this._onGotTokensFailure));
		},

		_getToken: function(loginData) {

			const data = {
				username: loginData.user,
				password: loginData.pass
			};

			const options = {
				data: data,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			};

			this._emitEvt('REQUEST', {
				method: 'POST',
				target: this._oauthLoginTarget,
				options: options
			});

			this._emitEvt('REQUEST', {
				method: 'POST',
				target: this._oidLoginTarget,
				options: options
			});
		},

		_loginDataAvailable: function(res, resWrapper) {

			const target = resWrapper.target,
				tokenData = res.data;

			this._getTokenDfds[target].resolve(tokenData);
		},

		_loginErrorAvailable: function(error, status, resWrapper) {

			const target = resWrapper.target;

			this._getTokenDfds[target].reject({ error, status });
		},

		_onGotTokensSuccess: function(tokensData) {

			const oauthTokenData = tokensData[0],
				oidTokenData = tokensData[1];

			this._emitEvt('USER_LOGGED_IN', tokensData);

			this._addUserOidData(oidTokenData);
			this._addUserOauthData(oauthTokenData);
		},

		_onGotTokensFailure: function(errorData) {

			this._emitEvt('USER_LOGIN_ERROR', errorData);
		},

		_addUserOidData: function(data) {

			const oidAccessToken = data.access_token;

			Credentials.set('oidAccessToken', oidAccessToken);
		},

		_addUserOauthData: function(data) {

			const oauthAccessToken = data.access_token;

			Credentials.set('accessToken', oauthAccessToken);
		}
	});
});
