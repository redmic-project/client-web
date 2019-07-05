define([
	"dijit/registry"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/_base/kernel"
	, "dojo/aspect"
	, "dojo/Deferred"
	, "dojo/dom-class"
	, "dojo/on"
	, "dojo/query"
	, 'leaflet/leaflet'
	, 'L-miniMap/Control.MiniMap.min'
	, "put-selector/put"
	, "redmic/map/OpenLayers"
	, "redmic/modules/map/_ListenContainers"
	, "redmic/modules/map/_OverlayLayersManagement"
	, "./_LeafletImplItfc"

	, 'awesome-markers/leaflet.awesome-markers.min'
	, 'L-coordinates/Leaflet.Coordinates-0.1.5.min'
	, 'L-navBar/Leaflet.NavBar'
	, 'leaflet-measure/leaflet-measure.min'
], function(
	registry
	, declare
	, lang
	, kernel
	, aspect
	, Deferred
	, domClass
	, on
	, query
	, L
	, MiniMap
	, put
	, OpenLayers
	, _ListenContainers
	, _OverlayLayersManagement
	, _LeafletImplItfc
){
	return declare([_LeafletImplItfc, _ListenContainers, _OverlayLayersManagement], {
		//	summary:
		//		Implementación de leaflet.
		//	description:
		//		Proporciona la fachada para trabajar con leaflet.

		//	config: Object
		//		Opciones y asignaciones por defecto.


		constructor: function(args) {

			this.config = {
				region: "center",

				extent: [28.5, -16.0],
				zoom: 7,
				minZoom: 1,
				maxZoom: 18,
				controlLayers: L.control.layers(),
				coordinatesViewer: true,
				navBar: true,
				miniMap: true,
				scaleBar: true,
				measureTools: true,
				queryableClass: "leaflet-queryable",

				_mapNodeValidSizeInterval: 100,

				layerTypes: {
					base: "base",
					forced: "forced",
					optional: "optional"
				},
				layers: {}
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			L.Icon.Default.imagePath = "/javascript/leaflet/dist/images";

			this.mapParentNode = put("div.map");
			this.mapNode = put(this.mapParentNode, "div.map");

			this.map = L.map(this.mapNode, {
				crs: L.CRS.EPSG4326,
				doubleClickZoom: false,
				minZoom: this.minZoom,
				maxZoom: this.maxZoom,
				attributionControl: true,
				worldCopyJump: true
			});
			this.map.once("load", lang.hitch(this, this._afterMapLoaded));

			domClass.remove(this.mapNode, 'leaflet-touch');

			this.controlLayers.addTo(this.map);
			domClass.add(this.controlLayers._container.firstChild, "fa-globe");

			this._resetMapPosition();
		},

		_doEvtFacade: function() {

			this.map.on("layeradd", lang.hitch(this, this._onLayerAdd));
			this.map.on("layerremove", lang.hitch(this, this._onLayerRemove));
			this.map.on("baselayerchange", lang.hitch(this, this._groupEventArgs, 'BASE_LAYER_CHANGE'));
			this.map.on("zoomend", lang.hitch(this, this._groupEventArgs, 'ZOOM_END'));
			this.map.on("moveend", lang.hitch(this, this._groupEventArgs, 'PAN'));
			this.map.on("click", lang.hitch(this, this._onMapClick));
			this.map.on("popupopen", lang.hitch(this, this._groupEventArgs, 'POPUP_OPEN'));
			this.map.on("popupclose", lang.hitch(this, this._groupEventArgs, 'POPUP_CLOSE'));
			this.map.on("movestart", lang.hitch(this, this._groupEventArgs, 'MOVE_START'));
			this.map.on("zoomstart", lang.hitch(this, this._groupEventArgs, 'ZOOM_START'));
		},

		_onLayerAdd: function(evt) {

			this._emitEvt('LAYER_ADD', {
				layer: evt.layer,
				mapInstance: this.map
			});
		},

		_onLayerRemove: function(evt) {

			this._emitEvt('LAYER_REMOVE', {
				layer: evt.layer,
				layerId: evt.layer._leaflet_id
			});
		},

		_onMapClick: function(evt) {

			!this._clickDisabled && this._emitEvt('CLICK', {
				latLng: evt.latlng,
				bbox: this.getBounds(),
				size: this.map.getSize(),
				containerPoint: evt.containerPoint,
				layerPoint: evt.layerPoint
			});
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('PAN', lang.hitch(this, function(evt) {

				if (!this._anyPopupOpened) {
					this._emitEvt('BBOX_CHANGE');
				}
			}));

			this._onEvt('POPUP_OPEN', lang.hitch(this, function(evt) {

				this._anyPopupOpened = true;
			}));

			this._onEvt('POPUP_CLOSE', lang.hitch(this, function(evt) {

				this._anyPopupOpened = false;
				this._emitEvt('BBOX_CHANGE');
			}));

			this._onEvt('RESIZE', lang.hitch(this, this.invalidateSize));
			this._onEvt('LAYER_ADDED_TO_PANE', lang.hitch(this, this._onLayerAddedToPane));
			this._onEvt('LAYER_REMOVED_FROM_PANE', lang.hitch(this, this._onLayerRemovedFromPane));
		},

		_getNodeToShow: function() {

			return this.mapParentNode;
		},

		_afterShow: function() {

			var dfd = new Deferred();

			dfd.then(lang.hitch(this, this._onMapNodeValidSize));

			this._mapNodeValidSizeIntervalHandler = setInterval(lang.hitch(this, function(dfd) {

				if (this.mapParentNode.clientHeight) {
					clearInterval(this._mapNodeValidSizeIntervalHandler);
					dfd.resolve();
				}
			}, dfd), this._mapNodeValidSizeInterval);

			return dfd;
		},

		_onMapNodeValidSize: function() {

			if (!this._getPreviouslyShown()) {
				this._addMapWidgets();
			}

			this.invalidateSize();
		},

		_addMapWidgets: function() {

			this._addCoordinatesViewer();
			this._addNavBar();
			this._addMeasureTools();
			this._addMiniMap();

			this._addScaleBar();
		},

		_addCoordinatesViewer: function() {

			if (!this.coordinatesViewer) {
				return;
			}

			var awesomeIcon = L.AwesomeMarkers.icon({
				icon: 'bullseye',
				markerColor: 'darkgreen',
				prefix: 'fa'
			});

			L.control.coordinates({
				position: "bottomleft",
				enableUserInput: true,
				decimals: 5,
				decimalSeperator: ",",
				useDMS: true,
				markerProps: {
					icon: awesomeIcon
				}
			}).addTo(this.map);
		},

		_addNavBar: function() {

			if (!this.navBar) {
				return;
			}

			L.control.navbar().addTo(this.map);
		},

		_addMiniMap: function() {

			if (!this.miniMap) {
				return;
			}

			var defaultLayerName = this.baseLayers[this.defaultBaseLayer];

			if (defaultLayerName instanceof Array) {
				defaultLayerName = defaultLayerName[0];
			}

			var baseMap = OpenLayers.get(defaultLayerName).instance,
				miniMapConfig = {
					position: "topright",
					collapsedWidth: 36,
					collapsedHeight: 36,
					toggleDisplay: true,
					minimized: true,
					strings: {
						showText: this.i18n.miniMapShowText,
						hideText: this.i18n.miniMapHideText
					}
				},
				miniMap = new MiniMap(baseMap, miniMapConfig);

			miniMap.addTo(this.map);

			// TODO workaround for https://github.com/Norkart/Leaflet-MiniMap/issues/114
			on(miniMap._miniMap._container, "click", function(evt) { evt.stopPropagation(); });
		},

		_addMeasureTools: function() {

			if (!this.measureTools) {
				return;
			}

			var measureConfig = {
					primaryLengthUnit: 'meters',
					secondaryLengthUnit: 'kilometers',
					primaryAreaUnit: 'sqmeters',
					secondaryAreaUnit: 'hectares',
					localization: kernel.locale
				},
				measure = new L.Control.Measure(measureConfig);

			measure.addTo(this.map);

			this.map.on("measurestart", lang.hitch(this, function() {
				this._clickDisabled = true;
			}));
			this.map.on("measurefinish", lang.hitch(this, function() {
				this._clickDisabled = false;
			}));
		},

		_addScaleBar: function() {

			if (!this.scaleBar) {
				return;
			}

			L.control.scale({
				position: "bottomright",
				imperial: false
			}).addTo(this.map);
		},

		setView: function(latLng, zoomLevel, options) {

			this.map.setView(latLng, zoomLevel, options);
		},

		panTo: function(latLng, options) {

			this.map.panTo(latLng, options);
		},

		fitBounds: function(bounds, options) {

			this.map.fitBounds(bounds);
		},

		setZoom: function(zoomLevel, options) {

			this.map.setZoom(zoomLevel, options);
		},

		getZoom: function() {

			return this.map.getZoom();
		},

		invalidateSize: function() {

			this.map && this.map.invalidateSize();
		},

		hasLayer: function(layer) {

			return this.map.hasLayer(layer);
		},

		addLayer: function(/*Object*/ layer, /*Integer?*/ layerId) {

			if (layerId) {
				layer._leaflet_id = layerId;
			}

			this.map.addLayer(layer);
		},

		removeLayer: function(layer) {

			this.map.removeLayer(layer);
		},

		bringLayerToFront: function(layer) {

			layer.bringToFront && layer.bringToFront();
		},

		bringLayerToBack: function(layer) {

			layer.bringToBack && layer.bringToBack();
		},

		getBounds: function() {

			var bounds = this.map.getBounds(),
				northEast = bounds._northEast,
				southWest = bounds._southWest,
				maxLat = 90,
				minLat = -90,
				maxLng = 180,
				minLng = -180;

			if (northEast.lat > maxLat) {
				bounds._northEast.lat = maxLat;
			}

			if (northEast.lng > maxLng) {
				bounds._northEast.lng = maxLng;
			}

			if (southWest.lat < minLat) {
				bounds._southWest.lat = minLat;
			}

			if (southWest.lng < minLng) {
				bounds._southWest.lng = minLng;
			}

			return bounds;
		},

		getCenter: function() {

			return this.map.getCenter();
		},

		closePopup: function() {

			this.map.closePopup();
		},

		_getMapInstance: function() {

			return this.map;
		},

		addButton: function(buttonNode, append) {

			var container = query("div.leaflet-top.leaflet-right", this.mapNode)[0];

			if (!container) {
				return;
			}

			put(container, buttonNode);

			if (!append) {
				put(container.firstChild, "-", buttonNode);
			}
		},

		_addQueryableCursor: function() {

			domClass.add(this.mapNode, this.queryableClass);
		},

		_removeQueryableCursor: function() {

			domClass.remove(this.mapNode, this.queryableClass);
		},

		_setLayerZIndex: function(layerInstance, zIndex) {

			if (!layerInstance) {
				return;
			}

			if (layerInstance.setZIndex) {
				layerInstance.setZIndex(zIndex);
			} else {
				this._setOverlayLayerZIndex(layerInstance, zIndex);
			}
		},

		_onLayerAddedToPane: function(evt) {

			var node = evt.node,
				nodeType = node.tagName;

			if (nodeType && nodeType.toLowerCase() === 'img') {
				this._onOverlayLayerAddedToPane(node);
			}
		},

		_onLayerRemovedFromPane: function(evt) {

			var node = evt.node,
				nodeType = node.tagName;

			if (nodeType && nodeType.toLowerCase() === 'img') {
				this._onOverlayLayerRemovedFromPane(node);
			}
		}
	});
});
