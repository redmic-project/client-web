define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
], function(
	declare
	, lang
	, aspect
) {

	return declare(null, {
		//	summary:
		//		Permite a los módulos escuchar las redimensiones del contexto global.

		listenWindowResizeEvents: {
			WINDOW_RESIZE: 'windowResize'
		},

		windowResizeTimeout: 500,
		lowWidthValue: 840,


		constructor: function(args) {

			this._evaluateCurrentWindowSize();

			aspect.after(this, '_mixEventsAndActions', lang.hitch(this, this._mixListenWindowResizeEventsAndActions));
			aspect.after(this, '_doEvtFacade', lang.hitch(this, this._doListenWindowResizeEvtFacade));
			aspect.after(this, '_setOwnCallbacksForEvents', lang.hitch(this,
				this._setListenWindowResizeOwnCallbacksForEvents));
		},

		_mixListenWindowResizeEventsAndActions: function() {

			lang.mixin(this.events, this.listenWindowResizeEvents);
			delete this.listenWindowResizeEvents;
		},

		_doListenWindowResizeEvtFacade: function() {

			var resizeMethod = lang.hitch(this, this._groupEventArgs, 'WINDOW_RESIZE');

			if (!globalThis.onresize) {
				globalThis.onresize = resizeMethod;
			} else {
				aspect.after(globalThis, 'onresize', resizeMethod);
			}
		},

		_setListenWindowResizeOwnCallbacksForEvents: function() {

			this._onEvt('WINDOW_RESIZE', lang.hitch(this, this._prepareResizeAfterWindowResize));
		},

		_prepareResizeAfterWindowResize: function(evt) {

			clearTimeout(this._windowResizeHandler);

			this._windowResizeHandler = setTimeout(lang.hitch(this, this._doResizeAfterWindowResize, evt),
				this.windowResizeTimeout);
		},

		_doResizeAfterWindowResize: function(evt) {

			this._evaluateCurrentWindowSize();

			this._resizeWrapper();
		},

		_evaluateCurrentWindowSize: function() {

			this._setLowWidth(globalThis.innerWidth < this.lowWidthValue);
		},

		_getLowWidth: function() {

			return this.statusFlags.lowWidth;
		},

		_setLowWidth: function(value) {

			this.statusFlags.lowWidth = value;
		}
	});
});
