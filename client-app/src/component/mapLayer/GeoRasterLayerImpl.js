define([
	'dojo/_base/declare'
	, 'dojo/Deferred'
	, 'georaster'
	, 'leaflet-georaster'
	, 'src/component/map/layer/MapLayer'
], function(
	declare
	, Deferred
	, GeoRasterParser
	, GeoRasterLayer
	, MapLayer
) {

	return declare(MapLayer, {
		// summary:
		//   Implementación de capa para contenido compatible con GeoRaster, como ficheros COG remotos.

		postMixInProperties: function() {

			this.inherited(arguments);

			const defaultConfig = {
				ownChannel: 'geoRasterLayer',
				geoRasterParserOptions: {
					noDataValue: -1
				},
				geoRasterLayerOptions: {
					resolution: 128,
					debugLevel: 0
				}
			};

			this._mergeOwnAttributes(defaultConfig);
		},

		_initialize: function() {

			this.inherited(arguments);

			this.deferredLayer = new Deferred();

			GeoRasterParser(this.sourceUrl, this.geoRasterParserOptions)
				.then(geoRaster => this._parseGeoRasterCallback(geoRaster));
		},

		_parseGeoRasterCallback: function(geoRaster) {

			this.layer = this._createGeoRasterLayer(geoRaster);
			this.deferredLayer.resolve(this.layer);
		},

		_createGeoRasterLayer: function(georaster) {

			const pixelValuesToColorFn = this._rgbaColorCallback;

			return new GeoRasterLayer({
				...this.geoRasterLayerOptions,
				georaster,
				pixelValuesToColorFn
			});
		},

		_rgbaColorCallback: function(values) {

			const [r, g, b, a] = values;
			return `rgba(${r}, ${g}, ${b}, ${a ? 1 : 0})`;
		},

		_requestLayerInfo: function(res) {

			const geoRaster = this.layer?.georasters?.[0];
			if (!geoRaster) {
				this._emitLayerInfo();
				return;
			}

			const {pixelX, pixelY} = this._getPixelXY(res.latLng, geoRaster);
			if (!pixelX || !pixelY) {
				this._emitLayerInfo();
				return;
			}

			const left = pixelX,
				top = pixelY,
				right = pixelX + 1,
				bottom = pixelY + 1,
				width = 1,
				height = 1,
				resampleMethod = 'nearest';

			geoRaster.getValues({ left, top, right, bottom, width, height, resampleMethod })
				.then(values => this._processLayerInfo(values));
		},

		_getPixelXY: function(latLng, geoRaster) {
			// summary:
			//   Devuelve las coordenadas del píxel pulsado, a partir del latLng del mapa y del geoRaster de la capa.
			//   Si el punto pulsado está fuera de la capa, devuelve un objeto va.

			const { clickX, clickY } = this._getWebMercatorFromLatLng(latLng),
				{ xMin, xMax, yMin, yMax } = this._getGeoRasterLimits(geoRaster);

			// Posición relativa del punto con respecto al geoRaster, entre 0 y 1
			const relativeX = (clickX - xMin) / (xMax - xMin),
				relativeY = (yMax - clickY) / (yMax - yMin);

			if (relativeX < 0 || relativeX > 1 || relativeY < 0 || relativeY > 1) {
				return {};
			}

			const pixelX = Math.floor(relativeX * geoRaster.width),
				pixelY = Math.floor(relativeY * geoRaster.height);

			return { pixelX, pixelY };
		},

		_getWebMercatorFromLatLng: function(latLng) {
			// summary:
			//   Devuelve las coordenadas Web Mercator correspondientes al objeto latLng recibido.

			const metersPerDegree = 20037508.34,
				clickX = latLng.lng * metersPerDegree / 180,
				clickY = Math.log(Math.tan((90 + latLng.lat) * Math.PI / 360)) * metersPerDegree / Math.PI;

			return { clickX, clickY };
		},

		_getGeoRasterLimits: function(geoRaster) {
			// summary:
			//   Devuelve los límites del geoRaster recibido en coordenadas Web Mercator.

			return {
				xMin: geoRaster.xmin,
				xMax: geoRaster.xmax,
				yMin: geoRaster.ymin,
				yMax: geoRaster.ymax
			};
		},

		_processLayerInfo: function(data) {

			const [r, g, b, a] = data;

			const info = {
				type: 'FeatureCollection',
				features: [{
					type: 'Feature',
					properties: { r, g, b, a }
				}]
			};
			this._emitLayerInfo(info);
		},

		_emitLayerInfo: function(info) {

			const layerId = this.layerId,
				layerLabel = this.layerLabel;

			this._emitEvt('LAYER_INFO', {
				layerId,
				layerLabel,
				info
			});
		}
	});
});
