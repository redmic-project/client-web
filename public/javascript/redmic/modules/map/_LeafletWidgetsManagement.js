define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/_base/kernel'
	, 'dojo/dom-class'
	, 'dojo/on'
	, 'leaflet/leaflet'
	, 'L-miniMap/Control.MiniMap.min'

	, 'awesome-markers/leaflet.awesome-markers.min'
	, 'L-coordinates/Leaflet.Coordinates-0.1.5.min'
	, 'L-navBar/Leaflet.NavBar'
	, 'leaflet-measure/leaflet-measure.min'
], function(
	declare
	, lang
	, kernel
	, domClass
	, on
	, L
	, MiniMap
) {

	return declare(null, {
		//	summary:
		//		Incluye y configura widgets para Leaflet.
		//	description:
		//		Complementa a la implementación de mapa Leaflet con widgets que amplían su funcionalidad.

		constructor: function(args) {

			this.config = {
				layersSelector: true,
				coordinatesViewer: true,
				navBar: true,
				miniMap: true,
				scaleBar: true,
				measureTools: true
			};

			lang.mixin(this, this.config, args);

			this._createNeededFromStartWidgets();
		},

		_createNeededFromStartWidgets: function() {

			if (this.layersSelector) {
				this._layersSelectorInstance = L.control.layers();
			}
		},

		_addMapWidgets: function() {

			this._addLayersSelector();
			this._addCoordinatesViewer();
			this._addNavBar();
			this._addMeasureTools();
			this._addMiniMap();
			this._addScaleBar();
		},

		_addLayersSelector: function() {

			if (!this._layersSelectorInstance) {
				return;
			}

			this._layersSelectorInstance.addTo(this.map);
			domClass.add(this._layersSelectorInstance._container.firstChild, 'fa-globe');
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
				position: 'bottomleft',
				enableUserInput: true,
				decimals: 5,
				decimalSeperator: ',',
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

			var baseLayer = this._getStaticLayerInstance('eoc-map');

			var miniMapConfig = {
				position: 'topright',
				collapsedWidth: 28,
				collapsedHeight: 28,
				toggleDisplay: true,
				minimized: true,
				strings: {
					showText: this.i18n.miniMapShowText,
					hideText: this.i18n.miniMapHideText
				}
			};

			var miniMap = new MiniMap(baseLayer, miniMapConfig);
			miniMap.addTo(this.map);

			// TODO workaround for https://github.com/Norkart/Leaflet-MiniMap/issues/114
			on(miniMap._miniMap._container, 'click', function(evt) { evt.stopPropagation(); });

			this.miniMapInstance = miniMap;
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

			this.map.on('measurestart', lang.hitch(this, function() {
				this._clickDisabled = true;
			}));
			this.map.on('measurefinish', lang.hitch(this, function() {
				this._clickDisabled = false;
			}));
		},

		_addScaleBar: function() {

			if (!this.scaleBar) {
				return;
			}

			L.control.scale({
				position: 'bottomright',
				imperial: false
			}).addTo(this.map);
		},

		_addLayerToSelector: function(layer, label, optional) {

			if (!this._layersSelectorInstance) {
				return;
			}

			var addMethod = !optional ? 'addBaseLayer' : 'addOverlay',
				layerLabel = this.i18n[label] || label;

			this._layersSelectorInstance[addMethod](layer, layerLabel);
		},

		_removeLayerFromSelector: function(layer) {

			if (!this._layersSelectorInstance) {
				return;
			}

			this._layersSelectorInstance.removeLayer(layer);
		},

		_onBaseLayerChangedFromControl: function(evt) {

			var layerInstance = evt.layer,
				layerId = layerInstance._leaflet_id;

			this._setLayerZIndex(layerInstance, 0);

			this._emitEvt('TRACK', {
				type: TRACK.type.event,
				info: {
					category: TRACK.category.layer,
					action: TRACK.action.click,
					label: 'Basemap changed: ' + layerId
				}
			});
		}
	});
});
