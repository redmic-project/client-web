define([
	"app/details/views/ActivityCitationMapBase"
	, "app/redmicConfig"
	, "dojo/_base/declare"
], function(
	ActivityCitationMapBase
	, redmicConfig
	, declare
){
	return declare(ActivityCitationMapBase, {
		//	summary:
		//

		_setConfigurations: function() {

			this.tabs = [{
				title: "seeInfo",
				href: redmicConfig.viewPaths.activityDetails
			},{
				title: "seeMap",
				select: true,
				href: redmicConfig.viewPaths.activityCitationMap
			}];

			this.pathParent = redmicConfig.viewPaths.activity;
		}
	});
});