define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
], function(
	declare
	, lang
) {

	return declare(null, {
		//	summary:
		//		Lógica de preparación del envío de peticiones del componente RestManager.

		postMixInProperties: function() {

			const defaultConfig = {
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

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_performGet: function(req, requesterChannel) {

			const url = this._getTargetForGet(req, requesterChannel),
				options = this._getOptionsForGet(req, requesterChannel);

			return this._launchRequest(url, options);
		},

		_getTargetForGet: function(req, requesterChannel) {

			let target = this._getTargetWithPathParamsReplaced(req.target, requesterChannel);

			const id = req.id,
				idType = typeof id;

			if (idType === 'string' || idType === 'number') {
				target = this._getTargetWithEndingSlash(target) + id;
			}

			return target;
		},

		_getOptionsForGet: function(req, requesterChannel) {

			const method = 'GET',
				headers = lang.mixin({}, this.headers, req.headers || {}),
				query = this._getQueryDataWithQueryParamsReplaced(req.target, requesterChannel);

			const options = {
				method,
				headers,
				query,
				sync: this.sync,
				preventCache: this.preventCache,
				timeout: this.timeout,
				handleAs: this.handleAs
			};

			return this._merge([options, req.options || {}]);
		},

		_performRequest: function(req, requesterChannel) {

			const url = this._getTargetForRequest(req, requesterChannel),
				options = this._getOptionsForRequest(req, requesterChannel);

			return this._launchRequest(url, options);
		},

		_getTargetForRequest: function(req, requesterChannel) {

			let target = this._getTargetWithPathParamsReplaced(req.target, requesterChannel);

			const action = req.action;
			if (action?.length) {
				target = this._getTargetWithEndingSlash(target) + action;
			}

			return target;
		},

		_getOptionsForRequest: function(req, requesterChannel) {

			const method = req.method || 'GET';

			const reqHeaders = this._getRequestRequestHeaders(req),
				headers = lang.mixin({}, this.headers, reqHeaders, req.headers || {});

			const options = {
				method,
				headers,
				sync: this.sync,
				preventCache: this.preventCache,
				timeout: this.timeout,
				handleAs: this.handleAs
			};

			const queryData = this._getQueryDataWithQueryParamsReplaced(req.target, requesterChannel);

			if (method === 'POST') {
				options.data = JSON.stringify(queryData,
					(key, value) => this._filterQueryParamsForRequestBodyData(key, value));
			} else {
				options.query = queryData;
			}

			const reqOptions = req.options || {};

			return lang.mixin(options, reqOptions);
		},

		_filterQueryParamsForRequestBodyData: function(_key, value) {

			const isEmptyArray = value instanceof Array && !value.length,
				isNullValue = value === null;

			// evita arrays vacíos y valores nulos en los campos de filtro
			if (isEmptyArray || isNullValue) {
				return;
			}

			return value;
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

		_getTargetWithEndingSlash: function(target) {

			if (target.includes('?') || target.endsWith('/')) {
				return target;
			}

			return `${target}/`;
		}
	});
});
