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
