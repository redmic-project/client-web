define([
	'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'src/view/detail/activity/ActivityDetail'
], function(
	redmicConfig
	, declare
	, ActivityDetail
) {

	return declare(ActivityDetail, {
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
