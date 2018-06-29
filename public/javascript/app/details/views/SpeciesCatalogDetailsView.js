define([
	"app/designs/details/main/Species"
	, "app/redmicConfig"
	, "dojo/_base/declare"
], function(
	Species
	, redmicConfig
	, declare
){
	return declare(Species, {
		//	summary:
		//

		_setConfigurations: function() {

			this.viewPathsWidgets = {
				documents: redmicConfig.viewPaths.bibliographyDetails,
				activities: redmicConfig.viewPaths.activityCatalogDetails
			};

			this.tabs = [{
				select: true,
				title: "seeInfo",
				href: redmicConfig.viewPaths.speciesCatalogDetails
			},{
				title: "location",
				href: redmicConfig.viewPaths.speciesCatalogLocation
			}];

			this.pathParent = redmicConfig.viewPaths.speciesCatalog;
		}
	});
});