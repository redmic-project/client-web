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

		//	config: Object
		//		Opciones por defecto.

		constructor: function(args) {

			this.config = {
				propertyName: 'bbox',
				ownChannel: "geographicSearch"
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			this.mapSearch = new Map();
			this.mapSearch.on("queryMap", lang.hitch(this, this._onNewSearch));
		},

		_beforeShow: function(/*Object*/ obj) {

			this.mapSearch.placeAt(obj.node);
			this.mapSearch.resize();
		},

		_getNodeToShow: function() {

			return this.domNode;
		},

		_reset: function() {

			this._newSearch(null);
		},

		_restore: function() {

			this.mapSearch.emit(this.mapSearch.events.REQUEST_QUERY);
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
