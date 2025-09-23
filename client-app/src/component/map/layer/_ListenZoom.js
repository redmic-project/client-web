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

		postMixInProperties: function() {

			const defaultConfig = {
				actions: {
					ZOOM_START: 'zoomStart',
					ZOOM_SET: 'zoomSet',
					GET_ZOOM: 'getZoom',
					GOT_ZOOM: 'gotZoom'
				},
				minZoom: 0
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._getCurrentZoom();
		},

		_defineSubscriptions: function() {

			this.inherited(arguments);

			const options = {
				predicate: lang.hitch(this, this._chkLayerAdded)
			};

			this.subscriptionsConfig.push({
				channel : this._buildChannel(this.mapChannel, 'GOT_ZOOM'),
				callback: '_subGotZoom'
			},{
				channel : this._buildChannel(this.mapChannel, 'ZOOM_START'),
				callback: '_subZoomStart',
				options
			},{
				channel : this._buildChannel(this.mapChannel, 'ZOOM_SET'),
				callback: '_subZoomSet',
				options
			});
		},

		_getCurrentZoom: function() {

			this._publish(this._buildChannel(this.mapChannel, 'GET_ZOOM'));
		},

		_subGotZoom: function(res) {

			this._applyZoomLevel(res);
		},

		_subZoomStart: function(res) {

			this._onZoomStart?.(res);
		},

		_subZoomSet: function(res) {

			this._applyZoomLevel(res);
		},

		_applyZoomLevel: function(res) {

			this._currentZoom = res.zoom;

			this._onZoomSet?.(this._currentZoom, res);
		},

		_afterLayerAdded: function() {

			this.inherited(arguments);

			if (!this._currentZoomIsValid()) {
				this.clear();
			}
		},

		_onMinZoomPropSet: function() {

			if (!this._currentZoomIsValid()) {
				this.clear();
			}
		},

		_currentZoomIsValid: function() {

			return Utilities.isValidNumber(this.minZoom) && Utilities.isValidNumber(this._currentZoom) &&
				this.minZoom <= this._currentZoom;
		},

		_shouldAbortRequest: function(params) {

			var originalReturn = this.inherited(arguments);

			return originalReturn || !this._currentZoomIsValid();
		}
	});
});
