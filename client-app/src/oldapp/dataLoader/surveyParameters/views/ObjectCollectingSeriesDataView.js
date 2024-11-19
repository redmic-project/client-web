define([
	"app/dataLoader/surveyParameters/views/_SeriesDataView"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, 'moment'
	, "src/component/chart/ChartsContainer/_InfoOnMouseOver"
	, "src/component/chart/ChartsContainer/_LegendBar"
	, "src/component/chart/ChartsContainer/_TemporalAxisWithGridDrawing"
	, "src/component/chart/ChartsContainer/_VerticalAxesWithGridDrawing"
	, "src/component/chart/ChartsContainer/_ZoomByDragging"
	, "templates/DataDefinitionObjectCollectingLabelColumn"
], function(
	_SeriesDataView
	, redmicConfig
	, declare
	, lang
	, moment
	, _InfoOnMouseOver
	, _LegendBar
	, _TemporalAxisWithGridDrawing
	, _VerticalAxesWithGridDrawing
	, _ZoomByDragging
	, DataDefinitionObjectCollectingLabelColumnTemplate
){
	return declare(_SeriesDataView, {
		//	summary:
		//		Vista de ObjectCollectingDataSeries.
		//	description:
		//		Permite visualizar y editar los datos de recolección en serie.

		constructor: function(args) {

			this.config = {
				dataDefinitionTarget: redmicConfig.services.activityObjectCollectingSeriesStations,

				dataSeriesTarget: redmicConfig.services.objectCollectingSeries,
				dataSeriesFormTarget: redmicConfig.services.objectCollectingSeriesByDataDefinition,

				ownChannel: "objectCollectingSeriesData"
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.dataSeriesListConfig = this._merge([{
				browserConfig: {
					itemByDataList: true,
					tableConfig: {
						columns: [{
							property: "date",
							style: "width: 12rem;",
							format: function(value) {
								return moment(value).format("YYYY-MM-DD HH:mm:ss");
							}
						},{
							template: DataDefinitionObjectCollectingLabelColumnTemplate,
							label: this.i18n.classification,
							style: "width: 28rem; justify-content: flex-start;"
						},{
							property: "value",
							style: "width: 6rem; justify-content: flex-end;"
						},{
							property: "qFlag",
							style: "width: 23rem;"
						},{
							property: "vFlag",
							style: "width: 23rem;"
						},{
							property: "remark",
							style: "width: 25rem;"
						}]
					},

					formConfig: {
						template: "dataLoader/surveyParameters/views/templates/ObjectCollecting"
					}
				}
			}, this.dataSeriesListConfig || {}]);

			this.dataSeriesChartsConfig = this._merge([{
				parentChannel: this.getChannel(),
				target: redmicConfig.services.objectCollectingSeriesTemporalData,
				aggregationToolSelection: {
					interval: [],
					metrics: ["sum"]
				},
				aggregationToolConfig: {
					defaultIntervalOptions: []
				},
				chartsContainerExts: [
					_TemporalAxisWithGridDrawing,
					_VerticalAxesWithGridDrawing,
					_ZoomByDragging,
					_InfoOnMouseOver,
					_LegendBar
				]
			}, this.dataSeriesChartsConfig || {}]);

			this.filterConfig = this._merge([{
				target: this.dataSeriesTarget
			}, this.filterConfig || {}]);
		}
	});
});
