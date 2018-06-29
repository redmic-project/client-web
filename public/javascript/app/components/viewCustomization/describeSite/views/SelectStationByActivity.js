define([
	"app/base/views/extensions/_LocalSelectionView"
	, "app/designs/mapWithSideContent/main/FilterAndGeographic"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "templates/SurveyStationList"
	, "templates/ActivityFilter"
	, "templates/LoadingCustom"
	, "templates/SurveyStationPopup"
], function (
	_LocalSelectionView
	, Main
	, redmicConfig
	, declare
	, lang
	, TemplateList
	, TemplateFilter
	, TemplateCustom
	, TemplatePopup
){
	return declare([Main, _LocalSelectionView], {
		//	summary:
		//		Step de

		constructor: function (args) {

			this.config = {
				// WizardStep params
				_results: null,

				templatePopup: TemplatePopup,

				// General params
				idProperty: "id",
				_totalSelected: 0,

				ownChannel: "previewLoadDataStep"
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				idProperty: "uuid",
				template: TemplateList,
				noDataMessage: TemplateCustom({
					message: this.i18n.noAssociatedSurveyStations,
					iconClass: "fr fr-no-data"
				}),
				instructionDataMessage: TemplateCustom({
					message: this.i18n.selectActivity,
					iconClass: "fr fr-crab"
				})
			}, this.browserConfig || {}]);

			this.filteringConfig = this._merge([{
				inputProps: {
					placeHolder: this.i18n.selectActivity,
					template: TemplateFilter,
					labelAttr: this.propertyNameFiltering,
					fields: ['name.raw^3', 'name', 'name.suggest']
				},
				propertyName: this.propertyNameFiltering
			}, this.filteringConfig || {}]);

			this.geoJsonLayerConfig = this._merge([{
				idProperty: "uuid",
				simpleSelection: true
			}, this.geoJsonLayerConfig || {}]);

			this.filterConfig = this._merge([{
				initQuery: {
					vFlags: null,
					qFlags: null,
					accessibilityIds: null
				}
			}, this.filterConfig || {}]);
		}
	});
});
