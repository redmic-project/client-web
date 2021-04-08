define([
	'app/details/views/ActivityLayerMapBase'
	, 'app/redmicConfig'
	, 'dojo/_base/declare'
], function(
	ActivityLayerMapBase
	, redmicConfig
	, declare
) {

	return declare(ActivityLayerMapBase, {
		//	summary:
		//		Vista de detalle en mapa para actividades con datos de capas

		_setConfigurations: function() {

			this.tabs = [{
				title: 'seeInfo',
				href: redmicConfig.viewPaths.activityCatalogDetails
			},{
				title: 'seeMap',
				select: true,
				href: redmicConfig.viewPaths.activityCatalogLayerMap
			}];

			this.pathParent = redmicConfig.viewPaths.activityCatalog;
		}
	});
});
