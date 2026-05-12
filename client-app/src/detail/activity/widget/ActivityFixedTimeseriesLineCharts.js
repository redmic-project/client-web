define([
	'app/designs/chart/main/_ProcessDataDefinitionAndGetTimeSeries'
	, 'app/designs/chart/main/ChartsWithLegendAndToolbarsAndSlider'
	, 'app/details/views/_ActivityTimeSeriesDataManagement'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
	, 'src/component/base/_Store'
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
	, _Store
	, _InfoOnMouseOver
	, _TemporalAxisWithGridDrawing
	, _VerticalAxesWithGridDrawing
	, _ZoomByDragging
	, redmicConfig
) {

	return declare([_Module, _Show, _Store, _ActivityTimeSeriesDataManagement], {
		//	summary:
		//		Widget para representar mediante gráficas lineales los datos producidos por la estación seleccionada.
		//

		constructor: function(args) {

			this.config = {
				ownChannel: 'activityFixedTimeseriesLineCharts',
				stationDataTarget: 'stationData'
			};

			lang.mixin(this, this.config, args);

			this.target = [this.stationDataTarget];
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('ME_OR_ANCESTOR_HIDDEN', lang.hitch(this, this._onMeOrAncestorHidden));
		},

		_initialize: function() {

			this._charts = new declare([
				ChartsWithLegendAndToolbarsAndSlider, _ProcessDataDefinitionAndGetTimeSeries
			])({
				parentChannel: this.getChannel(),
				target: redmicConfig.services.timeSeriesTemporalData,
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

		_itemAvailable: function(res, resWrapper) {

			this.inherited(arguments);

			const sourceData = res.data;

			this._setSiteData(sourceData);
			this._buildAndLoadChartData(sourceData);
		},

		_setSiteData: function(sourceData) {

			const siteName = sourceData?.site?.name;

			// TODO revisar si se aplica en caliente o necesita algo más (antes venía desde fuera al inicio)
			this.title = `${this.i18n.charts} | ${siteName}`;
		},

		_buildAndLoadChartData: function(sourceData) {

			this._buildChartData(sourceData);

			this._publish(this._charts.getChannel('SET_PROPS'), {
				chartsData: this._getChartsDefinitionData()
			});
		},

		getNodeToShow: function() {

			return this._charts.getNodeToShow();
		},

		_onMeOrAncestorHidden: function() {

			this._publish(this._charts.getChannel('CLEAR'));
		}
	});
});
