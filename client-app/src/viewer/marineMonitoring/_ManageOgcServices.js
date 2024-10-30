define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/atlas/_AtlasLayersManagement'
	, 'src/redmicConfig'
], function(
	declare
	, lang
	, _AtlasLayersManagement
	, redmicConfig
) {

	return declare(_AtlasLayersManagement, {
		//	summary:
		//		Extensión para el manejo de los datos de servicios OGC vinculados a actividades, permitiendo generar
		//		capas para el mapa y su control.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.atlasLayer
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

			var items = res.data.data;

			return items.map(lang.hitch(this, function(item) {

				var itemId = this._getAtlasLayerId(item),
					layerDefinition = this._getAtlasLayerDefinition(),
					layerConfiguration = this._getAtlasLayerConfiguration(item),
					layerLabel = layerConfiguration.layerLabel;

				layerConfiguration.mapChannel = this.map.getChannel();

				return {
					id: itemId,
					label: layerLabel,
					originalItem: item,
					layer: {
						definition: layerDefinition,
						props: layerConfiguration
					}
				};
			}));
		}
	});
});
