define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/base/_Selection"
	, "./_SelectableItfc"
], function(
	declare
	, lang
	, aspect
	, _Selection
	, _SelectableItfc
){
	return declare([_Selection, _SelectableItfc], {
		//	summary:
		//		Extensión de MapLayer para que sea capaz de seleccionar marcadores.
		//	description:
		//		Permite publicar y escuchar selecciones.

		constructor: function(args) {

			this.selectableConfig = {
				_selection: {},
				pathSeparator: '.',

				zIndexTop: 1000,
				zIndexBottom: 0,

				selectedMarkerColor: 'green',

				selectedMarkerIconName: 'star',
				selectedMarkerIconPrefix: 'fa',
				selectedMarkerIconSpin: false
			};

			lang.mixin(this, this.selectableConfig);

			aspect.after(this, '_initialize', lang.hitch(this, this._selectableInitialize));
		},

		_selectableInitialize: function() {

			aspect.after(this, '_onEachFeature', lang.hitch(this, this._selectableOnEachFeature), true);
		},

		_selectableOnEachFeature: function(feature, layer) {

			var featureId = feature[this.idProperty];

			this._selection[featureId] && this._selectMarker(featureId);
		},

		_getSelectedMarkerIconConfig: function() {

			return {
				markerColor: this.selectedMarkerColor,
				icon: this.selectedMarkerIconName,
				prefix: this.selectedMarkerIconPrefix,
				spin: this.selectedMarkerIconSpin
			};
		},

		_getSelectedStartMarkerIconConfig: function() {

			return {
				markerColor: this.selectedMarkerColor,
				icon: this.startMarkerIconName,
				prefix: this.startMarkerIconPrefix,
				spin: this.startMarkerIconSpin
			};
		},

		_getSelectedEndMarkerIconConfig: function() {

			return {
				markerColor: this.selectedMarkerColor,
				icon: this.endMarkerIconName,
				prefix: this.endMarkerIconPrefix,
				spin: this.endMarkerIconSpin
			};
		},

		_getSelectedIcon: function() {

			return this._getAwesomeIcon(this._getSelectedMarkerIconConfig());
		},

		_selectMarker: function(markerId) {

			var marker = this._getMarker(markerId);

			if (typeof markerId === 'object') {
				markerId = markerId.feature ? markerId.feature[this.idProperty] : markerId[this.idProperty];
			}

			if (markerId === undefined) {
				return;
			}

			if (marker && this._isMarkerSelectable(marker)) {
				this._selectExistingMarker(marker, markerId);
			} else {
				this._selectNonexistingMarker(markerId);
			}
		},

		_selectExistingMarker: function(marker, id) {

			var feature = marker.feature,
				geometryType = 'Point';

			if (feature && feature.geometry) {
				geometryType = feature.geometry.type;
			}

			marker.selected = true;

			if (geometryType === 'Point') {
				this._selectExistingPointMarker(marker, id);
			} else if (geometryType === 'LineString') {
				this._selectExistingLineStringMarker(marker, id);
			} else if (geometryType === 'MultiPolygon') {
				this._selectExistingMultiPolygonMarker(marker, id);
			}
		},

		_selectExistingPointMarker: function(marker, id) {

			if (!this._highlighted || !this._highlighted[id]) {
				this._setMarkerIcon(marker, this._getSelectedIcon());
			}

			marker.setZIndexOffset(this.zIndexTop);
		},

		_selectExistingMultiPolygonMarker: function(marker, id) {

			marker.bringToFront();

			marker.setStyle({
				fillColor: this.selectedMarkerColor,
				color: this.selectedMarkerColor
			});
		},

		_selectExistingLineStringMarker: function(marker, id) {

			var markers = this._lineMarkersById[id],
				startMarker = markers.startMarker,
				endMarker = markers.endMarker,
				featureLine = this._getMarker(id);

			if (!this._highlighted || !this._highlighted[id]) {
				var startIconConfig = this._getSelectedStartMarkerIconConfig(),
					endIconConfig = this._getSelectedEndMarkerIconConfig();

				this._setMarkerIcon(startMarker, this._getAwesomeIcon(startIconConfig));
				this._setMarkerIcon(endMarker, this._getAwesomeIcon(endIconConfig));
			}

			startMarker.setZIndexOffset(this.zIndexTop);
			endMarker.setZIndexOffset(this.zIndexTop - 1);

			featureLine.setStyle({
				color: this.selectedMarkerColor
			});
		},

		_deselectMarker: function(markerId) {

			var marker = this._getMarker(markerId);

			if (marker && this._isMarkerSelectable(marker)) {
				this._deselectExistingMarker(marker, markerId);
			} else {
				this._deselectNonexistingMarker(markerId);
			}
		},

		_deselectExistingMarker: function(marker, id) {

			var feature = marker.feature,
				geometryType = 'Point';

			if (feature && feature.geometry) {
				geometryType = feature.geometry.type;
			}

			marker.selected = false;

			if (geometryType === 'Point') {
				this._deselectExistingPointMarker(marker, id);
			} else if (geometryType === 'LineString') {
				this._deselectExistingLineStringMarker(marker, id);
			} else if (geometryType === 'MultiPolygon') {
				this._deselectExistingMultiPolygonMarker(marker, id);
			}
		},

		_deselectExistingPointMarker: function(marker, id) {

			var popup = marker.getPopup();

			this._fixPopupOffset(popup);

			var icon;

			if (this._highlighted && this._highlighted[id]) {
				icon = this._getHighlightIcon();
			} else {
				icon = this._getDefaultIcon(marker);
			}

			this._setMarkerIcon(marker, icon);
			marker.setZIndexOffset(this.zIndexBottom);

			this._closePopup(marker, popup);
		},

		_deselectExistingMultiPolygonMarker: function(marker, id) {

			var markerPopup = marker.getPopup();

			this._fixPopupOffset(markerPopup);

			marker.setStyle({
				fillColor: this.markerColor,
				color: this.markerColor
			});

			this._closePopup(marker, markerPopup);
		},

		_deselectExistingLineStringMarker: function(marker, id) {

			var markers = this._lineMarkersById[id],
				startMarker = markers.startMarker,
				endMarker = markers.endMarker,
				featureLine = this._getMarker(id),
				linePopup = featureLine.getPopup(),
				startPopup = startMarker.getPopup(),
				endPopup = endMarker.getPopup();

			this._fixPopupOffset(linePopup);
			this._fixPopupOffset(startPopup);
			this._fixPopupOffset(endPopup);

			var startIconConfig = this._getStartMarkerIconConfig(),
				endIconConfig = this._getEndMarkerIconConfig();

			if (this._highlighted && this._highlighted[id]) {
				icon = this._getHighlightIcon();
			} else {
				icon = this._getDefaultIcon(marker);
			}

			this._setMarkerIcon(startMarker, this._getAwesomeIcon(startIconConfig));
			this._setMarkerIcon(endMarker, this._getAwesomeIcon(endIconConfig));

			startMarker.setZIndexOffset(this.zIndexBottom + 1);
			endMarker.setZIndexOffset(this.zIndexBottom);

			featureLine.setStyle({
				color: this.markerColor
			});

			this._closePopup(featureLine, linePopup);
			this._closePopup(startMarker, startPopup);
			this._closePopup(endMarker, endPopup);
		},

		_fixPopupOffset: function(popup) {
			// TODO se hace por que setIcon produce el fallo añadiendo un offset diferente al popup

			if (popup) {
				popup.options.offset = L.point(0, 7);
			}
		},

		_closePopup: function(marker, popup) {

			if (popup && popup.isOpen()) {
				marker.closePopup();
			}
		},

		_setMarkerIcon: function(marker, icon) {

			marker.setIcon(icon);
		},

		_select: function(itemId) {

			if (this._selection[itemId]) {
				return;
			}

			this._selection[itemId] = true;
			this._selectMarker(itemId);
		},

		_deselect: function(itemId) {

			if (!this._selection[itemId]) {
				return;
			}

			delete this._selection[itemId];
			this._deselectMarker(itemId);
		},

		_getItemToSelect: function(itemId) {

			return {
				items: itemId
			};
		},

		_getItemToDeselect: function(itemId) {

			return {
				items: itemId
			};
		},

		_clearSelection: function() {

			for (var key in this._selection) {
				this._deselect(key);
			}
		}
	});
});
