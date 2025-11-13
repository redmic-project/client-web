define([
	'dojo/_base/declare'
	, 'src/app/component/layout/_LayoutItfc'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
], function(
	declare
	, _LayoutItfc
	, _Module
	, _Show
) {

	return declare([_Module, _Show, _LayoutItfc], {
		//	Summary:
		//		Componente de layout para estructurar la aplicación, tanto a nivel interno como externo.
		//	Description:
		//		Recibe órdenes para mostrar en pantalla los diferentes módulos de la aplicación.

		postMixInProperties: function() {

			const defaultConfig = {
				events: {
					MODULE_SHOWN: 'moduleShown'
				},
				actions: {
					SHOW_MODULE: 'showModule',
					MODULE_SHOWN: 'moduleShown'
				}
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
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

			this._onEvt('HIDE', () => this._onAppHide());
		},

		_subShowModule: function(req) {

			const moduleKey = req.moduleKey,
				moduleInstance = req.moduleInstance;

			this._once(moduleInstance.getChannel('SHOWN'), () => this._onModuleShown(moduleKey));

			this._publish(moduleInstance.getChannel('SHOW'), {
				node: this._getContentNode(),
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
