define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/map/layer/_LayerDimensions'
	, 'src/component/map/layer/_LayerFeatureInfo'
	, 'src/component/map/layer/_LayerProtocols'
	, 'src/component/map/layer/MapLayer'
	, 'src/component/map/StaticLayersDefinition'
	, 'templates/ServiceOGCImage'
], function(
	declare
	, lang
	, _LayerDimensions
	, _LayerFeatureInfo
	, _LayerProtocols
	, MapLayer
	, StaticLayersDefinition
	, ServiceOGCImage
) {

	return declare([MapLayer, _LayerProtocols, _LayerFeatureInfo, _LayerDimensions], {
		//	summary:
		//		Implementación de capa provista por servicio externo.
		//	description:
		//		Proporciona la fachada para trabajar con capas servidas mediante protocolos WMS, WMS-C, WMTS y TMS.

		constructor: function(args) {

			this.config = {
				ownChannel: 'wmsLayer',
				innerLayerDefinition: null,
				refresh: 0
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			if (!this.innerLayerDefinition) {
				return;
			}

			if (typeof this.innerLayerDefinition === 'string') {
				this.innerLayerDefinition = StaticLayersDefinition[this.innerLayerDefinition];
			}

			this.layer = this._getLayerInstance(this.innerLayerDefinition);
		},

		_afterLayerAdded: function(data) {

			this._setRefreshInterval();
		},

		_afterLayerRemoved: function() {

			this._stopRefreshInterval();
		},

		_setRefreshInterval: function() {

			if (this._checkRefreshIsValid() && !this._refreshIntervalHandler) {
				var cbk = lang.hitch(this, this._redraw),
					timeout = this.refresh * 1000;

				this._refreshIntervalHandler = setInterval(cbk, timeout);
			}
		},

		_checkRefreshIsValid: function() {

			return this.refresh && Number.isInteger(this.refresh);
		},

		_redraw: function() {

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

			var legendElement = ServiceOGCImage({
				data: atlasItem
			});

			this._emitEvt('LAYER_LEGEND', this._getLayerLegendToPublish(legendElement));
		},

		_chkLayerIsMe: function(response) {

			var layerAddedId = response.layer._leaflet_id;

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
