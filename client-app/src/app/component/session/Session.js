define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/app/component/session/_Login'
	, 'src/app/component/session/_Logout'
	, 'src/app/component/session/_Refresh'
	, 'src/component/base/_Module'
	, 'src/component/base/_Store'
], function(
	declare
	, lang
	, _Login
	, _Logout
	, _Refresh
	, _Module
	, _Store
) {

	return declare([_Module, _Store, _Login, _Logout, _Refresh], {
		//	summary:
		//		Módulo para gestionar el inicio y fin de sesión del usuario, así como mantenerla activa.

		constructor: function(args) {

			this.config = {
				ownChannel: 'session',
				events: {
					USER_LOGGED_IN: 'userLoggedIn',
					USER_LOGIN_ERROR: 'userLoginError',
					USER_LOGGED_OUT: 'userLoggedOut',
					USER_LOGOUT_ERROR: 'userLogoutError',
					USER_TOKEN_REFRESHED: 'userTokenRefreshed',
					USER_REFRESH_ERROR: 'userRefreshError'
				},
				actions: {
					USER_LOGIN: 'userLogin',
					USER_LOGGED_IN: 'userLoggedIn',
					USER_LOGIN_ERROR: 'userLoginError',
					USER_LOGOUT: 'userLogout',
					USER_LOGGED_OUT: 'userLoggedOut',
					USER_LOGOUT_ERROR: 'userLogoutError',
					USER_TOKEN_REFRESHED: 'userTokenRefreshed',
					USER_REFRESH_ERROR: 'userRefreshError'
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
				event: 'USER_TOKEN_REFRESHED',
				channel: this.getChannel('USER_TOKEN_REFRESHED')
			},{
				event: 'USER_LOGIN_ERROR',
				channel: this.getChannel('USER_LOGIN_ERROR')
			},{
				event: 'USER_LOGOUT_ERROR',
				channel: this.getChannel('USER_LOGOUT_ERROR')
			},{
				event: 'USER_REFRESH_ERROR',
				channel: this.getChannel('USER_REFRESH_ERROR')
			});
		},

		_initialize: function() {

			this.target = [];
		},

		_subUserLogin: function(req) {

			this._userLogin(req);
		},

		_subUserLogout: function() {

			this._userLogout();
		}
	});
});
