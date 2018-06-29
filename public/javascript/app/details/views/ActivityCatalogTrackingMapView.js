define([
	"app/designs/details/main/ActivityTrackingMap"
	, "app/redmicConfig"
	, "dojo/_base/declare"
], function(
	ActivityTrackingMap
	, redmicConfig
	, declare
){
	return declare(ActivityTrackingMap, {
		//	summary:
		//

		_setConfigurations: function() {

			this.tabs = [{
				title: "seeInfo",
				href: redmicConfig.viewPaths.activityCatalogDetails
			},{
				title: "seeMap",
				select: true,
				href: redmicConfig.viewPaths.activityCatalogTrackingMap
			}];

			this.pathParent = redmicConfig.viewPaths.activityCatalog;
		}
	});
});