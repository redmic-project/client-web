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

			this._titleRightButtonsList = [{
				icon: 'fa-edit',
				href: redmicConfig.viewPaths.activityEdit,
				title: this.i18n.edit
			}];

			this.shownOptionInfo = {
				id: true
			};

			this.viewPathsWidgets = {
				organisations: redmicConfig.viewPaths.organisationDetails,
				platforms: redmicConfig.viewPaths.platformDetails,
				documents: redmicConfig.viewPaths.documentDetails
			};

			this.pathParent = redmicConfig.viewPaths.activity;
		}
	});
});
