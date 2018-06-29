define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'redmic/modules/map/LayersManager'
], function(
	declare
	, lang
	, aspect
	, LayersManager
){
	return declare(null, {
		//	summary:
		//		Extensión de contenido de visor que añade gestor de capas de mapa.

		constructor: function(args) {

			this.config = {};

			lang.mixin(this, this.config, args);

			aspect.after(this, '_setConfigurations', lang.hitch(this, this._setLayerManagementTabConfigurations));
			aspect.before(this, '_initialize', lang.hitch(this, this._initializeLayerManagementTab));
		},

		_setLayerManagementTabConfigurations: function() {

			this.sidebarConfig = this._merge([{
				items: [{
					label: 'layers',
					icon: 'fr-layer'
				}]
			},this.sidebarConfig || {}]);

			this.layersManagerConfig = this._merge([{
				parentChannel: this.getChannel(),
				getMapChannel: this.getMapChannel,
				viewerConfigByActivityCategory: this.viewerConfigByActivityCategory
			}, this.layersManagerConfig || {}]);
		},

		_initializeLayerManagementTab: function() {

			this.layersManager = new LayersManager(this.layersManagerConfig);
		},

		_layersCallback: function() {

			return {
				instance: this.layersManager
			};
		}
	});
});
