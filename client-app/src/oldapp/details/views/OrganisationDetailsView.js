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

			this._titleRightButtonsList = [{
				icon: "fa-edit",
				href: redmicConfig.viewPaths.organisationEdit,
				title: this.i18n.edit
			}];

			this.viewPathsWidgets = {
				activities: redmicConfig.viewPaths.activityDetails
			};

			this.pathParent = redmicConfig.viewPaths.organisation;
		}
	});
});
