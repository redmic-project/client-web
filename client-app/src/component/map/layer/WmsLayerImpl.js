define([
	'dojo/_base/declare'
	, 'dojo/Deferred'
	, 'src/component/map/_StaticLayersManagement'
	, 'src/component/map/layer/_LayerDimensions'
	, 'src/component/map/layer/_LayerFeatureInfo'
	, 'src/component/map/layer/MapLayer'
	, 'templates/ServiceOGCImage'
], function(
	declare
	, Deferred
	, _StaticLayersManagement
	, _LayerDimensions
	, _LayerFeatureInfo
	, MapLayer
	, ServiceOGCImage
) {

	return declare([MapLayer, _StaticLayersManagement, _LayerFeatureInfo, _LayerDimensions], {
		//	summary:
		//		Implementación de capa provista por servicio externo.
		//	description:
		//		Proporciona la fachada para trabajar con capas servidas mediante protocolos WMS, WMS-C, WMTS y TMS.

		postMixInProperties: function() {

			this.inherited(arguments);

			const defaultConfig = {
				ownChannel: 'wmsLayer',
				refresh: 0
			};

			this._mergeOwnAttributes(defaultConfig);
		},

		_initialize: function() {

			this.inherited(arguments);

			if (!this.innerLayerDefinition) {
				return;
			}

			this._setInnerLayer();
		},

		postCreate: function() {

			this.inherited(arguments);

			this._getStaticLayersDefinition();
		},

		_setInnerLayer: function() {

			if (!this.deferredLayer) {
				this.deferredLayer = new Deferred();
			}

			if (typeof this.innerLayerDefinition === 'string') {
				const layerDefinition = this._getStaticLayerDefinition(this.innerLayerDefinition);
				if (layerDefinition?.then) {
					layerDefinition.then(() => this._setInnerLayer());
					return;
				} else {
					this.innerLayerDefinition = layerDefinition;
				}
			}

			const layerInstance = this._getLayerInstance(this.innerLayerDefinition);
			if (layerInstance?.then) {
				layerInstance.then(() => this._setInnerLayerInstance());
			} else {
				this._setInnerLayerInstance(layerInstance);
			}
		},

		_setInnerLayerInstance: function(layerInstance) {

			this.layer = layerInstance;

			this.deferredLayer.resolve(this.layer);
		},

		_afterLayerAdded: function(data) {

			this.inherited(arguments);

			this._setRefreshInterval();
		},

		_afterLayerRemoved: function() {

			this._stopRefreshInterval();
		},

		_setRefreshInterval: function() {

			if (this._checkRefreshIsValid() && !this._refreshIntervalHandler) {
				const timeout = this.refresh * 1000;

				this._refreshIntervalHandler = setInterval(() => this._redraw, timeout);
			}
		},

		_checkRefreshIsValid: function() {

			return this.refresh && Number.isInteger(this.refresh);
		},

		_redraw: function() {

			this.inherited(arguments);

			if (!this.layer) {
				return;
			}

			this.layer.setParams({
				timestamp: Date.now()
			});
		},

		_stopRefreshInterval: function() {

			if (!this._refreshIntervalHandler) {
				return;
			}

			clearInterval(this._refreshIntervalHandler);
			delete this._refreshIntervalHandler;
		},

		_getLayerLegend: function(atlasItem) {

			const legendElement = ServiceOGCImage({
				data: atlasItem
			});

			this._emitEvt('LAYER_LEGEND', this._getLayerLegendToPublish(legendElement));
		},

		_chkLayerIsMe: function(response) {

			const layerAddedId = response.layer._leaflet_id;

			return layerAddedId === this.layerId;
		},

		_onMapShown: function(response) {

			this._setRefreshInterval();
		},

		_onMapHidden: function(response) {

			this._stopRefreshInterval();
		}
	});
});
