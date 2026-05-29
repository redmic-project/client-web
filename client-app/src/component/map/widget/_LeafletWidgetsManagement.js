define([
	'dojo/_base/declare'
	, 'leaflet'
	, 'src/component/map/widget/_LeafletLayersSelector'
	, 'src/component/map/widget/_LeafletMeasureTools'
	, 'src/component/map/widget/_LeafletMiniMap'
	, 'src/component/map/widget/_LeafletTimeDimension'

], function(
	declare
	, L
	, _LeafletLayersSelector
	, _LeafletMeasureTools
	, _LeafletMiniMap
	, _LeafletTimeDimension
) {

	// Cargar extensiones de Leaflet de forma estática después de que L esté disponible para corregir compilado
	require([
		'awesome-markers'
		, 'L-coordinates'
		, 'L-navBar'
	]);

	return declare([_LeafletLayersSelector, _LeafletMeasureTools, _LeafletMiniMap, _LeafletTimeDimension], {
		// summary:
		//   Incluye y configura widgets para Leaflet.
		// description:
		//   Complementa a la implementación de mapa Leaflet con widgets que amplían su funcionalidad.

		postMixInProperties: function() {

			const defaultConfig = {
				zoomControl: true,
				coordinatesViewer: true,
				navBar: true,
				scaleBar: true
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_prepareAddMapWidgets: function() {
			// summary:
			//   Requiere dependencias que necesitan la variable L disponible, asegurando que Leaflet ya esté cargado.

			require([
				'awesome-markers'
				, 'L-coordinates'
				, 'L-navBar'
			], () => this._addMapWidgets());
		},

		_addMapWidgets: function() {

			this.zoomControl && this._addZoomControl();
			this.coordinatesViewer && this._addCoordinatesViewer();
			this.navBar && this._addNavBar();
			this.scaleBar && this._addScaleBar();

			this.inherited(arguments);
		},

		_addZoomControl: function() {

			L.control.zoom({
				zoomInTitle: this.i18n.leafletZoomInButton,
				zoomOutTitle: this.i18n.leafletZoomOutButton
			}).addTo(this.map);
		},

		_addCoordinatesViewer: function() {

			const icon = L.AwesomeMarkers.icon({
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
					icon
				}
			}).addTo(this.map);
		},

		_addNavBar: function() {

			L.control.navbar({
				homeTitle: this.i18n.leafletHomeButton,
				forwardTitle: this.i18n.leafletForwardButton,
				backTitle: this.i18n.leafletBackButton
			}).addTo(this.map);
		},

		_addScaleBar: function() {

			L.control.scale({
				position: 'bottomright',
				imperial: false
			}).addTo(this.map);
		}
	});
});
