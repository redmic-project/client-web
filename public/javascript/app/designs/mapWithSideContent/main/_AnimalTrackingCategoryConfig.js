define([
	'app/redmicConfig'
	, 'dojo/_base/declare'
	, 'redmic/modules/map/layer/_AddFilter'
	, 'redmic/modules/map/layer/_ListenBounds'
	, 'redmic/modules/map/layer/_RadiusOnClick'
	, 'redmic/modules/map/layer/GeoJsonLayerImpl'
	, 'redmic/modules/map/layer/PruneClusterLayerImpl'
	, 'redmic/modules/map/layer/TrackingLayerImpl'
	, "templates/AnimalListExpand"
], function(
	redmicConfig
	, declare
	, _AddFilter
	, _ListenBounds
	, _RadiusOnClick
	, GeoJsonLayerImpl
	, PruneClusterLayerImpl
	, TrackingLayerImpl
	, AnimalListTemplate
){

	return declare(null, {
		//	summary:
		//		Extensión para visor genérico, que lo habilita para representar datos de una categoría de actividad.

		constructor: function(args) {

			var config = {
				at: {
					activityContent: {
						register: {
							target: redmicConfig.services.elementsTrackingActivity,
							template: AnimalListTemplate
						}
					},
					map: {
						'default': {
							layerType: 'Tracking'
						},
						layer: {
							PointCluster: {
								props: {
									filterConfig: {
										initQuery: {
											returnFields: ['geometry']
										}
									}
								},
								// TODO esta ruta no puede ir literal aquí, definirla en redmicConfig
								target: '/api/activities/{id}/tracking/elements/75e6dd8e-da57-4a28-aa08-8488de13cad2/track/cluster'
							},
							Point: {
								props: {
									filterConfig: {
										initQuery: {
											returnFields: ['geometry']
										}
									}
								}
							},
							Tracking: {
								props: {
									drawFullTrack: true
								},
								// TODO esta ruta no puede ir literal aquí, definirla en redmicConfig
								target: '/api/activities/{id}/tracking/elements/75e6dd8e-da57-4a28-aa08-8488de13cad2/track/cluster'
							}
						},
						layerDefinition: {
							PointCluster: declare([PruneClusterLayerImpl, _AddFilter, _RadiusOnClick])
								.extend(_ListenBounds),

							Point: declare([GeoJsonLayerImpl, _AddFilter, _RadiusOnClick]).extend(_ListenBounds),

							Tracking: declare([TrackingLayerImpl, _AddFilter])
						}
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
