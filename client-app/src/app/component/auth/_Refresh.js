define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'src/redmicConfig'
	, 'src/util/Credentials'
], function(
	declare
	, lang
	, aspect
	, redmicConfig
	, Credentials
) {

	return declare(null, {
		//	summary:
		//		Lógica relativa a la renovación de la autenticación del usuario.

		constructor: function(args) {

			this.config = {
				_refreshTarget: redmicConfig.services.refreshToken,
				_authCheckIntervalSecondsTimeout: 30
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, '_initialize', lang.hitch(this, this._refreshInitialize));
			aspect.before(this, '_dataAvailable', lang.hitch(this, this._refreshDataAvailable));
			aspect.before(this, '_errorAvailable', lang.hitch(this, this._refreshErrorAvailable));
		},

		_refreshInitialize: function() {

			if (this._missingAuthData()) {
				return;
			}

			this.target.push(this._refreshTarget);

			this._authCheckIntervalHandler = setInterval(lang.hitch(this, this._checkAuthExpiry),
				this._authCheckIntervalSecondsTimeout * 1000);

			this._checkAuthExpiry();
		},

		_missingAuthData: function() {

			return !Credentials.get('refreshToken') || !Credentials.get('expiresAt') ||
				!Credentials.get('refreshExpiresAt');
		},

		_checkAuthExpiry: function() {

			const accessTokenExpiresAt = Credentials.get('expiresAt');

			if (!accessTokenExpiresAt) {
				console.log('  missing access token expiry, omitting auth check');
				return;
			}

			const currentTimeSeconds = this._getCurrentTimeInSeconds(),
				accessTokenExpirySeconds = accessTokenExpiresAt - this._authCheckIntervalSecondsTimeout;

			if (currentTimeSeconds < accessTokenExpirySeconds) {
				console.log('  access token is still valid, omitting refresh');
				return;
			}

			const refreshTokenExpiresAt = Credentials.get('refreshExpiresAt');

			if (!refreshTokenExpiresAt) {
				console.log('  missing refresh token expiry, omitting auth check');
				return;
			}

			const refreshTokenExpirySeconds = refreshTokenExpiresAt - this._authCheckIntervalSecondsTimeout;

			if (currentTimeSeconds < refreshTokenExpirySeconds) {
				console.log('  refresh token is still valid, refreshing!!');
				this._refreshToken();
			} else {
				console.log('  refresh token is invalid, logging out!!');
				this._removeAuthData();
			}
		},

		_refreshToken: function() {

			const data = {
				refresh_token: Credentials.get('refreshToken')
			};

			this._emitEvt('REQUEST', {
				method: 'POST',
				target: this._refreshTarget,
				query: data,
				requesterId: this.getOwnChannel()
			});
		},

		_refreshDataAvailable: function(res, resWrapper) {

			const target = resWrapper.target;

			if (this._refreshTarget !== target) {
				return;
			}

			this._onRefreshSuccess(res.data);
		},

		_refreshErrorAvailable: function(error, status, resWrapper) {

			const target = resWrapper.target;

			if (this._refreshTarget !== target) {
				return;
			}

			this._onRefreshFailure({ error, status });
		},

		_onRefreshSuccess: function(tokenData) {

			this._emitEvt('USER_TOKEN_REFRESHED', tokenData);

			this._updateAuthOidData(tokenData);
		},

		_onRefreshFailure: function(errorData) {

			this._emitEvt('USER_REFRESH_ERROR', errorData);
		},

		_updateAuthRefreshData: function(data) {

			const expiresAt = this._getExpiryDate(data.expires_in),
				refreshExpiresAt = this._getExpiryDate(data.refresh_expires_in);

			Credentials.set('expiresAt', expiresAt);
			Credentials.set('refreshToken', data.refresh_token);
			Credentials.set('refreshExpiresAt', refreshExpiresAt);
		},

		_getCurrentTimeInSeconds: function() {

			return Math.floor(Date.now() / 1000);
		},

		_getExpiryDate: function(expiresIn) {

			return this._getCurrentTimeInSeconds() + expiresIn;
		},

		_removeAuthRefreshData: function() {

			Credentials.remove('expiresAt');
			Credentials.remove('refreshToken');
			Credentials.remove('refreshExpiresAt');
		}
	});
});
