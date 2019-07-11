define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "dojo/has"
], function(
	declare
	, lang
	, aspect
	, has
) {

	return declare(null, {
		//	summary:
		//		Permite a los módulos escuchar las redimensiones del contexto global.

		listenWindowResizeEvents: {
			WINDOW_RESIZE: "windowResize"
		},

		constructor: function(args) {

			aspect.after(this, "_mixEventsAndActions", lang.hitch(this, this._mixListenWindowResizeEventsAndActions));
			aspect.after(this, "_doEvtFacade", lang.hitch(this, this._doListenWindowResizeEvtFacade));
			aspect.after(this, "_setOwnCallbacksForEvents", lang.hitch(this,
				this._setListenWindowResizeOwnCallbacksForEvents));
		},

		_mixListenWindowResizeEventsAndActions: function () {

			lang.mixin(this.events, this.listenWindowResizeEvents);
			delete this.listenWindowResizeEvents;
		},

		_doListenWindowResizeEvtFacade: function() {

			this._getGlobalContext().onresize = lang.hitch(this, this._groupEventArgs, 'WINDOW_RESIZE');
		},

		_setListenWindowResizeOwnCallbacksForEvents: function () {

			this._onEvt('WINDOW_RESIZE', lang.hitch(this, this._onWindowResize));
		},

		_onWindowResize: function(evt) {

			this._prepareResize(evt);
		},

		_getGlobalContext: function() {

			if (has('host-browser')) {
				return window;
			} else if (has('host-node')) {
				return global;
			} else {
				console.error('Environment not supported');
			}
		}
	});
});
