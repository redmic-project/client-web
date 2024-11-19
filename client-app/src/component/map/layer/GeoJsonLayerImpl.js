define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, 'leaflet'
	, "./_AnimateMarker"
	, "./_GeoJsonLayerItfc"
	, "./MapLayer"

	, 'awesome-markers'
], function(
	declare
	, lang
	, L
	, _AnimateMarker
	, _GeoJsonLayerItfc
	, MapLayer
){
	return declare([MapLayer, _GeoJsonLayerItfc, _AnimateMarker], {
		//	summary:
		//		Implementación de capa GeoJSON.
		//	description:
		//		Proporciona la fachada para trabajar con capas geoJson.

		constructor: function(args) {

			this.config = {
				ownChannel: 'geoJsonLayer',
				geoJsonData: null,
				pointToLayer: null,
				filterLayer: null,
				_layerById: {},
				_lineMarkersById: {},
				//_clickHandlers: {},

				markerColor: 'orange',

				markerIconName: 'star',
				markerIconPrefix: 'fa',
				markerIconSpin: false,

				startMarkerIconName: 'play',
				startMarkerIconPrefix: 'fa',
				startMarkerIconSpin: false,

				endMarkerIconName: 'stop',
				endMarkerIconPrefix: 'fa',
				endMarkerIconSpin: false
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			this.layer = L.geoJson(this.geoJsonData, {
				pointToLayer: this.pointToLayer,
				style: lang.hitch(this, this._getGeoJsonStyle),
				onEachFeature: lang.hitch(this, function(feature, layer) {

					this._onEachFeature(feature, layer);
				}),
				filter: this.filterLayer
			});
		},

		_doEvtFacade: function() {

			this.layer.on('click', lang.hitch(this, this._groupEventArgs, 'CLICK'));
			this.layer.on('preclick', lang.hitch(this, this._groupEventArgs, 'PRE_CLICK'));
			this.layer.on('mouseover', lang.hitch(this, this._groupEventArgs, 'MOUSE_OVER'));
		},

		_getGeoJsonStyle: function(feature) {

			var geometryType = feature.geometry.type;

			if (geometryType === 'LineString') {
				return {
					color: this.markerColor
				};
			} else if (geometryType === 'MultiPolygon') {
				return {
					fillColor: this.markerColor,
					color: this.markerColor
				};
			}
		},

		_getMarkerIconConfig: function() {

			return {
				markerColor: this.markerColor,
				icon: this.markerIconName,
				prefix: this.markerIconPrefix,
				spin: this.markerIconSpin
			};
		},

		_getStartMarkerIconConfig: function() {

			return {
				markerColor: this.markerColor,
				icon: this.startMarkerIconName,
				prefix: this.startMarkerIconPrefix,
				spin: this.startMarkerIconSpin
			};
		},

		_getEndMarkerIconConfig: function() {

			return {
				markerColor: this.markerColor,
				icon: this.endMarkerIconName,
				prefix: this.endMarkerIconPrefix,
				spin: this.endMarkerIconSpin
			};
		},

		_getDefaultIcon: function() {

			return this._getAwesomeIcon(this._getMarkerIconConfig());
		},

		_getAwesomeIcon: function(config) {

			return L.AwesomeMarkers.icon(config);
		},

		_getMarker: function(marker) {

			if (typeof marker !== 'object') {
				return this._layerById[marker];
			}

			return marker;
		},

		_isMarkerSelectable: function(marker) {

			return true;
		},

		_onEachFeature: function(feature, layer) {

			var featureId = feature[this.idProperty],
				geometryType = feature.geometry.type;

			this._layerById[featureId] = layer;

			this.onEachFeature(feature, layer);

			if (geometryType === 'Point') {
				layer.setIcon(this._getDefaultIcon());
			} else if (geometryType === 'LineString') {
				this._createLineMarkers(feature, featureId);
			}
		},

		_createLineMarkers: function(feature, featureId) {

			var geometry = feature.geometry,
				coords = geometry.coordinates,
				startPoint = coords[0],
				endPoint = coords[coords.length - 1],
				startMarker = this._createLineStartMarker(startPoint),
				endMarker = this._createLineEndMarker(endPoint);

			this._lineMarkersById[featureId] = {
				startMarker: startMarker,
				endMarker: endMarker
			};

			//this._onEvt('LAYER_ADDED', lang.hitch(this, this._addLineMarkersToMap, featureId));
			this._onEvt('LAYER_REMOVED', lang.hitch(this, this._removeLineMarkersFromMap, featureId));

			this._bindLinePopupToMarkers(featureId);
			this._addLineEventsToLineMarkers(featureId);
			this._addLineMarkersToMap(featureId);
		},

		_createLineStartMarker: function(startPoint) {

			var startMarkerPoint = L.latLng(startPoint[1], startPoint[0]),
				startMarkerIconProps = this._getStartMarkerIconConfig(),
				startMarkerIcon = this._getAwesomeIcon(startMarkerIconProps),
				startMarkerProps = {
					icon: startMarkerIcon,
					zIndexOffset: 2
				},
				startMarker = L.marker(startMarkerPoint, startMarkerProps);

			return startMarker;
		},

		_createLineEndMarker: function(endPoint) {

			var endMarkerPoint = L.latLng(endPoint[1], endPoint[0]),
				endMarkerIconProps = this._getEndMarkerIconConfig(),
				endMarkerIcon = this._getAwesomeIcon(endMarkerIconProps),
				endMarkerProps = {
					icon: endMarkerIcon,
					zIndexOffset: 1
				},
				endMarker = L.marker(endMarkerPoint, endMarkerProps);

			return endMarker;
		},

		_removeLineMarkersFromMap: function(featureId) {

			var markers = this._lineMarkersById[featureId];

			this._emitEvt('REMOVE_LAYER', {
				layer: markers.startMarker
			});

			this._emitEvt('REMOVE_LAYER', {
				layer: markers.endMarker
			});
		},

		_bindLinePopupToMarkers: function(featureId) {

			var linePopup = this._layerById[featureId].getPopup();

			if (!linePopup) {
				return;
			}

			var markers = this._lineMarkersById[featureId],
				startMarker = markers.startMarker,
				endMarker = markers.endMarker;

			startMarker.bindPopup(linePopup);
			endMarker.bindPopup(linePopup);
		},

		_addLineEventsToLineMarkers: function(featureId) {

			var markers = this._lineMarkersById[featureId],
				startMarker = markers.startMarker,
				endMarker = markers.endMarker,
				featureLine = this._getMarker(featureId),
				events = featureLine._events;

			for (var eventName in events) {
				var eventCallbacks = events[eventName];

				if (!eventCallbacks) {
					continue;
				}

				for (var i = 0; i < eventCallbacks.length; i++) {
					var eventCallback = eventCallbacks[i].fn;
					startMarker.on(eventName, eventCallback);
					endMarker.on(eventName, eventCallback);
				}
			}
		},

		_addLineMarkersToMap: function(featureId) {

			var markers = this._lineMarkersById[featureId];

			this._emitEvt('ADD_LAYER', {
				layer: markers.startMarker
			});

			this._emitEvt('ADD_LAYER', {
				layer: markers.endMarker
			});
		},

		_getLatLng: function(lat, lng) {

			if (lat && lng) {
				return new L.latLng(lat, lng);
			}
		},

		_addNewData: function(geoJsonData, moduleContext) {

			if (!geoJsonData.features) {
				return;
			}

			this._clearInternalStructures();
			this.addData(geoJsonData);
		},

		_clearInternalStructures: function() {

			this._layerById = {};
		},

		addData: function(geoJsonData) {

			this.layer.addData(geoJsonData);
		},

		_getMarkerById: function(id) {

			if (this._layerById && this._layerById[id]) {
				return this._layerById[id];
			}
		},

		setStyle: function(geoJsonStyle) {

			this.layer.setStyle(geoJsonStyle);
		},

		clear: function() {

			this.layer.clearLayers();

			for (var featureId in this._lineMarkersById) {
				this._removeLineMarkersFromMap(featureId);
			}
		},

		_setCenter: function(obj) {

			var layer = this._getMarkerById(obj.markerId),
				options = obj.options;

			if (!layer) {
				return;
			}

			if (layer.getBounds) {
				this._emitEvt('FIT_BOUNDS', {
					bounds: layer.getBounds(),
					options: options
				});
			} else {
				this._emitEvt('SET_CENTER', {
					center: layer.getLatLng(),
					options: options
				});
			}
		}
	});
});
