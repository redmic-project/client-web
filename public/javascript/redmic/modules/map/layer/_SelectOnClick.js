define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
], function(
	declare
	, lang
	, aspect
){
	return declare(null, {
		//	summary:
		//		Extensión de MapLayer para que sea capaz de seleccionar marcadores.
		//	description:
		//		Permite publicar y escuchar selecciones.

		constructor: function(args) {

			aspect.after(this, '_setOwnCallbacksForEvents',
				lang.hitch(this, this._setSelectOnClickOwnCallbacksForEvents));
		},

		_setSelectOnClickOwnCallbacksForEvents: function() {

			this._onEvt('PRE_CLICK', lang.hitch(this, this._handleSelectionOnMarkerPreClick));
		},

		_handleSelectionOnMarkerPreClick: function(evt) {

			var selectedMarker = evt.layer,
				data = evt.data,
				selectedFeature = selectedMarker.feature || data.feature,
				selectedId = selectedFeature[this.idProperty],
				selectedState = !!this._selection[selectedId];

			if (selectedState) {
				var markerPopup = selectedMarker.getPopup();
				if (markerPopup && markerPopup.isOpen()) {
					this._emitEvt('DESELECT', selectedId);
				}
			} else {
				this._emitEvt('SELECT', selectedId);
			}
		}
	});
});
