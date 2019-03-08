define([
	'app/designs/base/_Main'
	, 'app/designs/chart/Controller'
	, 'app/designs/chart/layout/TopContent'
	, 'app/redmicConfig'
	, 'd3/d3.min'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'moment/moment.min'
	, 'redmic/modules/base/_Filter'
	, 'redmic/modules/base/_Store'
	, 'redmic/modules/chart/layer/ChartLayer/WindRoseChartImpl'
	, 'redmic/modules/chart/layer/ChartLayer/_ObtainableValue'
	, 'redmic/modules/chart/Toolbar/DataFilterImpl'
	, 'redmic/modules/chart/Toolbar/GridManagementImpl'
	, 'redmic/modules/chart/Toolbar/SliderSelectorImpl'
], function (
	_Main
	, Controller
	, TopContentLayout
	, redmicConfig
	, d3
	, declare
	, lang
	, moment
	, _Filter
	, _Store
	, WindRoseChartImpl
	, _ObtainableValue
	, DataFilterImpl
	, GridManagementImpl
	, SliderSelectorImpl
){
	return declare([TopContentLayout, Controller, _Main, _Filter, _Store], {
		//	summary:
		//		Gráfica de rosa de los vientos multinivel con barra de herramientas.

		constructor: function(args) {

			this.config = {
				ownChannel: 'multiPieChartWithToolbar',
				events: {
					ADD_LAYER: 'addLayer',
					REMOVE_LAYER: 'removeLayer'
				},
				actions: {
				},

				target: redmicConfig.services.timeSeriesWindRose,

				_unit: '%',

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

			this.dataFilter = new DataFilterImpl({
				parentChannel: this.getChannel()
			});
		},

		_defineMainSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this._directionSplitSelector.getChannel('TOOL_ACTUATED'),
				callback: '_subDirectionSplitSelectorToolActuated'
			},{
				channel : this._domainSplitSelector.getChannel('TOOL_ACTUATED'),
				callback: '_subDomainSplitSelectorToolActuated'
			},{
				channel : this.dataFilter.getChannel('TOOL_ACTUATED'),
				callback: '_subDataFilterToolActuated'
			},{
				channel : this.chartsContainer.getChannel('SHOWN'),
				callback: '_subChartsContainerShown'
			});
		},

		_defineMainPublications: function() {

			this.publicationsConfig.push({
				event: 'ADD_LAYER',
				channel: this.chartsContainer.getChannel('ADD_LAYER')
			},{
				event: 'REMOVE_LAYER',
				channel: this.chartsContainer.getChannel('REMOVE_LAYER')
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._publish(this._directionSplitSelector.getChannel('SHOW'), {
				node: this.buttonsContainerChartsTopNode
			});

			this._publish(this._domainSplitSelector.getChannel('SHOW'), {
				node: this.buttonsContainerChartsTopNode
			});

			this._publish(this.gridManagement.getChannel('SHOW'), {
				node: this.buttonsContainerChartsTopNode
			});

			this._publish(this.dataFilter.getChannel('SHOW'), {
				node: this.buttonsContainerChartsTopNode
			});

			this._publish(this.chartsContainer.getChannel('SET_PROPS'), {
				buttonsContainer: this.buttonsContainerChartsTopNode
			});

			setTimeout(lang.hitch(this, this._dataAvailable, {data: {}}), 1000);
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

			chartsData = [{
					value: 6.5
				},{
					value: 1
				},{
					value: 3
				},{
					value: 5.1
				},{
					value: 2.2
				},{
					value: 4.3
				},{
					value: 2.1
				},{
					value: 5.715
				},{
					value: 2
				},{
					value: 1
				},{
					value: 3
				},{
					value: 5.1
				},{
					value: 2.2
				},{
					value: 4.3
				},{
					value: 2.1
				},{
					value: 5.715
				},{
					value: 2
				},{
					value: 1
				},{
					value: 3
				},{
					value: 5.1
				},{
					value: 2.2
				},{
					value: 4.3
				},{
					value: 2.1
				},{
					value: 5.715
				},{
					value: 2
				},{
					value: 1
				},{
					value: 3
				},{
					value: 5.1
				},{
					value: 2.2
				},{
					value: 4.3
				},{
					value: 2.1
				},{
					value: 5.715
				}];
			limits = [{"min":8.666,"max":10.525}];

			this._chartsData = {
				data: chartsData,
				parameterName: this._unit
			};

			this._limits = limits;

			this._updateCharts();
		},

		_subDirectionSplitSelectorToolActuated: function(res) {

			var value = res.value;

			this._directionSplitPow = value;

			this._updateQuery();
		},

		_subDomainSplitSelectorToolActuated: function(res) {

			var value = res.value;

			this._domainSplit = value;

			this._updateQuery();
		},

		_subDataFilterToolActuated: function(res) {

			var value = res.value;

			this._startDate = value.startDate;
			this._endDate = value.endDate;

			this._updateQuery();
		},

		_updateQuery: function() {

			if (this.speedDataDefinitionId === undefined || this.directionDataDefinitionId === undefined) {
				return;
			}

			if (!this._startDate || !this._endDate) {
				var currentDate = moment();
				this._endDate = currentDate.toISOString();
				this._startDate = currentDate.subtract(1, 'days').toISOString();
			}

			this._addToQueryChartsData({
				dateLimits: {
					startDate: this._startDate,
					endDate: this._endDate
				},
				terms: {
					dataDefinition: {
						speed: this.speedDataDefinitionId,
						direction: this.directionDataDefinitionId
					},
					numSectors: Math.pow(2, this._directionSplitPow),
					numSplits: this._domainSplit
				}
			});
		},

		_subChartsContainerShown: function() {

			this._emitEvt('REFRESH');
		},

		_updateCharts: function() {

			var colorScale = this._getColorScale();

			for (var i = 0; i < this._domainSplit; i++) {
				this._updateChart(i, colorScale(i));
			}
		},

		_getColorScale: function() {

			var colorReferences = ['#0000ff', '#00ffff', '#00ff00', '#ffff00', '#ff0000'],
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
				limits = this._limits[i],
				min = limits.min,
				max = limits.max;

			return param + ' (' + min + ' - ' + max + ')';
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

			this._publish(this._chartInstances[i].getChannel('ADD_DATA'), this._chartsData);
		}
	});
});
