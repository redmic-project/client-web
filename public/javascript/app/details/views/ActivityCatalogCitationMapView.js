define([
	"app/details/views/ActivityCitationMapBase"
	, "app/redmicConfig"
	, "dojo/_base/declare"
], function(
	ActivityCitationMapBase
	, redmicConfig
	, declare
){
	return declare(ActivityCitationMapBase, {
		//	summary:
		//

		_setConfigurations: function() {

			this.tabs = [{
				title: "seeInfo",
				href: redmicConfig.viewPaths.activityCatalogDetails
			},{
				title: "seeMap",
				select: true,
				href: redmicConfig.viewPaths.activityCatalogCitationMap
			}];

			this.pathParent = redmicConfig.viewPaths.activityCatalog;
		}
	});
});