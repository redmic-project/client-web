define([
	"app/designs/details/main/Platform"
	, "app/redmicConfig"
	, "dojo/_base/declare"
], function(
	Platform
	, redmicConfig
	, declare
){
	return declare(Platform, {
		//	summary:
		//

		_setConfigurations: function() {

			this.viewPathsWidgets = {
				activities: redmicConfig.viewPaths.activityCatalogDetails
			};

			this.pathParent = redmicConfig.viewPaths.platformCatalog;
		}
	});
});