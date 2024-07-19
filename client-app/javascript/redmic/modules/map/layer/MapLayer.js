define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Store"
	, "./_MapLayerItfc"
], function(
	declare
	, lang
	, _Module
	, _Store
	, _MapLayerItfc
){
	return declare([_Module, _MapLayerItfc, _Store], {
		//	summary:
		//		Módulo de capa para un mapa.
		//	description:
		//		Permite trabajar con una capa de mapa sobre el módulo Map.

		constructor: function(args) {

			this.config = {
				target: null,
				idProperty: "id",
				bounds: null,
				_mapInstance: null,
				_errorData: 0,
				events: {
					ADD_LAYER: "addLayer",
					LAYER_ADDED: "layerAdded",
					REMOVE_LAYER: "removeLayer",
					LAYER_REMOVED: "layerRemoved",
					CLICK: "click",
					PRE_CLICK: "preClick",
					MOUSE_OVER: "mouseOver",
					FIT_BOUNDS: "fitBounds",
					SET_CENTER: "setCenter",
					LAYER_LOADING: "layerLoading",
					LAYER_LOADED: "layerLoaded",
					LAYER_LEGEND: "layerLegend",
					POPUP_LOADED: 'popupLoaded'
				},
				actions: {
					CLEAR: "clear",
					CHANGE_TARGET: "changeTarget",
					ADD_LAYER: "addLayer",
					REMOVE_LAYER: "removeLayer",
					ADD_DATA: "addData",
					POPUP_CLOSED: "popupClosed",
					POPUP_LOADED: 'popupLoaded',
					MAP_CLICKED: "mapClicked",
					LAYER_LOADING: "layerLoading",
					LAYER_LOADED: "layerLoaded",
					LAYER_LEGEND: "layerLegend",
					LAYER_ADDED: "layerAdded",
					LAYER_ADDED_FORWARDED: "layerAddedForwarded",
					LAYER_REMOVED: "layerRemoved",
					LAYER_REMOVED_FORWARDED: "layerRemovedForwarded",
					DELETE_INSTANCE: "deleteInstance",
					ANIMATE_MARKER: "animateMarker",
					FIT_BOUNDS: "fitBounds",
					SET_CENTER: "setCenter",
					MAP_SHOWN: "mapShown",
					MAP_HIDDEN: "mapHidden"
				}
			};

			lang.mixin(this, this.config, args);
		},

		_defineSubscriptions: function() {

			if (!this.mapChannel) {
				console.error("Map channel not defined for layer '%s'", this.getChannel());
			}

			this.subscriptionsConfig.push({
				channel : this.getChannel("DELETE_INSTANCE"),
				callback: "_subDeleteInstance"
			},{
				channel : this.getChannel("CLEAR"),
				callback: "_subClear"
			},{
				channel : this.getChannel("CHANGE_TARGET"),
				callback: "_subChangeTarget"
			},{
				channel : this.getChannel("ADD_DATA"),
				callback: "_subAddData"
			},{
				channel : this.getChannel("ANIMATE_MARKER"),
				callback: "_subAnimateMarker"
			},{
				channel : this._buildChannel(this.mapChannel, this.actions.LAYER_ADDED),
				callback: "_subLayerAdded",
				options: {
					predicate: this._chkLayerIsMe
				}
			},{
				channel : this._buildChannel(this.mapChannel, this.actions.LAYER_REMOVED),
				callback: "_subLayerRemoved",
				options: {
					predicate: this._chkLayerIsMe
				}
			},{
				channel : this.getChannel("SET_CENTER"),
				callback: "_subSetCenter"
			},{
				channel : this._buildChannel(this.mapChannel, this.actions.MAP_SHOWN),
				callback: "_subMapShown"
			},{
				channel : this._buildChannel(this.mapChannel, this.actions.MAP_HIDDEN),
				callback: "_subMapHidden"
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'ADD_LAYER',
				channel: this._buildChannel(this.mapChannel, this.actions.ADD_LAYER)
			},{
				event: 'REMOVE_LAYER',
				channel: this._buildChannel(this.mapChannel, this.actions.REMOVE_LAYER)
			},{
				event: 'LAYER_LOADING',
				channel: this._buildChannel(this.mapChannel, this.actions.LAYER_LOADING)
			},{
				event: 'LAYER_LOADED',
				channel: this._buildChannel(this.mapChannel, this.actions.LAYER_LOADED)
			},{
				event: 'LAYER_LEGEND',
				channel: this.getChannel("LAYER_LEGEND")
			},{
				event: 'LAYER_ADDED',
				channel: this.getChannel("LAYER_ADDED")
			},{
				event: 'LAYER_ADDED',
				channel: this._buildChannel(this.mapChannel, this.actions.LAYER_ADDED_FORWARDED)
			},{
				event: 'LAYER_REMOVED',
				channel: this.getChannel("LAYER_REMOVED")
			},{
				event: 'LAYER_REMOVED',
				channel: this._buildChannel(this.mapChannel, this.actions.LAYER_REMOVED_FORWARDED)
			},{
				event: 'SET_CENTER',
				channel: this._buildChannel(this.mapChannel, this.actions.SET_CENTER)
			},{
				event: 'FIT_BOUNDS',
				channel: this._buildChannel(this.mapChannel, this.actions.FIT_BOUNDS)
			},{
				event: 'POPUP_LOADED',
				channel: this.getChannel('POPUP_LOADED')
			});
		},

		_subSetCenter: function(req) {

			this._setCenter(req);
		},

		_subClear: function() {

			this.clear();
		},

		_updateTarget: function(obj) {

			if (!this.associatedIds) {// If associatedIds los datos no los trae este módulo
				this._redraw();
			}
		},

		// TODO: Cambiar por canal updateTarget de _store
		_subChangeTarget: function(obj) {

			this._changeTarget(obj);
		},

		_changeTarget: function(obj) {

			this.target = obj.target || this.target;
		},

		_subAddData: function(request) {

			this.addData(request.data);
		},

		_subLayerAdded: function(response) {

			// TODO quizá sea mejor retrasar la carga de la leyenda, bajo petición
			this._getLayerLegend(response.extraInfo);
			this._mapInstance = response.mapInstance;

			this._publish(this.getChannel('CONNECT'), {
				actions: ['LAYER_REMOVED', 'MAP_SHOWN', 'MAP_HIDDEN']
			});
			this._publish(this.getChannel('DISCONNECT'), {
				actions: ['LAYER_ADDED']
			});

			this._afterLayerAdded(response);
			this._emitEvt('LAYER_ADDED', this._getLayerInfoToPublish(response));
		},

		_subLayerRemoved: function(response) {

			this._mapInstance = null;

			this._publish(this.getChannel('DISCONNECT'), {
				actions: ['LAYER_REMOVED', 'MAP_SHOWN', 'MAP_HIDDEN']
			});
			this._publish(this.getChannel('CONNECT'), {
				actions: ['LAYER_ADDED']
			});

			this._afterLayerRemoved(response);
			this._emitEvt('LAYER_REMOVED', this._getLayerInfoToPublish(response));
		},

		_subAnimateMarker: function(req) {

			this._animateMarker(req);
		},

		_getLayerInfoToPublish: function(res) {

			return {
				layerId: this.layerId,
				layerLabel: this.layerLabel
			};
		},

		_getLayerLegendToPublish: function(legend) {

			return {
				layerId: this.layerId,
				layerLabel: this.layerLabel,
				legend: legend
			};
		},

		_dataAvailable: function(response) {

			this.clear();
			this._addNewData(response.data, this);
			this._emitEvt('LAYER_LOADED');

			this._resolveLoadedByErrorData();
		},

		_errorAvailable: function(error) {

			this._errorData++;
		},

		_resolveLoadedByErrorData: function(response) {

			while (this._errorData !== 0) {
				this._errorData--;
				this._emitEvt('LAYER_LOADED');
			}
		},

		_chkLayerIsMe: function(response) {

			var layerAddedId = response.layer.ownChannel || response.layer._leaflet_id || response.layerId;

			return layerAddedId === this.getOwnChannel();
		},

		_chkLayerAdded: function() {

			return !!(this.layer && this.layer._map) || !!this._mapInstance;
		},

		_subDeleteInstance: function(response) {

			this._emitEvt('REMOVE_LAYER', {layer: this.layer});
		},

		_subMapShown: function(response) {

			this._onMapShown(response);
		},

		_subMapHidden: function(response) {

			this._onMapHidden(response);
		}
	});
});
