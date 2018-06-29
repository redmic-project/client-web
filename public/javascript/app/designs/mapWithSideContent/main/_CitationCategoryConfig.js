define([
	'app/redmicConfig'
	, 'app/viewers/models/PointClusterModel'
	, 'app/viewers/models/PointClusterCategorizeModel'
	, 'dojo/_base/declare'
	, 'redmic/modules/map/layer/_AddFilter'
	, 'redmic/modules/map/layer/_ListenBounds'
	, 'redmic/modules/map/layer/_RadiusOnClick'
	, 'redmic/modules/map/layer/GeoJsonLayerImpl'
	, 'redmic/modules/map/layer/PruneClusterLayerImpl'
	, 'templates/CitationListExpand'
], function(
	redmicConfig
	, pointClusterSchema
	, pointClusterCategorizeSchema
	, declare
	, _AddFilter
	, _ListenBounds
	, _RadiusOnClick
	, GeoJsonLayerImpl
	, PruneClusterLayerImpl
	, TaxonListTemplate
){

	return declare(null, {
		//	summary:
		//		Extensión para visor genérico, que lo habilita para representar datos de una categoría de actividad.

		constructor: function(args) {

			var config = {
				ci: {
					activityContent: {
						register: {
							target: redmicConfig.services.citationByActivity,
							template: TaxonListTemplate
						}
					},
					map: {
						'default': {
							layerType: 'PointCluster'
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
								target: redmicConfig.services.citationByActivity
							},
							Point: {
								props: {
									filterConfig: {
										initQuery: {
											returnFields: ['geometry']
										}
									}
								}
							}
						},
						layerDefinition: {
							PointCluster: declare([PruneClusterLayerImpl, _AddFilter, _RadiusOnClick])
								.extend(_ListenBounds),

							Point: declare([GeoJsonLayerImpl, _AddFilter, _RadiusOnClick])
								.extend(_ListenBounds)
						},
						layerStyle: {
							PointCluster: {
								template: "viewers/views/templates/forms/PointCluster",
								templateCategorize: "viewers/views/templates/forms/PointClusterCategorize",
								schema: pointClusterSchema,
								schemaCategorize: pointClusterCategorizeSchema
							},
							Point: {
								template: "viewers/views/templates/forms/PointCluster",
								templateCategorize: "viewers/views/templates/forms/PointClusterCategorize",
								schema: pointClusterSchema,
								schemaCategorize: pointClusterCategorizeSchema
							}
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
