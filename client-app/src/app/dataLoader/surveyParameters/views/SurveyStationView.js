define([
	"app/dataLoader/surveyParameters/views/_DataLoadedByStationManagement"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "templates/SurveyStationList"
	, "templates/SurveyStationPopup"
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
		//		Vista de SurveyStation.
		//	description:
		//		.

		constructor: function(args) {

			this.config = {
				title: "this.i18n.surveyStations",

				replaceTarget: redmicConfig.services.activityTimeSeriesStations,

				dataDefinitionsPath: redmicConfig.viewPaths.surveyStationDataDefinitions,
				addPath: redmicConfig.viewPaths.activityGeoDataAdd,
				editPath: redmicConfig.viewPaths.activityGeoDataEdit,
				loadPath: redmicConfig.viewPaths.activityGeoDataLoad,

				popupTemplate: PopupTemplate,
				listTemplate: ListTemplate,
				activityCategory: ["ft"],

				ownChannel: "surveyStation"
			};

			lang.mixin(this, this.config, args);
		}
	});
});
