define([
	"app/designs/chart/main/_ProcessDataDefinitionAndGetTimeSeries"
	, "app/designs/chart/main/ChartsWithToolbarsAndSlider"
	, "app/designs/chart/main/MultiPieChartWithToolbar"
	, "app/designs/details/Controller"
	, "app/designs/details/Layout"
	, 'src/redmicConfig'
	, "app/viewers/views/_ObjectCollectionSeriesSelectionManagement"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/Deferred"
	, "dojo/on"
	, "RWidgets/Utilities"
	, "src/component/base/_Filter"
	, "src/component/base/_Store"
	, "src/component/chart/ChartsContainer/_BreadcrumbsBar"
	, "src/component/chart/ChartsContainer/_GroupedLegendBar"
	, "src/component/chart/ChartsContainer/_LegendBar"
	, "src/component/chart/ChartsContainer/_InfoOnMouseOver"
	, "src/component/chart/ChartsContainer/_TemporalAxisWithGridDrawing"
	, "src/component/chart/ChartsContainer/_VerticalAxesWithGridDrawing"
	, "src/component/chart/ChartsContainer/_ZoomByDragging"
], function(
	_ProcessDataDefinitionAndGetTimeSeries
	, ChartsWithToolbarsAndSlider
	, MultiPieChartWithToolbar
	, Controller
	, Layout
	, redmicConfig
	, _ObjectCollectionSeriesSelectionManagement
	, declare
	, lang
	, Deferred
	, on
	, Utilities
	, _Filter
	, _Store
	, _BreadcrumbsBar
	, _GroupedLegendBar
	, _LegendBar
	, _InfoOnMouseOver
	, _TemporalAxisWithGridDrawing
	, _VerticalAxesWithGridDrawing
	, _ZoomByDragging
){
	return declare([Layout, Controller, _ObjectCollectionSeriesSelectionManagement, _Filter, _Store], {
		//	summary:
		//		Vista de las graficas para trashCollection.
		//	description:
		//		Permite visualizar en graficas los datos de las recolecciones de basura.

		constructor: function(args) {

			this.config = {
				ownChannel: "trashCharts",
				events: {
					DATA_SET: "dataSet"
				},

				actions: {
					SHOW_NO_DATA: "showNoData",
					REFRESH: "refresh"
				},

				target: redmicConfig.services.objectCollectingSeriesClassification
			};

			lang.mixin(this, this.config, args);
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('DATA_SET', lang.hitch(this, this._onDataSet));
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel: this.getChannel("REFRESH"),
				callback: "_subRefresh"
			});
		},

		_subRefresh: function(res) {

			this._intervalValue = res.intervalValue;
			this._intervalLabelKey = res.intervalLabelKey;

			this._emitEvt('REFRESH');
		},

		_onDataSet: function(changeObj) {

			this._dataAvailableDfd = null;

			var data = this.data;

			this._generateObjectCollectionSeriesData(data.data);

			this._emitEvt("REFRESH");

			this._intervalValue = data.interval;
			this._intervalLabelKey = data.intervalLabelKey;
		},

		_dataAvailable: function(res) {

			var data = res.data;

			if (data.length) {
				this._manageWidgets(data);
				this._addDataToCharts(data);
			} else {
				this._dataAvailableDfd.resolve();

				this._publish(this._buildChannel(this.noDataChannel, this.actions.SHOW_NO_DATA), {
					buttonKeyEmbedded: 'showChart'
				});
			}
		},

		_beforeShow: function(data) {

			if (!this._dataAvailableDfd) {
				this._dataAvailableDfd = new Deferred();
			}

			return this._dataAvailableDfd;
		},

		_manageWidgets: function(data) {

			var i = this._needMoreWidgets(data);

			if (!this._widgetsAlreadyGenerated) {
				this._lastDataLength = data.length;

				this._createWidgets(data, i);
			}

			this._dataAvailableDfd.resolve();

			this._needToHideOrShowWidgets(data);
		},

		_needMoreWidgets: function(data) {

			if (this._lastDataLength && this._lastDataLength < data.length) {
				this._widgetsAlreadyGenerated = null;
				return this._lastDataLength;
			}

			return 0;
		},

		_createWidgets: function(data, i) {

			if (!data || !data.length) {
				return;
			}

			this.widgetConfigs = {
				linearChartsContainer: this._getLinearChartsContainerConfig(data[0])
			};

			for (i; i < data.length; i++) {
				var obj = {};

				obj["multiPieChartContainer" + i] = this._getMultiPieChartContainerConfig(data[i]);
				this.widgetConfigs = this._merge([this.widgetConfigs, obj]);
			}
		},

		_needToHideOrShowWidgets: function(data) {

			var i, widgetKey;

			if (this._lastDataLength && this._lastDataLength > data.length) {
				for (i = data.length; i < this._lastDataLength; i++) {
					widgetKey = "multiPieChartContainer" + i;
					this._hideWidget(widgetKey);
					this._disconnectWidget(widgetKey);
				}

				this._lastWidgetsShow = {
					i: data.length,
					size: this._lastDataLength - data.length
				};

				//this._updateInteractive();
			} else if (this._lastWidgetsShow) {
				for (i = this._lastWidgetsShow.i; i <= this._lastWidgetsShow.size; i++) {
					widgetKey = "multiPieChartContainer" + i;
					this._connectWidget(widgetKey);
					this._showWidget(widgetKey, true);
				}

				this._lastWidgetsShow = null;

				//this._updateInteractive();
			}
		},

		_getMultiPieChartContainerConfig: function(data) {

			return {
				width: 3,
				height: 4,
				type: MultiPieChartWithToolbar,
				props: {
					title: data.name,
					parentChannel: this.getChannel(),
					chartsContainerExts: [
						_InfoOnMouseOver,
						_BreadcrumbsBar,
						_GroupedLegendBar
					]
				}
			};
		},

		_getLinearChartsContainerConfig: function(data) {

			return {
				width: 6,
				height: 6,
				type: declare([
					ChartsWithToolbarsAndSlider,
					_ProcessDataDefinitionAndGetTimeSeries
				]),
				props: {
					title: 'collectedItems',
					parentChannel: this.getChannel(),
					target: redmicConfig.services.objectCollectingSeriesTemporalData,
					intervalLabelKey: this._intervalLabelKey,
					chartsContainerExts: [
						_TemporalAxisWithGridDrawing,
						_VerticalAxesWithGridDrawing,
						_ZoomByDragging,
						_InfoOnMouseOver,
						_LegendBar
					],
					aggregationToolConfig: {
						notShowIntervalList: true,
						metricsConfig: {
							items: [{
								'labelKey': 'sum',
								'value': 'sum'
							}]
						}
					},
					aggregationToolSelection: {
						interval: [this._intervalValue],
						metrics: ["sum"]
					}
				}
			};
		},

		_addDataToCharts: function(data) {

			var linearChartsContainerInstance = this._widgets.linearChartsContainer,
				linearChartsSetPropsChannel = linearChartsContainerInstance.getChannel("SET_PROPS");

			this._publish(linearChartsSetPropsChannel, {
				timeInterval: this._intervalValue,
				intervalLabelKey: this._intervalLabelKey,
				reqObjQuery: this.objQuery
			});

			this._publish(linearChartsSetPropsChannel, {
				chartsData: this.seriesData
			});

			for (var i = 0; i < data.length; i++) {
				this._publish(this._widgets["multiPieChartContainer" + i].getChannel("SET_PROPS"), {
					chartsData: data[i].data
				});
			}
		}
	});
});
