define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/request/xhr'
	, 'dojo/request/notify'
	, 'src/component/store/RestManager'
	, 'src/redmicConfig'
	, 'src/util/Credentials'
], function(
	declare
	, lang
	, requestXhr
	, requestNotify
	, RestManager
	, redmicConfig
	, Credentials
) {

	return declare(RestManager, {
		//	summary:
		//		Implementación del módulo RestManager, que provee métodos de comunicación mediante dojo/request/xhr.
		//	description:
		//		También maneja errores de permisos en peticiones y les añade cabeceras de autentificación.
		//		Importante: el campo 'options' recibido en las peticiones desde otros módulos, sobreescribe directamente
		//		las opciones que se usarán a su vez para realizar la petición HTTP.

		//	_apiUrl: String
		//		Prefijo de rutas hacia el servidor.
		//	_filteredAuthPaths: Array
		//		Define las rutas de URLs a las que no hay que añadirle cabeceras de autenticación.

		constructor: function(args) {

			this.config = {
				idProperty: 'id',
				limitDefault: 100,
				sortParamName: 'sort',
				ascendingPrefix: '+',
				descendingPrefix: '-',

				headers: {
					'Accept': 'application/javascript, application/json'
				},
				sync: false,
				preventCache: false,
				timeout: 45000,
				handleAs: 'json',

				_apiUrl: redmicConfig.getEnvVariableValue('envApiUrl'),
				_filteredAuthPaths: [
					'token',
					'reCaptcha',
					'register',
					'resettingRequest',
					'resettingSetPassword',
					'activateAccount'
				],
				_oidPaths: [
					'acoustic-detection'
				]
			};

			lang.mixin(this, this.config, args);

			this._prepareRequestHandlers();
		},

		_prepareRequestHandlers: function() {

			requestNotify('error', lang.hitch(this, this._requestErrorHandler));
		},

		_getTargetWithEndingSlash: function(target) {

			if (target.includes('?') || target.endsWith('/')) {
				return target;
			}

			return target + '/';
		},

		_launchRequest: function(url, options) {

			const opts = this._getOptionsWithAuthIfNeeded(url, options);

			return requestXhr(url, opts).response;
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

			const isUrlToApi = url.includes(this._apiUrl);

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
		},

		_getRequest: function(target, req) {

			var url = this._getGetRequestTarget(target, req),
				options = this._getGetRequestOptions(req);

			return this._launchRequest(url, options);
		},

		_getGetRequestTarget: function(target, req) {

			const id = req.id,
				idType = typeof id;

			if (idType === 'string' || idType === 'number') {
				return this._getTargetWithEndingSlash(target) + id;
			}

			return target;
		},

		_getGetRequestOptions: function(req) {

			var headers = lang.mixin({}, this.headers, req.headers || {}),
				query = lang.mixin({}, req.query || {}),
				options = req.options || {};

			return lang.mixin({
				method: 'GET',
				headers: headers,
				query: query,
				sync: this.sync,
				preventCache: this.preventCache,
				timeout: this.timeout,
				handleAs: this.handleAs
			}, options);
		},

		_requestRequest: function(target, req) {

			var url = this._getRequestRequestTarget(target, req),
				options = this._getRequestRequestOptions(req);

			return this._launchRequest(url, options);
		},

		_getRequestRequestTarget: function(target, req) {

			const action = req.action;

			if (action?.length) {
				return this._getTargetWithEndingSlash(target) + action;
			}

			return target;
		},

		_getRequestRequestOptions: function(req) {

			var requestHeaders = this._getRequestRequestHeaders(req),
				headers = lang.mixin({}, this.headers, requestHeaders, req.headers || {}),
				requestQuery = this._getRequestRequestQuery(req),
				query = lang.mixin({}, requestQuery, req.query || {}),
				reqOptions = req.options || {},
				method = req.method || 'GET';

			var options = {
				method: method,
				headers: headers,
				sync: this.sync,
				preventCache: this.preventCache,
				timeout: this.timeout,
				handleAs: this.handleAs
			};

			if (method === 'POST') {
				options.data = JSON.stringify(query);
			} else {
				options.query = query;
			}

			return lang.mixin(options, reqOptions);
		},

		_getRequestRequestHeaders: function(req) {
			// TODO es posible que esta funcionalidad quepa mejor en _Store, antes de publicar, para que aquí se
			// reciban directamente las cabeceras listas para usar.

			var method = req.method,
				headers = {};

			if (method === 'POST') {
				headers['Content-Type'] = 'application/json';
			} else {
				this._setRangeHeaders(headers, req);
			}

			return headers;
		},

		_setRangeHeaders: function(headers, req) {

			var start = req.start,
				count = req.count;

			if (start >= 0 || count >= 0) {
				start = start || 0;

				// cambiar this.limitDefault por ''
				var end = count !== undefined ? count + start - 1 : this.limitDefault,
					rangeHeader = 'items=' + start + '-' + end;

				headers.Range = headers['X-Range'] = rangeHeader;
			}
		},

		_getRequestRequestQuery: function(req) {
			// TODO es posible que esta funcionalidad quepa mejor en _Store, antes de publicar, para que aquí se
			// reciban directamente los parámetros de consulta listos para usar.

			var sort = req.sort,
				query = {};

			if (sort) {
				var sortValue = '(';

				for (var i = 0; i < sort.length; i++) {
					var sortItem = sort[i],
						attributeName = sortItem.attribute,
						descendingDirection = sortItem.descending || false,
						directionPrefix = descendingDirection ? this.descendingPrefix : this.ascendingPrefix;

					if (i > 0) {
						sortValue += ',';
					}
					sortValue += encodeURIComponent(directionPrefix) + encodeURIComponent(attributeName);
				}

				sortValue += ')';

				query[this.sortParamName] = sortValue;
			}

			return query;
		},

		_saveRequest: function(target, req) {

			var url = this._getSaveRequestTarget(target, req),
				options = this._getSaveRequestOptions(req);

			return this._launchRequest(url, options);
		},

		_getSaveRequestTarget: function(target, req) {

			const id = this._getItemIdFromSaveRequest(req);

			if (id) {
				return this._getTargetWithEndingSlash(target) + id;
			}

			return target;
		},

		_getItemIdFromSaveRequest: function(req) {

			var data = req.data,
				idProperty = req.idProperty || this.idProperty,
				idInReq = req[idProperty],
				idInReqData = data[idProperty];

			return idInReq || idInReqData;
		},

		_getSaveRequestOptions: function(req) {

			var method = this._getSaveRequestMethod(req),
				saveHeaders = this._getSaveRequestHeaders(req),
				headers = lang.mixin({}, this.headers, saveHeaders, req.headers || {}),
				data = JSON.stringify(req.data),
				options = req.options || {};

			return lang.mixin({
				method: method,
				headers: headers,
				data: data,
				sync: this.sync,
				preventCache: this.preventCache,
				timeout: this.timeout,
				handleAs: this.handleAs
			}, options);
		},

		_getSaveRequestMethod: function(req) {
			// TODO es posible que esta funcionalidad quepa mejor en _Store, antes de publicar, para que aquí se
			// reciba directamente el método de consulta listo para usar.

			var id = this._getItemIdFromSaveRequest(req);

			return id ? 'PUT' : 'POST';
		},

		_getSaveRequestHeaders: function(req) {
			// TODO es posible que esta funcionalidad quepa mejor en _Store, antes de publicar, para que aquí se
			// reciban directamente las cabeceras listas para usar.

			var headers = {
				'Content-Type': 'application/json'
			};

			return headers;
		},

		_removeRequest: function(target, req) {

			var url = this._getRemoveRequestTarget(target, req),
				options = this._getRemoveRequestOptions(req);

			return this._launchRequest(url, options);
		},

		_getRemoveRequestTarget: function(target, req) {

			const targetWithSlash = this._getTargetWithEndingSlash(target),
				id = req.id;

			return targetWithSlash + id;
		},

		_getRemoveRequestOptions: function(req) {

			var headers = lang.mixin({}, this.headers, req.headers || {}),
				options = req.options || {};

			return lang.mixin({
				method: 'DELETE',
				headers: headers,
				sync: this.sync,
				preventCache: this.preventCache,
				timeout: this.timeout,
				handleAs: this.handleAs
			}, options);
		},

		_parseResponse: function(res) {

			// TODO usar res.data directamente cuando no se envuelva la respuesta con body
			var data = res.data;
			if (data && data.body) {
				data = data.body;
			}

			return {
				status: res.status,
				data: data,
				text: res.text,
				url: res.url,
				getHeader: res.getHeader,
				options: res.options
			};
		},

		_parseError: function(res) {

			var response = res.response,
				status = response.status,
				data = response.data,
				error = res.message;

			if (data) {
				// TODO usar response.data directamente cuando no se envuelva la respuesta con error
				if (data.error && data.error instanceof Object) {
					data = data.error;
				}

				if (data.code) {
					error += ' - ' + data.code;
				}

				if (data.description) {
					error += ' - ' + data.description;
				}
			}

			return {
				status: status,
				data: data,
				text: response.text,
				url: response.url,
				getHeader: response.getHeader,
				options: response.options,
				error: error
			};
		},

		_requestErrorHandler: function(err) {
			//	summary:
			//		Se ejecuta cuando un request produce un error y permite manejarlo
			//	tags:
			//		private
			//	err:
			//		respuesta con el error del request

			var res = err.response,
				status = res.status;

			this._emitEvt('ABORT_ALL_LOADING');

			if (status === 401) {
				this._onRequestPermissionError(res);
			} else if (status === 502) {
				this._onRequestReachabilityError(res);
			}
		},

		_onRequestPermissionError: function(res) {

			var requestedTarget = res.url,
				isGetTokenTarget = requestedTarget.includes(redmicConfig.services.getOauthToken) ||
					requestedTarget.includes(redmicConfig.services.getOidToken),

				isNotApiTarget = !requestedTarget.includes(this._apiUrl);

			if (isGetTokenTarget || isNotApiTarget) {
				return;
			}

			// TODO notificar al usuario que intentó acceder a algo para lo que no tenía permiso (token caducado o con
			// privilegios insuficientes)
			//Credentials.remove('accessToken');
		},

		_onRequestReachabilityError: function(res) {

			// TODO notificar al usuario que hubo un error de conexión y ofrecerle recargar (para que pueda actuar
			// sobre la página actual antes de recargar)
		}
	});
});
