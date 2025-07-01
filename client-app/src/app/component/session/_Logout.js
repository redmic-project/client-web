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
		//		Lógica relativa al cierre de sesión del usuario.

		constructor: function(args) {

			this.config = {
				_oauthLogoutTarget: redmicConfig.services.logoutOauth,
				_oidLogoutTarget: redmicConfig.services.logoutOid
			};

			lang.mixin(this, this.config, args);
		},

		_userLogout: function() {

			if (this._userIsLoggedIn()) {
				this._revokeToken();
			} else {
				this._removeUserData();
			}
		},

		_revokeToken: function() {

			this._prepareLogoutDfd();
			this._sendOauthLogoutRequest();
			this._sendOidLogoutRequest();
		},

		_prepareLogoutDfd: function() {

			this._logoutDfds = {};

			this._logoutDfds[this._oauthLogoutTarget] = new Deferred();
			this._logoutDfds[this._oidLogoutTarget] = new Deferred();

			PromiseAll(Object.values(this._logoutDfds)).then(
				lang.hitch(this, this._onLogoutSuccess),
				lang.hitch(this, this._onLogoutFailure));
		},

		_sendOauthLogoutRequest: function() {

			const data = {
				token: Credentials.get('accessToken')
			};

			this._sendLogoutRequest(data, this._oauthLogoutTarget);
		},

		_sendOidLogoutRequest: function() {

			const data = {
				token: Credentials.get('oidAccessToken')
			};

			this._sendLogoutRequest(data, this._oidLogoutTarget);
		},

		_sendLogoutRequest: function(data, target) {

			this._emitEvt('REQUEST', {
				method: 'POST',
				target: target,
				query: data,
				requesterId: this.getOwnChannel()
			});
		},

		_logoutDataAvailable: function(res, resWrapper) {

			const target = resWrapper.target,
				logoutData = res.data;

			this._logoutDfds[target].resolve(logoutData);
		},

		_logoutErrorAvailable: function(error, status, resWrapper) {

			const target = resWrapper.target;

			this._logoutDfds[target].reject({ error, status });
		},

		_onLogoutSuccess: function(logoutData) {

			this._emitEvt('USER_LOGGED_OUT', logoutData);

			this._removeUserOidData();
			this._removeUserOauthData();
		},

		_onLogoutFailure: function(errorData) {

			this._emitEvt('USER_LOGOUT_ERROR', errorData);
		},

		_removeUserOidData: function() {

			Credentials.set('oidAccessToken', null);
		},

		_removeUserOauthData: function() {

			Credentials.set('accessToken', null);
		},

		_userIsLoggedIn: function() {

			return !!Credentials.get('accessToken');
		}
	});
});
