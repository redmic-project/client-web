define([
	'app/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/io-query'
	, 'dojo/request'
	, 'dojo/Deferred'
	, './RestManager'
], function(
	redmicConfig
	, declare
	, lang
	, ioQuery
	, request
	, Deferred
	, RestManager
){
	return declare(RestManager, {
		//	summary:
		//		Implementación del módulo RestManager, que nos permite intercambiar datos con los diferentes servicios.
		//	description:
		//		Proporciona los métodos de consulta (get, query y post).

		constructor: function(args) {

			this.config = {
				timeout: 45000,
				type: 'ES',
				defaultType: 'ES',
				action: '_search',
				headers: {},
				idProperty: 'id',
				ascendingPrefix: '%2B',
				descendingPrefix: '-',
				limitDefault: 100,
				handleAs: 'json',
				accepts: 'application/javascript, application/json'
			};

			lang.mixin(this, this.config, args);
		},

		get: function(target, id, options) {
			//	summary:
			//		Devuelve el item correspondiente al id en el servicio especificado por target
			//	id: Integer
			//		Identificador del objeto
			//	options: Object?
			//
			//	returns: Object
			//		El item traido del servicio

			var builtTarget = target + id;

			var requestDfd = request(builtTarget, {
				method: 'GET',
				handleAs: this.handleAs,
				headers: this._getHeaders('get', options || {}),
				timeout: this.timeout
			});

			return requestDfd.response;
		},

		query: function(target, query, options) {
			//	summary:
			//		Devuelve, desde el servicio especificado por target, los items que satisfacen la query establecida
			//	query: Object
			//		Query que especifica los datos requeridos
			//	options: Object?
			//
			//	returns: Object

			var queryString = this._getQuery(target, query, options) || '',
				builtTarget = target + queryString;

			var requestDfd = request(builtTarget, {
				method: 'GET',
				handleAs: this.handleAs,
				headers: this._getHeaders('query', options),
				timeout: this.timeout,
				query : queryString ? {} : query
			});

			return requestDfd.response;
		},

		post: function(target, queryObject, queryString, options) {
			//	summary:
			//		Consultas vía post
			//	queryObject: Object
			//		Query object.
			//	options: Object?
			//
			//	returns: Object

			var requestDfd = request(target, {
				method: 'POST',
				data: JSON.stringify(queryObject),
				handleAs: this.handleAs,
				headers: this._getHeaders('post', options || {}),
				timeout: this.timeout,
				query: queryString
			});

			return requestDfd.response;
		},

		_handleResponse: function(res) {

			var data = res.data,
				status = res.status;

			if (data && data.body) {
				data = data.body;
			}

			return {
				data: data,
				status: status
			};
		},

		_handleError: function(err) {

			console.error(err.message);

			var errObj = err.response,
				data = errObj.data,
				status = errObj.status;

			if (data && data.error) {
				data = data.error;
			}

			return {
				data: data,
				status: status
			};
		},

		_getBuiltTarget: function(req) {

			var target = this._getSafeTarget(req.target),
				type = req.type || this.type,
				action = req.action || this.action;

			if (type === this.defaultType) {
				target += action;
			}

			return target;
		},

		_getSafeTarget: function(target) {

			var resolvedTarget = redmicConfig.getServiceUrl(target, this._evt);

			if (resolvedTarget.indexOf('?') === -1) {
				return resolvedTarget + '/';
			}

			return resolvedTarget;
		},

		_getHeaders: function(type, options) {

			if (type === 'query') {
				var headers = lang.mixin({ Accept: this.accepts }, this.headers, options.headers);

				if (options.start >= 0 || options.count >= 0) {
					//set X-Range for Opera since it blocks "Range" header
					headers.Range = headers['X-Range'] = 'items=' + (options.start || '0') + '-' +
						(('count' in options && options.count != Infinity) ?
							(options.count + (options.start || 0) - 1) :
							this.limitDefault);  // cambiar this.limitDefault por ''
				}
				return headers;

			} else if (type === 'get') {
				return lang.mixin({Accept: this.accepts}, this.headers, options.headers || options);

			} else if (type === 'post') {
				return lang.mixin({
					'Content-Type': 'application/json',
					'Accept': this.accepts,
					'If-Match': options.overwrite === true ? '*' : null,
					'If-None-Match': options.overwrite === false ? '*' : null
				}, this.headers, options.headers);
			}
		},

		_getQuery: function(target, query, options) {

			var hasQuestionMark = target.indexOf('?') > -1;

			if (query && typeof query == 'object') {
				query = ioQuery.objectToQuery(query);
				query = query ? (hasQuestionMark ? '&' : '?') + query: '';
			}

			if (options && options.sort) {
				if (!query) {
					query = '';
				}

				var sortParam = this.sortParam;

				query += (query || hasQuestionMark ? '&' : '?') + (sortParam ? sortParam + '=' : 'sort=(');

				for (var i = 0; i < options.sort.length; i++) {
					var sort = options.sort[i];

					if (sort.property) {
						sort.attribute = sort.property;
					}

					query += (i > 0 ? ',' : '') + (sort.descending ? this.descendingPrefix :
						this.ascendingPrefix) + encodeURIComponent(sort.attribute || sort.property);
				}

				if (!sortParam) {
					query += ')';
				}
			}

			return query;
		}
	});
});
