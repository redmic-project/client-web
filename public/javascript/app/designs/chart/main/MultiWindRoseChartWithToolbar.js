define([
	'app/designs/base/_Main'
	, 'app/designs/chart/Controller'
	, 'app/designs/chart/layout/TopContent'
	, 'app/redmicConfig'
	, 'd3/d3.min'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'moment/moment.min'
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
	, _Store
	, WindRoseChartImpl
	, _ObtainableValue
	, DataFilterImpl
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
				iconClass: 'fa-arrows-alt',
				value: this._directionSplitMultiplier,
				range: [this._minDirectionSplitMultiplier, this._maxDirectionSplitMultiplier],
				labels: this._getDirectionLabels()
			});

			this._domainSplitSelector = new SliderSelectorImpl({
				parentChannel: this.getChannel(),
				title: this.i18n.domainLevels,
				iconClass: 'fa-scissors',
				value: this._domainSplit,
				range: [this._minDomainSplit, this._maxDomainSplit],
				labels: this._getDomainLabels()
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

			this._updateQuery();
		},

		_requestChartsData: function() {

			this._emitEvt('REQUEST', {
				target: this.target,
				method: 'POST',
				query: this._queryObj
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
				status = res.status;

			if (status !== 200) {
				// TODO imprimir gráfica vacía
				return;
			}

			var chartsData = data.data,
				limits = data.limits;

			//chartsData = [[{"value":5.863},{"value":0.826},{"value":0.413},{"value":0.578},{"value":0.826},{"value":0.413},{"value":0.083},{"value":0.0},{"value":0.0},{"value":0.0}],[{"value":0.0},{"value":0.495},{"value":0.661},{"value":0.413},{"value":0.413},{"value":0.0},{"value":0.165},{"value":0.0},{"value":0.0},{"value":0.0}],[{"value":0.0},{"value":0.413},{"value":0.33},{"value":0.165},{"value":0.33},{"value":0.165},{"value":0.0},{"value":0.083},{"value":0.0},{"value":0.0}],[{"value":0.0},{"value":0.495},{"value":0.413},{"value":0.248},{"value":0.413},{"value":0.0},{"value":0.0},{"value":0.165},{"value":0.0},{"value":0.0}],[{"value":0.0},{"value":0.578},{"value":1.156},{"value":0.578},{"value":0.661},{"value":0.083},{"value":0.083},{"value":0.165},{"value":0.083},{"value":0.0}],[{"value":0.0},{"value":0.33},{"value":0.33},{"value":0.083},{"value":0.33},{"value":0.248},{"value":0.083},{"value":0.248},{"value":0.083},{"value":0.0}],[{"value":0.0},{"value":0.248},{"value":0.413},{"value":0.413},{"value":0.661},{"value":0.165},{"value":0.0},{"value":0.495},{"value":0.0},{"value":0.0}],[{"value":0.0},{"value":0.495},{"value":1.073},{"value":0.33},{"value":0.33},{"value":0.083},{"value":0.165},{"value":0.0},{"value":0.0},{"value":0.0}],[{"value":0.0},{"value":0.248},{"value":0.083},{"value":0.083},{"value":0.165},{"value":0.165},{"value":0.165},{"value":0.0},{"value":0.0},{"value":0.0}],[{"value":0.0},{"value":0.413},{"value":0.248},{"value":0.0},{"value":0.413},{"value":0.248},{"value":0.083},{"value":0.0},{"value":0.0},{"value":0.0}],[{"value":0.0},{"value":0.661},{"value":0.578},{"value":0.248},{"value":0.578},{"value":0.083},{"value":0.248},{"value":0.0},{"value":0.0},{"value":0.0}],[{"value":0.0},{"value":0.826},{"value":0.908},{"value":0.248},{"value":0.578},{"value":0.495},{"value":0.248},{"value":0.165},{"value":0.083},{"value":0.0}],[{"value":0.0},{"value":0.991},{"value":0.578},{"value":0.991},{"value":1.486},{"value":0.248},{"value":0.495},{"value":0.0},{"value":0.0},{"value":0.0}],[{"value":0.0},{"value":0.165},{"value":0.413},{"value":0.165},{"value":0.495},{"value":0.0},{"value":0.0},{"value":0.0},{"value":0.0},{"value":0.0}],[{"value":0.0},{"value":0.578},{"value":0.33},{"value":0.165},{"value":0.083},{"value":0.0},{"value":0.0},{"value":0.0},{"value":0.0},{"value":0.0}],[{"value":0.0},{"value":1.156},{"value":0.743},{"value":0.083},{"value":0.248},{"value":0.0},{"value":0.0},{"value":0.0},{"value":0.0},{"value":0.0}],[{"value":0.0},{"value":0.495},{"value":0.165},{"value":0.248},{"value":0.083},{"value":0.0},{"value":0.0},{"value":0.0},{"value":0.0},{"value":0.0}],[{"value":0.0},{"value":0.083},{"value":0.0},{"value":0.083},{"value":0.248},{"value":0.0},{"value":0.0},{"value":0.0},{"value":0.0},{"value":0.0}],[{"value":0.0},{"value":0.0},{"value":0.743},{"value":0.578},{"value":0.248},{"value":0.0},{"value":0.0},{"value":0.0},{"value":0.0},{"value":0.0}],[{"value":0.0},{"value":0.165},{"value":0.743},{"value":0.578},{"value":0.413},{"value":0.0},{"value":0.0},{"value":0.0},{"value":0.0},{"value":0.0}],[{"value":0.0},{"value":0.991},{"value":1.156},{"value":1.982},{"value":0.908},{"value":0.248},{"value":0.083},{"value":0.0},{"value":0.0},{"value":0.0}],[{"value":0.0},{"value":1.239},{"value":1.652},{"value":0.743},{"value":0.743},{"value":0.083},{"value":0.0},{"value":0.0},{"value":0.0},{"value":0.0}],[{"value":0.0},{"value":1.486},{"value":1.404},{"value":0.991},{"value":0.743},{"value":0.083},{"value":0.0},{"value":0.0},{"value":0.0},{"value":0.0}],[{"value":0.0},{"value":0.578},{"value":0.991},{"value":0.661},{"value":0.661},{"value":0.248},{"value":0.0},{"value":0.083},{"value":0.0},{"value":0.0}],[{"value":0.0},{"value":0.743},{"value":0.578},{"value":0.661},{"value":1.321},{"value":0.578},{"value":0.0},{"value":0.248},{"value":0.0},{"value":0.083}],[{"value":0.0},{"value":0.578},{"value":0.578},{"value":0.578},{"value":0.661},{"value":0.083},{"value":0.578},{"value":0.33},{"value":0.248},{"value":0.165}],[{"value":0.0},{"value":0.413},{"value":0.33},{"value":0.248},{"value":0.33},{"value":1.321},{"value":0.743},{"value":0.578},{"value":0.248},{"value":0.083}],[{"value":0.0},{"value":0.826},{"value":0.413},{"value":1.321},{"value":1.899},{"value":0.991},{"value":1.073},{"value":0.248},{"value":0.165},{"value":0.083}],[{"value":0.0},{"value":1.239},{"value":2.064},{"value":1.239},{"value":1.073},{"value":0.083},{"value":0.083},{"value":0.165},{"value":0.0},{"value":0.0}],[{"value":0.0},{"value":0.33},{"value":1.156},{"value":0.743},{"value":0.578},{"value":0.33},{"value":0.165},{"value":0.0},{"value":0.0},{"value":0.0}],[{"value":0.0},{"value":0.33},{"value":1.404},{"value":0.908},{"value":0.495},{"value":0.661},{"value":0.165},{"value":0.083},{"value":0.0},{"value":0.0}],[{"value":0.0},{"value":0.33},{"value":0.578},{"value":0.826},{"value":0.578},{"value":0.33},{"value":0.083},{"value":0.0},{"value":0.0},{"value":0.0}]];
			//limits = [{"min":0.0,"max":2.53},{"min":2.53,"max":5.06},{"min":5.06,"max":7.59},{"min":7.59,"max":10.12},{"min":10.12,"max":12.65},{"min":12.65,"max":15.18},{"min":15.18,"max":17.71},{"min":17.71,"max":20.24},{"min":20.24,"max":22.77},{"min":22.77,"max":25.3}];

			this._chartsData = {
				data: chartsData,
				parameterName: this._unit
			};

			this._limits = limits;

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

		_subDataFilterToolActuated: function(res) {

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
				this._startDate = currentDate.subtract(1, 'hours').toISOString();
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

			this._requestChartsData();
		},

		_subChartsContainerShown: function() {

			//this._requestChartsData();
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
