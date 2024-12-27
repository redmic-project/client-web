define([
	'app/designs/chart/main/_ProcessDataDefinitionAndGetTimeSeries'
	, 'app/designs/chart/main/ChartsWithLegendAndToolbarsAndSlider'
	, 'app/details/views/_ActivityTimeSeriesDataManagement'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
	, 'src/component/chart/ChartsContainer/_InfoOnMouseOver'
	, 'src/component/chart/ChartsContainer/_TemporalAxisWithGridDrawing'
	, 'src/component/chart/ChartsContainer/_VerticalAxesWithGridDrawing'
	, 'src/component/chart/ChartsContainer/_ZoomByDragging'
	, 'src/redmicConfig'
], function(
	_ProcessDataDefinitionAndGetTimeSeries
	, ChartsWithLegendAndToolbarsAndSlider
	, _ActivityTimeSeriesDataManagement
	, declare
	, lang
	, _Module
	, _Show
	, _InfoOnMouseOver
	, _TemporalAxisWithGridDrawing
	, _VerticalAxesWithGridDrawing
	, _ZoomByDragging
	, redmicConfig
) {

	return declare([_Module, _Show, _ActivityTimeSeriesDataManagement], {
		//	summary:
		//

		constructor: function(args) {

			this.config = {
				ownChannel: 'activityFixedTimeseriesLineCharts',
				target: redmicConfig.services.timeSeriesTemporalData
			};

			lang.mixin(this, this.config, args);
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('ME_OR_ANCESTOR_HIDDEN', lang.hitch(this, this._onMeOrAncestorHidden));
		},

		_initialize: function() {

			this._charts = new declare([
				ChartsWithLegendAndToolbarsAndSlider, _ProcessDataDefinitionAndGetTimeSeries
			])({
				parentChannel: this.getChannel(),
				target: this.target,
				filterConfig: {
					initQuery: {
						size: null
					}
				},
				chartsContainerExts: [
					_TemporalAxisWithGridDrawing,
					_VerticalAxesWithGridDrawing,
					_ZoomByDragging,
					_InfoOnMouseOver
				],
				aggregationToolSelection: {
					interval: [],
					metrics: ['avg']
				},
				aggregationToolConfig: {
					defaultIntervalOptions: []
				}
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._subscribe(this.timeseriesDataChannel, lang.hitch(this, function(data) {

				this._buildAndLoadChartData(data);
			}));
		},

		getNodeToShow: function() {

			return this._charts.getNodeToShow();
		},

		_buildAndLoadChartData: function(sourceData) {

			this._buildChartData(sourceData);

			this._publish(this._charts.getChannel('SET_PROPS'), {
				chartsData: this._getChartsDefinitionData()
			});
		},

		_onMeOrAncestorHidden: function() {

			this._publish(this._charts.getChannel('CLEAR'));
		}
	});
});
