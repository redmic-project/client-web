define([
	'redmic/modules/base/_Module'
	, 'redmic/modules/base/_Show'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, './_appItfc'
], function(
	_Module
	, _Show
	, declare
	, lang
	, _appItfc
) {

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
					MODULE_SHOWN: 'moduleShown'
				},
				actions: {
					SHOW_MODULE: 'showModule',
					MODULE_SHOWN: 'moduleShown'
				}
			};

			lang.mixin(this, this.config, args);
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel: this.getChannel('SHOW_MODULE'),
				callback: '_subShowModule'
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'MODULE_SHOWN',
				channel: this.getChannel('MODULE_SHOWN')
			});
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('HIDE', lang.hitch(this, this._onAppHide));
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

		_onModuleShown: function(moduleKey) {

			this._emitEvt('MODULE_SHOWN', {
				key: moduleKey
			});
		}
	});
});
