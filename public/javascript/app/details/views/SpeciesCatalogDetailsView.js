define([
	'app/designs/details/main/Species'
	, 'app/redmicConfig'
	, 'dojo/_base/declare'
], function(
	Species
	, redmicConfig
	, declare
){
	return declare(Species, {
		//	summary:
		//		Vista detalle pública de especies

		_setConfigurations: function() {

			this.viewPathsWidgets = {
				documents: redmicConfig.viewPaths.bibliographyDetails,
				activities: redmicConfig.viewPaths.activityCatalogDetails
			};

			this.pathParent = redmicConfig.viewPaths.speciesCatalog;
		}
	});
});
