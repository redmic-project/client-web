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
				type: "ES",
				defaultType: "ES",
				action: "_search",
				headers: {},
				target: "",
				idProperty: "id",
				ascendingPrefix: "%2B",
				descendingPrefix: "-",
				queryEngine: SimpleQueryEngine,
				limitDefault: 100,
				handleAs: "json",
				accepts: "application/javascript, application/json"
			};

			lang.mixin(this, this.config, args);
		},

		// TODO GENERAL: quitar Json.parser si api con elastic devuelve json no string line 84, 102 y 200

		get: function (id, options) {
			// summary:
			//		Devuelve el item correspondiente al id en el servicio especificado por target
			// id: Integer
			//		Identificador del objeto
			// options: Object?
			//
			// returns: Object
			//		El item traido del servicio

			options = options || {};
			var deferred = new Deferred(),
				target = this.target + id,

				xhrOptions = {
					method: "GET",
					handleAs: this.handleAs,
					headers: this._getHeaders("get", options),
					timeout: this.timeout
				},

				callback = lang.hitch(this, function(data) {
					if (data.success || data.success === undefined) {
						deferred.resolve(data.body ? data.body : data);
					} else {
						deferred.reject(data);
					}
				});

			xhr(target, xhrOptions).then(callback, lang.hitch(this, function(err) {

				deferred.reject(this._parseError(err));
			}));

			return deferred;
		},

		query: function (query, options) {
			// summary:
			//		Devuelve los items del servicio especificado por target, los cuales coinciden con la query establecida
			// query: Object
			//		Query que especifica los datos requeridos
			// options: __QueryOptions?
			//
			// returns: dojo/store/api/Store.QueryResults

			if (this.type === this.defaultType) {
				this.target += this.action;
			}

			var deferred = new Deferred(),
				queryString = this._getQuery(query, options) || "",
				results = xhr(this.target + queryString, {
					method: "GET",
					handleAs: this.handleAs,
					headers: this._getHeaders("query", options),
					timeout: this.timeout,
					query : queryString ? {} : query
				});

			deferred.total = new Deferred();

			results.then (
				lang.hitch(this, function(rest) {
					if (rest.success) {
						if (this.type !== this.defaultType) {
							results.response.then(function(response) {
								deferred.resolve(rest.body);
								deferred.total.resolve(rest.total || rest.body.length);
							});
						} else {
							deferred.resolve(rest.body);
							deferred.total.resolve(rest.body.total || rest.body.length);
						}
					} else {
						deferred.reject(lang.delegate(rest, {total: 0}));
					}
				}),
				function(error) {
					deferred.reject(lang.delegate(error, {total: 0}));
				}
			);
			return QueryResults(deferred);
		},

		post: function(object, queryString, options) {
			// summary:
			//		Consultas vía post
			// object: Object
			//		Query object.
			// options: __PutDirectives?
			//
			// returns: dojo/_base/Deferred

			if (this.type === this.defaultType) {
				this.target += this.action;
			}

			options = options || {};

			var self = this,
				deferred = new Deferred();

			deferred.total = new Deferred();

			xhr(this.target, {
				method: "POST",
				data: JSON.stringify(object),
				handleAs: this.handleAs,
				headers: self._getHeaders("post", options),
				timeout: this.timeout,
				query: queryString
			}).then(lang.hitch(this, this._responseParse, deferred), lang.hitch(this, function(err) {

				deferred.reject(this._parseError(err));
			}));

			return deferred;
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

		_responseParse: function(deferred, data) {

			if (!data.success) {
				deferred.reject(data);
			}

			data = data.body;

			if (!this.type || this.type === this.defaultType) {
				deferred.resolve(data);
				deferred.total.resolve(data.length);
			} else {
				deferred.resolve(data);
				deferred.total.resolve(data.total ? data.total : 0);
			}
		},

		_getHeaders: function(type, options) {

			if (type === "query") {
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
