define([
	"app/designs/details/main/Platform"
	, 'src/redmicConfig'
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
				activities: redmicConfig.viewPaths.activityDetails
			};

			this.pathParent = redmicConfig.viewPaths.platformCatalog;
		}
	});
});
