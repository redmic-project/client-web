define([
	"app/designs/details/main/Activity"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function(
	Activity
	, redmicConfig
	, declare
	, lang
){
	return declare(Activity, {
		//	summary:
		//

		_setConfigurations: function() {

			this._titleRightButtonsList = [{
				icon: "fa-edit",
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

			this.tabs = [{
				select: true,
				title: "seeInfo",
				href: redmicConfig.viewPaths.activityDetails
			},{
				title: "seeMap",
				conditionHref: "activityCategory",
				conditionValue: "ci",
				href: redmicConfig.viewPaths.activityCitationMap
			},{
				title: "seeMap",
				condition: lang.hitch(this, function(item) {

					if (["at", "pt", "tr"].indexOf(item.activityCategory) > -1)
						return true;
				}),
				href: redmicConfig.viewPaths.activityTrackingMap
			},{
				title: "seeMap",
				conditionHref: "activityCategory",
				conditionValue: "if",
				href: redmicConfig.viewPaths.activityInfrastructureMap
			},{
				title: "seeMap",
				conditionHref: "activityCategory",
				conditionValue: "ar",
				href: redmicConfig.viewPaths.activityAreaMap
			}];

			this.pathParent = redmicConfig.viewPaths.activity;
		}
	});
});