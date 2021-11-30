define([
	'app/designs/base/_Main'
	, 'app/designs/chart/main/_ProcessDataDefinitionAndGetTimeSeries'
	, 'app/designs/chart/main/ChartsWithLegendAndToolbarsAndSlider'
	, 'app/designs/details/Controller'
	, 'app/designs/details/Layout'
	, 'app/details/views/_ActivityTimeSeriesDataManagement'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'redmic/modules/chart/ChartsContainer/_InfoOnMouseOver'
	, 'redmic/modules/chart/ChartsContainer/_TemporalAxisWithGridDrawing'
	, 'redmic/modules/chart/ChartsContainer/_VerticalAxesWithGridDrawing'
	, 'redmic/modules/chart/ChartsContainer/_ZoomByDragging'
], function(
	_Main
	, _ProcessDataDefinitionAndGetTimeSeries
	, ChartsWithLegendAndToolbarsAndSlider
	, Controller
	, Layout
	, _ActivityTimeSeriesDataManagement
	, declare
	, lang
	, _InfoOnMouseOver
	, _TemporalAxisWithGridDrawing
	, _VerticalAxesWithGridDrawing
	, _ZoomByDragging
) {

	return declare([Layout, Controller, _Main, _ActivityTimeSeriesDataManagement], {
		//	summary:
		//		Vista detalle de gráficas asociadas a actividad.

		constructor: function(args) {

			this.config = {
				propsWidget: {
					omitTitleBar: true,
					resizable: false
				}
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.widgetConfigs = this._merge([{
				chartDesign: {
					width: 6,
					height: 6,
					type: [ChartsWithLegendAndToolbarsAndSlider, _ProcessDataDefinitionAndGetTimeSeries],
					props: {
						title: this.i18n.chart,
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
					}
				}
			}, this.widgetConfigs || {}]);
		},

		_buildAndLoadChartData: function(sourceData) {

			this._buildChartData(sourceData);

			this._publish(this._getWidgetInstance('chartDesign').getChannel('SET_PROPS'), {
				chartsData: this._getChartsDefinitionData()
			});
		},

		_clearModules: function() {

			this._publish(this._getWidgetInstance('chartDesign').getChannel('CLEAR'));
		}
	});
});
