define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'leaflet'
], function(
	declare
	, lang
	, L
) {

	return declare(null, {
		//	summary:
		//		Extensión de WmsLayerImpl para gestionar las peticiones de información mediante getFeatureInfo.

		constructor: function(args) {

			this.config = {
				getFeatureInfoService: 'WMS',
				getFeatureInfoVersion: '1.1.1',
				getFeatureInfoRequest: 'GetFeatureInfo',
				getFeatureInfoSrs: 'EPSG:4326',
				getFeatureInfoFormat: 'application/json',
				getFeatureInfoMaxCount: 100,
				getFeatureInfoBuffer: 5
			};

			lang.mixin(this, this.config, args);
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

		_processLayerInfo: function(data) {

			this._emitEvt('LAYER_INFO', {
				layerId: this.layerId,
				layerLabel: this.layerLabel,
				info: data
			});
		},

		_obtainLayerInfoTarget: function(data) {

			var protocol = this.innerLayerDefinition.protocol,
				mustUseAlternativeDefinition = protocol === 'WMTS' || protocol === 'TMS' || protocol === 'WMS-C';

			if (mustUseAlternativeDefinition) {
				return this._obtainLayerAlternativeDefinitionTarget(data);
			}

			return this._obtainLayerMainDefinitionTarget(data);
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

		_obtainLayerMainDefinitionTarget: function(data) {

			return this._chkUrlAndAddParams(this._obtainMainGetUrl(), this._obtainMainGetParams(data));
		},

		_obtainLayerAlternativeDefinitionTarget: function(data) {

			var alternativeDefinitions = this.innerLayerDefinition.alternativeDefinitions,
				alternativeDefinition;

			for (var i = 0; i < alternativeDefinitions.length; i++) {
				var altDef = alternativeDefinitions[i];
				if (altDef.protocol === 'WMS') {
					alternativeDefinition = altDef;
					break;
				}
			}

			if (!alternativeDefinition) {
				console.error('Alternative protocol not found for GetFeatureInfo at layer:', this.innerLayerDefinition);
				return;
			}

			return this._chkUrlAndAddParams(this._obtainAltGetUrl(alternativeDefinition),
				this._obtainAltGetParams(alternativeDefinition, data));
		},

		_obtainCommonGetParams: function() {

			return {
				service: this.getFeatureInfoService,
				version: this.getFeatureInfoVersion,
				request: this.getFeatureInfoRequest,
				srs: this.getFeatureInfoSrs,
				info_format: this.getFeatureInfoFormat,
				feature_count: this.getFeatureInfoMaxCount,
				buffer: this.getFeatureInfoBuffer
			};
		},

		_obtainPositionGetParams: function(position, version) {

			var params = {},
				lngParam, latParam;

			if (version === '1.3.0') {
				lngParam = 'i';
				latParam = 'j';
			} else {
				lngParam = 'x';
				latParam = 'y';
			}

			params[lngParam] = parseInt(position.x, 10);
			params[latParam] = parseInt(position.y, 10);

			return params;
		},

		_obtainAltGetUrl: function(altDef) {

			return altDef.url + '?';
		},

		_obtainAltGetParams: function(altDef, data) {

			var commonGetParams = this._obtainCommonGetParams(),
				dimensionParams = this._obtainDimensionParams(data),
				positionParams = this._obtainPositionGetParams(data.containerPoint, commonGetParams.version),
				sizeParams = {
					width: data.size.x,
					height: data.size.y,
					bbox: data.bbox.toBBoxString()
				},
				layerProps = altDef.props,
				layerName = layerProps.layers,
				layerStyles = layerProps.styles || '';

			var getParams = this._merge([commonGetParams, dimensionParams, positionParams, sizeParams, {
				layers: layerName,
				query_layers: layerName,
				styles: layerStyles
			}]);

			return L.Util.getParamString(getParams);
		},

		_obtainMainGetUrl: function() {

			var innerLayer = this._getInnerLayerInstance();

			return innerLayer._wmsUrl + '?';
		},

		_obtainMainGetParams: function(data) {

			var commonGetParams = this._obtainCommonGetParams(),
				dimensionParams = this._obtainDimensionParams(data),
				serviceVersion = commonGetParams.version,
				layerName = this._getLayerWmsParams().layers,
				positionParams, sizeParams;

			var isTiled = this.innerLayerDefinition.protocol === 'WMS-C';
			if (!isTiled) {
				var containerPosParams = this._obtainPositionGetParams(data.containerPoint, serviceVersion);

				positionParams = containerPosParams;

				sizeParams = {
					width: data.size.x,
					height: data.size.y,
					bbox: data.bbox.toBBoxString()
				};
			} else {
				var tile = this._getClickedTile(data.latLng, data.zoom),
					tileSize = this.layer.getTileSize(),
					tilePoint = this._getClickedTilePoint(data.containerPoint, tile),
					tilePosParams = this._obtainPositionGetParams(tilePoint, serviceVersion);

				// TODO falla el punto
				positionParams = tilePosParams;

				sizeParams = {
					width: tileSize.x,
					height: tileSize.y,
					bbox: this._getTileBbox(tile)
				};
			}

			var getParams = this._merge([commonGetParams, dimensionParams, positionParams, sizeParams, {
				layers: layerName,
				query_layers: layerName,
				styles: this._getLayerWmsParams().styles
			}]);

			return L.Util.getParamString(getParams);
		},

		_getInnerLayerInstance: function() {

			var innerLayer;
			if (this.layer.getBaseLayer) {
				innerLayer = this.layer.getBaseLayer();
			} else {
				innerLayer = this.layer;
			}
			return innerLayer;
		},

		_getLayerWmsParams: function() {

			var innerLayer = this._getInnerLayerInstance();

			return innerLayer.wmsParams || {};
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
		}
	});
});
