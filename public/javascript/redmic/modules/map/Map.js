define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/map/OpenLayers"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Show"
	, "./_MapItfc"
], function(
	declare
	, lang
	, OpenLayers
	, _Module
	, _Show
	, _MapItfc
){
	return declare([_Module, _MapItfc, _Show], {
		//	summary:
		//		Módulo de Map.
		//	description:
		//		Permite trabajar con un mapa para representar datos geográficos.
		//		Escucha y publica a través de Mediator.

		//	config: Object
		//		Opciones y asignaciones por defecto.


		constructor: function(args) {

			this.config = {
				events: {
					LAYER_ADD: "layerAdd",
					LAYER_ADD_FAIL: "layerAddFail",
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
					LAYER_REMOVED_FROM_PANE: "layerRemovedFromPane"/*,
					DRAGEND: "dragEnd"*/
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
					MAP_HIDDEN: "mapHidden"
				},

				ownChannel: "map",

				baseLayers: [
					['eoc-map', 'eoc-overlay'],
					'topografico',
					'ortofoto'
				],
				defaultBaseLayer: 0,
				_relatedBaseLayers: {}
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
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'LAYER_ADD',
				channel: this.getChannel("LAYER_ADDED")
				//callback: "_pubLayerAdded"
			},{
				event: 'LAYER_ADD_FAIL',
				channel: this.getChannel("LAYER_ADDED"),
				callback: "_pubLayerAddFailed"
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
				channel: this.getChannel("BASE_LAYER_CHANGED"),
				callback: "_pubBaseLayerChanged"
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

		_changeBaseLayer: function(layer, layerGroup) {

			var layerInstance,
				layerLabel;

			if (typeof layer === "object" && layer instanceof Array) {
				for (var i = 0; i < layer.length; i++) {
					this._changeBaseLayer(layer[i], layer);
				}
			} else {
				if (!(layer && layer.length)) {
					this._emitEvt('BASE_LAYER_CHANGE_FAIL', layer);
					return;
				}

				var layerIsGroupLeader = layerGroup && layerGroup.indexOf(layer) === 0;

				if (layerIsGroupLeader) {
					this._relatedBaseLayers[layer] = layerGroup;
				}

				var layerObj = OpenLayers.get(layer);
				layerInstance = layerObj.instance;
				if (layerGroup && !layerIsGroupLeader) {
					layerLabel = '';
				} else {
					layerLabel = layerObj.label;
				}
			}

			if (!layerInstance) {
				this._emitEvt('BASE_LAYER_CHANGE_FAIL', layer);
				return;
			}

			this._cleanBaseLayers(layerInstance, layerGroup);
			this._addBaseLayer(layerInstance, layer, layerLabel);
		},

		_cleanBaseLayers: function(layer, layerGroup) {
			// Limpiamos del mapa todas las capas base que no sean la nueva (si estuviera)

			for (var key in this.layers) {
				if (layerGroup && layerGroup.indexOf(key) !== -1) {
					continue;
				}

				var layerObj = this.layers[key];

				if (!layerObj || !this._isBaseLayer(layerObj)) {
					continue;
				}

				var mapLayer = layerObj.layer;
				if (this.hasLayer(mapLayer) && mapLayer !== layer) {
					this.removeLayer(mapLayer);
				}
			}
		},

		_isBaseLayer: function(layerObj) {

			return layerObj.type === this.layerTypes.base;
		},

		_isForcedLayer: function(layerObj) {

			return layerObj.type === this.layerTypes.forced;
		},

		_isOptionalLayer: function(layerObj) {

			return layerObj.type === this.layerTypes.optional;
		},

		_addBaseLayer: function(layerInstance, layerId, layerLabel) {

			if (!this._existsBaseLayer(layerId)) {
				this.layers[layerId] = {
					layer: layerInstance,
					type: this.layerTypes.base,
					order: 1
				};
				this.addLayer(layerInstance, layerId);
				this.controlLayers.addBaseLayer(layerInstance, layerLabel);
			} else {
				var previousBaseLayer = this._getExistingBaseLayer(layerId);
				if (previousBaseLayer) {
					this.addLayer(previousBaseLayer);
				} else {
					// Se buscaba una baselayer que no existia anteriormente
					// TODO esto no debería publicar un BASE_LAYER_CHANGE_FAIL??
					this._emitEvt('BASE_LAYER_CHANGE', layerInstance);
				}
			}
		},

		_existsBaseLayer: function(layerId) {

			if (this.layers.hasOwnProperty(layerId) && this._isBaseLayer(this.layers[layerId])) {
				return true;
			}

			return false;
		},

		_getExistingBaseLayer: function(layerId) {

			if (!this.controlLayers) {
				return;
			}

			var previousBaseLayers = this.controlLayers._layers;

			for (var key in previousBaseLayers) {
				var baseLayer = previousBaseLayers[key].layer;

				if (baseLayer && baseLayer._leaflet_id === layerId) {
					return baseLayer;
				}
			}
		},

		_subAddLayer: function(obj) {

			var layer = obj.layer;

			if (!layer) {
				console.error('Tried to add invalid layer to map "%s"', this.getChannel());
				return;
			}

			var optional = obj.optional,
				order = obj.order ? obj.order + 1 : null,
				layerId = obj.layerId || layer.id || null,
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

			var type;

			if (optional) {
				type = this.layerTypes.optional;
				this.controlLayers.addOverlay(layer, layerLabel);
			} else {
				type = this.layerTypes.forced;
			}

			if (!this._hasLayer(layerId)) {
				this.layers[layerId] = {
					layer: layer,
					type: type
				};
			} else {
				this._setLayerZIndex(layer, this.layers[layerId].order);
			}

			if (order) {
				this.layers[layerId].order = order;
				this._setLayerZIndex(layer, order);
			}
		},

		_hasLayer: function(layerId) {

			if (this.layers.hasOwnProperty(layerId)) {
				return true;
			}

			return false;
		},

		_subRemoveLayer: function(obj) {

			var layer = obj.layer,
				keepInstance = obj.keepInstance,
				layerId;

			if (typeof layer === "object") {

				layerId = obj.layerId;

				if (layer.isInstanceOf && layer.isInstanceOf(_Module)) {
					layer = layer.layer;
				}

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
			} else if (this._hasLayer(layerId)) {
				this._removeLayer(layerId, this.layers[layerId], keepInstance);
			} else {
				this._emitEvt('LAYER_REMOVE_FAIL', layer);
			}
		},

		_removeLayer: function(layerId, layerObj, keepInstance) {

			var layer = layerObj.layer,
				order = layerObj.order;

			if (!this._isBaseLayer(layerObj) && !keepInstance && order) {
				for (var key in this.layers) {
					var layerObject = this.layers[key];

					if (layerObject.order > order) {
						layerObject.order--;
						this._setLayerZIndex(layerObject.layer, layerObject.order);
					}
				}
			}

			if (!keepInstance) {
				delete this.layers[layerId];
			}

			if (this._isOptionalLayer(layerObj) || this._isBaseLayer(layerObj)) {
				this.controlLayers.removeLayer(layer);
			}

			this.removeLayer(layer);
		},

		_subChangeBaseLayer: function(request) {

			this._changeBaseLayer(request.layer);
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
				layerObj = this.layers[layerId],
				newPosition = request.newPosition + 1,
				oldPosition = request.oldPosition + 1,
				diff = newPosition - oldPosition,
				key, layerObject;

			if (diff < 0) {
				for (key in this.layers) {
					layerObject = this.layers[key];

					if (layerObject.order >= newPosition && layerObject.order < oldPosition) {
						layerObject.order++;
						this._setLayerZIndex(layerObject.layer, layerObject.order);
					}
				}

				layerObj.order -= Math.abs(diff);
				this._setLayerZIndex(layerObj.layer, layerObj.order);
			} else {

				for (key in this.layers) {
					layerObject = this.layers[key];

					if (layerObject.order <= newPosition && layerObject.order > oldPosition) {
						layerObject.order--;
						this._setLayerZIndex(layerObject.layer, layerObject.order);
					}
				}

				layerObj.order += Math.abs(diff);
				this._setLayerZIndex(layerObj.layer, layerObj.order);
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

		_pubLayerAdded: function(channel, evt) {

			this._publish(channel, {
				success: true,
				layer: evt.layer
			});
		},

		_pubLayerAddFailed: function(channel, layer) {

			this._publish(channel, {
				success: false,
				errorCode: 1,
				layer: layer
			});

			this._emitEvt('ERROR', channel);
		},

		_pubLayerRemoved: function(channel, evt) {

			evt.success = true;
			this._publish(channel, evt);
		},

		_pubLayerRemoveFailed: function(channel, layer) {

			this._publish(channel, {
				success: false,
				errorCode: 1,
				layer: layer
			});

			this._emitEvt('ERROR', channel);
		},

		_pubBaseLayerChanged: function(channel, baseLayer) {

			var layerInstance = baseLayer.layer || baseLayer,
				layerId = layerInstance._leaflet_id,
				relatedLayerIds = this._relatedBaseLayers[layerId];

			if (relatedLayerIds) {
				this._changeBaseLayer(relatedLayerIds);
			}

			this.bringLayerToBack(layerInstance);

			this._emitEvt('TRACK', {
				type: TRACK.type.event,
				info: {
					category: TRACK.category.layer,
					action: TRACK.action.click,
					label: 'Basemap changed: ' + layerId
				}
			});

			this._publish(channel, {
				success: true,
				baseLayer: baseLayer
			});
		},

		_pubBaseLayerChangeFailed: function(channel, baseLayer) {

			this._publish(channel, {
				success: false,
				errorCode: 1,
				baseLayer: baseLayer
			});

			this._emitEvt('ERROR', channel);
		},

		_pubCenterSet: function(channel) {

			this._publish(channel, {
				success: true,
				latLng: this.getCenter()
			});
		},

		_pubZoomSet: function(channel, evt) {

			var newZoom = evt.target._zoom;

			if (newZoom !== this._zoomValue) {
				this._publish(channel, {
					success: true,
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

		_afterMapLoaded: function() {

			for (var i = 0; i < this.baseLayers.length; i++) {
				var baseLayer = this.baseLayers[i];
				this._changeBaseLayer(baseLayer);
			}
			this._changeBaseLayer(this.baseLayers[this.defaultBaseLayer]);
			this._addContainerListeners();
		},

		clear: function() {

			this._clearLayers();
			this._changeBaseLayer(this.baseLayers[this.defaultBaseLayer]);
			this._resetMapPosition();
		},

		_clearLayers: function() {

			for (var key in this.layers) {
				this._removeLayer(key, this.layers[key]);
			}
		},

		_resetMapPosition: function() {

			this.setView(this.extent, this.zoom);
		},

		_getShownOrHiddenResponseObject: function() {

			return {
				success: true,
				body: {
					instance: this._getMapInstance()
				}
			};
		}

	});
});
