define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/request'
	, './RestManager'
], function(
	declare
	, lang
	, request
	, RestManager
) {

	return declare(RestManager, {
		//	summary:
		//		Implementación del módulo RestManager, que provee métodos de comunicación mediante dojo/request.
		//	description:
		//		Importante: el campo 'options' recibido en las peticiones desde otros módulos, sobreescribe directamente
		//		las opciones que se usarán a su vez para realizar la petición HTTP.

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
				handleAs: 'json'
			};

			lang.mixin(this, this.config, args);
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

			var data = req.data;
				idProperty = req.idProperty || this.idProperty,
				id = data[idProperty],
				targetWithSlash = this._getTargetWithEndingSlash(target);

			if (!id) {
				return targetWithSlash;
			}

			return targetWithSlash + id;
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

			var data = req.data,
				idProperty = req.idProperty || this.idProperty,
				id = data[idProperty],
				idInTarget = req.idInTarget;

			return (id || idInTarget) ? 'PUT' : 'POST';
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

			var response = res.response;

			// TODO usar response.data directamente cuando no se envuelva la respuesta con error
			var data = response.data;
			if (data && data.error) {
				data = data.error;
			}

			return {
				status: response.status,
				data: data,
				text: response.text,
				url: response.url,
				getHeader: response.getHeader,
				options: response.options,
				error: res.message
			};
		}
	});
});
