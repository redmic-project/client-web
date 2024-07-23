define([
	"app/designs/details/main/Organisation"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
], function(
	Organisation
	, redmicConfig
	, declare
){
	return declare(Organisation, {
		//	summary:
		//

		_setConfigurations: function() {

			this.viewPathsWidgets = {
				activities: redmicConfig.viewPaths.activityCatalogDetails
			};

			this.pathParent = redmicConfig.viewPaths.organisationCatalog;
		}
	});
});
