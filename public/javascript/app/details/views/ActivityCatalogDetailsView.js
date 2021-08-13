define([
	'app/designs/details/main/Activity'
	, 'app/redmicConfig'
	, 'dojo/_base/declare'
], function(
	Activity
	, redmicConfig
	, declare
) {

	return declare(Activity, {
		//	summary:
		//

		_setConfigurations: function() {

			this.viewPathsWidgets = {
				organisations: redmicConfig.viewPaths.organisationCatalogDetails,
				platforms: redmicConfig.viewPaths.platformCatalogDetails,
				documents: redmicConfig.viewPaths.bibliographyDetails
			};

			this.pathParent = redmicConfig.viewPaths.activityCatalog;
		}
	});
});
