define([
	'app/designs/base/_Main'
	, 'app/designs/chart/Controller'
	, 'app/designs/chart/main/_ChartsWithToolbarsAndSliderItfc'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'redmic/modules/chart/ChartsContainer/_InfoOnEmptyData'
	, 'redmic/modules/chart/ChartsContainer/_LayerColorSelection'
	, 'redmic/modules/chart/ChartsContainer/SliderChartsContainerImpl'
	, 'redmic/modules/chart/layer/ChartLayer/_QueryableValue'
	, 'redmic/modules/chart/layer/ChartLayer/LinearChartImpl'
	, 'redmic/modules/chart/Toolbar/AggregationToolImpl'
	, 'redmic/modules/chart/Toolbar/GridManagementImpl'
], function(
	_Main
	, Controller
	, _ChartsWithToolbarsAndSliderItfc
	, declare
	, lang
	, _InfoOnEmptyData
	, _LayerColorSelection
	, SliderChartsContainerImpl
	, _QueryableValue
	, LinearChartImpl
	, AggregationToolImpl
	, GridManagementImpl
) {

	return declare([Controller, _Main, _ChartsWithToolbarsAndSliderItfc], {
		//	summary:
		//		Main ChartsWithToolbars.

		constructor: function(args) {

			this.config = {
				ownChannel: 'chartsWithToolbars',
				events: {
					ADD_LAYER: 'addLayer',
					REMOVE_LAYER: 'removeLayer',
					CHANGE_DOMAIN: 'changeDomain',
					TIME_INTERVAL_SET: 'timeIntervalSet',
					CHARTS_DATA_SET: 'chartsDataSet',
					CLEAR_LAYERS: 'clearLayers'
				},
				actions: {
				},

				_data: {},
				_layers: {},
				_layersIndexByLayerId: {},
				_categoriesIndexed: {},
				aggregationToolSelection: {
					interval: ['raw'],
					metrics: ['avg']
				},
				pathSeparator: '.',
				idSeparator: ','
			};

			lang.mixin(this, this.config, args);

			this._interval = this.aggregationToolSelection.interval[0] || null;
			this._aggregations = this.aggregationToolSelection.metrics;
		},

		_setMainConfigurations: function() {

			this.chartsContainerExts.push(_LayerColorSelection, _InfoOnEmptyData);

			this.aggregationToolConfig = this._merge([{
				parentChannel: this.getChannel(),
				selection: this.aggregationToolSelection
			}, this.aggregationToolConfig || {}]);
		},

		_initializeMain: function() {

			this.gridManagementConfig = this._merge([{
				parentChannel: this.getChannel(),
				getChartsContainerChannel: lang.hitch(this.chartsContainer,
					this.chartsContainer.getChannel)
			}, this.gridManagementConfig || {}]);

			this.sliderConfig = this._merge([{
				parentChannel: this.getChannel(),
				getChartsContainerChannel: lang.hitch(this.chartsContainer,
					this.chartsContainer.getChannel)
			}, this.sliderConfig || {}]);

			this.aggregationTool = new AggregationToolImpl(this.aggregationToolConfig);

			this.gridManagement = new GridManagementImpl(this.gridManagementConfig);

			this.slider = new SliderChartsContainerImpl(this.sliderConfig);
		},

		_defineMainSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.aggregationTool.getChannel('TOOL_ACTUATED'),
				callback: '_subAggregationToolActuated'
			},{
				channel : this.chartsContainer.getChannel('SHOWN'),
				callback: '_subChartsContainerShown'
			},{
				channel : this.chartsContainer.getChannel('LAYER_CLEARED'),
				callback: '_subChartsContainerLayerCleared'
			},{
				channel : this.slider.getChannel('DOMAIN_CHANGED'),
				callback: '_subSliderDomainChanged'
			});
		},

		_defineMainPublications: function() {

			this.publicationsConfig.push({
				event: 'ADD_LAYER',
				channel: this.chartsContainer.getChannel('ADD_LAYER')
			},{
				event: 'REMOVE_LAYER',
				channel: this.chartsContainer.getChannel('REMOVE_LAYER')
			},{
				event: 'CHANGE_DOMAIN',
				channel: this.chartsContainer.getChannel('CHANGE_DOMAIN')
			},{
				event: 'CLEAR_LAYERS',
				channel: this.chartsContainer.getChannel('CLEAR')
			});
		},

		_setMainOwnCallbacksForEvents: function() {

			this._onEvt('TIME_INTERVAL_SET', lang.hitch(this, this._onTimeIntervalSet));
			this._onEvt('CHARTS_DATA_SET', lang.hitch(this, this._onChartsDataSet));
		},

		_onTimeIntervalSet: function(changeObj) {

			this._interval = changeObj.value;
		},

		_onChartsDataSet: function(changeObj) {

			this._categoriesIndexed = {};
			this._data = {};
			this.categories = this._getCategories();

			var selection = {
				metrics: this._aggregations
			};

			if (this._interval) {
				selection.interval = [this._interval];
			}

			this._publish(this.aggregationTool.getChannel('SET_PROPS'), {
				selection: selection,
				dataDefinitions: this._parseDataForAggregationTool(this.categories)
			});

			if (this._chartsContainerIsReady) {
				this._clearOldChartsData();
			}
		},

		_clearOldChartsData: function() {

			this._emitEvt('CLEAR_LAYERS');
			this._interval && this._setInterval(this._interval);
		},

		_parseDataForAggregationTool: function() {

			var data = [];

			for (var key in this.categories) {
				data.push({
					dataDefinition: this.categories[key]
				});
			}

			return data;
		},

		postCreate: function() {

			this.inherited(arguments);

			this._publish(this.aggregationTool.getChannel('SHOW'), {
				node: this.toolbarContainerChartsTopNode
			});

			this._publish(this.gridManagement.getChannel('SHOW'), {
				node: this.buttonsContainerChartsTopNode
			});

			this._publish(this.slider.getChannel('SHOW'), {
				node: this.chartsBottomNode
			});

			this._publish(this.chartsContainer.getChannel('SET_PROPS'), {
				buttonsContainer: this.buttonsContainerChartsTopNode
			});
		},

		_addDataToChart: function(chartInstance, dataObj) {

			this._publish(chartInstance.getChannel('ADD_DATA'), dataObj);
		},

		_setChartProps: function(chartInstance, propsObj) {

			this._publish(chartInstance.getChannel('SET_PROPS'), propsObj);
		},

		_subAggregationToolActuated: function(req) {

			var interval = req.interval,
				metrics = req.metrics;

			if (!interval || !metrics) {
				return;
			}

			var intervalValue = interval.value ? interval.value[0] : interval[0],
				aggregations = metrics;

			if (intervalValue !== this._interval) {
				this._setInterval(intervalValue);
				this._intervalLabelKey = interval.labelKey;
				this._intervalAlreadySetByTool = true;
			} else {
				this._updateChartsForAggregations(aggregations);
			}
		},

		_subChartsContainerShown: function() {

			if (this._interval && !this._intervalAlreadySetByTool) {
				this._setInterval(this._interval);
			}
			this._chartsContainerIsReady = true;
		},

		_subChartsContainerLayerCleared: function(res) {

			var layerId = res.chart,
				layerIndex = this._layersIndexByLayerId[layerId];

			delete this._layersIndexByLayerId[layerId];
			this._removeChartLayer(layerIndex.cat, layerIndex.agg);
		},

		_subSliderDomainChanged: function(res) {

			this._emitEvt('CHANGE_DOMAIN', res);
		},

		_setInterval: function(interval) {

			this._interval = interval;

			this._publish(this.chartsContainer.getChannel('INTERVAL_CHANGED'), {
				interval: interval
			});
		},

		_updateChartsForAggregations: function(aggregations) {

			if (this._aggregations) {
				this._findAndRemoveUnusedAggregationCharts(this._aggregations, aggregations);
			}

			this._addUsedAggregationCharts(aggregations);

			this._aggregations = lang.clone(aggregations);
		},

		_findAndRemoveUnusedAggregationCharts: function(prevAggs, currAggs) {

			var aggsDiff = prevAggs.filter(lang.partial(function(a, i) {

				return a.indexOf(i) < 0;
			}, currAggs));

			var categories = Object.keys(this._data);

			for (var i = 0; i < categories.length; i++) {
				var cat = categories[i].split(this.idSeparator);
				this._selectAndRemoveUnusedAggregationCharts(cat, aggsDiff);
			}
		},

		_selectAndRemoveUnusedAggregationCharts: function(cat, aggs) {

			if (this._interval !== 'raw') {
				aggs.push('raw');
				this._removeUnusedAggregationCharts(cat, aggs);
			} else {
				this._removeAllAggregationCharts(cat);
			}
		},

		_removeUnusedAggregationCharts: function(cat, aggs) {

			var catLayers = this._layers[cat];

			if (!catLayers) {
				return;
			}

			for (var i = 0; i < aggs.length; i++) {
				var agg = aggs[i],
					layerInstance = catLayers[agg];

				if (layerInstance) {
					this._emitEvt('REMOVE_LAYER', {
						layerId: layerInstance.getOwnChannel()
					});
					this._removeChartLayer(cat, agg);
				}
			}
		},

		_removeAllAggregationCharts: function(cat) {

			var catLayers = this._layers[cat];

			if (!catLayers) {
				return;
			}

			this._removeUnusedAggregationCharts(cat, Object.keys(this._layers[cat]));
		},

		_removeChartLayer: function(cat, agg) {

			delete this._layers[cat][agg];
		},

		_addUsedAggregationCharts: function(aggs) {

			var categories = Object.keys(this._data);

			for (var i = 0; i < categories.length; i++) {
				var cat = categories[i].split(this.idSeparator);
				this._addUsedAggregationChart(aggs, cat);
			}
		},

		_addUsedAggregationChart: function(aggs, cat) {

			if (!this._layers[cat]) {
				this._layers[cat] = {};
			}

			if (this._interval !== 'raw') {
				for (var i = 0; i < aggs.length; i++) {
					this._addAggregationChart(cat, aggs[i]);
				}
			} else {
				this._addAggregationChart(cat, 'raw');
			}
		},

		_addAggregationChart: function(cat, agg) {

			var catLayers = this._layers[cat],
				layerInstance = catLayers[agg],
				data = this._data[cat],
				definitions = this._getDefinitions(cat);

			if (!layerInstance) {
				layerInstance = this._createChartLayer(cat, agg);
			}

			this._setChartProps(layerInstance, {
				pathToValue: agg === 'raw' ? '' : agg,
				hierarchicalInfo: this._getHierarchicalInfo(cat),
				definition: definitions,
				label: this._createChartLabel(agg)
			});

			this._emitEvt('ADD_LAYER', { layerInstance: layerInstance });

			data && this._addDataToChart(layerInstance, data);
		},

		_getDefinitions: function(cat) {

			var definitions = {};

			if (!(cat instanceof Array)) {
				definitions[cat] = this._getDefinitionsData(cat);
			} else {
				for (var i = 0; i < cat.length; i++) {
					var catComponent = cat[i];
					definitions[catComponent] = this._getDefinitionsData(catComponent);
				}
			}

			return definitions;
		},

		_createChartLayer: function(cat, agg, layerConfig) {

			var config = {
				parentChannel: this.getChannel(),
				xName: 'date',
				yName: 'value'
			};

			lang.mixin(config, layerConfig);

			var LayerDefinition = declare([LinearChartImpl, _QueryableValue]),
				layerInstance = new LayerDefinition(config),
				layerId = layerInstance.getOwnChannel(),
				layerCat = this._layers[cat];

			if (!layerCat) {
				this._layers[cat] = {};
				layerCat = this._layers[cat];
			}

			this._layersIndexByLayerId[layerId] = {
				cat: cat,
				agg: agg
			};

			layerCat[agg] = layerInstance;
			return layerInstance;
		},

		_createChartLabel: function(agg) {

			var intervalLabel = this.intervalLabelKey || this._intervalLabelKey || this._interval;

			return this._interval !== 'raw' ? agg + '_by_' + intervalLabel : agg;
		}

	});
});
