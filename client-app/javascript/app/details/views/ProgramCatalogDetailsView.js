define([
	"app/designs/details/main/Program"
	, "app/redmicConfig"
	, "dojo/_base/declare"
], function(
	Program
	, redmicConfig
	, declare
){
	return declare(Program, {
		//	summary:
		//

		_setConfigurations: function() {

			this.viewPathsWidgets = {
				organisations: redmicConfig.viewPaths.organisationCatalogDetails,
				platforms: redmicConfig.viewPaths.platformCatalogDetails,
				documents: redmicConfig.viewPaths.bibliographyDetails,
				projects: redmicConfig.viewPaths.projectCatalogDetails
			};

			this.pathParent = redmicConfig.viewPaths.programCatalog;
		}
	});
});