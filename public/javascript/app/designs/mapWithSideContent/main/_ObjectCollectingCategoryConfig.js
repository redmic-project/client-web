define([
	'app/redmicConfig'
	, 'dojo/_base/declare'
	, 'redmic/modules/map/layer/GeoJsonLayerImpl'
	, "templates/ObjectCollectionList"
], function(
	redmicConfig
	, declare
	, GeoJsonLayerImpl
	, ObjectCollectionListTemplate
){

	return declare(null, {
		//	summary:
		//		Extensión para visor genérico, que lo habilita para representar datos de una categoría de actividad.

		constructor: function(args) {

			var config = {
				oc: {
					activityContent: {
						register: {
							target: redmicConfig.services.activityObjectCollectingSeriesStations,
							template: ObjectCollectionListTemplate
						}
					},
					map: {
						layer: [{
							definition: declare([GeoJsonLayerImpl]),
							props: {}
						}]
					}
				}
			};

			this._viewerConfigByActivityCategory = this._merge([
				this._viewerConfigByActivityCategory || {},
				config
			]);
		}
	});
});
