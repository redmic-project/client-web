define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/Deferred"
	, "dojo/dom-class"
	, "dojo/query"
	, 'leaflet/leaflet'
	, "put-selector/put"
	, "./_LeafletImplItfc"
	, './_LeafletWidgetsManagement'
	, "./_ListenContainers"
	, "./_OverlayLayersManagement"
	, "./Map"
], function(
	declare
	, lang
	, Deferred
	, domClass
	, query
	, L
	, put
	, _LeafletImplItfc
	, _LeafletWidgetsManagement
	, _ListenContainers
	, _OverlayLayersManagement
	, Map
) {

	return declare([Map, _LeafletImplItfc, _LeafletWidgetsManagement, _ListenContainers, _OverlayLayersManagement], {
		//	summary:
		//		Implementación de mapa Leaflet.
		//	description:
		//		Proporciona la fachada para trabajar con Leaflet.


		constructor: function(args) {

			this.config = {
				queryableClass: "leaflet-queryable",
				omitContainerSizeCheck: false,

				_mapNodeValidSizeInterval: 100
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

			this._resetMapPosition();
		},

		_doEvtFacade: function() {

			this.map.on("layeradd", lang.hitch(this, this._onLayerAdd));
			this.map.on("layerremove", lang.hitch(this, this._onLayerRemove));
			this.map.on("baselayerchange", lang.hitch(this, this._onBaseLayerChangedFromControl));
			this.map.on("zoomend", lang.hitch(this, this._groupEventArgs, 'ZOOM_END'));
			this.map.on("moveend", lang.hitch(this, this._groupEventArgs, 'PAN'));
			this.map.on("click", lang.hitch(this, this._onMapClick));
			this.map.on("popupopen", lang.hitch(this, this._groupEventArgs, 'POPUP_OPEN'));
			this.map.on("popupclose", lang.hitch(this, this._groupEventArgs, 'POPUP_CLOSE'));
			this.map.on("movestart", lang.hitch(this, this._groupEventArgs, 'MOVE_START'));
			this.map.on("zoomstart", lang.hitch(this, this._groupEventArgs, 'ZOOM_START'));
		},

		_onLayerAdd: function(evt) {

			var layer = evt.layer;

			this._emitEvt('LAYER_ADD', {
				layer: layer,
				mapInstance: this.map
			});

			var layerId = layer._leaflet_id;
			if (this._isBaseLayer(layerId)) {
				this._emitEvt('BASE_LAYER_CHANGE', {
					success: true,
					baseLayer: layer,
					layerId: layerId
				});
			}
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
				zoom: this.getZoom(),
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

			if (this.omitContainerSizeCheck) {
				this._onMapNodeValidSize();
				return;
			}

			var dfd = new Deferred();

			dfd.then(lang.hitch(this, this._onMapNodeValidSize));

			this._mapNodeValidSizeIntervalHandler = setInterval(lang.hitch(this, function(nestedDfd) {

				if (this.mapParentNode.clientHeight) {
					clearInterval(this._mapNodeValidSizeIntervalHandler);
					nestedDfd.resolve();
				}
			}, dfd), this._mapNodeValidSizeInterval);

			return dfd;
		},

		_afterMapLoaded: function() {

			this._loadBaseLayers();
			this._loadOptionalLayers();
			this._addContainerListeners();
		},

		_onMapNodeValidSize: function() {

			this.invalidateSize();

			if (!this._getPreviouslyShown()) {
				this._resetMapPosition();
				this._addMapWidgets();
			}
		},

		setView: function(latLng, zoomLevel, options) {

			this.map.setView(latLng, zoomLevel, options);
		},

		panTo: function(latLng, options) {

			this.map.panTo(latLng, options);
		},

		fitBounds: function(bounds, options) {

			this.map.fitBounds(bounds, options || {});
		},

		setZoom: function(zoomLevel, options) {

			this.map.setZoom(zoomLevel, options);
		},

		getZoom: function() {

			return this.map.getZoom();
		},

		invalidateSize: function() {

			if (!this.map) {
				return;
			}

			this.map.invalidateSize();

			if (this.miniMap && this.miniMapInstance) {
				this.miniMapInstance.addTo(this.map);
			}
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
