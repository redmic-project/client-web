define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/base/_Module'
	, 'src/component/base/_SelectionManager'
	, 'src/component/base/_Show'
	, 'src/component/base/_Store'
	, 'src/component/map/layer/_PublishInfo'
	, 'src/component/mapLayer/GeoRasterLayerImpl'
	, 'src/design/map/_AddAtlasComponent'
	, 'src/design/map/_AddQueryOnMapComponent'
	, 'src/design/map/_MapDesignWithContentLayout'
	, 'src/redmicConfig'
], function(
	declare
	, lang
	, _Module
	, _SelectionManager
	, _Show
	, _Store
	, _PublishInfo
	, GeoRasterLayerImpl
	, _AddAtlasComponent
	, _AddQueryOnMapComponent
	, _MapDesignWithContentLayout
	, redmicConfig
) {

	return declare([_Module, _Show, _Store, _SelectionManager, _MapDesignWithContentLayout, _AddAtlasComponent,
		_AddQueryOnMapComponent], {
		// summary:
		//   Widget para mostrar un mapa con contenido ráster remoto.

		postMixInProperties: function() {

			this.inherited(arguments);

			const defaultConfig = {
				ownChannel: 'activityGeoRasterMap',
				_localLayersTarget: 'geoRasterMapLocalTarget'
			};

			this._mergeOwnAttributes(defaultConfig);
		},

		_setConfigurations: function() {

			this.inherited(arguments);

			this.mergeComponentAttribute('atlasConfig', {
				localTarget: this._localLayersTarget,
				addThemesBrowserFirst: true
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._addGeoRasterLayerItem();
		},

		_addGeoRasterLayerItem: function() {

			const parentChannel = this.getChannel(),
				mapChannel = this.getComponentInstance('map').getChannel(),
				sourceUrl = this.sourceUrl,
				label = this.sourceLabel ?? sourceUrl;

			const mapLayerId = this.getOwnChannel(),
				mapLayerDefinition = declare([GeoRasterLayerImpl, _PublishInfo]);

			const mapLayerConfig = {
				parentChannel,
				mapChannel,
				sourceUrl,
				layerLabel: label
			};

			const layerItem = {
				id: mapLayerId,
				label,
				state: true,
				providedByView: true,
				mapLayerId,
				mapLayerDefinition,
				mapLayerConfig
			};

			this._emitEvt('INJECT_ITEM', {
				target: this._localLayersTarget,
				data: layerItem
			});
		}
	});
});
