define([
	'dojo/_base/declare'
	, 'src/app/component/request/_Auth'
	, 'src/app/component/request/_Params'
	, 'src/app/component/request/_Receive'
	, 'src/app/component/request/_RestManagerItfc'
	, 'src/app/component/request/_Send'
	, 'src/component/base/_Module'
], function(
	declare
	, _Auth
	, _Params
	, _Receive
	, _RestManagerItfc
	, _Send
	, _Module
) {

	return declare([_Module, _Send, _Receive, _Params, _Auth, _RestManagerItfc], {
		// summary:
		//   Componente encargado de la entrada/salida de datos, para consulta, escritura y borrado.

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
					REQUEST_PARAMS_CHANGED: 'requestParamsChanged',
					AUTH_PERMISSION_ERROR: 'authPermissionError'
				},

				// TODO esto quizá no debería ir aquí, sino en el comunicador de errores
				defaultErrorDescription: 'Error'
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_defineSubscriptions: function() {

			const options = {
				predicate: req => this._chkTargetIsValid(req)
			};

			this.subscriptionsConfig.push({
				channel: this.getChannel('REQUEST'),
				callback: '_subRequest',
				options
			},{
				channel: this.getChannel('GET'),
				callback: '_subGet',
				options
			},{
				channel: this.getChannel('INJECT_DATA'),
				callback: '_subInjectData',
				options
			},{
				channel: this.getChannel('INJECT_ITEM'),
				callback: '_subInjectItem',
				options
			},{
				channel: this.getChannel('ADD_REQUEST_PARAMS'),
				callback: '_subAddRequestParams',
				options
			},{
				channel: this.getChannel('SAVE'),
				callback: '_subSave',
				options: {
					predicate: req => this._chkValidSaveRequest(req)
				}
			},{
				channel: this.getChannel('REMOVE'),
				callback: '_subRemove',
				options: {
					predicate: req => this._chkValidRemoveRequest(req)
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
				channel: this._buildChannel(this.loadingChannel, 'ABORT_ALL_LOADING')
			});
		},

		_subGet: function(req, _mediatorChannel, componentInfo) {

			const requesterChannel = this._getRequesterChannel(componentInfo);

			this._manageRequestParams(req, requesterChannel);

			const evtName = 'GET',
				notifySuccess = false,
				notifyError = true;

			this._performGet(req, requesterChannel).then(
				res => this._handleSuccess({ evtName, notifySuccess }, req, res),
				res => this._handleError({ evtName, notifyError }, req, res));
		},

		_subRequest: function(req, _mediatorChannel, componentInfo) {

			const requesterChannel = this._getRequesterChannel(componentInfo);

			this._manageRequestParams(req, requesterChannel);

			const evtName = 'REQUEST',
				notifySuccess = false,
				notifyError = true;

			this._performRequest(req, requesterChannel).then(
				res => this._handleSuccess({ evtName, notifySuccess }, req, res),
				res => this._handleError({ evtName, notifyError }, req, res));
		},

		_subInjectItem: function(req) {

			const res = {
				status: 200,
				data: req.data ?? {}
			};

			const evtName = 'GET',
				notifySuccess = false;

			this._handleSuccess({ evtName, notifySuccess }, req, res);
		},

		_subInjectData: function(req) {

			const res = {
				status: 200,
				data: req.data ?? []
			};

			// TODO esta variable no se usa, eliminarla o asignarla a req o res?
			var total = req.data ? (req.total || req.data.length) : 0;

			// TODO por qué se borra? comprobar si es necesario
			if (req.total) {
				delete req.total;
			}

			const evtName = 'REQUEST',
				notifySuccess = false;

			this._handleSuccess({ evtName, notifySuccess }, req, res);
		},

		_subAddRequestParams: function(req, _mediatorChannel, componentInfo) {

			const requesterChannel = this._getRequesterChannel(componentInfo);

			this._manageRequestParams(req, requesterChannel);
		},

		_getRequesterChannel: function(componentInfo) {

			return componentInfo?.publisherChannel ?? '';
		},

		_chkValidSaveRequest: function(req) {

			if (!this._chkTargetIsValid(req)) {
				return false;
			}

			const condition = !!req.data;

			if (!condition) {
				console.error('Invalid save request at module "%s": %O', this.getChannel(), req);
			}

			return condition;
		},

		_subSave: function(req) {

			const evtName = 'SAVE',
				notifySuccess = !req.omitSuccessNotification ?? true,
				notifyError = true;

			this._performSave(req).then(
				res => this._handleSuccess({ evtName, notifySuccess }, req, res),
				res => this._handleError({ evtName, notifyError }, req, res));
		},

		_chkValidRemoveRequest: function(req) {

			if (!this._chkTargetIsValid(req)) {
				return false;
			}

			const condition = !!req.id;

			if (!condition) {
				console.error('Invalid remove request at module "%s": %O', this.getChannel(), req);
			}

			return condition;
		},

		_subRemove: function(req) {

			const evtName = 'REMOVE',
				notifySuccess = !req.omitSuccessNotification ?? true,
				notifyError = true;

			this._performRemove(req).then(
				res => this._handleSuccess({ evtName, notifySuccess }, req, res),
				res => this._handleError({ evtName, notifyError }, req, res));
		}
	});
});
