define([
	"app/designs/details/main/ActivityTrackingMap"
	, "app/redmicConfig"
	, "dojo/_base/declare"
], function(
	ActivityTrackingMap
	, redmicConfig
	, declare
){
	return declare(ActivityTrackingMap, {
		//	summary:
		//

		_setConfigurations: function() {

			this.tabs = [{
				title: "seeInfo",
				href: redmicConfig.viewPaths.activityDetails
			},{
				title: "seeMap",
				select: true,
				href: redmicConfig.viewPaths.activityTrackingMap
			}];

			this.pathParent = redmicConfig.viewPaths.activity;
		}
	});
});