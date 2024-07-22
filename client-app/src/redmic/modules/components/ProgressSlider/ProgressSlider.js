define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Show"
	, "RWidgets/ProgressSlider"
	, "RWidgets/extensions/_ShowValue"
], function(
	declare
	, lang
	, _Module
	, _Show
	, ProgressSlider
	, _ShowValue
){
	return declare([_Module, _Show], {
		//	summary:
		//
		//	description:
		//

		//	config: Object
		//		Opciones por defecto.

		constructor: function(args) {

			this.config = {
				props: {},
				events: {
					SET_VALUE: "setValue",
					SET_MIN: "setMin",
					SET_MAX: "setMax",
					SET_TIMEOUT: "setTimeout",
					HIDE_VALUE: "hideValue",
					SHOW_VALUE: "showValue",
					CHANGE_VALUE: "changeValue",
					NEXT: "next",
					PREV: "prev",
					PAUSE: "pause",
					PLAY: "play",
					STOP: "stop",
					SET_DELTA: "setDelta"
				},
				actions: {
					CHANGE_VALUE: "changeValue",
					SET_VALUE: "setValue",
					SET_MIN: "setMin",
					SET_MAX: "setMax",
					HIDE_VALUE: "hideValue",
					SHOW_VALUE: "showValue",
					SET_TIMEOUT: "setTimeout",
					BUTTON_ACTION: "btnAction",
					SET_DELTA: "setDelta"
				},
				ownChannel: "progressSlider"
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			this.progressSlider = new declare(ProgressSlider).extend(_ShowValue)(this.props);
		},

		_doEvtFacade: function() {

			this.progressSlider.on(this.progressSlider.events.CHANGE_VALUE, lang.hitch(this, this._groupEventArgs, 'CHANGE_VALUE'));
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("SET_VALUE"),
				callback: "_subSetValue"
			},{
				channel : this.getChannel("SET_MIN"),
				callback: "_subSetMin"
			},{
				channel : this.getChannel("SET_MAX"),
				callback: "_subSetMax"
			},{
				channel : this.getChannel("HIDE_VALUE"),
				callback: "_subHideValue"
			},{
				channel : this.getChannel("SHOW_VALUE"),
				callback: "_subShowValue"
			},{
				channel : this.getChannel("SET_TIMEOUT"),
				callback: "_subSetTimeout"
			},{
				channel : this.getChannel("BUTTON_ACTION"),
				callback: "_subButtonAction"
			},{
				channel : this.getChannel("SET_DELTA"),
				callback: "_subSetDelta"
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'CHANGE_VALUE',
				channel: this.getChannel("CHANGE_VALUE")
			});
		},

		_subSetValue: function(req) {

			this.progressSlider.emit(this.events.SET_VALUE, req.value);
		},

		_subSetMin: function(req) {

			this.progressSlider.emit(this.events.SET_MIN, req.value, req.reset);
		},

		_subSetMax: function(req) {

			this.progressSlider.emit(this.events.SET_MAX, req.value);
		},

		_subHideValue: function() {

			this.progressSlider.emit(this.events.HIDE_VALUE);
		},

		_subShowValue: function() {

			this.progressSlider.emit(this.events.SHOW_VALUE);
		},

		_subSetTimeout: function(req) {

			this.progressSlider.emit(this.events.SET_TIMEOUT, req.value);
		},

		_subButtonAction: function(req) {

			if (this.events[req.key])
				this.progressSlider.emit(this.events[req.key]);
		},

		_subSetDelta: function(req) {

			this.progressSlider.emit(this.events.SET_DELTA, req.value);
		},

		_getNodeToShow: function() {

			return this.progressSlider.domNode;
		}
	});
});