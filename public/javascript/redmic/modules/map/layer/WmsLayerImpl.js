define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'leaflet/leaflet'
	, 'redmic/modules/map/StaticLayersDefinition'
	, './_LayerProtocols'
	, './MapLayer'
], function(
	declare
	, lang
	, L
	, StaticLayersDefinition
	, _LayerProtocols
	, MapLayer
) {

	return declare([MapLayer, _LayerProtocols], {
		//	summary:
		//		Implementación de capa provista por servicio externo.
		//	description:
		//		Proporciona la fachada para trabajar con capas servidas mediante protocolos WMS, WMS-C, WMTS y TMS.

		constructor: function(args) {

			this.config = {
				ownChannel: 'wmsLayer',
				layerDefinition: null,
				refresh: 0
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			if (!this.layerDefinition) {
				return;
			}

			if (typeof this.layerDefinition === 'string') {
				this.layerDefinition = StaticLayersDefinition[this.layerDefinition];
			}

			this.layer = this._getLayerInstance(this.layerDefinition);
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

			this.infoTarget = this._obtainLayerInfoTarget(obj);

			this._emitEvt('GET', {
				target: this.infoTarget,
				requesterId: this.getOwnChannel(),
				headers: {
					'X-Requested-With': ''
				}
			});
		},

		_obtainLayerInfoTarget: function(data) {

			var protocol = this.layerDefinition.protocol,
				mustUseAlternativeDefinition = protocol === 'WMTS' || protocol === 'TMS' || protocol === 'WMS-C';

			if (mustUseAlternativeDefinition) {
				return this._obtainLayerAlternativeDefinitionTarget(data);
			}

			return this._obtainLayerMainDefinitionTarget(data);
		},

		_obtainLayerMainDefinitionTarget: function(data) {

			return this._chkUrlAndAddParams(this._obtainMainGetUrl(), this._obtainMainGetParams(data));
		},

		_obtainLayerAlternativeDefinitionTarget: function(data) {

			var alternativeDefinitions = this.layerDefinition.alternativeDefinitions,
				alternativeDefinition;

			for (var i = 0; i < alternativeDefinitions.length; i++) {
				var altDef = alternativeDefinitions[i];
				if (altDef.protocol === 'WMS') {
					alternativeDefinition = altDef;
					break;
				}
			}

			if (!alternativeDefinition) {
				console.error('Alternative protocol not found for GetFeatureInfo at layer:', this.layerDefinition);
				return;
			}

			return this._chkUrlAndAddParams(this._obtainAltGetUrl(alternativeDefinition),
				this._obtainAltGetParams(alternativeDefinition, data));
		},

		_obtainAltGetUrl: function(altDef) {

			// TODO
			return altDef.url + '?';
		},

		_obtainAltGetParams: function(altDef, data) {

			// TODO
			var layerProtocol = altDef.protocol,
				layerProps = altDef.props,
				layerName = layerProps.layers,
				layerFormat = layerProps.format,
				layerTransparent = layerProps.transparent;

			return L.Util.getParamString({
				request: 'GetFeatureInfo',
				srs: 'EPSG:4326',
				info_format: 'application/json',
				service: layerProtocol,
				version: '1.1.1',
				layers: layerName,
				query_layers: layerName,
				//styles: this.layer.wmsParams.styles,
				format: layerFormat,
				transparent: layerTransparent,
				feature_count: 100,

				width: data.size.x,
				height: data.size.y,
				bbox: data.bbox.toBBoxString(),
				x: parseInt(data.containerPoint.x, 10),
				y: parseInt(data.containerPoint.y, 10)
			});
		},

		_obtainMainGetUrl: function() {

			return this.layer._url + '?';
		},

		_obtainMainGetParams: function(data) {

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
				feature_count: 100
			};

			var lngParam, latParam;
			if (params.version === '1.3.0') {
				lngParam = 'i';
				latParam = 'j';
			} else {
				lngParam = 'x';
				latParam = 'y';
			}

			var isTiled = this.layerDefinition.protocol === 'WMS-C';
			if (!isTiled) {
				params.width = data.size.x;
				params.height = data.size.y;
				params.bbox = data.bbox.toBBoxString();
				params[lngParam] = parseInt(data.containerPoint.x, 10);
				params[latParam] = parseInt(data.containerPoint.y, 10);
			} else {
				var tile = this._getClickedTile(data.latLng, data.zoom),
					tileSize = this.layer.getTileSize(),
					tilePoint = this._getClickedTilePoint(data.containerPoint, tile);

				params.width = tileSize.x;
				params.height = tileSize.y;
				params.bbox = this._getTileBbox(tile);
				// TODO falla el punto
				params[lngParam] = parseInt(tilePoint.x, 10);
				params[latParam] = parseInt(tilePoint.y, 10);
			}

			return L.Util.getParamString(params);
		},

		_getClickedTile: function(clickLatLng, currZoom) {

			var clickedTileKey = this._getTileKey(clickLatLng, currZoom);

			return this.layer._tiles[clickedTileKey];
		},

		_getTileKey: function(clickLatLng, currZoom) {

			var tileSize = this.layer.getTileSize(),
				pixelPoint = this.layer._map.project(clickLatLng, currZoom).floor(),
				coords = pixelPoint.unscaleBy(tileSize).floor();

			return coords.x + ':' + coords.y + ':' + currZoom;
		},

		_getClickedTilePoint: function(containerPoint, tile) {
			// TODO no funciona, va bien en zoom alejado solamente

			var tilePosition = tile.el._leaflet_pos,
				tileOffsetX = containerPoint.x - tilePosition.x,
				tileOffsetY = containerPoint.y - tilePosition.y;

			return { x: tileOffsetX, y: tileOffsetY };
		},

		_getTileBbox: function(tile) {

			var tileSrc = tile.el.src,
				bboxExpr = /.+bbox=([-.,\d]+).*/gi,
				exprMatches = new RegExp(bboxExpr).exec(tileSrc);

			return exprMatches[1];
		},

		_chkLayerIsMe: function(response) {

			var layerAddedId = response.layer._leaflet_id;

			return layerAddedId === this.layerId;
		},

		_processLayerInfo: function(data) {

			this._emitEvt('LAYER_INFO', {
				layerId: this.layerId,
				layerLabel: this.layerLabel,
				info: data
			});
		},

		_onMapShown: function(response) {

			this._setRefreshInterval();
		},

		_onMapHidden: function(response) {

			this._stopRefreshInterval();
		}
	});
});
