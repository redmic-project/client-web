define([
	'dojo/_base/declare'
	, 'dojo/Deferred'
], function(
	declare
	, Deferred
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
				optionsDfd = this._getOptionsForGet(req, requesterChannel),
				getResponseDfd = new Deferred();

			optionsDfd.then(options => {
				this._launchRequest(url, options).then(
					getResponse => getResponseDfd.resolve(getResponse),
					getError => getResponseDfd.reject(getError));
			});

			return getResponseDfd;
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
				headers = this._merge([{}, this.headers, req.headers ?? {}]);

			const options = {
				method,
				headers,
				sync: this.sync,
				preventCache: this.preventCache,
				timeout: this.timeout,
				handleAs: this.handleAs
			};

			const queryDfd = this._getQueryDataWithQueryParamsReplaced(req.target, requesterChannel),
				optionsDfd = new Deferred();

			queryDfd.then(query => optionsDfd.resolve(this._merge([options, {query}, req.options ?? {}])));

			return optionsDfd;
		},

		_performRequest: function(req, requesterChannel) {

			const url = this._getTargetForRequest(req, requesterChannel),
				optionsDfd = this._getOptionsForRequest(req, requesterChannel),
				requestResponseDfd = new Deferred();

			optionsDfd.then(options => {
				this._launchRequest(url, options).then(
					requestResponse => requestResponseDfd.resolve(requestResponse),
					requestError => requestResponseDfd.reject(requestError));
			});

			return requestResponseDfd;
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

			const method = req.method ?? 'GET',
				reqHeaders = this._getRequestRequestHeaders(req),
				headers = this._merge([{}, this.headers, reqHeaders, req.headers ?? {}]);

			const options = {
				method,
				headers,
				sync: this.sync,
				preventCache: this.preventCache,
				timeout: this.timeout,
				handleAs: this.handleAs
			};

			const queryDfd = this._getQueryDataWithQueryParamsReplaced(req.target, requesterChannel),
				optionsDfd = new Deferred();

			queryDfd.then(query => {
				if (method === 'POST') {
					options.data = JSON.stringify(query,
						(key, value) => this._filterQueryParamsForRequestBodyData(key, value));
				} else {
					options.query = query;
				}

				optionsDfd.resolve(this._merge([options, req.options ?? {}]));
			});

			return optionsDfd;
		},

		_filterQueryParamsForRequestBodyData: function(_key, value) {
			// summary:
			//   Evita el paso hacia los parámetros de filtrado de valores nulos y arrays vacíos.

			const isNullValue = value === null;
			if (isNullValue) {
				return;
			}

			const isEmptyArray = value instanceof Array && !value.length;
			if (isEmptyArray) {
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

		_performSave: function(req) {

			const url = this._getTargetForSave(req),
				options = this._getOptionsForSave(req);

			return this._launchRequest(url, options);
		},

		_getTargetForSave: function(req) {

			const idValue = this._getItemIdFromSaveRequest(req),
				idType = typeof idValue;

			let target = this._getTargetWithPathParamsReplaced(req.target);
			target = this._getTargetWithEndingSlash(target);

			if (idType === 'string' || idType === 'number') {
				target += idValue;
			}

			return target;
		},

		_getItemIdFromSaveRequest: function(req) {

			const idPropName = req.idProperty ?? this.idProperty;

			return req[idPropName] ?? req.data[idPropName];
		},

		_getOptionsForSave: function(req) {

			const method = this._getSaveRequestMethod(req),
				saveHeaders = this._getSaveRequestHeaders(req),
				headers = this._merge([{}, this.headers, saveHeaders, req.headers ?? {}]),
				data = JSON.stringify(req.data);

			const options = {
				method,
				headers,
				data,
				sync: this.sync,
				preventCache: this.preventCache,
				timeout: this.timeout,
				handleAs: this.handleAs
			};

			return this._merge([options, req.options ?? {}]);
		},

		_getSaveRequestMethod: function(req) {
			// TODO es posible que esta funcionalidad quepa mejor en _Store, antes de publicar, para que aquí se
			// reciba directamente el método de consulta listo para usar.

			const idValue = this._getItemIdFromSaveRequest(req);

			return idValue ? 'PUT' : 'POST';
		},

		_getSaveRequestHeaders: function(req) {
			// TODO es posible que esta funcionalidad quepa mejor en _Store, antes de publicar, para que aquí se
			// reciban directamente las cabeceras listas para usar.

			const headers = {
				'Content-Type': 'application/json'
			};

			return headers;
		},

		_performRemove: function(req) {

			const url = this._getTargetForRemove(req),
				options = this._getOptionsForRemove(req);

			return this._launchRequest(url, options);
		},

		_getTargetForRemove: function(req) {

			const target = this._getTargetWithPathParamsReplaced(req.target),
				idValue = req.id;

			return this._getTargetWithEndingSlash(target) + idValue;
		},

		_getOptionsForRemove: function(req) {

			const method = 'DELETE',
				headers = this._merge([{}, this.headers, req.headers ?? {}]);

			const options = {
				method,
				headers,
				sync: this.sync,
				preventCache: this.preventCache,
				timeout: this.timeout,
				handleAs: this.handleAs
			};

			return this._merge([options, req.options ?? {}]);
		},

		_getTargetWithEndingSlash: function(target) {

			if (target.includes('?') || target.endsWith('/')) {
				return target;
			}

			return `${target}/`;
		}
	});
});
