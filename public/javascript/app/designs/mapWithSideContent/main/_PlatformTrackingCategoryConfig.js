define([
	'app/redmicConfig'
	, 'dojo/_base/declare'
	, 'redmic/modules/map/layer/GeoJsonLayerImpl'
	, 'redmic/modules/map/layer/TrackingLayerImpl'
	, "templates/TrackingPlatformList"
], function(
	redmicConfig
	, declare
	, GeoJsonLayerImpl
	, TrackingLayerImpl
	, TrackingPlatformListTemplate
){

	return declare(null, {
		//	summary:
		//		Extensión para visor genérico, que lo habilita para representar datos de una categoría de actividad.

		constructor: function(args) {

			var config = {
				pt: {
					activityContent: {
						register: {
							target: redmicConfig.services.elementsTrackingActivity,
							template: TrackingPlatformListTemplate
						}
					},
					map: {
						layer: [{
							definition: declare([TrackingLayerImpl]),
							props: {}
						}, {
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
