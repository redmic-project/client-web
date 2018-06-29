define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
], function(
	declare
	, lang
	, aspect
){
	return declare(null, {
		//	summary:
		//		Extensión de módulos para que se muestren mediante eventos.

		constructor: function(args) {

			this.config = {
				showOnEvtActions: {
					ADD_EVT: "addEvt",
					DELETE_EVT: "deleteEvt",
					CLEAN_EVTS: "cleanEvts"
				},
				_eventsAdded: {},
				eventDefault: 'onclick'
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_mixEventsAndActions", lang.hitch(this, this._mixEventsAndActionsShowOnEvt));
			aspect.before(this, "_defineSubscriptions", lang.hitch(this, this._defineShowOnEvtSubscriptions));
		},

		_mixEventsAndActionsShowOnEvt: function () {

			lang.mixin(this.actions, this.showOnEvtActions);
			delete this.showOnEvtActions;
		},

		_defineShowOnEvtSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("ADD_EVT"),
				callback: "_subAddEvt"
			},{
				channel : this.getChannel("DELETE_EVT"),
				callback: "_subDeleteEvt"
			},{
				channel : this.getChannel("CLEAN_EVTS"),
				callback: "_subCleanEvts"
			});
		},

		_subAddEvt: function(res) {

			var event = res.event || this.eventDefault,
				sourceNode = res.sourceNode,
				showNode = res.showNode || sourceNode,
				initAction = res.initAction || 'show';

			this._deleteEvt(res);

			this._eventsAdded[event] = {
				sourceNode: sourceNode,
				showNode: showNode
			};

			var callback = initAction === 'show' ? this._onShowEvent : this._onHideEvent;

			sourceNode[event] = lang.hitch(this, callback, event);
		},

		_onShowEvent: function(event) {

			var obj = this._eventsAdded[event];

			this._publish(this.getChannel("SHOW"), {
				node: obj.showNode
			});

			obj.sourceNode[event] = lang.hitch(this, this._onHideEvent, event);
		},

		_onHideEvent: function(event) {

			var obj = this._eventsAdded[event];

			this._publish(this.getChannel("HIDE"));

			obj.sourceNode[event] = lang.hitch(this, this._onShowEvent, event);
		},

		_subDeleteEvt: function(res) {

			this._deleteEvt(res);
		},

		_deleteEvt: function(res) {

			var event = res.event || this.eventDefault,
				obj;

			if (this._eventsAdded[event]) {
				obj = this._eventsAdded[event];
				obj.sourceNode[event] = null;
				delete this._eventsAdded[event];
			}
		},

		_onModuleHide: function() {

			this.inherited(arguments);

			for (var event in this._eventsAdded) {
				this._eventsAdded[event].sourceNode[event] = lang.hitch(this, this._onShowEvent, event);
			}
		},

		_subCleanEvts: function() {

			this._cleanEvts();
		},

		_cleanEvts: function() {

			for (var event in this._eventsAdded) {
				this._deleteEvt({
					event: event
				});
			}
		}
	});
});
