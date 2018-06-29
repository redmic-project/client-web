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

			this._titleRightButtonsList = [{
				icon: "fa-edit",
				href: redmicConfig.viewPaths.projectEdit,
				title: this.i18n.edit
			}];

			this.viewPathsWidgets = {
				organisations: redmicConfig.viewPaths.organisationDetails,
				platforms: redmicConfig.viewPaths.platformDetails,
				documents: redmicConfig.viewPaths.documentDetails,
				activities: redmicConfig.viewPaths.activityDetails
			};

			this.pathParent = redmicConfig.viewPaths.projectCatalog;
		}
	});
});