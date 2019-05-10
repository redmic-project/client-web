define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'leaflet/leaflet'
	, 'moment/moment.min'
	, './MapLayer'
], function(
	declare
	, lang
	, L
	, moment
	, MapLayer
){
	return declare(MapLayer, {
		//	summary:
		//		Implementación de capa WMS.
		//	description:
		//		Proporciona la fachada para trabajar con capas WMS.

		constructor: function(args) {

			this.config = {
				ownChannel: 'wmsLayer',
				refresh: 0
			};

			lang.mixin(this, this.config, args);
		},

		_afterLayerAdded: function(data) {

			this._setRefreshInterval();
		},

		_afterLayerRemoved: function() {

			this._stopRefreshInterval();
		},

		_setRefreshInterval: function() {

			// TODO eliminar excepción para capa AIS cuando se defina refresh en el servicio
			var isAisLayer = this.layer.wmsParams.layers.indexOf('last_position') !== -1;

			if ((this._checkRefreshIsValid() || isAisLayer) && !this._refreshIntervalHandler) {
				if (isAisLayer) {
					this.refresh = 15;
				}

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

		_getLayerLegend: function(layer) {

			// TODO cuando se defina leyenda en el servicio de atlas, consultar la imagen correspondiente
			if (0 && this.styleLayer) {
				this._emitEvt('LAYER_LEGEND',
					this._getLayerLegendToPublish(this._obtainLegendUrl(this.styleLayer.url)));
			}
		},

		_obtainLegendUrl: function(url) {

			var params = {
				legend_options: 'fontAntiAliasing:true;dpi:100'
			};

			return this._chkUrlAndAddParams(url, L.Util.getParamString(params));
		},

		_chkUrlAndAddParams: function(url, paramsStr) {

			var index = url.indexOf('?'),
				params = paramsStr;

			if (index >= 0) {
				params = '';

				if (index !== url.length - 1) {
					params += '&';
				}

				params += paramsStr.substr(1, paramsStr.length);
			}

			return url + params;
		},

		_requestLayerInfo: function(obj) {

			this.infoTarget = this._chkUrlAndAddParams(this.layer._url + '?', this._obtainGetParams(obj));

			this._emitEvt('GET', {
				target: this.infoTarget,
				requesterId: this.getOwnChannel(),
				id: '',
				options: {
					'X-Requested-With': ''
				}
			});
		},

		_processLayerInfo: function(data) {

			this._emitEvt('LAYER_INFO', {
				layerId: this.layerId,
				layerLabel: this.layerLabel,
				info: data
			});
		},

		_obtainGetParams: function(data) {

			var params = {
				request: 'GetFeatureInfo',
				srs: 'EPSG:4326',
				info_format: 'application/json',
				service: this.layer.wmsParams.service,
				version: this.layer.wmsParams.version,
				layers: this.layer.wmsParams.layers,
				query_layers: this.layer.wmsParams.layers,
				styles: this.layer.wmsParams.styles,
				format: this.layer.wmsParams.format,
				transparent: this.layer.wmsParams.transparent,
				feature_count: 100,
				width: data.size.x,
				height: data.size.y,
				bbox: data.bbox.toBBoxString()
			};
			params[params.version === '1.3.0' ? 'i' : 'x'] = parseInt(data.containerPoint.x, 10);
			params[params.version === '1.3.0' ? 'j' : 'y'] = parseInt(data.containerPoint.y, 10);

			return L.Util.getParamString(params);
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
