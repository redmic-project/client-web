define([
	"app/designs/details/main/Platform"
	, "app/redmicConfig"
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

			this._titleRightButtonsList = [{
				icon: "fa-edit",
				href: redmicConfig.viewPaths.platformEdit,
				title: this.i18n.edit
			}];

			this.viewPathsWidgets = {
				activities: redmicConfig.viewPaths.activityDetails
			};

			this.pathParent = redmicConfig.viewPaths.platform;
		}
	});
});