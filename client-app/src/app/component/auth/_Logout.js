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
		//		Lógica relativa a la finalización de la autenticación del usuario.

		constructor: function(args) {

			this.config = {
				_oauthLogoutTarget: redmicConfig.services.logoutOauth,
				_oidcLogoutTarget: redmicConfig.services.logoutOidc
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, '_initialize', lang.hitch(this, this._logoutInitialize));
			aspect.before(this, '_dataAvailable', lang.hitch(this, this._logoutDataAvailable));
			aspect.before(this, '_errorAvailable', lang.hitch(this, this._logoutErrorAvailable));
		},

		_logoutInitialize: function() {

			this.target.push(this._oauthLogoutTarget, this._oidcLogoutTarget);
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
			this._sendOidcLogoutRequest();
		},

		_prepareLogoutDfd: function() {

			this._logoutDfds = {};

			this._logoutDfds[this._oauthLogoutTarget] = new Deferred();
			this._logoutDfds[this._oidcLogoutTarget] = new Deferred();

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

		_sendOidcLogoutRequest: function() {

			const data = {
				token: Credentials.get('oidcAccessToken')
			};

			this._sendLogoutRequest(data, this._oidcLogoutTarget);
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

			const target = resWrapper.target;

			if (this._oauthLogoutTarget !== target && this._oidcLogoutTarget !== target) {
				return;
			}

			this._logoutDfds[target].resolve(res.data);
		},

		_logoutErrorAvailable: function(error, status, resWrapper) {

			const target = resWrapper.target;

			if (this._oauthLogoutTarget !== target && this._oidcLogoutTarget !== target) {
				return;
			}

			this._logoutDfds[target].reject({ error, status });
		},

		_onLogoutSuccess: function(logoutData) {

			this._emitEvt('USER_LOGGED_OUT', logoutData);

			this._removeAuthData();
		},

		_onLogoutFailure: function(errorData) {

			this._emitEvt('USER_LOGOUT_ERROR', errorData);
		},

		_removeAuthData: function() {

			this._removeAuthRefreshData();

			Credentials.remove('oidcAccessToken');
			Credentials.remove('accessToken');
		},

		_userIsLoggedIn: function() {

			return !!Credentials.get('accessToken');
		}
	});
});
