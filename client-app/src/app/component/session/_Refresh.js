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
		//		Lógica relativa a la renovación de la sesión del usuario.

		constructor: function(args) {

			this.config = {
				_refreshTarget: redmicConfig.services.refreshToken,
				_sessionCheckInterval: 10000
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, '_initialize', lang.hitch(this, this._refreshInitialize));
			aspect.before(this, '_dataAvailable', lang.hitch(this, this._refreshDataAvailable));
			aspect.before(this, '_errorAvailable', lang.hitch(this, this._refreshErrorAvailable));
			aspect.before(this, '_updateUserSessionData',
				lang.hitch(this, this._updateRefreshSessionDataOnUpdateUserSessionData));
			aspect.before(this, '_removeUserSessionData', lang.hitch(this,
				this._removeRefreshSessionDataOnRemoveUserSessionData));
		},

		_refreshInitialize: function() {

			this.target.push(this._refreshTarget);

			setInterval(lang.hitch(this, this._checkSessionValidity), this._sessionCheckInterval);
		},

		_checkSessionValidity: function() {

			const accessTokenExpiresAt = Credentials.get('expiresAt'),
				currentTime = Math.floor(Date.now() / 1000);

			if (accessTokenExpiresAt && currentTime < accessTokenExpiresAt) {
				console.log('  access token is still valid');
				return;
			}

			const refreshTokenExpiresAt = Credentials.get('refreshExpiresAt');

			if (refreshTokenExpiresAt && currentTime < refreshTokenExpiresAt) {
				console.log('  refresh token is still valid, refreshing!!');
				this._refreshToken();
			} else {
				console.log('  refresh token is invalid, logging out!!');
				this._removeUserSessionData();
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

			this._updateRefreshSessionData(tokenData);
		},

		_onRefreshFailure: function(errorData) {

			this._emitEvt('USER_REFRESH_ERROR', errorData);
		},

		_updateRefreshSessionDataOnUpdateUserSessionData: function(tokensData) {

			this._updateRefreshSessionData(tokensData[1]);
		},

		_updateRefreshSessionData: function(data) {

			const expiresAt = this._getExpiryDate(data.expires_in),
				refreshExpiresAt = this._getExpiryDate(data.refresh_expires_in);

			Credentials.set('expiresAt', expiresAt);
			Credentials.set('refreshToken', data.refresh_token);
			Credentials.set('refreshExpiresAt', refreshExpiresAt);
		},

		_getExpiryDate: function(expiresIn) {

			return Math.floor(Date.now() / 1000) + expiresIn;
		},

		_removeRefreshSessionDataOnRemoveUserSessionData: function() {

			this._removeRefreshSessionData();
		},

		_removeRefreshSessionData: function() {

			Credentials.remove('expiresAt');
			Credentials.remove('refreshToken');
			Credentials.remove('refreshExpiresAt');
		}
	});
});
