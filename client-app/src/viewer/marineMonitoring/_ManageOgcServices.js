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

		postMixInProperties: function() {

			this.inherited(arguments);

			const defaultConfig = {
				target: redmicConfig.services.atlasLayer,
				_localLayersTarget: 'ogcServicesLayerDataLocalTarget',
				defaultLayerItemState: false
			};

			this._mergeOwnAttributes(defaultConfig);
		},

		_setConfigurations: function() {

			this.inherited(arguments);

			this.mergeComponentAttribute('atlasConfig', {
				localTarget: this._localLayersTarget
			});
		},

		_initialize: function() {

			this.inherited(arguments);

			const mapInstance = this.getComponentInstance('map');
			this.getMapChannel = mapInstance ? lang.hitch(mapInstance, mapInstance.getChannel) : null;
		},

		_requestLayersDataFilteredByActivityIds: function(activities) {

			this._emitEvt('REQUEST', {
				target: this.target,
				action: '_search',
				method: 'POST',
				params: {
					query: {
						terms: {activities}
					}
				},
				requesterId: this.getChannel()
			});
		},

		_dataAvailable: function(res, resWrapper) {

			this.inherited(arguments);

			if (!resWrapper?.req?.params?.query?.terms?.activities) {
				return;
			}

			this._onActivityLayersData(res);
		},

		_onActivityLayersData: function(res) {

			var layersData = this._getDataToAddToBrowser(res);

			this._emitEvt('INJECT_DATA', {
				data: layersData,
				target: this._localLayersTarget
			});
		},

		_getDataToAddToBrowser: function(res) {

			var atlasItems = res.data.data;

			return atlasItems.map(lang.hitch(this, this._getAtlasLayerItemToInject));
		},

		_getAtlasLayerItemToInject: function(atlasItem) {

			const inheritedAtlasItem = this.inherited(arguments),
				providedByView = true;

			return this._merge([inheritedAtlasItem, {providedByView}]);
		}
	});
});
