define([
	'd3'
	, 'dojo/_base/declare'
	, 'leaflet'
	, 'src/component/map/layer/_D3MapProjection'
	, 'src/component/map/layer/MapLayer'
], function(
	d3
	, declare
	, L
	, _D3MapProjection
	, MapLayer
) {

	return declare([MapLayer, _D3MapProjection], {
		// summary:
		//   Implementación de capa de rejilla.

		postMixInProperties: function() {

			const defaultConfig = {
				ownChannel: 'gridLayer',

				scale:{
					grid5000: {zoom:8, factor:200},
					grid1000: {zoom:11, factor:50},
					grid500: {zoom:12, factor:25},
					grid100: {zoom:14, factor:5}
				},
				currentGridLayer: 'grid5000',
				currentMode: 0,
				confidences: [1, 2, 3, 4]
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_setConfigurations: function() {

			this.inherited(arguments);

			this.targetPathParams = {
				grid: this.currentGridLayer
			};

			this.targetQueryParams = {
				terms: {
					confidences: this.confidences
				}
			};
		},

		_onCurrentGridLayerPropSet: function() {

			this.targetPathParams.grid = this.currentGridLayer;
			this._redraw();
		},

		_onConfidencesPropSet: function() {

			this.targetQueryParams.terms.confidences = this.confidences;
			this._redraw();
		},

		_onSelectionPropSet: function() {

			this.targetQueryParams.terms.selection = this.selection;
			this._redraw();
		},

		clear: function() {

			this._globalG?.selectAll('g').remove();
			this._globalG?.remove();

			this.svg?.remove();
		},

		_addNewData: function(geoJsonData, moduleContext) {

			// todo - hay que limpiar si no llegan datos nuevos
			if (!this._mapInstance || !geoJsonData?.features?.length) {
				this.clear();
				return;
			}

			this.addData(geoJsonData, moduleContext);
		},

		addData: function(geoJsonData, moduleContext) {

			this.svg = this._getSvgElement();

			this._globalG = this.svg.append('svg:g')
				.attr('class', 'leaflet-zoom-hide');

			this.path = this._getGeoPath();

			const featureG = this._globalG.selectAll('path')
				.data(geoJsonData.features)
				.enter().append('svg:g')
					.attr('gridId', d => d.id)
					.on('mouseout', function(evt) {

						this.firstChild.setAttribute('class', 'grid-distribution');
					})
					.on('mouseover', function(evt) {

						this.firstChild.setAttribute('class', 'grid-distribution-select');
					});

			const feature = featureG.append('svg:path')
				.attr('class', 'grid-distribution');

			const text = featureG.append('svg:text');

			this._mapInstance.on('viewreset', () => this._redrawByZoom(geoJsonData, feature, text));
			this._redrawByZoom(geoJsonData, feature, text);
		},

		_redrawByZoom: function(geojson, feature, text) {

			const bounds = this.path.bounds(geojson),
				topLeft = bounds[0],
				bottomRight = bounds[1];

			// Se cambia los atributos con respecto al zoom
			this.svg.attr('width', bottomRight[0] - topLeft[0])
				.attr('height', bottomRight[1] - topLeft[1])
				.style('left', `${topLeft[0]}px`)
				.style('top', `${topLeft[1]}px`);

			this._globalG.attr('transform', `translate(${-topLeft[0]},${-topLeft[1]})`);

			// Se establece el texto que se va a mostrar en la cuadrícula
			text
				.attr('class', 'count-text')
				.attr('style', () => `font-size:${this._getFontByZoom()}px`)
				.attr('transform', d => {

					const centroid = this.path.centroid(d);
					return `translate(${centroid[0]},${centroid[1]})`;
				})
				.text(d => this._getTextContent.call(this, d));

			feature.attr('d', this.path);
		},

		_getFontByZoom: function() {

			const zoom = this._mapInstance.getZoom(),
				zoomMin = this.scale[this.currentGridLayer].zoom,
				factor = this.scale[this.currentGridLayer].factor;

			return zoom >= zoomMin ? ((Math.pow(2, zoom) / 10000) * factor) : 0;
		},

		_getTextContent: function(d) {
			// Retorna el texto que se va a mostrar en la cuadrícula

			if (this.currentMode === 1) {
				return d.properties.registerCount;	// Número de citas
			}

			if (this.currentMode === 2) {
				return d.properties.taxonCount;//_getUniqueResults(d.properties.data).length;	// Número de species
			}

			return '';
		},

		_requestLayerInfo: function(res) {

			const pos = res.latLng;

			if (!pos || !this._globalG) {
				this._emitLayerInfo();
				return;
			}

			const elementsClicked = this._globalG.selectAll('g')
				.filter((d, i) => L.polygon(d.geometry.coordinates).getBounds().contains([pos.lng, pos.lat]));

			if (!elementsClicked.size()) {
				this._emitLayerInfo();
				return;
			}

			const element = d3.select(elementsClicked.node()),
				gridId = element.attr('gridId');

			this._requestInfoData(gridId);
		},

		_requestInfoData: function(gridId) {

			const path = {
				grid: this.currentGridLayer,
				tile: gridId
			};

			const query = {
				terms: {
					selection: this.selection,
					confidences: this.confidences
				}
			};

			this._emitEvt('REQUEST', {
				method: 'POST',
				target: this.infoTarget,
				params: {path, query},
				requesterId: this.getOwnChannel()
			});

		},

		_processLayerInfo: function(data) {

			this._emitLayerInfo(data);
		},

		_emitLayerInfo: function(info) {

			this._emitEvt('LAYER_INFO', {
				layerId: this.layerId,
				layerLabel: this.layerLabel,
				info: info
			});
		}
	});
});
