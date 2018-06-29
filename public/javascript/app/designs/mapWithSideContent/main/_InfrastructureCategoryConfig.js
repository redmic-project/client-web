define([
	'app/redmicConfig'
	, 'dojo/_base/declare'
	, 'redmic/modules/map/layer/GeoJsonLayerImpl'
	, 'redmic/modules/map/layer/PruneClusterLayerImpl'
	, "templates/SurveyStationList"
], function(
	redmicConfig
	, declare
	, GeoJsonLayerImpl
	, PruneClusterLayerImpl
	, SurveyStationListTemplate
){

	return declare(null, {
		//	summary:
		//		Extensión para visor genérico, que lo habilita para representar datos de una categoría de actividad.

		constructor: function(args) {

			var config = {
				'if': {
					activityContent: {
						register: {
							target: redmicConfig.services.infrastructureByActivity,
							template: SurveyStationListTemplate
						}
					},
					map: {
						layer: [{
							definition: declare([GeoJsonLayerImpl]),
							props: {}
						}, {
							definition: declare([PruneClusterLayerImpl]),
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
