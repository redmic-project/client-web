define([
	"app/designs/details/main/Project"
	, "app/redmicConfig"
	, "dojo/_base/declare"
], function(
	Project
	, redmicConfig
	, declare
){
	return declare(Project, {
		//	summary:
		//

		_setConfigurations: function() {

			this.viewPathsWidgets = {
				organisations: redmicConfig.viewPaths.organisationCatalogDetails,
				platforms: redmicConfig.viewPaths.platformCatalogDetails,
				documents: redmicConfig.viewPaths.bibliographyDetails,
				activities: redmicConfig.viewPaths.activityCatalogDetails
			};

			this.pathParent = redmicConfig.viewPaths.project;
		}
	});
});