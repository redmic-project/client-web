define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, 'leaflet/leaflet'
	, "./MapLayer"

	, 'L-draw/leaflet.draw'
], function(
	declare
	, lang
	, aspect
	, L
	, MapLayer
){
	return declare(MapLayer, {
		//	summary:
		//		Implementación de capas generadas por leaflet-draw.
		//	description:
		//		Proporciona la fachada para trabajar con leaflet-draw.

		constructor: function(args) {

			this.config = {
				ownChannel: "dragInLayer",
				drawOption: {},
				dragInLayerImplEvents: {
					DRAG: "drag",
					DRAW: "draw",
					REMOVE: "remove"
				},

				_layers: {},

				dragInLayerImplActions: {
					ADD_LAYER: "addLayer",
					REMOVE_LAYER: "removeLayer",
					DRAGGED: "dragged",
					REMOVE_IN_MAP: "removeInMap",
					REMOVED: "removed",
					DRAW_IN_MAP: "drawInMap",
					DRAG_IN_MAP: "dragInMap",
					DRAWN: "drawn",
					FIT_BOUNDS: "fitBounds"
				},

				simpleLayer: false
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_beforeInitialize", lang.hitch(this, this._initializeDragInLayerImpl));
			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixDragInLayerImplEventsAndActions));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineDragInLayerImplSubscriptions));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineDragInLayerImplPublications));
		},

		_initializeDragInLayerImpl: function() {

			this.layer = new L.FeatureGroup();

			this.drawOption = this._merge([{
				edit: {
					featureGroup: this.layer
				}
			}, this.drawOption || {}]);
		},

		_mixDragInLayerImplEventsAndActions: function () {

			lang.mixin(this.events, this.dragInLayerImplEvents);
			lang.mixin(this.actions, this.dragInLayerImplActions);
			delete this.dragInLayerImplEvents;
			delete this.dragInLayerImplActions;
		},

		_defineDragInLayerImplSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("DRAW_IN_MAP"),
				callback: "_subDrawInMap"
			},{
				channel : this.getChannel("REMOVE_IN_MAP"),
				callback: "_subRemoveInMap"
			},{
				channel : this.getChannel("DRAG_IN_MAP"),
				callback: "_subDragInMap"
			},{
				channel : this.getChannel("ADD_LAYER"),
				callback: "_subAddLayer"
			},{
				channel : this.getChannel("REMOVE_LAYER"),
				callback: "_subRemoveLayer"
			});
		},

		_defineDragInLayerImplPublications: function () {

			this.publicationsConfig.push({
				event: 'DRAG',
				channel: this.getChannel("DRAGGED")
			},{
				event: 'DRAW',
				channel: this.getChannel("DRAWN")
			},{
				event: 'REMOVE',
				channel: this.getChannel("REMOVED")
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._emitEvt('ADD_LAYER', {
				layer: this.layer,
				channel: this.getChannel(),
				drawOption: this.drawOption
			});
		},

		_subDrawInMap: function(obj) {

			this._addLayer(obj.layer, obj.type);

			this._emitEvt('DRAW', {
				layer: obj.layer,
				position: this._convertCoordinatesToGeoJSON(obj)
			});
		},

		_convertCoordinatesToGeoJSON: function(obj) {

			if (obj.type === 'polyline') {
				return this._convertGeoJSONPolyline(obj.layer._latlngs);
			} else if (obj.type === 'polygon') {
				return this._convertGeoJSONPolygon(obj.layer._latlngs);
			}
		},

		_convertGeoJSONPolyline: function(latlngs) {

			var geoJson = L.polyline(latlngs).toGeoJSON();

			return geoJson.geometry.coordinates;
		},

		_convertGeoJSONPolygon: function(latlngs) {

			var geoJson = L.polygon(latlngs).toGeoJSON();

			return geoJson.geometry.coordinates;
		},

		_subRemoveInMap: function(obj) {

			this._removeLayer(obj.layer);

			this._emitEvt('REMOVE');
		},

		_addLayer: function(layer, type) {

			this._layers[layer._leaflet_id] = type;

			this.simpleLayer && this._layer && this._removeLayer(this._layer);

			this._layer = layer;

			this.layer.addLayer(layer);
		},

		_removeLayer: function(layer) {

			delete this._layers[layer._leaflet_id];

			this._layer = null;

			this.layer.removeLayer(layer);
		},

		_subDragInMap: function(obj) {

			obj.type = this._layers[obj.layer_leaflet_id];

			this._emitEvt('DRAG', {
				position: this._convertCoordinatesToGeoJSON(obj)
			});
		},

		_subAddLayer: function(obj) {

			var layer,
				type = obj.type;

			if (type === "polyline") {
				layer = L.polyline(this._reverseCoordinates(obj.geometry), this._configType(type));
			} else if (type === "polygon") {
				layer = L.polygon(this._reverseCoordinatesPolygon(obj.geometry), this._configType(type));
			}

			if (type && layer) {
				this._addLayer(layer, type);
			}

			var bounds = layer.getBounds && layer.getBounds();

			if (type === "polyline" && bounds && Object.keys(bounds).length) {
				layer.getBounds && this._publish(this._buildChannel(this.mapChannel, this.actions.FIT_BOUNDS), {
					bounds: bounds
				});
			}
		},

		_configType: function(type) {

			var config = this.drawOption.draw[type];

			if (config && config.shapeOptions) {
				return config.shapeOptions;
			}

			return config;
		},

		_reverseCoordinatesPolygon: function(geometry) {

			var resGeometry = lang.clone(geometry);

			for (var i = 0; i < geometry.length; i++) {
				resGeometry[i] = this._reverseCoordinates(geometry[i]);
			}

			return resGeometry;
		},

		_reverseCoordinates: function(geometry) {

			var coordinates = [];

			for (var i = 0; i < geometry.length; i++) {
				coordinates.push([geometry[i][1], geometry[i][0]]);
			}

			return coordinates;
		},

		_subRemoveLayer: function(obj) {

			this._removeLayer(obj.layer);
		},

		clear: function() {

			this.layer.clearLayers();
		}
	});
});
