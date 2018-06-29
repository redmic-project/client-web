define([
	"app/details/views/ActivityAreaMapBase"
	, "app/redmicConfig"
	, "dojo/_base/declare"
], function(
	ActivityAreaMapBase
	, redmicConfig
	, declare
){
	return declare(ActivityAreaMapBase, {
		//	summary:
		//

		_setConfigurations: function() {

			this.tabs = [{
				title: "seeInfo",
				href: redmicConfig.viewPaths.activityCatalogDetails
			},{
				title: "seeMap",
				select: true,
				href: redmicConfig.viewPaths.activityCatalogAreaMap
			}];

			this.pathParent = redmicConfig.viewPaths.activityCatalog;
		}
	});
});
