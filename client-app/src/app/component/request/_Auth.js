define([
	'dojo/_base/declare'
	, 'src/util/Credentials'
], function(
	declare
	, Credentials
) {

	return declare(null, {
		//	summary:
		//		Lógica de autenticación del componente RestManager.

		//	_filteredAuthPaths: Array
		//		Define las rutas de URLs a las que no hay que añadirle cabeceras de autenticación.

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
				_oidPaths: [
					'acoustic-detection'
				]
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_getOptionsWithAuthIfNeeded: function(url, options) {

			if (!this._requestedUrlNeedsAuth(url)) {
				return options;
			}

			const authHeader = this._getAuthHeaderNeededByUrl(url);

			if (!authHeader) {
				return options;
			}

			if (!options.headers) {
				options.headers = {};
			}

			options.headers.Authorization = authHeader;

			return options;
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

			let isOidPath = false;

			for (let i = 0; i < this._oidPaths.length; i++) {
				if (url.includes(this._oidPaths[i])) {
					isOidPath = true;
					break;
				}
			}

			const accessToken = isOidPath ? Credentials.get('oidAccessToken') : Credentials.get('accessToken');

			return accessToken ? `Bearer ${accessToken}` : null;
		}
	});
});
