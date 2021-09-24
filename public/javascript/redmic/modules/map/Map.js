define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, 'node-uuid/uuid'
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Show"
	, './_StaticLayersManagement'
	, "./_MapItfc"
], function(
	declare
	, lang
	, uuid
	, _Module
	, _Show
	, _StaticLayersManagement
	, _MapItfc
) {

	return declare([_Module, _MapItfc, _Show, _StaticLayersManagement], {
		//	summary:
		//		Módulo de cliente para visualización de mapas.
		//	description:
		//		Permite trabajar con un mapa para representar datos geográficos, en forma de capas superpuestas.


		constructor: function(args) {

			this.config = {
				events: {
					LAYER_ADD: "layerAdd",
					LAYER_REMOVE: "layerRemove",
					LAYER_REMOVE_FAIL: "layerRemoveFail",
					BASE_LAYER_CHANGE: "baseLayerChange",
					BASE_LAYER_CHANGE_FAIL: "baseLayerChangeFail",
					PAN: "pan",
					MOVE_START: "moveStart",
					ZOOM_END: "zoomEnd",
					CLICK: "click",
					BBOX_CHANGE: "bBoxChange",
					POPUP_OPEN: "popupOpen",
					POPUP_CLOSE: "popupClose",
					ZOOM_START: "zoomStart",
					GOT_ZOOM: "gotZoom",
					LAYER_ADDED_FORWARDED: "layerAddedForwarded",
					LAYER_REMOVED_FORWARDED: "layerRemovedForwarded",
					LAYER_INFO_FORWARDED: "layerInfoForwarded",
					LAYER_QUERYING_FORWARDED: "layerQueryingForwarded",
					LAYER_ADDED_TO_PANE: "layerAddedToPane",
					LAYER_REMOVED_FROM_PANE: "layerRemovedFromPane"
				},

				actions: {
					ADD_LAYER: "addLayer",
					REMOVE_LAYER: "removeLayer",
					CHANGE_BASE_LAYER: "changeBaseLayer",
					SET_CENTER: "setCenter",
					SET_ZOOM: "setZoom",
					GOT_ZOOM: "gotZoom",
					GET_ZOOM: "getZoom",
					SET_CENTER_AND_ZOOM: "setCenterAndZoom",
					FIT_BOUNDS: "fitBounds",
					LAYER_ADDED: "layerAdded",
					LAYER_REMOVED: "layerRemoved",
					BASE_LAYER_CHANGED: "baseLayerChanged",
					MOVE_START: "moveStart",
					CENTER_SET: "centerSet",
					ZOOM_SET: "zoomSet",
					BBOX_CHANGED: "bBoxChanged",
					POPUP_OPENED: 'popupOpened',
					POPUP_CLOSED: "popupClosed",
					MAP_CLICKED: "mapClicked",
					CLOSE_POPUP: "closePopup",
					ADD_BUTTON: "addButton",
					LAYER_LOADING: "layerLoading",
					LAYER_LOADED: "layerLoaded",
					REORDER_LAYERS: "reorderLayers",
					ZOOM_START: "zoomStart",
					LAYER_INFO: "layerInfo",
					LAYER_INFO_FORWARDED: "layerInfoForwarded",
					LAYER_QUERYING: "layerQuerying",
					LAYER_QUERYING_FORWARDED: "layerQueryingForwarded",
					LAYER_ADDED_FORWARDED: "layerAddedForwarded",
					LAYER_ADDED_CONFIRMED: "layerAddedConfirmed",
					LAYER_REMOVED_FORWARDED: "layerRemovedForwarded",
					LAYER_REMOVED_CONFIRMED: "layerRemovedConfirmed",
					SET_QUERYABLE_CURSOR: "setQueryableCursor",
					MAP_SHOWN: "mapShown",
					MAP_HIDDEN: "mapHidden",
					CLEAR: 'clear'
				},

				ownChannel: "map",

				defaultCenter: [28.3, -16.0],
				defaultZoom: 7,
				initialBounds: [[27.3, -18.3], [29.5, -13.1]],

				minZoom: 1,
				maxZoom: 21,

				_overlayLayers: {},
				_optionalLayerKeys: [],
				_baseLayerKeys: [],
				_baseLayerInstances: {}
			};

			lang.mixin(this, this.config, args);
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.getChannel("ADD_LAYER"),
				callback: "_subAddLayer"
			},{
				channel : this.getChannel("REMOVE_LAYER"),
				callback: "_subRemoveLayer"
			},{
				channel : this.getChannel("CHANGE_BASE_LAYER"),
				callback: "_subChangeBaseLayer"
			},{
				channel : this.getChannel("SET_CENTER"),
				callback: "_subSetCenter"
			},{
				channel : this.getChannel("SET_ZOOM"),
				callback: "_subSetZoom"
			},{
				channel : this.getChannel("GET_ZOOM"),
				callback: "_subGetZoom"
			},{
				channel : this.getChannel("SET_CENTER_AND_ZOOM"),
				callback: "_subSetCenterAndZoom"
			},{
				channel : this.getChannel("FIT_BOUNDS"),
				callback: "_subFitBounds"
			},{
				channel : this.getChannel("CLOSE_POPUP"),
				callback: "_subClosePopup"
			},{
				channel : this.getChannel("ADD_BUTTON"),
				callback: "_subAddButton"
			},{
				channel : this.getChannel("LAYER_LOADING"),
				callback: "_subLayerLoading"
			},{
				channel : this.getChannel("LAYER_LOADED"),
				callback: "_subLayerLoaded"
			},{
				channel : this.getChannel("REORDER_LAYERS"),
				callback: "_subReorderLayers"
			},{
				channel : this.getChannel("LAYER_ADDED_FORWARDED"),
				callback: "_subLayerAddedForwarded"
			},{
				channel : this.getChannel("LAYER_REMOVED_FORWARDED"),
				callback: "_subLayerRemovedForwarded"
			},{
				channel : this.getChannel("LAYER_QUERYING_FORWARDED"),
				callback: "_subLayerQueryingForwarded"
			},{
				channel : this.getChannel("LAYER_INFO_FORWARDED"),
				callback: "_subLayerInfoForwarded"
			},{
				channel : this.getChannel("SET_QUERYABLE_CURSOR"),
				callback: "_subSetQueryableCursor"
			},{
				channel : this.getChannel('CLEAR'),
				callback: '_subClear'
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'LAYER_ADD',
				channel: this.getChannel("LAYER_ADDED")
			},{
				event: 'LAYER_REMOVE',
				channel: this.getChannel("LAYER_REMOVED"),
				callback: "_pubLayerRemoved"
			},{
				event: 'LAYER_REMOVE_FAIL',
				channel: this.getChannel("LAYER_REMOVED"),
				callback: "_pubLayerRemoveFailed"
			},{
				event: 'BASE_LAYER_CHANGE',
				channel: this.getChannel("BASE_LAYER_CHANGED")
			},{
				event: 'BASE_LAYER_CHANGE_FAIL',
				channel: this.getChannel("BASE_LAYER_CHANGED"),
				callback: "_pubBaseLayerChangeFailed"
			},{
				event: 'MOVE_START',
				channel: this.getChannel("MOVE_START")
			},{
				event: 'PAN',
				channel: this.getChannel("CENTER_SET"),
				callback: "_pubCenterSet"
			},{
				event: 'GOT_ZOOM',
				channel: this.getChannel("GOT_ZOOM")
			},{
				event: 'ZOOM_START',
				channel: this.getChannel("ZOOM_START")
			},{
				event: 'ZOOM_END',
				channel: this.getChannel("ZOOM_SET"),
				callback: "_pubZoomSet"
			},{
				event: 'BBOX_CHANGE',
				channel: this.getChannel("BBOX_CHANGED"),
				callback: "_pubBBoxChanged"
			},{
				event: 'POPUP_OPEN',
				channel: this.getChannel('POPUP_OPENED')
			},{
				event: 'POPUP_CLOSE',
				channel: this.getChannel("POPUP_CLOSED")
			},{
				event: 'CLICK',
				channel: this.getChannel("MAP_CLICKED")
			},{
				event: 'LAYER_ADDED_FORWARDED',
				channel: this.getChannel("LAYER_ADDED_CONFIRMED")
			},{
				event: 'LAYER_REMOVED_FORWARDED',
				channel: this.getChannel("LAYER_REMOVED_CONFIRMED")
			},{
				event: 'LAYER_QUERYING_FORWARDED',
				channel: this.getChannel("LAYER_QUERYING")
			},{
				event: 'LAYER_INFO_FORWARDED',
				channel: this.getChannel("LAYER_INFO")
			},{
				event: 'ME_OR_ANCESTOR_SHOWN',
				channel: this.getChannel('MAP_SHOWN')
			},{
				event: 'ME_OR_ANCESTOR_HIDDEN',
				channel: this.getChannel('MAP_HIDDEN')
			});
		},

		_changeBaseLayer: function(layerId) {

			if (!layerId || !layerId.length) {
				this._emitEvt('BASE_LAYER_CHANGE_FAIL', layerId);
				return;
			}

			var layerInstance = this._baseLayerInstances[layerId];
			if (!layerInstance) {
				layerInstance = this._createBaseLayer(layerId);
				if (!layerInstance) {
					return;
				}
			}

			this._cleanOtherBaseLayers(layerInstance);
			this.addLayer(layerInstance, layerId);
		},

		_createBaseLayer: function(layerId) {

			var layerInstance = this._getStaticLayerInstance(layerId);

			if (!layerInstance) {
				this._emitEvt('BASE_LAYER_CHANGE_FAIL', layerId);
				return;
			}

			this._baseLayerInstances[layerId] = layerInstance;

			var layerLabel = this._getStaticLayerLabel(layerId);

			this._addLayerToSelector(layerInstance, layerLabel);

			return layerInstance;
		},

		_cleanOtherBaseLayers: function(layerInstance) {

			for (var key in this._baseLayerInstances) {
				var mapLayerInstance = this._baseLayerInstances[key];
				if (this.hasLayer(mapLayerInstance) && mapLayerInstance !== layerInstance) {
					this.removeLayer(mapLayerInstance);
				}
			}
		},

		_subAddLayer: function(req) {

			this._addMapLayer(req);
		},

		_addMapLayer: function(obj) {

			var layer = obj.layer;

			if (!layer) {
				console.error('Tried to add invalid layer to map "%s"', this.getChannel());
				return;
			}

			var optional = obj.optional,
				order = obj.order ? obj.order + 1 : null,
				layerId = this._getLayerId(obj) || uuid.v4(),
				layerLabel = obj.layerLabel || layerId;

			// Si la capa es un módulo
			if (layer.isInstanceOf && layer.isInstanceOf(_Module)) {
				layer = layer.layer;

				// Si no contiene una capa de tipo leaflet (D3, por ejemplo)
				if (layerId && !layer) {
					this._emitEvt('LAYER_ADD', {
						layer: obj.layer,
						mapInstance: this.map
					});
				}

				if (!layer) {
					return;
				}
			}

			this.addLayer(layer, layerId);

			if (optional) {
				this._addLayerToSelector(layer, layerLabel, true);
			}

			if (!this._overlayLayers[layerId]) {
				this._overlayLayers[layerId] = {
					instance: layer,
					optional: !!optional
				};
			} else {
				this._setLayerZIndex(layer, this._overlayLayers[layerId].order);
			}

			if (order) {
				this._overlayLayers[layerId].order = order;
				this._setLayerZIndex(layer, order);
			}
		},

		_getLayerId: function(layerObj) {

			if (!layerObj) {
				return;
			}

			if (layerObj.layerId) {
				return layerObj.layerId;
			}

			if (layerObj.layer) {
				return this._getLayerId(layerObj.layer) || layerObj.id;
			}

			return layerObj._leaflet_id || (layerObj.options && layerObj.options.id);
		},

		_subRemoveLayer: function(obj) {

			var layer = obj.layer,
				keepInstance = obj.keepInstance,
				layerId;

			if (typeof layer === 'object') {
				if (layer.isInstanceOf && layer.isInstanceOf(_Module)) {
					layer = layer.layer;
				}

				layerId = this._getLayerId(obj);

				// Si no contiene una capa de tipo leaflet (D3, por ejemplo)
				if (!layer) {
					this._emitEvt('LAYER_REMOVE', {
						layer: obj.layer,
						layerId: layerId
					});
					return;
				}
			} else {
				layerId = layer;
			}

			if (layerId === undefined) {
				this.removeLayer(layer);
			} else if (this._overlayLayers[layerId]) {
				this._removeMapLayer(layerId, keepInstance);
			} else if (this._baseLayerInstances[layerId]) {
				this._removeMapBaseLayer(layerId, keepInstance);
			} else {
				this._emitEvt('LAYER_REMOVE_FAIL', layer);
			}
		},

		_removeMapLayer: function(layerId, keepInstance) {

			var layerObj = this._overlayLayers[layerId],
				layer = layerObj.instance,
				order = layerObj.order;

			if (!keepInstance && order) {
				for (var key in this._overlayLayers) {
					var layerObject = this._overlayLayers[key];

					if (layerObject.order > order) {
						layerObject.order--;
						this._setLayerZIndex(layerObject.instance, layerObject.order);
					}
				}
			}

			if (!keepInstance) {
				delete this._overlayLayers[layerId];
			}

			if (layerObj.optional) {
				this._removeLayerFromSelector(layer);
			}

			this.removeLayer(layer);
		},

		_removeMapBaseLayer: function(layerId, keepInstance) {

			var layerInstance = this._baseLayerInstances[layerId];

			if (!keepInstance) {
				delete this._baseLayerInstances[layerId];
			}

			this._removeLayerFromSelector(layerInstance);
			this.removeLayer(layerInstance);
		},

		_subChangeBaseLayer: function(req) {

			this._changeBaseLayer(req.layer);
		},

		_subSetCenter: function(req) {

			var latLng = req.center,
				options = req.options;

			if (!latLng) {
				return;
			}

			this.panTo(latLng, options);
		},

		_subSetZoom: function(req) {

			var zoomLevel = req.zoom,
				options = req.options;

			if (isNaN(zoomLevel)) {
				return;
			}

			this.setZoom(zoomLevel, options);
		},

		_subGetZoom: function() {

			this._emitEvt('GOT_ZOOM', {
				zoom: this.getZoom()
			});
		},

		_subSetCenterAndZoom: function(req) {

			if (!req) {
				return;
			}

			var latLng = req.center,
				zoomLevel = req.zoom,
				options = req.options;

			this.setView(latLng, zoomLevel, options);
		},

		_subFitBounds: function(req) {

			var bounds = req.bounds,
				options = req.options;

			if (!bounds) {
				return;
			}

			this.fitBounds(bounds, options);
		},

		_subClosePopup: function() {

			this.closePopup();
		},

		_subAddButton: function(request) {

			var button = request.button,
				append = request.append;

			this.addButton(button, append);
		},

		_subLayerLoading: function() {

			this._emitEvt('LOADING');
		},

		_subLayerLoaded: function() {

			this._emitEvt('LOADED');
		},

		_subReorderLayers: function(request) {

			var layerId = request.layerId,
				layerObj = this._overlayLayers[layerId],
				newPosition = request.newPosition + 1,
				oldPosition = request.oldPosition + 1,
				diff = newPosition - oldPosition,
				key, layerObject;

			if (diff < 0) {
				for (key in this._overlayLayers) {
					layerObject = this._overlayLayers[key];

					if (layerObject.order >= newPosition && layerObject.order < oldPosition) {
						layerObject.order++;
						this._setLayerZIndex(layerObject.instance, layerObject.order);
					}
				}

				layerObj.order -= Math.abs(diff);
				this._setLayerZIndex(layerObj.instance, layerObj.order);
			} else {
				for (key in this._overlayLayers) {
					layerObject = this._overlayLayers[key];

					if (layerObject.order <= newPosition && layerObject.order > oldPosition) {
						layerObject.order--;
						this._setLayerZIndex(layerObject.instance, layerObject.order);
					}
				}

				layerObj.order += Math.abs(diff);
				this._setLayerZIndex(layerObj.instance, layerObj.order);
			}
		},

		_subLayerAddedForwarded: function(res) {

			this._emitEvt('LAYER_ADDED_FORWARDED', res);
		},

		_subLayerRemovedForwarded: function(res) {

			this._emitEvt('LAYER_REMOVED_FORWARDED', res);
		},

		_subLayerQueryingForwarded: function(res) {

			this._emitEvt('LAYER_QUERYING_FORWARDED', res);
		},

		_subLayerInfoForwarded: function(res) {

			this._emitEvt('LAYER_INFO_FORWARDED', res);
		},

		_subSetQueryableCursor: function(req) {

			if (req.enable) {
				this._addQueryableCursor();
			} else {
				this._removeQueryableCursor();
			}
		},

		_subClear: function() {

			this.clear();
		},

		_pubLayerRemoveFailed: function(channel, layer) {

			this._publish(channel, {
				success: false,
				errorCode: 1,
				layer: layer
			});
		},

		_pubLayerRemoved: function(channel, evt) {

			evt.success = true;
			this._publish(channel, evt);
		},

		_pubBaseLayerChangeFailed: function(channel, layerId) {

			this._publish(channel, {
				success: false,
				layerId: layerId
			});
		},

		_pubCenterSet: function(channel) {

			this._publish(channel, {
				latLng: this.getCenter()
			});
		},

		_pubZoomSet: function(channel, evt) {

			var newZoom = evt.target._zoom;

			if (newZoom !== this._zoomValue) {
				this._publish(channel, {
					zoom: evt.target._zoom
				});

				this._zoomValue = newZoom;
			}
		},

		_pubBBoxChanged: function(channel) {

			var bbox = this.getBounds(),
				newBboxData = {
					lat1: bbox._northEast.lat,
					lng1: bbox._northEast.lng,
					lat2: bbox._southWest.lat,
					lng2: bbox._southWest.lng
				};

			if (!this._bboxValue || this._bboxIsDifferent(newBboxData, this._bboxValue)) {
				this._publish(channel, {
					bbox: bbox
				});

				this._bboxValue = newBboxData;
			}
		},

		_bboxIsDifferent: function(bbox1, bbox2) {

			return !(bbox1.lat1 === bbox2.lat1 && bbox1.lng1 === bbox2.lng1 &&
				bbox1.lat2 === bbox2.lat2 && bbox1.lng2 === bbox2.lng2);
		},

		_loadBaseLayers: function() {

			if (!this._baseLayerKeys.length) {
				this._baseLayerKeys = this._getBaseLayers();
			}

			for (var i = 0; i < this._baseLayerKeys.length; i++) {
				var baseLayerKey = this._baseLayerKeys[i];
				this._changeBaseLayer(baseLayerKey);
			}
			this._changeBaseLayer(this._baseLayerKeys[0]);
		},

		_loadOptionalLayers: function() {

			if (!this._optionalLayerKeys.length) {
				this._optionalLayerKeys = this._getOptionalLayers();
			}

			for (var i = 0; i < this._optionalLayerKeys.length; i++) {
				var optionalLayerKey = this._optionalLayerKeys[i];
				this._addMapLayer({
					layer: this._getStaticLayerInstance(optionalLayerKey),
					layerId: optionalLayerKey,
					optional: true
				});
			}
		},

		_isBaseLayer: function(layerId) {

			return this._baseLayerKeys.indexOf(layerId) !== -1;
		},

		clear: function() {

			this._clearLayers();
			this._changeBaseLayer(this._baseLayerKeys[0]);
			this._loadOptionalLayers();
			this._resetMapPosition();
		},

		_clearLayers: function() {

			for (var key in this._overlayLayers) {
				this._removeMapLayer(key);
			}
		},

		_resetMapPosition: function() {

			if (this._mapPositionAlreadyReset) {
				this.fitBounds(this.initialBounds, { animate: false });
				return;
			}

			this.setView(this.defaultCenter, this.defaultZoom);
			this._mapPositionAlreadyReset = true;
		},

		_getShownOrHiddenResponseObject: function() {

			return {
				success: true,
				instance: this._getMapInstance()
			};
		}

	});
});
