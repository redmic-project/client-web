define([
	'dojo/_base/declare'
	, 'src/util/Credentials'
], function(
	declare
	, Credentials
) {

	return declare(null, {
		// summary:
		//   Lógica de autenticación del componente RestManager.

		// _filteredAuthPaths: Array
		//   Define las rutas de URLs a las que no hay que añadirle cabeceras de autenticación.

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

			for (let i = 0; i < this._oidcPaths.length; i++) {
				if (url.includes(this._oidcPaths[i])) {
					isOidcPath = true;
					break;
				}
			}

			const accessToken = isOidcPath ? Credentials.get('oidcAccessToken') : Credentials.get('accessToken');

			return accessToken ? `Bearer ${accessToken}` : null;
		}
	});
});
