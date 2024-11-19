define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/atlas/_AtlasDimensionsManagement'
	, 'src/component/atlas/_AtlasLayersManagement'
	, 'src/redmicConfig'
], function(
	declare
	, lang
	, _AtlasDimensionsManagement
	, _AtlasLayersManagement
	, redmicConfig
) {

	return declare([_AtlasDimensionsManagement, _AtlasLayersManagement], {
		//	summary:
		//		Extensión para el manejo de los datos de servicios OGC vinculados a actividades, permitiendo generar
		//		capas para el mapa y su control.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.atlasLayer,
				defaultLayerItemState: false
			};

			lang.mixin(this, this.config, args);
		},

		_onActivityLayersData: function(res) {

			var layersData = this._getDataToAddToBrowser(res);

			this._emitEvt('INJECT_DATA', {
				data: layersData,
				target: this._activityLayersTarget
			});
		},

		_getDataToAddToBrowser: function(res) {

			var atlasItems = res.data.data;

			return atlasItems.map(lang.hitch(this, this._getAtlasLayerItemToInject));
		}
	});
});
