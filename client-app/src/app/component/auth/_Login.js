define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'dojo/Deferred'
	, 'dojo/promise/all'
	, 'src/redmicConfig'
	, 'src/util/Credentials'
], function(
	declare
	, lang
	, aspect
	, Deferred
	, PromiseAll
	, redmicConfig
	, Credentials
) {

	return declare(null, {
		//	summary:
		//		Lógica relativa al establecimiento de la autenticación del usuario.

		constructor: function(args) {

			this.config = {
				_oauthLoginTarget: redmicConfig.services.getOauthToken,
				_oidcLoginTarget: redmicConfig.services.getOidcToken
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, '_initialize', lang.hitch(this, this._loginInitialize));
			aspect.before(this, '_dataAvailable', lang.hitch(this, this._loginDataAvailable));
			aspect.before(this, '_errorAvailable', lang.hitch(this, this._loginErrorAvailable));
		},

		_loginInitialize: function() {

			this.target.push(this._oauthLoginTarget, this._oidcLoginTarget);
		},

		_userLogin: function(loginData) {

			this._prepareTokenPromise();
			this._getToken(loginData);
		},

		_prepareTokenPromise: function() {

			this._getTokenDfds = {};

			this._getTokenDfds[this._oauthLoginTarget] = new Deferred();
			this._getTokenDfds[this._oidcLoginTarget] = new Deferred();

			PromiseAll(Object.values(this._getTokenDfds)).then(
				lang.hitch(this, this._onLoginSuccess),
				lang.hitch(this, this._onLoginFailure));
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
				options: options,
				requesterId: this.getOwnChannel()
			});

			this._emitEvt('REQUEST', {
				method: 'POST',
				target: this._oidcLoginTarget,
				options: options,
				requesterId: this.getOwnChannel()
			});
		},

		_loginDataAvailable: function(res, resWrapper) {

			const target = resWrapper.target;

			if (this._oauthLoginTarget !== target && this._oidcLoginTarget !== target) {
				return;
			}

			this._getTokenDfds[target].resolve(res.data);
		},

		_loginErrorAvailable: function(error, status, resWrapper) {

			const target = resWrapper.target;

			if (this._oauthLoginTarget !== target && this._oidcLoginTarget !== target) {
				return;
			}

			this._getTokenDfds[target].reject({ error, status });
		},

		_onLoginSuccess: function(tokensData) {

			this._emitEvt('USER_LOGGED_IN', tokensData);

			this._updateAuthData(tokensData);
		},

		_onLoginFailure: function(errorData) {

			this._emitEvt('USER_LOGIN_ERROR', errorData);
		},

		_updateAuthData: function(tokensData) {

			const oauthTokenData = tokensData[0],
				oidcTokenData = tokensData[1];

			this._updateAuthOidcData(oidcTokenData);
			this._updateAuthOauthData(oauthTokenData);
		},

		_updateAuthOidcData: function(data) {

			this._updateAuthRefreshData(data);

			Credentials.set('oidcAccessToken', data.access_token);
		},

		_updateAuthOauthData: function(data) {

			Credentials.set('accessToken', data.access_token);
		}
	});
});
