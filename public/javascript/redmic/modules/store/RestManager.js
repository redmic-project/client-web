define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'redmic/modules/base/_Module'
], function(
	declare
	, lang
	, _Module
){
	return declare(_Module, {
		//	summary:
		//		Módulo encargado de la entrada/salida con respecto a servicios externos.
		//	description:
		//		Permite manejar las peticiones de datos y su respuesta.

		constructor: function(args) {

			this.config = {
				events: {
					GET: 'get',
					REQUEST: 'request',
					REQUEST_QUERY: 'requestQuery',
					TARGET_LOADING: 'targetLoading',
					TARGET_LOADED: 'targetLoaded'
				},
				actions: {
					REQUEST: 'request',
					AVAILABLE: 'available',
					GET: 'get',
					ITEM_AVAILABLE: 'itemAvailable',
					INJECT_DATA: 'injectData',
					INJECT_ITEM: 'injectItem',
					AVAILABLE_QUERY: 'availableQuery',
					TARGET_LOADING: 'targetLoading',
					TARGET_LOADED: 'targetLoaded'
				},
				ownChannel: 'data',
				defaultErrorDescription: 'Error',
				defaultErrorCode: '0'
			};

			lang.mixin(this, this.config, args);
		},

		_defineSubscriptions: function () {

			var options = {
				predicate: lang.hitch(this, this._chkRequestHasTarget)
			};

			this.subscriptionsConfig.push({
				channel : this.getChannel('REQUEST'),
				callback: '_subRequest',
				options: options
			},{
				channel : this.getChannel('GET'),
				callback: '_subGet',
				options: options
			},{
				channel : this.getChannel('INJECT_DATA'),
				callback: '_subInjectData',
				options: options
			},{
				channel : this.getChannel('INJECT_ITEM'),
				callback: '_subInjectItem',
				options: options
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'GET',
				channel: this.getChannel('ITEM_AVAILABLE')
			},{
				event: 'REQUEST',
				channel: this.getChannel('AVAILABLE')
			},{
				event: 'TARGET_LOADING',
				channel: this.getChannel('TARGET_LOADING')
			},{
				event: 'TARGET_LOADED',
				channel: this.getChannel('TARGET_LOADED')
			},{
				event: 'REQUEST_QUERY',
				channel: this.getChannel('AVAILABLE_QUERY')
			});
		},

		_chkRequestHasTarget: function(request) {

			if (!request || !request.target) {
				return false;
			}

			return true;
		},

		_subRequest: function(req) {

			this._emitTargetLoadingState('TARGET_LOADING', req.target, req.requesterId, 'request');

			var target = this._getBuiltTarget(req),
				method = req.method || 'GET',
				query = req.query || {},
				queryString = req.queryString || '',
				options = req.options || {},
				queryResult = (method === 'GET') ?
					this.query(target, query, options) :
					this.post(target, query, queryString, options);

			queryResult.then(
				lang.hitch(this, this._emitRequestResults, req),
				lang.hitch(this, this._emitError, req));

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

		_emitRequestResults: function(req, res, total) {

			var handledResponse = this._handleResponse(res);

			var responseObj = {
				target: req.target,
				requesterId: req.requesterId,
				total: total
			};

			lang.mixin(responseObj, handledResponse);

			// TODO suprimir envoltura de respuesta
			this._emitEvt('REQUEST', {
				success: true,
				body: responseObj
			});
		},

		_emitError: function(req, err) {

			var target = req.target,
				requesterId = req.requesterId,
				handledError = this._handleError(err),
				data = handledError.data,
				status = handledError.status;

			// TODO creo que estos valores por defecto deberían ponerse donde se escuchan, no aquí
			if (!data.code) {
				data.code = this.defaultErrorCode;
			}
			if (!data.description) {
				data.description = this.defaultErrorDescription/* + ' ' + (data.code || '')*/;
			}

			this._emitTargetLoadingState('TARGET_LOADED', target/*, requesterId, 'request'*/);

			this._emitEvt('COMMUNICATION', {
				type: 'alert',
				level: 'error',
				description: data.description
			});

			this._emitEvt('REQUEST', {
				success: false,
				error: {
					target: target,
					requesterId: requesterId,
					error: data
				}
			});
		},

		_subGet: function(req) {

			this._emitTargetLoadingState('TARGET_LOADING', req.target, req.requesterId, 'get');

			var target = this._getSafeTarget(req.target),
				result = this.get(target, req.id, req.options);

			result.then(
				lang.hitch(this, this._emitGetResults, req),
				lang.hitch(this, this._emitError, req));
		},

		_emitGetResults: function(req, res) {

			var handledResponse = this._handleResponse(res);

			var responseObj = {
				target: req.target,
				requesterId: req.requesterId
			};

			lang.mixin(responseObj, handledResponse);

			// TODO suprimir envoltura de respuesta
			var getResponse = {
				success: true,
				body: responseObj
			};

			// TODO creo que mejor no hacer esto aquí de forma genérica, sino tratar la respuesta donde se desee
			if (req.noSetTotal) {
				getResponse.body.noSetTotal = true;
			}

			this._emitEvt('GET', getResponse);
		},

		_subInjectData: function(req) {

			var res = {
				data: req.data || []
			};

			var total = req.data ? (req.total || req.data.length) : 0;

			if (req.total) {
				delete req.total;
			}

			this._emitRequestResults(req, res, total);
		},

		_subInjectItem: function(req) {

			var data = req.data;

			if (!data) {
				data = [];
			}

			this._emitGetResults(req, {
				data: data
			});
		}
	});
});
