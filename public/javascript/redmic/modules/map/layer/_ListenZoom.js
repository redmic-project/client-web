define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "RWidgets/Utilities"
], function(
	declare
	, lang
	, Utilities
){
	return {
		//	summary:
		//		Extensión de MapLayer para que escuche los cambios de zoom.
		//	description:
		//		Permite escuchar los cambios de zoom directamente desde el módulo del mapa y recibir un zoom mínimo
		//		para limitar su aparición en el mapa.

		_initialize: function() {

			this.actions.ZOOM_SET = 'zoomSet';

			this._currentZoom = 7;
			this.minZoom = 0;

			this.inherited(arguments);
		},

		_defineSubscriptions: function() {

			this.inherited(arguments);

			this.subscriptionsConfig.push({
				channel : this._buildChannel(this.mapChannel, this.actions.ZOOM_SET),
				callback: '_subZoomSet'
			});
		},

		_subZoomSet: function(res) {

			this._currentZoom = res.zoom;
		},

		_onMinZoomPropSet: function(changeObj) {

		},

		_shouldAbortRequest: function(params) {

			var originalReturn = this.inherited(arguments);

			if (originalReturn || (Utilities.isValidNumber(this.minZoom) &&
				Utilities.isValidNumber(this._currentZoom) && this.minZoom > this._currentZoom)) {

				return true;
			}

			return false;
		}
	};
});
