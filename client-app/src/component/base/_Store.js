define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "src/component/base/_StoreItfc"
], function(
	declare
	, lang
	, aspect
	, _StoreItfc
) {

	return declare(_StoreItfc, {
		//	summary:
		//		Permite a los módulos realizar peticiones de datos, comunicándose con RestManager.

		storeEvents: {
			REQUEST: "request",
			GET: "get",
			INJECT_ITEM: "injectItem",
			INJECT_DATA: "injectData",
			ADD_REQUEST_PARAMS: 'addRequestParams'
		},

		storeActions: {
			REQUEST: "request",
			AVAILABLE: "available",
			GET: "get",
			ITEM_AVAILABLE: "itemAvailable",
			INJECT_ITEM: "injectItem",
			INJECT_DATA: "injectData",
			TARGET_LOADING: "targetLoading",
			TARGET_LOADED: "targetLoaded",
			ADD_REQUEST_PARAMS: 'addRequestParams',
			REQUEST_PARAMS_CHANGED: 'requestParamsChanged'
		},

		constructor: function(args) {

			aspect.after(this, "_mixEventsAndActions", lang.hitch(this, this._mixEventsAndActionsStore));
			aspect.before(this, "_defineSubscriptions", lang.hitch(this, this._defineStoreSubscriptions));
			aspect.before(this, "_definePublications", lang.hitch(this, this._defineStorePublications));
		},

		_mixEventsAndActionsStore: function () {

			lang.mixin(this.events, this.storeEvents);
			lang.mixin(this.actions, this.storeActions);
			delete this.storeEvents;
			delete this.storeActions;
		},

		_defineStoreSubscriptions: function () {

			const options = {
				predicate: lang.hitch(this, this._chkTargetAndRequester)
			};

			this.subscriptionsConfig.push({
				channel : this._buildChannel(this.storeChannel, 'AVAILABLE'),
				callback: '_subAvailable',
				options
			},{
				channel : this._buildChannel(this.storeChannel, 'ITEM_AVAILABLE'),
				callback: '_subItemAvailable',
				options
			},{
				channel : this._buildChannel(this.storeChannel, 'REQUEST_PARAMS_CHANGED'),
				callback: '_subRequestParamsChanged',
				options
			});

			if (!this.omitLoading) {
				const loadingOpts = {
					predicate: lang.hitch(this, this._chkTargetLoadingIsMine)
				};

				this.subscriptionsConfig.push({
					channel : this._buildChannel(this.storeChannel, 'TARGET_LOADING'),
					callback: '_subTargetLoading',
					options: loadingOpts
				},{
					channel : this._buildChannel(this.storeChannel, 'TARGET_LOADED'),
					callback: '_subTargetLoaded',
					options: loadingOpts
				});
			}

			this._deleteDuplicatedChannels(this.subscriptionsConfig);
		},

		_defineStorePublications: function () {

			this.publicationsConfig.push({
				event: 'REQUEST',
				channel: this._buildChannel(this.storeChannel, 'REQUEST')
			},{
				event: 'GET',
				channel: this._buildChannel(this.storeChannel, 'GET')
			},{
				event: 'INJECT_ITEM',
				channel: this._buildChannel(this.storeChannel, 'INJECT_ITEM')
			},{
				event: 'INJECT_DATA',
				channel: this._buildChannel(this.storeChannel, 'INJECT_DATA')
			},{
				event: 'ADD_REQUEST_PARAMS',
				channel: this._buildChannel(this.storeChannel, 'ADD_REQUEST_PARAMS')
			});

			this._deleteDuplicatedChannels(this.publicationsConfig);
		},

		_subAvailable: function(resWrapper) {

			var response = resWrapper.res,
				status = response.status;

			if (this._chkSuccessfulStatus(status)) {
				this._dataAvailable(response, resWrapper);
			} else {
				this._errorAvailable(response.error, status, resWrapper);
			}

			this._tryToEmitEvt('LOADED');
		},

		_subItemAvailable: function(resWrapper) {

			var response = resWrapper.res,
				status = response.status;

			if (this._chkSuccessfulStatus(status)) {
				this._itemAvailable(response, resWrapper);
			} else {
				this._errorAvailable(response.error, status, resWrapper);
			}

			this._tryToEmitEvt('LOADED');
		},

		_subRequestParamsChanged: function(res) {

			this._requestParamsChanged(res);
		},

		_onSetPropTarget: function() {

			this.inherited(arguments);

			this._tryToEmitEvt('LOADED');
		},

		_chkTargetAndRequester: function(res) {

			return this._chkTargetIsMine(res) && this._chkRequesterIsMe(res);
		},

		_chkTargetLoadingIsMine: function(res) {

			return !this._shouldOmitTargetLoading(res) && this._chkTargetAndRequester(res);
		},

		_subTargetLoading: function() {

			this._tryToEmitEvt('LOADING');
		},

		_subTargetLoaded: function() {

			this._tryToEmitEvt('LOADED');
		},

		_getTarget: function() {

			var target = this.inherited(arguments);

			if (target) {
				return target;
			}

			if (this.baseTarget) {
				return this.baseTarget;
			}

			if (this.target instanceof Array) {
				return this.target[0];
			}

			return this.target;
		}
	});
});
