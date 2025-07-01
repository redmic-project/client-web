define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/app/component/session/_Login'
	, 'src/app/component/session/_Logout'
	, 'src/component/base/_Module'
	, 'src/component/base/_Store'
], function(
	declare
	, lang
	, _Login
	, _Logout
	, _Module
	, _Store
) {

	return declare([_Module, _Store, _Login, _Logout], {
		//	summary:
		//		Módulo para gestionar el inicio y fin de sesión del usuario, así como mantenerla activa.

		constructor: function(args) {

			this.config = {
				ownChannel: 'session',
				events: {
					USER_LOGGED_IN: 'userLoggedIn',
					USER_LOGGED_OUT: 'userLoggedOut',
					USER_LOGIN_ERROR: 'userLoginError',
					USER_LOGOUT_ERROR: 'userLogoutError'
				},
				actions: {
					USER_LOGIN: 'userLogin',
					USER_LOGGED_IN: 'userLoggedIn',
					USER_LOGIN_ERROR: 'userLoginError',
					USER_LOGOUT: 'userLogout',
					USER_LOGGED_OUT: 'userLoggedOut',
					USER_LOGOUT_ERROR: 'userLogoutError'
				}
			};

			lang.mixin(this, this.config, args);
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel: this.getChannel('USER_LOGIN'),
				callback: '_subUserLogin'
			},{
				channel: this.getChannel('USER_LOGOUT'),
				callback: '_subUserLogout'
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'USER_LOGGED_IN',
				channel: this.getChannel('USER_LOGGED_IN')
			},{
				event: 'USER_LOGGED_OUT',
				channel: this.getChannel('USER_LOGGED_OUT')
			},{
				event: 'USER_LOGIN_ERROR',
				channel: this.getChannel('USER_LOGIN_ERROR')
			},{
				event: 'USER_LOGOUT_ERROR',
				channel: this.getChannel('USER_LOGOUT_ERROR')
			});
		},

		_initialize: function() {

			this._loginTargets = [
				this._oauthLoginTarget,
				this._oidLoginTarget
			];

			this._logoutTargets = [
				this._oauthLogoutTarget,
				this._oidLogoutTarget
			];

			this.target = this._loginTargets.concat(this._logoutTargets);
		},

		_subUserLogin: function(req) {

			this._userLogin(req);
		},

		_subUserLogout: function() {

			this._userLogout();
		},

		_dataAvailable: function(res, resWrapper) {

			const target = resWrapper.target;

			if (this._loginTargets.includes(target)) {
				this._loginDataAvailable(res, resWrapper);
			} else if (this._logoutTargets.includes(target)) {
				this._logoutDataAvailable(res, resWrapper);
			} else {
				console.error('Received data from unknown target:', target);
			}
		},

		_errorAvailable: function(error, status, resWrapper) {

			const target = resWrapper.target;

			if (this._loginTargets.includes(target)) {
				this._loginErrorAvailable(error, status, resWrapper);
			} else if (this._logoutTargets.includes(target)) {
				this._logoutErrorAvailable(error, status, resWrapper);
			} else {
				console.error('Received error from unknown target:', target);
			}
		}
	});
});
