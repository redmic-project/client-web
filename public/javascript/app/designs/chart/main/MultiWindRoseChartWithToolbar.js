define([
	"app/designs/base/_Main"
	, "app/designs/chart/Controller"
	, "app/designs/chart/layout/TopContent"
	, "app/redmicConfig"
	, 'd3/d3.min'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Filter"
	, "redmic/modules/base/_Store"
	, "redmic/modules/chart/layer/ChartLayer/WindRoseChartImpl"
	, "redmic/modules/chart/layer/ChartLayer/_ObtainableValue"
	, "redmic/modules/chart/Toolbar/SliderSelectorImpl"
	, "redmic/modules/chart/Toolbar/GridManagementImpl"
], function (
	_Main
	, Controller
	, TopContentLayout
	, redmicConfig
	, d3
	, declare
	, lang
	, _Filter
	, _Store
	, WindRoseChartImpl
	, _ObtainableValue
	, SliderSelectorImpl
	, GridManagementImpl
){
	return declare([TopContentLayout, Controller, _Main, _Filter, _Store], {
		//	summary:
		//		Gráfica de multi rosa de los vientos con barra de herramientas.

		constructor: function(args) {

			this.config = {
				ownChannel: "multiPieChartWithToolbar",
				events: {
					ADD_LAYER: "addLayer",
					REMOVE_LAYER: "removeLayer"
				},
				actions: {
				},

				target: redmicConfig.services.timeSeriesWindRose,

				_domainSplit: 4,
				_minDomainSplit: 1,
				_maxDomainSplit: 10,

				_directionSplitPow: 2,
				_minDirectionSplitPow: 1,
				_maxDirectionSplitPow: 5,

				_chartInstances: {},
				_marginForLabels: 30
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.chartsContainerConfig = this._merge([{
				marginForLabels: this._marginForLabels
			}, this.chartsContainerConfig || {}]);
		},

		_initializeMain: function() {

			this._directionSplitSelector = new SliderSelectorImpl({
				parentChannel: this.getChannel(),
				title: this.i18n.directions,
				iconClass: 'fa-arrows-alt',
				sliderConfig: {
					inputProps: {
						minimum: this._minDirectionSplitPow,
						maximum: this._maxDirectionSplitPow,
						labels: this._getDirectionLabels(this._minDirectionSplitPow, this._maxDirectionSplitPow),
						value: this._directionSplitPow
					}
				}
			});

			this._domainSplitSelector = new SliderSelectorImpl({
				parentChannel: this.getChannel(),
				title: this.i18n.domainLevels,
				iconClass: 'fa-scissors',
				sliderConfig: {
					inputProps: {
						minimum: this._minDomainSplit,
						maximum: this._maxDomainSplit,
						labels: this._getDomainLabels(this._minDomainSplit, this._maxDomainSplit),
						value: this._domainSplit
					}
				}
			});

			this.gridManagementConfig = this._merge([{
				parentChannel: this.getChannel(),
				getChartsContainerChannel: lang.hitch(this.chartsContainer, this.chartsContainer.getChannel)
			}, this.gridManagementConfig || {}]);

			this.gridManagement = new GridManagementImpl(this.gridManagementConfig);
		},

		_defineMainSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this._directionSplitSelector.getChannel("TOOL_ACTUATED"),
				callback: "_subDirectionSplitSelectorToolActuated"
			},{
				channel : this._domainSplitSelector.getChannel("TOOL_ACTUATED"),
				callback: "_subDomainSplitSelectorToolActuated"
			},{
				channel : this.chartsContainer.getChannel("SHOWN"),
				callback: "_subChartsContainerShown"
			});
		},

		_defineMainPublications: function() {

			this.publicationsConfig.push({
				event: 'ADD_LAYER',
				channel: this.chartsContainer.getChannel("ADD_LAYER")
			},{
				event: 'REMOVE_LAYER',
				channel: this.chartsContainer.getChannel("REMOVE_LAYER")
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._publish(this._directionSplitSelector.getChannel("SHOW"), {
				node: this.buttonsContainerChartsTopNode
			});

			this._publish(this._domainSplitSelector.getChannel("SHOW"), {
				node: this.buttonsContainerChartsTopNode
			});

			this._publish(this.gridManagement.getChannel("SHOW"), {
				node: this.buttonsContainerChartsTopNode
			});

			this._publish(this.chartsContainer.getChannel("SET_PROPS"), {
				buttonsContainer: this.buttonsContainerChartsTopNode
			});
		},

		_getDirectionLabels: function(start, end) {

			var labels = [];
			for (var i = start; i <= end; i++) {
				labels.push(Math.pow(2, i));
			}

			return labels;
		},

		_getDomainLabels: function(start, end) {

			var labels = [];
			for (var i = start; i <= end; i++) {
				labels.push(i);
			}

			return labels;
		},


		_addToQueryChartsData: function(query) {

			this._emitEvt('ADD_TO_QUERY', {
				query: query
			});

			this._prepareChartsForNextData();
		},

		_prepareChartsForNextData: function() {

			for (var i in this._chartInstances) {
				var instance = this._chartInstances[i];

				this._emitEvt('REMOVE_LAYER', {
					layerId: instance.getOwnChannel()
				});
				delete this._chartInstances[i];
			}
		},

		_dataAvailable: function(res) {

			var data = res.data,
				chartsData = data.data,
				limits = data.limits;

			this._chartsData = {
				data: chartsData,
				parameterName: "%"
			};

			this._limits = limits;

			this._updateCharts();
		},

		_subDirectionSplitSelectorToolActuated: function(req) {

			var value = req.value;

			this._directionSplitPow = value;

			this._addToQueryChartsData({
				"dateLimits": {
					"startDate":"2012-01-18T20:34:00.000Z",
					"endDate":"2017-08-12T07:33:00.000Z"
				},
				"terms": {
					"dataDefinition": {
						"speed": 111,
						"direction": 112
					},
					"numSectors": Math.pow(2, this._directionSplitPow)
				}
			});
		},

		_subDomainSplitSelectorToolActuated: function(req) {

			var value = req.value;

			this._domainSplit = value;

			this._addToQueryChartsData({
				"dateLimits": {
					"startDate":"2012-01-18T20:34:00.000Z",
					"endDate":"2017-08-12T07:33:00.000Z"
				},
				"terms": {
					"dataDefinition": {
						"speed": 111,
						"direction": 112
					},
					"numSplits": this._domainSplit
				}
			});
		},

		_subChartsContainerShown: function() {

			this._emitEvt("REFRESH");
		},

		_updateCharts: function() {

			var colorScale = this._getColorScale();

			for (var i = 0; i < this._domainSplit; i++) {
				this._updateChart(i, colorScale(i));
			}
		},

		_getColorScale: function() {

			var colorReferences = ["#0000ff", "#00ffff", "#00ff00", "#ffff00", "#ff0000"],
				maxDomainLevelIndex = this._domainSplit - 1,
				scaleDomain, scaleRange;

			if (!maxDomainLevelIndex) {
				scaleDomain = [0, maxDomainLevelIndex];

				scaleRange = [colorReferences[0], colorReferences[0]];
			} else {
				scaleDomain = [0, maxDomainLevelIndex / 4, maxDomainLevelIndex / 3, maxDomainLevelIndex / 2,
					maxDomainLevelIndex];

				scaleRange = colorReferences;
			}

			var colorScale = d3.scaleLinear()
				.domain(scaleDomain)
				.range(scaleRange);

			return colorScale;
		},

		_updateChart: function(i, color) {

			this._chartInstances[i] = this._createChartLayer({
				depth: i,
				label: this._getLayerLabel(i),
				color: color
			});

			this._emitEvt('ADD_LAYER', {
				layerInstance: this._chartInstances[i]
			});

			if (this._chartsData) {
				this._addDataToChart(i);
			}
		},

		_getLayerLabel: function(i) {

			var param = this.i18n.frequency,
				unit = '<unit>',	// TODO habrá que cogerlo del datadefinition
				limits = this._limits[i],
				min = limits.min,
				max = limits.max;

			return param + ' (' + min + ' - ' + max + ' ' + unit + ')';
		},

		_createChartLayer: function(layerConfig) {

			var config = {
				parentChannel: this.getChannel(),
				margin: this._marginForLabels
			};

			lang.mixin(config, layerConfig);

			var layerInstance = new declare([
				WindRoseChartImpl,
				_ObtainableValue
			])(config);

			return layerInstance;
		},

		_addDataToChart: function(i) {

			this._publish(this._chartInstances[i].getChannel("ADD_DATA"), this._chartsData);
		}
	});
});
