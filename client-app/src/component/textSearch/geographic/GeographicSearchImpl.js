define([
	'dojo/_base/declare'
	, 'src/component/textSearch/TextSearch'
	, 'src/design/map/_MapDesignFullSizeLayout'
], function(
	declare
	, TextSearch
	, _MapDesignFullSizeLayout
) {

	return declare([TextSearch, _MapDesignFullSizeLayout], {
		// summary:
		//   Implementación de componente TextSearch para realizar búsquedas con filtro geográfico.
		//   TODO queda pendiente generalizar componente TextSearch, ya que aquí encaja bien pero no maneja texto

		postMixInProperties: function() {

			this.inherited(arguments);

			const defaultConfig = {
				ownChannel: 'geographicSearch',
				enabledMapExtensions: {
					toponyms: false
				},
				mapConfig: {
					layersSelector: false,
					miniMap: false,
					measureTools: false
				},
				className: 'fHeight'
			};

			this._mergeOwnAttributes(defaultConfig);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._addClass(this.className);
		},

		_defineSubscriptions: function() {

			this.inherited(arguments);

			const mapInstance = this.getComponentInstance('map');

			this.subscriptionsConfig.push({
				channel: mapInstance.getChannel('BBOX_CHANGED'),
				callback: '_subBBoxChanged'
			});
		},

		_subBBoxChanged: function(res) {

			const northEast = res.bbox._northEast,
				southWest = res.bbox._southWest;

			this._emitSearchEvent({
				topLeftLat: northEast.lat,
				topLeftLon: southWest.lng,
				bottomRightLat: southWest.lat,
				bottomRightLon: northEast.lng
			});
		},

		_emitSearchEvent: function(value) {

			if (value && value !== this._lastSearchInputValue) {
				this._lastSearchInputValue = value;
			}

			this._emitEvt('SEARCH', {value});
		},

		_reset: function() {

			this._emitSearchEvent(null);
		},

		_refresh: function() {

			this._emitSearchEvent(this._lastSearchInputValue ?? null);
		}
	});
});
