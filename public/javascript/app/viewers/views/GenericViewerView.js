define([
	'app/designs/mapWithSideContent/main/GenericViewer'
	, 'app/designs/mapWithSideContent/main/_AnimalTrackingCategoryConfig'
	, 'app/designs/mapWithSideContent/main/_CitationCategoryConfig'
	, 'app/designs/mapWithSideContent/main/_FixedTimeSeriesCategoryConfig'
	, 'app/designs/mapWithSideContent/main/_InfrastructureCategoryConfig'
	, 'app/designs/mapWithSideContent/main/_ObjectCollectingCategoryConfig'
	, 'app/designs/mapWithSideContent/main/_PlatformTrackingCategoryConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
], function(
	Main
	, _AnimalTrackingCategoryConfig
	, _CitationCategoryConfig
	, _FixedTimeSeriesCategoryConfig
	, _InfrastructureCategoryConfig
	, _ObjectCollectingCategoryConfig
	, _PlatformTrackingCategoryConfig
	, declare
	, lang
){
	return declare([Main, _AnimalTrackingCategoryConfig, _CitationCategoryConfig, _FixedTimeSeriesCategoryConfig,
		_InfrastructureCategoryConfig, _ObjectCollectingCategoryConfig, _PlatformTrackingCategoryConfig], {
		//	summary:
		//		Vista de visor genérico.

		constructor: function (args) {

			this.config = {
				ownChannel: 'genericViewer'
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

		},

		_initialize: function() {

		},

		_defineSubscriptions: function () {

		},

		_definePublications: function () {

		}
	});
});
