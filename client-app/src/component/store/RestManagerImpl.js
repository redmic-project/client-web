define([
	'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/request'
	, 'dojo/request/notify'
	, 'dojo/request/registry'
	, 'src/util/Credentials'
	, './RestManager'
], function(
	redmicConfig
	, declare
	, lang
	, request
	, notify
	, registry
	, Credentials
	, RestManager
) {

	return declare(RestManager, {
		//	summary:
		//		Implementación del módulo RestManager, que provee métodos de comunicación mediante dojo/request.
		//	description:
		//		También maneja errores de permisos en peticiones y les añade cabeceras de autentificación.
		//		Importante: el campo 'options' recibido en las peticiones desde otros módulos, sobreescribe directamente
		//		las opciones que se usarán a su vez para realizar la petición HTTP.

		//	_apiUrl: String
		//		Prefijo de rutas hacia el servidor
		//	_filteredUrls: Array
		//		Define las URLs a las que no hay que añadirle caberas de autentificación

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
				_filteredUrls: [
					'token',
					'reCaptcha',
					'register',
					'resettingRequest',
					'resettingSetPassword',
					'activateAccount'
				]
			};

			lang.mixin(this, this.config, args);

			this._prepareRequestHandlers();
		},

		_prepareRequestHandlers: function() {

			notify('error', lang.hitch(this, this._requestErrorHandler));
			registry.register(lang.hitch(this, this._preRequestHandler), request);
		},

		_getTargetWithEndingSlash: function(target) {

			if (target.indexOf('?') === -1 && target[target.length - 1] !== '/') {
				target += '/';
			}

			return target;
		},

		_launchRequest: function(url, options) {

			return request(url, options).response;
		},

		_getRequest: function(target, req) {

			var url = this._getGetRequestTarget(target, req),
				options = this._getGetRequestOptions(req);

			return this._launchRequest(url, options);
		},

		_getGetRequestTarget: function(target, req) {

			var targetWithSlash = this._getTargetWithEndingSlash(target),
				id = req.id;

			if (typeof id === 'string' || typeof id === 'number') {
				return targetWithSlash + id;
			}

			return targetWithSlash;
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

			var targetWithSlash = this._getTargetWithEndingSlash(target),
				action = req.action || '';

			return targetWithSlash + action;
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

			var id = this._getItemIdFromSaveRequest(req),
				targetWithSlash = this._getTargetWithEndingSlash(target);

			if (!id) {
				return targetWithSlash;
			}

			return targetWithSlash + id;
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

			var targetWithSlash = this._getTargetWithEndingSlash(target),
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

			var getTokenTarget = redmicConfig.getServiceUrl(redmicConfig.services.getToken),
				requestedTarget = res.url;

			if (requestedTarget.indexOf(getTokenTarget) === -1) {
				// TODO notificar al usuario que intentó acceder a algo para lo que no tenía permiso (token caducado o con
				// privilegios insuficientes)
				Credentials.set('accessToken', null);
			}
		},

		_onRequestReachabilityError: function(res) {

			// TODO notificar al usuario que hubo un error de conexión y ofrecerle recargar (para que pueda actuar
			// sobre la página actual antes de recargar)
		},

		_preRequestHandler: function(url, options) {
			//	summary:
			//		Se ejecuta antes de hacer un request y nos permite añadir cabeceras
			//	tags:
			//		private
			//	url:
			//		url del servicio
			//	options:
			//		opciones del request (headers...)

			var urlSplitted = url.split('/'),
				lastUrlItem = urlSplitted.pop();

			if (!lastUrlItem.length) {
				lastUrlItem = urlSplitted.pop();
			}

			var lastUrlItemWithoutParams = lastUrlItem.split('?')[0],
				isFilteredUrlItem = this._filteredUrls.indexOf(lastUrlItemWithoutParams) !== -1,
				isUrlToServer = url.indexOf(this._apiUrl) !== -1,
				urlNeedsAuth = isUrlToServer && !isFilteredUrlItem;

			if (urlNeedsAuth) {
				if (!options.headers) {
					options.headers = {};
				}

				var accessToken = Credentials.get('accessToken');
				if (accessToken) {
					options.headers.Authorization = 'Bearer ' + accessToken;
				}
			}

			return !!options.useXHR;
		}
	});
});
