define([
	'd3'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'leaflet'
	, 'src/component/filter/Filter'
	, 'src/component/map/layer/_D3MapProjection'
	, 'src/component/map/layer/MapLayer'
	, 'src/util/Credentials'
], function(
	d3
	, declare
	, lang
	, aspect
	, L
	, Filter
	, _D3MapProjection
	, MapLayer
	, Credentials
) {

	return declare([MapLayer, _D3MapProjection], {
		//	summary:
		//		Implementación de capa de rejilla.

		constructor: function() {

			aspect.before(this, "_initialize", lang.hitch(this, this._initializeGridLayerImpl));
			aspect.before(this, "_afterSetConfigurations", lang.hitch(this, this._setGridLayerConfigurations));
		},

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

		_setGridLayerConfigurations: function() {

			this.filterConfig = this._merge([{
				initQuery: {
					terms: {
						confidences: this.confidences
					}
				}
			}, this.filterConfig || {}]);
		},

		_initializeGridLayerImpl: function() {

			this.infoFilter = new Filter({
				parentChannel: this.getChannel()
			});
		},

		setStyle: function(geoJsonStyle) {
			//hara cosas
		},

		clear: function() {

			if (this._globalG) {
				this._globalG.selectAll("g").remove();
				this._globalG.remove();
			}

			this.svg && this.svg.remove();
		},

		_addNewData: function(geoJsonData, moduleContext) {

			// todo - hay que limpiar si no llegan datos nuevos
			if (!this._mapInstance || (!geoJsonData || !geoJsonData.features || !geoJsonData.features.length)) {
				return;
			}

			this.addData(geoJsonData, moduleContext);
		},

		addData: function(geoJsonData, moduleContext) {

			this.svg = this._getSvgElement();

			this._globalG = this.svg.append("svg:g")
				.attr("class", "leaflet-zoom-hide");

			this.path = this._getGeoPath();

			var featureG = this._globalG.selectAll("path")
				.data(geoJsonData.features)
				.enter().append("svg:g")
					.attr('gridId', lang.hitch(this, function(d) { return d.id; }))
					.on('mouseout', function(evt) {

						this.firstChild.setAttribute('class', 'grid-distribution');
					})
					.on('mouseover', function(evt) {

						this.firstChild.setAttribute('class', 'grid-distribution-select');
					}),

				feature = featureG.append("svg:path")
					.attr("class", "grid-distribution"),

				text = featureG.append("svg:text");

			this._mapInstance.on("viewreset", lang.hitch(this, this._redrawByZoom, geoJsonData, feature, text));
			this._redrawByZoom(geoJsonData, feature, text);
		},

		_getTextContent: function(d) {
			// Retorna el texto que se va a mostrar en la cuadrícula

			if (this.currentMode === 1) {
				return d.properties.registerCount;	// Número de citas
			}

			if (this.currentMode === 2) {
				return d.properties.taxonCount;//_getUniqueResults(d.properties.data).length;	// Número de species
			}

			return "";
		},

		_redrawByZoom: function(geojson, feature, text) {

			var bounds = this.path.bounds(geojson),
				topLeft = bounds[0],
				bottomRight = bounds[1];

			// Se cambia los atributos con respecto al zoom
			this.svg.attr("width", bottomRight[0] - topLeft[0])
				.attr("height", bottomRight[1] - topLeft[1])
				.style("left", topLeft[0] + "px")
				.style("top", topLeft[1] + "px");

			this._globalG.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

			// Se establece el texto que se va a mostrar en la cuadrícula
			text
				.attr("class", "count-text")
				.attr("style", lang.hitch(this, function(d) {

					return "font-size:" + this._getFontByZoom() + "px";
				}))
				.attr("transform", lang.hitch(this, function(d) {

					var centroid = this.path.centroid(d),
						x = centroid[0],
						y = centroid[1];

					return "translate(" + x + "," + y + ")" ;
				}))
				.text(lang.hitch(this, function(d) {

					return lang.hitch(this, this._getTextContent)(d);
				}));

			feature.attr("d", this.path);
		},

		_getFontByZoom: function() {

			var zoom = this._mapInstance.getZoom(),
				zoomMin = this.scale[this.currentGridLayer].zoom,
				factor = this.scale[this.currentGridLayer].factor;

			return zoom >= zoomMin ? ((Math.pow(2,zoom)/10000)*factor) : 0;
		},

		_requestLayerInfo: function(res) {

			var pos = res.latLng;

			if (!pos || !this._globalG) {
				this._emitLayerInfo();
				return;
			}

			var elementsClicked = this._globalG.selectAll("g")
				.filter(function(d, i) {

					return L.polygon(d.geometry.coordinates).getBounds().contains([pos.lng, pos.lat]);
				});

			if (elementsClicked.size()) {
				var element = d3.select(elementsClicked.node()),
					id = element.attr("gridId"),
					selectionId = Credentials.get("selectIds")[this.target.replace("/" + this.currentGridLayer, "")];

				this.infoTarget = this.target + "/" + id;

				this._publish(this.infoFilter.getChannel('SET_PROPS'), {
					target: this.infoTarget
				});

				this._emitAddToQuery(selectionId);
			} else {
				this._emitLayerInfo();
			}
		},

		_emitLayerInfo: function(info) {

			this._emitEvt('LAYER_INFO', {
				layerId: this.layerId,
				layerLabel: this.layerLabel,
				info: info
			});
		},

		_emitAddToQuery: function(selectionId) {

			this._publish(this.infoFilter.getChannel("ADD_TO_QUERY"), {
				query: {
					terms: {
						selection: selectionId,
						confidences: this.confidences
					}
				},
				requesterId: this.getOwnChannel()
			});
		},

		_processLayerInfo: function(data) {

			this._emitLayerInfo(data);
		}
	});
});
