define([
	"app/details/views/ActivityInfrastructureMapBase"
	, "app/redmicConfig"
	, "dojo/_base/declare"
], function(
	ActivityInfrastructureMapBase
	, redmicConfig
	, declare
){
	return declare(ActivityInfrastructureMapBase, {
		//	summary:
		//

		_setConfigurations: function() {

			this.tabs = [{
				title: "seeInfo",
				href: redmicConfig.viewPaths.activityCatalogDetails
			},{
				title: "seeMap",
				select: true,
				href: redmicConfig.viewPaths.activityCatalogInfrastructureMap
			}];

			this.pathParent = redmicConfig.viewPaths.activityCatalog;
		}
	});
});