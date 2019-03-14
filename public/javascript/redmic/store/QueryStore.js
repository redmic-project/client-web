define([
	"dojo/io-query"
	, "dojo/request"
	, "dojo/_base/lang"
	, "dojo/_base/declare"
	, "dojo/Deferred"
	, "dojo/store/util/QueryResults"
	, "redmic/store/util/SimpleQueryEngine"
], function(
	ioQuery
	, xhr
	, lang
	, declare
	, Deferred
	, QueryResults
	, SimpleQueryEngine
){
	return declare(null, {
		//	summary:
		//		Componente que nos permite traer datos de nuestro servicio
		//	description:
		//		Proporciona los métodos get y query

		//	config: Object
		//		Opciones por defecto.

		constructor: function(args) {
			// summary:
			//		Constructor del store.
			// tags:
			//		extension
			// args:
			//		Atributo de inicialización.

			this.config = {
				timeout: 45000,
				type: 'ES',
				defaultType: 'ES',
				action: '_search',
				headers: {},
				target: '',
				idProperty: 'id',
				ascendingPrefix: '%2B',
				descendingPrefix: '-',
				queryEngine: SimpleQueryEngine,
				limitDefault: 100,
				handleAs: 'json',
				accepts: 'application/javascript, application/json'
			};

			lang.mixin(this, this.config, args);
		},

		// TODO GENERAL: quitar Json.parser si api con elastic devuelve json no string line 84, 102 y 200

		get: function(id, options) {
			// summary:
			//		Devuelve el item correspondiente al id en el servicio especificado por target
			// id: Integer
			//		Identificador del objeto
			// options: Object?
			//
			// returns: Object
			//		El item traido del servicio

			var responseDfd = new Deferred(),
				target = this.target + id,
				successCallback = lang.hitch(this, this._handleGetResponse, responseDfd),
				errorCallback = lang.hitch(this, this._handleGetError, responseDfd);

			var requestDfd = xhr(target, {
				method: 'GET',
				handleAs: this.handleAs,
				headers: this._getHeaders('get', options || {}),
				timeout: this.timeout
			});

			requestDfd.response.then(successCallback, errorCallback);

			return responseDfd;
		},

		_handleGetResponse: function(dfd, res) {

			var data = res.data,
				status = res.status;

			// TODO sustituir propiedad 'success' por el uso del status de la respuesta
			if (data.success || data.success === undefined) {
				dfd.resolve(data.body || data);
			} else {
				dfd.reject(data);
			}
		},

		_handleGetError: function(dfd, err) {

			dfd.reject(this._parseError(err));
		},

		query: function(query, options) {
			// summary:
			//		Devuelve los items del servicio especificado por target, los cuales coinciden con la query establecida
			// query: Object
			//		Query que especifica los datos requeridos
			// options: __QueryOptions?
			//
			// returns: dojo/store/api/Store.QueryResults

			var responseDfd = new Deferred(),
				queryString = this._getQuery(query, options) || '',
				target = this.target + (this.type === this.defaultType ? this.action : '') + queryString,
				successCallback = lang.hitch(this, this._handleQueryResponse, responseDfd),
				errorCallback = lang.hitch(this, this._handleQueryError, responseDfd);

			var requestDfd = xhr(target, {
				method: 'GET',
				handleAs: this.handleAs,
				headers: this._getHeaders('query', options),
				timeout: this.timeout,
				query : queryString ? {} : query
			});

			requestDfd.response.then(successCallback, errorCallback);

			return QueryResults(responseDfd);
		},

		_handleQueryResponse: function(dfd, res) {

			var data = res.data,
				status = res.status;

			// TODO sustituir propiedad 'success' por el uso del status de la respuesta
			if (data.success) {
				var response = data.body;

				// TODO parece funcionar bien sin este bloque, borrar si sigue todo correcto
				/*if (this.type !== this.defaultType) {
					response.total = data.total || data.body.length;
				} else {
					response.total = data.body.total || data.body.length;
				}*/

				dfd.resolve(response);
			} else {
				dfd.reject(lang.delegate(data, {total: 0}));
			}
		},

		_handleQueryError: function(dfd, err) {

			dfd.reject(lang.delegate(err, { total: 0 }));
		},

		post: function(queryObject, queryString, options) {
			// summary:
			//		Consultas vía post
			// queryObject: Object
			//		Query object.
			// options: __PutDirectives?
			//
			// returns: dojo/_base/Deferred

			var responseDfd = new Deferred(),
				target = this.target + (this.type === this.defaultType ? this.action : ''),
				successCallback = lang.hitch(this, this._handlePostResponse, responseDfd),
				errorCallback = lang.hitch(this, this._handlePostError, responseDfd);

			var requestDfd = xhr(target, {
				method: 'POST',
				data: JSON.stringify(queryObject),
				handleAs: this.handleAs,
				headers: this._getHeaders('post', options || {}),
				timeout: this.timeout,
				query: queryString
			});

			requestDfd.response.then(successCallback, errorCallback);

			return responseDfd;
		},

		_handlePostResponse: function(dfd, res) {

			var data = res.data,
				status = res.status;

			// TODO sustituir propiedad 'success' por el uso del status de la respuesta
			if (data.success) {
				var response = data.body;

				// TODO parece funcionar bien sin este bloque, borrar si sigue todo correcto
				/*if (!this.type || this.type === this.defaultType) {
					response.total = response.length;
				} else {
					response.total = response.total || 0;
				}*/

				dfd.resolve(response);
			} else {
				dfd.reject(data);
			}
		},

		_handlePostError: function(dfd, err) {

			dfd.reject(this._parseError(err));
		},

		_parseError: function(err) {

			var data = err;

			if (data && data.response) {
				data = data.response;
				if (data && data.data) {
					data = data.data;
				}
			}

			return data.error || data;
		},

		_getHeaders: function(type, options) {

			if (type === 'query') {
				var headers = lang.mixin({ Accept: this.accepts }, this.headers, options.headers);

				if (options.start >= 0 || options.count >= 0) {
					//set X-Range for Opera since it blocks "Range" header
					headers.Range = headers["X-Range"] = "items=" + (options.start || '0') + '-' +
						(("count" in options && options.count != Infinity) ?
							(options.count + (options.start || 0) - 1) : this.limitDefault);  // cambiar this.limitDefault por ''
				}
				return headers;

			} else if (type === "get") {
				return lang.mixin({Accept: this.accepts}, this.headers, options.headers || options);

			} else if (type === "post") {
				return lang.mixin({
						"Content-Type": "application/json",
						Accept: this.accepts,
						"If-Match": options.overwrite === true ? "*" : null,
						"If-None-Match": options.overwrite === false ? "*" : null
					}, this.headers, options.headers);
			}
		},

		_getQuery: function(query, options) {

			var hasQuestionMark = this.target.indexOf("?") > -1;

			if (query && typeof query == "object") {
				query = ioQuery.objectToQuery(query);
				query = query ? (hasQuestionMark ? "&" : "?") + query: "";
			}

			if (options && options.sort) {
				if (!query) {
					query = "";
				}

				var sortParam = this.sortParam;

				query += (query || hasQuestionMark ? "&" : "?") + (sortParam ? sortParam + '=' : "sort=(");

				for (var i = 0; i < options.sort.length; i++) {
					var sort = options.sort[i];

					if (sort.property) {
						sort.attribute = sort.property;
					}

					query += (i > 0 ? "," : "") + (sort.descending ? this.descendingPrefix :
						this.ascendingPrefix) + encodeURIComponent(sort.attribute || sort.property);
				}

				if (!sortParam) {
					query += ")";
				}
			}

			return query;
		}
	});
});
