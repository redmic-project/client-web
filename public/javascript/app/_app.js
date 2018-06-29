define([
	'redmic/modules/base/_Module'
	, 'redmic/modules/base/_Show'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/has'
	, './_appItfc'
], function(
	_Module
	, _Show
	, declare
	, lang
	, has
	, _appItfc
){
	return declare([_Module, _Show, _appItfc], {
		//	Summary:
		//		Módulo App para gestionar la aplicación
		//
		//	Description:
		//		Recibe módulos desde Router, pertenecientes a la parte externa o interna, para mostrar en pantalla

		constructor: function(args) {

			this.config = {
				ownChannel: 'app',
				events: {
					WINDOW_RESIZE: 'windowResize',
					MODULE_SHOWN: 'moduleShown'
				},
				actions: {
					SHOW_MODULE: 'showModule',
					MODULE_SHOWN: 'moduleShown',
					WINDOW_RESIZE: 'windowResize'
				}
			};

			lang.mixin(this, this.config, args);
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel: this.getChannel('SHOW_MODULE'),
				callback: '_subShowModule'
			},{
				channel: this.getChannel('RESIZE_VIEW'),
				callback: '_subResizeView'
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'MODULE_SHOWN',
				channel: this.getChannel('MODULE_SHOWN')
			},{
				event: 'WINDOW_RESIZE',
				channel: this.getChannel('WINDOW_RESIZE')
			});
		},

		_doEvtFacade: function() {

			this._getGlobalContext().onresize = lang.hitch(this, this._groupEventArgs, 'WINDOW_RESIZE');
		},

		_setOwnCallbacksForEvents: function() {

			this._onceEvt('SHOW', lang.hitch(this, this._onFirstShow));
		},

		_onFirstShow: function() {

			this.startup();
		},

		_getGlobalContext: function() {

			if (has('host-browser')) {
				return window;
			} else if (has('host-node')) {
				return global;
			} else {
				console.error('Environment not supported');
			}
		},

		_subResizeView: function(req) {

			this._doResize();
		},

		_subShowModule: function(req) {

			var moduleKey = req.moduleKey,
				moduleInstance = req.moduleInstance;

			this._once(moduleInstance.getChannel('SHOWN'), lang.hitch(this, this._onModuleShown, moduleKey));

			this._publish(moduleInstance.getChannel('SHOW'), {
				node: this._getNode(),
				metaTags: true
			});
		},

		_onModuleShown: function(moduleKey, res) {

			this._doResize();

			this._emitEvt('MODULE_SHOWN', {
				key: moduleKey
			});
		},

		_getNodeToShow: function() {

			return this.domNode;
		}
	});
});
