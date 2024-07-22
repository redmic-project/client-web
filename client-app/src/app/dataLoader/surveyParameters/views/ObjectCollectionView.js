define([
	"app/dataLoader/surveyParameters/views/_DataLoadedByStationManagement"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "templates/ObjectCollectionList"
	, "templates/ObjectCollectionPopup"
], function(
	_DataLoadedByStationManagement
	, redmicConfig
	, declare
	, lang
	, ListTemplate
	, PopupTemplate
){
	return declare(_DataLoadedByStationManagement, {
		//	summary:
		//		Vista de ObjectCollection.
		//	description:
		//		.

		constructor: function(args) {

			this.config = {
				title: "this.i18n.objectCollection",

				replaceTarget: redmicConfig.services.activityObjectCollectingSeriesStations,

				dataDefinitionsPath: redmicConfig.viewPaths.objectCollectingDataDefinitions,
				addPath: redmicConfig.viewPaths.activityGeoDataAdd,
				editPath: redmicConfig.viewPaths.activityGeoDataEdit,
				loadPath: redmicConfig.viewPaths.activityGeoDataLoad,

				popupTemplate: PopupTemplate,
				listTemplate: ListTemplate,
				activityCategory: ["oc"],

				ownChannel: "objectCollection"
			};

			lang.mixin(this, this.config, args);
		}
	});
});
