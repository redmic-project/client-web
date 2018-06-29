define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/base/_StoreItfc"
], function(
	declare
	, lang
	, aspect
	, _StoreItfc
){
	return declare(_StoreItfc, {
		//	summary:
		//		Base común para todos los módulos con carga de datos.
		//	description:
		//		Aporta la funcionalidad de pedir y obtener datos al módulo que extiende de él.

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
			REMOVE: "remove",
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
				},
				errorOptions = {
					predicate: lang.hitch(this, this._chkErrorTargetAndRequester)
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
				channel : this._buildChannel(this.storeChannel, this.actions.AVAILABLE),
				callback: "_subDataError",
				options: errorOptions
			},{
				channel : this._buildChannel(this.storeChannel, this.actions.ITEM_AVAILABLE),
				callback: "_subDataError",
				options: errorOptions
			},{
				channel : this.getChannel(this.actions.REMOVE),
				callback: "_subRemove"
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
				channel: this._buildChannel(this.storeChannel, this.actions.REQUEST),
				callback: "_pubToStore"
			},{
				event: 'GET',
				channel: this._buildChannel(this.storeChannel, this.actions.GET),
				callback: "_pubToStore"
			},{
				event: 'INJECT_ITEM',
				channel: this._buildChannel(this.storeChannel, this.actions.INJECT_ITEM),
				callback: "_pubToStore"
			},{
				event: 'INJECT_DATA',
				channel: this._buildChannel(this.storeChannel, this.actions.INJECT_DATA),
				callback: "_pubToStore"
			});

			this._deleteDuplicatedChannels(this.publicationsConfig);
		},

		_subAvailable: function(res) {

			this._dataAvailable(res.body);

			this._tryToEmitEvt('LOADED');
		},

		_subItemAvailable: function(res) {

			this._itemAvailable(res.body);

			this._tryToEmitEvt('LOADED');
		},

		_subDataError: function(res) {

			var err = res.error;

			this._errorAvailable(err);

			this._tryToEmitEvt('LOADED');
		},

		_subRemove: function(req) {

			this._removeData(req.ids);
		},

		_pubToStore: function(channel, req) {

			req && this._publish(channel, req);
		},

		_subUpdateTarget: function(obj) {

			this._tryToEmitEvt('LOADED');

			if (this.target !== obj.target) {
				this.target = obj.target;

				this._updateTarget && this._updateTarget(obj);
			}
		},

		_chkTargetLoadingIsMine: function(res) {

			if (this._shouldOmitLoadingEvents()) {
				return false;
			}

			var target = res.target;
				requesterId = res.requesterId,
				type = res.type,

				targetCondition = this._targetIsMine(target) || target === this.baseTarget,
				arriveMethod = type === "request" ? "_dataAvailable" : (type === "get" ? "_itemAvailable" : null),
				typeCondition = arriveMethod ? !!this[arriveMethod] : false;

			if (targetCondition && typeCondition) {
				if (!requesterId || requesterId === this.getOwnChannel()) {
					return true;
				}
			}

			return false;
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
