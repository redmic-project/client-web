define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'leaflet'
	, 'src/component/map/widget/_LeafletLayersSelector'
	, 'src/component/map/widget/_LeafletMeasureTools'
	, 'src/component/map/widget/_LeafletMiniMap'
	, 'src/component/map/widget/_LeafletTimeDimension'

	, 'awesome-markers'
	, 'L-coordinates'
	, 'L-navBar'
], function(
	declare
	, lang
	, L
	, _LeafletLayersSelector
	, _LeafletMeasureTools
	, _LeafletMiniMap
	, _LeafletTimeDimension
) {

	return declare([_LeafletLayersSelector, _LeafletMeasureTools, _LeafletMiniMap, _LeafletTimeDimension], {
		//	summary:
		//		Incluye y configura widgets para Leaflet.
		//	description:
		//		Complementa a la implementación de mapa Leaflet con widgets que amplían su funcionalidad.

		constructor: function(args) {

			this.config = {
				zoomControl: true,
				coordinatesViewer: true,
				navBar: true,
				scaleBar: true
			};

			lang.mixin(this, this.config, args);
		},

		_addMapWidgets: function() {

			this._addZoomControl();
			this._addCoordinatesViewer();
			this._addNavBar();
			this._addScaleBar();
		},

		_addZoomControl: function() {

			if (!this.zoomControl) {
				return;
			}

			L.control.zoom({
				zoomInTitle: this.i18n.leafletZoomInButton,
				zoomOutTitle: this.i18n.leafletZoomOutButton
			}).addTo(this.map);
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

			L.control.navbar({
				homeTitle: this.i18n.leafletHomeButton,
				forwardTitle: this.i18n.leafletForwardButton,
				backTitle: this.i18n.leafletBackButton
			}).addTo(this.map);
		},

		_addScaleBar: function() {

			if (!this.scaleBar) {
				return;
			}

			L.control.scale({
				position: 'bottomright',
				imperial: false
			}).addTo(this.map);
		}
	});
});
