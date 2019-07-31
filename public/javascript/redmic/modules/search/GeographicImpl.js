define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
	, "RWidgets/Map"
	, "./Search"
], function(
	declare
	, lang
	, put
	, Map
	, Search
){
	return declare(Search, {
		//	summary:
		//		Todo lo necesario para trabajar con MapSearch.
		//	description:
		//		Proporciona métodos y contenedor para la búsqueda de tipo bbox.

		constructor: function(args) {

			this.config = {
				propertyName: 'bbox',
				ownChannel: "geographicSearch"
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			// TODO este redmic-widget de mapa es contraproducente, debería usarse el módulo mapa en su lugar
			this.mapSearch = new Map({
				urlMapBasemap: "https://idecan3.grafcan.es/ServicioWMS/MTI",
				layersBasemap: 'WMS_MTI',
				formatBasemap: 'image/png',
				latCenter: 28.5,
				lonCenter: -15.7,
				zoom: 4,
				widthAreaSelect: 140,
				heightAreaSelect: 100
			});

			this.mapSearch.on("queryMap", lang.hitch(this, this._onNewSearch));
			this.mapSearch.placeAt(this.domNode);
		},

		_afterShow: function() {

			this.mapSearch.resize();
		},

		_getNodeToShow: function() {

			return this.domNode;
		},

		_reset: function() {

			this._newSearch(null);
		},

		_restore: function() {

			this.mapSearch.emit('requestQuery');
		},

		_onNewSearch: function(evt) {

			this._newSearch({
				"topLeftLat": evt._northEast.lat,
				"topLeftLon": evt._southWest.lng,
				"bottomRightLat": evt._southWest.lat,
				"bottomRightLon": evt._northEast.lng
			});

			this._emitEvt('TRACK', {
				type: TRACK.type.event,
				info: {
					category: TRACK.category.button,
					action: TRACK.action.click,
					label: "openMapFilter"
				}
			});
		}
	});
});
