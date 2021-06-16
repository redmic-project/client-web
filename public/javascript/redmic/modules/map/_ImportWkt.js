define([
	'dojo/_base/declare'
	, 'wicket/wicket-leaflet'
], function(
	declare
	, wicket
) {

	return declare(null, {
		//	summary:
		//		Extensión que ofrece capacidades de traducción desde WKT hacia GeoJSON y capas Leaflet
		//	description:
		//		Utiliza la librería Wicket para hacer la traducción de formato.

		constructor: function(args) {

			this._wicket = new wicket.Wkt();
		},

		_readWkt: function(wkt) {

			this._wicket.read(wkt);
		},

		_getGeoJsonFeatureFromWkt: function(wkt) {

			this._readWkt(wkt);
			return this._wicket.toJson();
		},

		_getLeafletLayerFromWkt: function(wkt) {

			this._readWkt(wkt);
			return this._wicket.toObject();
		}
	});
});
