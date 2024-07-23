define([
	'app/designs/base/_Main'
	, 'app/designs/chart/Controller'
	, 'app/designs/chart/layout/TopContent'
	, 'src/redmicConfig'
	, 'd3/d3.min'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'moment/moment.min'
	, 'src/component/base/_Store'
	, 'src/component/chart/layer/ChartLayer/WindRoseChartImpl'
	, 'src/component/chart/layer/ChartLayer/_ObtainableValue'
	, 'src/component/chart/Toolbar/DateFilterImpl'
	, 'src/component/chart/Toolbar/GridManagementImpl'
	, 'src/component/chart/Toolbar/SliderSelectorImpl'
], function (
	_Main
	, Controller
	, TopContentLayout
	, redmicConfig
	, d3
	, declare
	, lang
	, moment
	, _Store
	, WindRoseChartImpl
	, _ObtainableValue
	, DateFilterImpl
	, GridManagementImpl
	, SliderSelectorImpl
){
	return declare([TopContentLayout, Controller, _Main, _Store], {
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

				_unit: '%',

				_domainSplit: 5,
				_minDomainSplit: 1,
				_maxDomainSplit: 10,

				_directionSplitMultiplier: 2,
				_minDirectionSplitMultiplier: 1,
				_maxDirectionSplitMultiplier: 9,

				_chartInstances: {},
				_marginForLabels: 30,

				directionDataDefinitionIds: [],
				speedDataDefinitionIds: []
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
				iconClass: 'fa-compass',
				value: this._directionSplitMultiplier,
				range: [this._minDirectionSplitMultiplier, this._maxDirectionSplitMultiplier],
				labels: this._getDirectionLabels()
			});

			this._domainSplitSelector = new SliderSelectorImpl({
				parentChannel: this.getChannel(),
				title: this.i18n.domainLevels,
				iconClass: 'fa-sort',
				value: this._domainSplit,
				range: [this._minDomainSplit, this._maxDomainSplit],
				labels: this._getDomainLabels()
			});

			this.gridManagementConfig = this._merge([{
				parentChannel: this.getChannel(),
				getChartsContainerChannel: lang.hitch(this.chartsContainer, this.chartsContainer.getChannel)
			}, this.gridManagementConfig || {}]);

			this.gridManagement = new GridManagementImpl(this.gridManagementConfig);

			this.dateFilter = new DateFilterImpl({
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
				channel : this.dateFilter.getChannel('TOOL_ACTUATED'),
				callback: '_subDateFilterToolActuated'
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

			this._publish(this.dateFilter.getChannel('SHOW'), {
				node: this.buttonsContainerChartsTopNode
			});

			this._publish(this.chartsContainer.getChannel('SET_PROPS'), {
				buttonsContainer: this.buttonsContainerChartsTopNode
			});
		},

		_getDirectionLabels: function() {

			var labels = [];
			for (var i = this._minDirectionSplitMultiplier; i <= this._maxDirectionSplitMultiplier; i++) {
				labels.push(4 * i);
			}

			return labels;
		},

		_getDomainLabels: function() {

			var labels = [];
			for (var i = this._minDomainSplit; i <= this._maxDomainSplit; i++) {
				labels.push(i);
			}

			return labels;
		},

		_onTargetPropSet: function(res) {

			this._clearDateRange();

			this._updateQuery();
		},

		_requestChartsData: function() {

			this._emitEvt('REQUEST', {
				action: '_search',
				target: this.target,
				method: 'POST',
				query: this._queryObj
			});
		},

		_clearDateRange: function() {

			this._startDate = null;
			this._endDate = null;
		},

		_clearCharts: function() {

			this._publish(this.chartsContainer.getChannel('CLEAR'));

			for (var i in this._chartInstances) {
				var instance = this._chartInstances[i];

				this._publish(instance.getChannel('DESTROY'));
				delete this._chartInstances[i];
			}
		},

		_dataAvailable: function(res) {

			var data = res.data,
				status = res.status;

			if (status !== 200) {
				return;
			}

			this._chartsData = {
				data: data.data,
				parameterName: this._unit
			};

			this._limits = data.limits;

			this._stats = data.stats;

			this._updateCharts();
		},

		_subDirectionSplitSelectorToolActuated: function(res) {

			var value = res.value;

			this._directionSplitMultiplier = value;

			this._updateQuery();
		},

		_subDomainSplitSelectorToolActuated: function(res) {

			var value = res.value;

			this._domainSplit = value;

			this._updateQuery();
		},

		_subDateFilterToolActuated: function(res) {

			var value = res.value;

			this._startDate = value.startDate;
			this._endDate = value.endDate;

			this._updateQuery();
		},

		_updateQuery: function() {

			if (!this.speedDataDefinitionIds.length || !this.directionDataDefinitionIds.length) {
				return;
			}

			if (!this._startDate || !this._endDate) {
				var currentDate = moment();
				this._endDate = currentDate.toISOString();
				this._startDate = currentDate.subtract(7, 'days').toISOString();
			}

			this._queryObj = {
				dateLimits: {
					startDate: this._startDate,
					endDate: this._endDate
				},
				terms: {
					dataDefinition: {
						speed: this.speedDataDefinitionIds,
						direction: this.directionDataDefinitionIds
					},
					timeInterval: this.timeInterval,
					numSectors: 4 * this._directionSplitMultiplier,
					numSplits: this._domainSplit
				}
			};

			if (this._chartsData) {
				this._clearCharts();
			}
			this._updateChartsLegendTitle();
			this._requestChartsData();
		},

		_updateChartsLegendTitle: function() {

			if (!this._startDate || !this._endDate) {
				return;
			}

			var param = this.i18n.speed,
				dateFormat = 'YYYY-MM-DD hh:mm:ss',
				humanizedStartDate = moment(this._startDate).format(dateFormat),
				humanizedEndDate = moment(this._endDate).format(dateFormat),
				dateRange = humanizedStartDate + ' - ' + humanizedEndDate,
				legendTitle = param + ' (' + this.sourceUnit + ') | ' + dateRange;

			this._publish(this.chartsContainer.getChannel('SET_PROPS'), {
				legendTitle: legendTitle
			});
		},

		_subChartsContainerShown: function() {

			//this._requestChartsData();
		},

		_updateCharts: function() {

			var colorScale = this._getColorScale();

			for (var i = 0; i < this._domainSplit; i++) {
				this._updateChart(i, colorScale(i));
			}

			this._publish(this.chartsContainer.getChannel('SET_PROPS'), {
				summaryData: this._stats
			});
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

			var limits = this._limits[i],
				min = limits.min,
				max = limits.max;

			return '[' + min + ' - ' + max + ')';
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
