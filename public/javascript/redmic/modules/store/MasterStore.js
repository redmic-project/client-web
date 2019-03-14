define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/store/Observable"
	, "redmic/store/QueryStore"
	, "redmic/modules/base/_Module"
], function(
	declare
	, lang
	, Observable
	, Store
	, _Module
){
	return declare(_Module, {
		//	summary:
		//		Todo lo necesario para trabajar con master Store.
		//	description:
		//		Proporciona métodos manejar datos de la api.

		//	config: Object
		//		Opciones por defecto.

		constructor: function(args) {

			this.config = {
				// own events
				events: {
					GET: "get",
					REQUEST: "request",
					REQUEST_QUERY: "requestQuery",
					TARGET_LOADING: "targetLoading",
					TARGET_LOADED: "targetLoaded"
				},
				// own actions
				actions: {
					REQUEST: "request",
					AVAILABLE: "available",
					GET: "get",
					ITEM_AVAILABLE: "itemAvailable",
					INJECT_DATA: "injectData",
					INJECT_ITEM: "injectItem",
					AVAILABLE_QUERY: "availableQuery",
					TARGET_LOADING: "targetLoading",
					TARGET_LOADED: "targetLoaded"
				},
				// mediator params
				ownChannel: "data",
				defaultErrorDescription: "Error",
				defaultErrorCode: "0"
			};

			lang.mixin(this, this.config, args);
		},

		_defineSubscriptions: function () {

			var options = {
				predicate: lang.hitch(this, this._chkRequestHasTarget)
			};

			this.subscriptionsConfig.push({
				channel : this.getChannel("REQUEST"),
				callback: "_subRequest",
				options: options
			},{
				channel : this.getChannel("GET"),
				callback: "_subGet",
				options: options
			},{
				channel : this.getChannel("INJECT_DATA"),
				callback: "_subInjectData",
				options: options
			},{
				channel : this.getChannel("INJECT_ITEM"),
				callback: "_subInjectItem",
				options: options
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'GET',
				channel: this.getChannel("ITEM_AVAILABLE")
			},{
				event: 'REQUEST',
				channel: this.getChannel("AVAILABLE")
			},{
				event: 'TARGET_LOADING',
				channel: this.getChannel("TARGET_LOADING")
			},{
				event: 'TARGET_LOADED',
				channel: this.getChannel("TARGET_LOADED")
			},{
				event: 'REQUEST_QUERY',
				channel: this.getChannel("AVAILABLE_QUERY")
			});
		},

		_chkRequestHasTarget: function(request) {

			if (!request || !request.target) {
				return false;
			}

			return true;
		},

		_subRequest: function(req) {

			this._emitTargetLoadingState("TARGET_LOADING", req.target, req.requesterId, "request");

			var target = this._getSafeTarget(req.target),
				obj = {
					target: target
				};

			if (req.type) {
				obj.type = req.type;
			}

			if (req.action) {
				obj.action = req.action;
			}

			this.collection = new Observable(new Store(obj));
			// TODO - IMPLEMENTAR -> this.collection.destroy();

			var method = req.method ? req.method : "GET",
				query = req.query ? req.query : {},
				queryString = req.queryString ? req.queryString : "",
				options = req.options ? req.options: {},
				queryResult = (method === "GET") ?
					this.collection.query(query, options) :
					this.collection.post(query, queryString, options);

			queryResult.then(
				lang.hitch(this, function(req, result) {

					this._emitRequestResults(req, result, result.total);
				}, req),
				lang.hitch(this, this._emitError, target));

			this._emitEvt('REQUEST_QUERY', {
				target: req.target,
				query: query
			});
		},

		_emitTargetLoadingState: function(event, target, requesterId, type) {

			this._emitEvt(event, {
				target: target,
				requesterId: requesterId,
				type: type
			});
		},

		_emitRequestResults: function(request, result, total) {

			this._emitEvt('REQUEST', {
				success: true,
				body: {
					data: result,
					target: request.target,
					requesterId: request.requesterId,
					total: total
				}
			});
		},

		_emitError: function(target, error) {

			if (!error) {
				error = {};
			}

			if (!error.code) {
				error.code = this.defaultErrorCode;
			}

			if(!error.description) {
				error.description = this.defaultErrorDescription/* + ' ' + (error.code || '')*/;
			}

			this._emitTargetLoadingState("TARGET_LOADED", /*request.*/target/*, request.requesterId, "request"*/);

			this._emitEvt('COMMUNICATION', {
				type: "alert",
				level: "error",
				description: error.description
			});

			this._emitEvt('REQUEST', {
				success: false,
				error: {
					target: target,
					error: error
				}
			});
		},

		_getSafeTarget: function(target) {

			if (target.indexOf('?') === -1) {
				return target + '/';
			}

			return target;
		},

		_subGet: function(req) {

			this._emitTargetLoadingState("TARGET_LOADING", req.target, req.requesterId, "get");

			var target = this._getSafeTarget(req.target),
				obj = {
					target: target
				};

			if (req.type) {
				obj.type = req.type;
			}

			this.collection = new Observable(new Store(obj));
			// TODO - IMPLEMENTAR -> this.collection.destroy();

			var result = this.collection.get(req.id, req.options);

			result.then(
				lang.hitch(this, this._emitGetResults, req),
				lang.hitch(this, this._emitError, target));
		},

		_emitGetResults: function(request, result) {

			var objRequest = {
				success: true,
				body: {
					data: result,
					target: request.target,
					requesterId: request.requesterId
				}
			};

			if (request.noSetTotal) {
				objRequest.body.noSetTotal = true;
			}

			this._emitEvt('GET', objRequest);
		},

		_subInjectData: function(request) {

			var result = request.data,
				total = result ? (request.total || result.length) : 0;

			if (!result) {
				result = [];
			}

			if (request.total) {
				delete request.total;
			}

			this._emitRequestResults(request, result, total);
		},

		_subInjectItem: function(request) {

			var result = request.data;

			if (!result) {
				result = [];
			}

			this._emitGetResults(request, result);
		}
	});
});
