define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/gateway/MapCenteringGatewayImpl'
	, 'src/component/map/layer/_AddFilter'
	, 'src/component/map/layer/_ListenBounds'
	, 'src/component/map/layer/_ListenZoom'
	, 'src/component/map/layer/_RadiusOnClick'
	, 'src/component/map/layer/GeoJsonLayerImpl'
	, 'src/component/map/layer/PruneClusterLayerImpl'
], function (
	declare
	, lang
	, MapCenteringGatewayImpl
	, _AddFilter
	, _ListenBounds
	, _ListenZoom
	, _RadiusOnClick
	, GeoJsonLayerImpl
	, PruneClusterLayerImpl
) {

	const mapLayerComponentDefinitions = {
		geojson: GeoJsonLayerImpl,
		cluster: PruneClusterLayerImpl
	};

	const mapLayerComponentExtensionDefinitions = {
		filter: _AddFilter,
		listenBounds: _ListenBounds,
		listenZoom: _ListenZoom,
		radius: _RadiusOnClick
	};

	return declare(null, {
		// summary:
		//   Lógica de diseño para añadir un componente MapLayer, junto con otros para comunicarlo y mostrar información
		//   en el mapa.
		//   Debe asociarse como mixin a un componente al instanciarlo, junto con la parte de controlador y alguna
		//   maquetación de este diseño.

		constructor: function(args) {

			const defaultConfig = {
				mapLayerDefinition: 'cluster',
				enabledMapLayerExtensions: {
					filter: false,
					listenBounds: false,
					listenZoom: false,
					radius: false
				},
				mapLayerPopupTemplate: null
			};

			lang.mixin(this, this._merge([this, defaultConfig, args]));
		},

		_setConfigurations: function() {

			this.inherited(arguments);

			const parentChannel = this.getChannel();

			this.mergeComponentAttribute('mapLayerConfig', {
				parentChannel,
				selectorChannel: parentChannel,
				idProperty: 'uuid',
				simpleSelection: true
			});

			if (this.mapLayerDefinition === 'cluster') {
				this.mergeComponentAttribute('mapLayerConfig', {
					categoryStyle: 'bubbles',
					getMarkerCategory: lang.hitch(this, this._getMarkerCategory),
					getPopupContent: lang.hitch(this, this._getPopupContent)
				});
			} else if (this.mapLayerDefinition === 'geojson') {
				this.mergeComponentAttribute('mapLayerConfig', {
					onEachFeature: lang.hitch(this, this._bindPopupToFeature)
				});
			}

			this.mergeComponentAttribute('mapCenteringConfig', {
				parentChannel
			});

			const mapLayerComponentBaseDefinition = mapLayerComponentDefinitions[this.mapLayerDefinition];

			this._MapLayerComponentDefinition = this.prepareComponentDefinition([mapLayerComponentBaseDefinition],
				this.enabledMapLayerExtensions, mapLayerComponentExtensionDefinitions);
		},

		createDesignControllerComponents: function() {

			let inheritedComponents = this.inherited(arguments);

			const mapLayer = this._createDesignMapLayerComponent(inheritedComponents.map),
				mapCentering = this._createDesignMapCenteringComponent();

			return lang.mixin(inheritedComponents, {mapLayer, mapCentering});
		},

		_createDesignMapLayerComponent: function(mapInstance) {

			const mapChannel = mapInstance.getChannel();

			this.mergeComponentAttribute('mapLayerConfig', {
				mapChannel
			});

			return new this._MapLayerComponentDefinition(this.mapLayerConfig);
		},

		_createDesignMapCenteringComponent: function() {

			return new MapCenteringGatewayImpl(this.mapCenteringConfig);
		},

		populateDesignLayoutNodes: function() {

			this.inherited(arguments);

			this._addMapLayerToMap();
			this._linkBrowserActionWithMapLayer();
		},

		_addMapLayerToMap: function() {

			const mapInstance = this.getComponentInstance('map'),
				mapLayerInstance = this.getComponentInstance('mapLayer');

			this._publish(mapInstance.getChannel('ADD_LAYER'), mapLayerInstance);
		},

		_linkBrowserActionWithMapLayer: function() {

			const mapCenteringInstance = this.getComponentInstance('mapCentering');

			const mapLayerInstance = this.getComponentInstance('mapLayer');

			const browserInstance = this.getComponentInstance('browser'),
				browserButtonEventActionChannel = browserInstance?.getChannel('BUTTON_EVENT');

			if (!browserButtonEventActionChannel) {
				return;
			}

			this._publish(mapCenteringInstance.getChannel('ADD_CHANNELS_DEFINITION'), {
				channelsDefinition: [{
					input: browserButtonEventActionChannel,
					output: mapLayerInstance.getChannel('SET_CENTER'),
					subMethod: 'setCenter'
				},{
					input: browserButtonEventActionChannel,
					output: mapLayerInstance.getChannel('ANIMATE_MARKER'),
					subMethod: 'animateMarker'
				}]
			});
		},

		_getMarkerCategory: function(feature) {

			return feature.properties?.infrastructureType?.id - 1 || 0;
		},

		_getPopupContent: function(data) {

			return this.mapLayerPopupTemplate?.({
				i18n: this.i18n,
				feature: data.feature
			});
		},

		_bindPopupToFeature: function(feature, layer) {

			layer.bindPopup(this.mapLayerPopupTemplate?.({
				feature: feature,
				i18n: this.i18n
			}));
		}
	});
});
