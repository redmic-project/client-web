define([
	"app/dataLoader/surveyParameters/views/_SeriesDataView"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, 'moment/moment.min'
	, "redmic/modules/chart/ChartsContainer/_InfoOnMouseOver"
	, "redmic/modules/chart/ChartsContainer/_LegendBar"
	, "redmic/modules/chart/ChartsContainer/_TemporalAxisWithGridDrawing"
	, "redmic/modules/chart/ChartsContainer/_VerticalAxesWithGridDrawing"
	, "redmic/modules/chart/ChartsContainer/_ZoomByDragging"
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
){
	return declare(_SeriesDataView, {
		//	summary:
		//		Vista de SurveyStation.
		//	description:
		//		Permite visualizar y editar los datos temporales en serie.

		constructor: function(args) {

			this.config = {
				dataDefinitionTarget: redmicConfig.services.activityTimeSeriesStations,

				dataSeriesTarget: redmicConfig.services.timeSeries,
				dataSeriesFormTarget: redmicConfig.services.surveyStationsTimeSeries,

				ownChannel: "timeSeriesData"
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
							style: "width: 22rem;",
							format: function(value) {
								return moment(value).format("YYYY-MM-DD HH:mm:ss");
							}
						},{
							property: "value",
							style: "width: 10rem; justify-content: flex-end;",
							format: function(value) {
								return parseFloat(value).toFixed(2);
							}
						},{
							property: "qFlag",
							style: "width: 20rem;"
						},{
							property: "vFlag",
							style: "width: 20rem;"
						},{
							property: "remark",
							style: "width: 20rem;"
						}]
					},

					formConfig: {
						template: "dataLoader/surveyParameters/views/templates/TimeSeries"
					}
				}
			}, this.dataSeriesListConfig || {}]);

			this.dataSeriesChartsConfig = this._merge([{
				parentChannel: this.getChannel(),
				aggregationToolSelection: {
					interval: [],
					metrics: ["avg"]
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
