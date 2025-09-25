define([
	'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/base/_Module'
	, 'src/component/store/_RestManagerItfc'
], function(
	redmicConfig
	, declare
	, lang
	, _Module
	, _RestManagerItfc
) {

	return declare([_Module, _RestManagerItfc], {
		//	summary:
		//		Módulo encargado de la entrada/salida con respecto a servicios externos.
		//	description:
		//		Permite manejar las peticiones de datos y su respuesta, así como las operaciones de escritura y borrado.

		postMixInProperties: function() {

			const defaultConfig = {
				ownChannel: 'data',
				events: {
					GET: 'get',
					REQUEST: 'request',
					SAVE: 'save',
					REMOVE: 'remove',
					TARGET_LOADING: 'targetLoading',
					TARGET_LOADED: 'targetLoaded',
					ABORT_ALL_LOADING: 'abortAllLoading',
					REQUEST_PARAMS_CHANGED: 'requestParamsChanged'
				},
				actions: {
					REQUEST: 'request',
					AVAILABLE: 'available',
					GET: 'get',
					ITEM_AVAILABLE: 'itemAvailable',
					INJECT_DATA: 'injectData',
					INJECT_ITEM: 'injectItem',
					SAVE: 'save',
					SAVED: 'saved',
					REMOVE: 'remove',
					REMOVED: 'removed',
					TARGET_LOADING: 'targetLoading',
					TARGET_LOADED: 'targetLoaded',
					ABORT_ALL_LOADING: 'abortAllLoading',
					ADD_REQUEST_PARAMS: 'addRequestParams',
					REQUEST_PARAMS_CHANGED: 'requestParamsChanged'
				},

				// TODO esto quizá no debería ir aquí, sino en el comunicador de errores
				defaultErrorDescription: 'Error'
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_defineSubscriptions: function () {

			const options = {
				predicate: lang.hitch(this, this._chkTargetIsValid)
			};

			this.subscriptionsConfig.push({
				channel : this.getChannel('REQUEST'),
				callback: '_subRequest',
				options
			},{
				channel : this.getChannel('GET'),
				callback: '_subGet',
				options
			},{
				channel : this.getChannel('INJECT_DATA'),
				callback: '_subInjectData',
				options
			},{
				channel : this.getChannel('INJECT_ITEM'),
				callback: '_subInjectItem',
				options
			},{
				channel : this.getChannel('ADD_REQUEST_PARAMS'),
				callback: '_subAddRequestParams',
				options
			},{
				channel : this.getChannel('SAVE'),
				callback: '_subSave',
				options: {
					predicate: lang.hitch(this, function(req) {

						return this._chkTargetIsValid(req) && this._chkValidSaveRequest(req);
					})
				}
			},{
				channel : this.getChannel('REMOVE'),
				callback: '_subRemove',
				options: {
					predicate: lang.hitch(this, function(req) {

						return this._chkTargetIsValid(req) && this._chkValidRemoveRequest(req);
					})
				}
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
				event: 'REQUEST_PARAMS_CHANGED',
				channel: this.getChannel('REQUEST_PARAMS_CHANGED')
			},{
				event: 'SAVE',
				channel: this.getChannel('SAVED')
			},{
				event: 'REMOVE',
				channel: this.getChannel('REMOVED')
			},{
				event: 'TARGET_LOADING',
				channel: this.getChannel('TARGET_LOADING')
			},{
				event: 'TARGET_LOADED',
				channel: this.getChannel('TARGET_LOADED')
			},{
				event: 'ABORT_ALL_LOADING',
				channel: this._buildChannel(this.loadingChannel, this.actions.ABORT_ALL_LOADING)
			});
		},

		_subGet: function(req, _mediatorChannel, componentInfo) {

			this._emitLoading(req);

			const requesterChannel = this._getRequesterChannel(componentInfo);

			this._manageRequestParams(req, requesterChannel);

			this._performGet(req, requesterChannel).then(
				lang.hitch(this, this._handleGetSuccess, req),
				lang.hitch(this, this._handleGetError, req));
		},

		_handleGetSuccess: function(req, res) {

			var response = this._parseResponse(res);

			this._emitResponse({
				req: req,
				res: response,
				evtName: 'GET'
			});
		},

		_handleGetError: function(req, res) {

			var response = this._parseError(res);

			this._emitError(response);

			this._emitResponse({
				req: req,
				res: response,
				evtName: 'GET'
			});
		},

		_subRequest: function(req, _mediatorChannel, componentInfo) {

			this._emitLoading(req);

			const requesterChannel = this._getRequesterChannel(componentInfo);

			this._manageRequestParams(req, requesterChannel);

			this._performRequest(req, requesterChannel).then(
				lang.hitch(this, this._handleRequestSuccess, req),
				lang.hitch(this, this._handleRequestError, req));
		},

		_handleRequestSuccess: function(req, res) {

			var response = this._parseResponse(res);

			this._emitResponse({
				req: req,
				res: response,
				evtName: 'REQUEST'
			});
		},

		_handleRequestError: function(req, res) {

			var response = this._parseError(res);

			this._emitError(response);

			this._emitResponse({
				req: req,
				res: response,
				evtName: 'REQUEST'
			});
		},

		_subInjectItem: function(req) {

			var data = req.data;

			if (!data) {
				data = [];
			}

			this._handleGetSuccess(req, {
				status: 200,
				data: data
			});
		},

		_subInjectData: function(req) {

			var res = {
				status: 200,
				data: req.data || []
			};

			var total = req.data ? (req.total || req.data.length) : 0;

			if (req.total) {
				delete req.total;
			}

			this._handleRequestSuccess(req, res);
		},

		_subAddRequestParams: function(req, _mediatorChannel, componentInfo) {

			const requesterChannel = this._getRequesterChannel(componentInfo);

			const params = this._manageRequestParams(req, requesterChannel);

			const target = req.target,
				addedParams = req.params;

			this._emitEvt('REQUEST_PARAMS_CHANGED', {target, params, addedParams});
		},

		_getRequesterChannel: function(componentInfo) {

			return componentInfo?.publisherChannel ?? '';
		},

		_chkValidSaveRequest: function(req) {

			var condition = !!req.data;

			if (!condition) {
				console.error('Invalid save request at module "%s": %O', this.getChannel(), req);
			}

			return condition;
		},

		_subSave: function(req) {

			this._emitLoading(req);

			var target = this._getResolvedTarget(req.target);

			this._saveRequest(target, req).then(
				lang.hitch(this, this._handleSaveSuccess, req),
				lang.hitch(this, this._handleSaveError, req));
		},

		_handleSaveSuccess: function(req, res) {

			var response = this._parseResponse(res);

			if (!req.omitSuccessNotification) {
				this._notifySuccess();
			}

			this._emitResponse({
				req: req,
				res: response,
				evtName: 'SAVE'
			});
		},

		_handleSaveError: function(req, res) {

			var response = this._parseError(res);

			console.error(response.error);

			this._emitError(response);

			this._emitResponse({
				req: req,
				res: response,
				evtName: 'SAVE'
			});
		},

		_chkValidRemoveRequest: function(req) {

			var condition = !!req.id;

			if (!condition) {
				console.error('Invalid remove request at module "%s": %O', this.getChannel(), req);
			}

			return condition;
		},

		_subRemove: function(req) {

			this._emitLoading(req);

			var target = this._getResolvedTarget(req.target);

			this._removeRequest(target, req).then(
				lang.hitch(this, this._handleRemoveSuccess, req),
				lang.hitch(this, this._handleRemoveError, req));
		},

		_handleRemoveSuccess: function(req, res) {

			var response = this._parseResponse(res);

			if (!req.omitSuccessNotification) {
				this._notifySuccess();
			}

			this._emitResponse({
				req: req,
				res: response,
				evtName: 'REMOVE'
			});
		},

		_handleRemoveError: function(req, res) {

			var response = this._parseError(res);

			this._emitError(response);

			this._emitResponse({
				req: req,
				res: response,
				evtName: 'REMOVE'
			});
		},

		_getResolvedTarget: function(target) {

			return redmicConfig.getServiceUrl(target);
		},

		_emitLoading: function(req) {

			this._emitEvt('TARGET_LOADING', {
				target: req.target,
				requesterId: req.requesterId
			});
		},

		_emitLoaded: function(req) {

			this._emitEvt('TARGET_LOADED', {
				target: req.target,
				requesterId: req.requesterId
			});
		},

		_emitResponse: function(params) {

			var req = params.req,
				res = params.res,
				evtName = params.evtName;

			var response = {
				target: req.target,
				requesterId: req.requesterId,
				req: req,
				res: res
			};

			this._emitLoaded(req);

			this._emitEvt(evtName, response);
		},

		_emitError: function(response) {

			var status = response.status,
				error = response.error,
				description = error || this.defaultErrorDescription;

			if (status) {
				description += ' - <a href="/feedback/' + status + '" target="_blank">' + this.i18n.contact + '</a>';
			}

			this._emitEvt('COMMUNICATION', {
				type: 'alert',
				level: 'error',
				description: description,
				timeout: 0
			});
		},

		_notifySuccess: function() {

			this._emitEvt('COMMUNICATION', {
				type: 'alert',
				level: 'success',
				description: this.i18n.success
			});
		}
	});
});
