define([
	'dojo/_base/declare'
	, 'src/util/Credentials'
], function(
	declare
	, Credentials
) {

	return declare(null, {
		// summary:
		//   Manejo de errores de petición relativos a la autenticación del usuario.

		postMixInProperties: function() {

			const defaultConfig = {
				invalidTokenNotifyTimeout: 10
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_authPermissionError: function(res) {

			const status = res.status;

			if (status === 400) {
				this._notifyInvalidUserError(res);
			} else if (status === 401) {
				if (!res.data || res.data.code === 'invalid_token' /* caso oidc*/ ||
					res.data.error === 'invalid_token' /* caso oauth*/) {

					this._notifyInvalidTokenError(res);
				} else {
					this._notifyInvalidUserError(res);
				}
			} else if (status === 403) {
				this._notifyForbiddenResourceError(res);
			} else {
				this._notifyUnknownError(res);
			}
		},

		_notifyInvalidUserError: function(res) {

			this._emitEvt('COMMUNICATION', {
				type: 'alert',
				level: 'error',
				description: this.i18n.authInvalidUser
			});

			const url = res.url;
			this._emitEvt('TRACK', {
				event: 'auth_user_error',
				url
			});
		},

		_notifyInvalidTokenError: function(res) {

			this._emitEvt('COMMUNICATION', {
				type: 'alert',
				level: 'error',
				description: this.i18n.authInvalidToken,
				timeout: this.invalidTokenNotifyTimeout,
				callback: () => this._invalidTokenErrorCallback()
			});

			const url = res.url;
			this._emitEvt('TRACK', {
				event: 'auth_token_error',
				url
			});
		},

		_invalidTokenErrorCallback: function() {

			Credentials.remove('accessToken');
		},

		_notifyForbiddenResourceError: function(res) {

			this._emitEvt('COMMUNICATION', {
				type: 'alert',
				level: 'error',
				description: this.i18n.authForbiddenResource
			});

			const url = res.url;
			this._emitEvt('TRACK', {
				event: 'auth_forbidden_error',
				url
			});
		},

		_notifyUnknownError: function(res) {

			this._emitEvt('COMMUNICATION', {
				type: 'alert',
				level: 'error',
				description: this.i18n.authUnknownError
			});

			const url = res.url;
			this._emitEvt('TRACK', {
				event: 'auth_unknown_error',
				url
			});
		}
	});
});
