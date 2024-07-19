define([
	'd3/d3.min'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, 'leaflet/leaflet'
	, "redmic/base/Credentials"
	, "redmic/modules/filter/Filter"
	, "./MapLayer"
], function(
	d3
	, declare
	, lang
	, aspect
	, L
	, Credentials
	, Filter
	, MapLayer
){
	return declare(MapLayer, {
		//	summary:
		//		Implementación de capa de rejilla.

		constructor: function(args) {

			this.config = {
				scale:{
					"grid5000": {zoom:8, factor:200},
					"grid1000": {zoom:11, factor:50},
					"grid500": {zoom:12, factor:25},
					"grid100": {zoom:14, factor:5}
				},
				currentGridLayer: "grid5000",
				currentMode: 0,
				confidences: [1, 2, 3, 4],

				ownChannel: "gridLayer"
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_initialize", lang.hitch(this, this._initializeGridLayerImpl));
			aspect.before(this, "_afterSetConfigurations", lang.hitch(this, this._setGridLayerConfigurations));
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

			this.svg = d3.select(this._mapInstance.getPanes().overlayPane)
				.append("svg:svg");

			this._globalG = this.svg.append("svg:g")
				.attr("class", "leaflet-zoom-hide");

			var transform = d3.geoTransform({
				point: lang.partial(function(self, x, y) {

					self._projectPoint(x, y, this.stream);
				}, this)
			});

			this.path = d3.geoPath(transform);

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

		_projectPoint: function(x, y, stream) {
			// Use Leaflet to implement a D3 geometric transformation.

			var point = this._mapInstance.latLngToLayerPoint(new L.LatLng(y, x));
			stream.point(point.x, point.y);
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

				this._publish(this.infoFilter.getChannel('UPDATE_TARGET'), {
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
