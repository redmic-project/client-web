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
			INJECT_DATA: "injectData"
		},

		storeActions: {
			REQUEST: "request",
			AVAILABLE: "available",
			GET: "get",
			ITEM_AVAILABLE: "itemAvailable",
			INJECT_ITEM: "injectItem",
			INJECT_DATA: "injectData",
			UPDATE_TARGET: "updateTarget",
			TARGET_LOADING: "targetLoading",
			TARGET_LOADED: "targetLoaded"
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

			var options = {
					predicate: lang.hitch(this, this._chkTargetAndRequester)
				};

			this.subscriptionsConfig.push({
				channel : this._buildChannel(this.storeChannel, this.actions.AVAILABLE),
				callback: "_subAvailable",
				options: options
			},{
				channel : this._buildChannel(this.storeChannel, this.actions.ITEM_AVAILABLE),
				callback: "_subItemAvailable",
				options: options
			},{
				channel : this.getChannel(this.actions.UPDATE_TARGET),
				callback: "_subUpdateTarget"
			});

			!this.omitLoading && this.subscriptionsConfig.push({
				channel : this._buildChannel(this.storeChannel, this.actions.TARGET_LOADING),
				callback: "_subTargetLoading",
				options: {
					predicate: lang.hitch(this, this._chkTargetLoadingIsMine)
				}
			},{
				channel : this._buildChannel(this.storeChannel, this.actions.TARGET_LOADED),
				callback: "_subTargetLoaded",
				options: {
					predicate: lang.hitch(this, this._chkTargetLoadingIsMine)
				}
			});

			this._deleteDuplicatedChannels(this.subscriptionsConfig);
		},

		_defineStorePublications: function () {

			this.publicationsConfig.push({
				event: 'REQUEST',
				channel: this._buildChannel(this.storeChannel, this.actions.REQUEST)
			},{
				event: 'GET',
				channel: this._buildChannel(this.storeChannel, this.actions.GET)
			},{
				event: 'INJECT_ITEM',
				channel: this._buildChannel(this.storeChannel, this.actions.INJECT_ITEM)
			},{
				event: 'INJECT_DATA',
				channel: this._buildChannel(this.storeChannel, this.actions.INJECT_DATA)
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

		_subUpdateTarget: function(obj) {

			this._tryToEmitEvt('LOADED');

			if (obj.refresh || this.target !== obj.target) {
				this.target = obj.target;

				this._updateTarget && this._updateTarget(obj);
			}
		},

		_chkTargetLoadingIsMine: function(res) {

			if (this._shouldOmitLoadingEvents()) {
				return false;
			}

			return this._chkTargetAndRequester(res);
		},

		_subTargetLoading: function(res) {

			this._tryToEmitEvt('LOADING');
		},

		_subTargetLoaded: function(res) {

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
