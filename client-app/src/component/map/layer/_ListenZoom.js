define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'RWidgets/Utilities'
], function(
	declare
	, lang
	, Utilities
) {

	return declare(null, {
		//	summary:
		//		Extensión de MapLayer para que escuche los cambios de zoom del mapa.
		//	description:
		//		Permite escuchar los cambios de zoom directamente desde el módulo del mapa y recibir un zoom mínimo
		//		para limitar su aparición en el mapa.

		constructor: function(args) {

			const defaultConfig = {
				actions: {
					ZOOM_SET: 'zoomSet'
				},
				minZoom: 0,
				_currentZoom: 7
			};

			lang.mixin(this, this._merge([this, defaultConfig, args]));
		},

		_defineSubscriptions: function() {

			this.inherited(arguments);

			this.subscriptionsConfig.push({
				channel : this._buildChannel(this.mapChannel, 'ZOOM_SET'),
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

			return originalReturn || (Utilities.isValidNumber(this.minZoom) &&
				Utilities.isValidNumber(this._currentZoom) && this.minZoom > this._currentZoom);
		}
	});
});
