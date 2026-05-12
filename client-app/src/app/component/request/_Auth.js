define([
	'dojo/_base/declare'
	, 'src/redmicConfig'
	, 'src/util/Credentials'
], function(
	declare
	, redmicConfig
	, Credentials
) {

	return declare(null, {
		// summary:
		//   Lógica de autenticación del componente RestManager.

		// _filteredAuthPaths: Array
		//   Define las rutas de URLs a las que no hay que añadirle cabeceras de autenticación.
		// _subPathsForResponseAuthError: Array
		//   Define las subrutas de URLs que, si reciben respuesta con error 400, 401 o 403, deben derivarse hacia el
		//   componente Auth para su manejo.

		postMixInProperties: function() {

			const defaultConfig = {
				_filteredAuthPaths: [
					'token',
					'reCaptcha',
					'register',
					'resettingRequest',
					'resettingSetPassword',
					'activateAccount'
				],
				// TODO medida temporal, mientras convivan oauth y keycloak
				_oidcPaths: [
					'acoustic-detection'
				],
				_subPathsForResponseAuthError: [
					this.apiUrl,
					redmicConfig.services.getOauthToken,
					redmicConfig.services.getOidcToken,
					redmicConfig.services.logoutOauth,
					redmicConfig.services.logoutOidc,
					redmicConfig.services.refreshToken,
					redmicConfig.services.getTokenPayload
				]
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_getAuthHeaders: function(url) {

			if (!this._requestedUrlNeedsAuth(url)) {
				return;
			}

			const authHeaderName = 'Authorization',
				authHeaderValue = this._getAuthHeaderNeededByUrl(url);

			if (!authHeaderValue) {
				return;
			}

			return {
				[authHeaderName]: authHeaderValue
			};
		},

		_addAuthHeadersToOptions: function(options, authHeaders) {

			if (!authHeaders || !options) {
				return;
			}

			options.headers = this._merge([options.headers ?? {}, authHeaders]);
		},

		_requestedUrlNeedsAuth: function(url) {

			const isUrlToApi = url.includes(this.apiUrl);

			if (!isUrlToApi) {
				return false;
			}

			let urlSplitted = url.split('/'),
				lastPathItem = urlSplitted.pop();

			if (!lastPathItem.length) {
				lastPathItem = urlSplitted.pop();
			}

			const lastPathItemWithoutParams = lastPathItem.split('?')[0];

			return !this._filteredAuthPaths.includes(lastPathItemWithoutParams);
		},

		_getAuthHeaderNeededByUrl: function(url) {

			let isOidcPath = false;

			for (const oidcPath of this._oidcPaths) {
				if (url.includes(oidcPath)) {
					isOidcPath = true;
					break;
				}
			}

			const accessToken = isOidcPath ? Credentials.get('oidcAccessToken') : Credentials.get('accessToken');

			return accessToken ? `Bearer ${accessToken}` : null;
		},

		_responseHasErrorForAuthComponent: function(res) {

			const status = res.status,
				url = res.url;

			if (!status || status < 400 || status > 403) {
				return false;
			}

			for (const subPath of this._subPathsForResponseAuthError) {
				if (url.includes(subPath)) {
					return true;
				}
			}

			return false;
		}
	});
});
