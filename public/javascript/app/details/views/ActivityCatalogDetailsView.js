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

			this.viewPathsWidgets = {
				organisations: redmicConfig.viewPaths.organisationCatalogDetails,
				platforms: redmicConfig.viewPaths.platformCatalogDetails,
				documents: redmicConfig.viewPaths.bibliographyDetails
			};

			this.tabs = [{
				select: true,
				title: "seeInfo",
				href: redmicConfig.viewPaths.activityCatalogDetails
			},{
				title: "seeMap",
				conditionHref: "activityCategory",
				conditionValue: "ci",
				href: redmicConfig.viewPaths.activityCatalogCitationMap
			},{
				title: "seeMap",
				condition: lang.hitch(this, function(item) {

					if (["at", "pt", "tr"].indexOf(item.activityCategory) > -1)
						return true;
				}),
				href: redmicConfig.viewPaths.activityCatalogTrackingMap
			},{
				title: "seeMap",
				conditionHref: "activityCategory",
				conditionValue: "if",
				href: redmicConfig.viewPaths.activityCatalogInfrastructureMap
			},{
				title: "seeMap",
				conditionHref: "activityCategory",
				conditionValue: "ar",
				href: redmicConfig.viewPaths.activityCatalogAreaMap
			},{
				title: "seeMap",
				conditionHref: "activityCategory",
				conditionValue: "ml",
				href: redmicConfig.viewPaths.activityCatalogLayerMap
			}];

			this.pathParent = redmicConfig.viewPaths.activityCatalog;
		}
	});
});
