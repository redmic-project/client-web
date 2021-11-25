define([
	'app/designs/chart/layout/SideAndTopAndBottomContent'
	, 'app/designs/chart/main/_ChartsWithToolbarsAndSlider'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/Deferred'
	, 'redmic/modules/chart/SmartLegend/TimeSeriesSmartLegendImpl'
], function (
	SideAndTopAndBottomContent
	, _ChartsWithToolbarsAndSlider
	, declare
	, lang
	, Deferred
	, TimeSeriesSmartLegendImpl
) {

	return declare([SideAndTopAndBottomContent, _ChartsWithToolbarsAndSlider], {
		//	summary:
		//		Main ChartsWithLegendAndToolbarsAndSlider.

		_initializeMain: function() {

			this._smartLegend = new TimeSeriesSmartLegendImpl({
				parentChannel: this.getChannel(),
				getChartsContainerChannel: lang.hitch(this.chartsContainer, this.chartsContainer.getChannel)
			});

			this.inherited(arguments);
		},

		_defineMainSubscriptions: function() {

			this.inherited(arguments);

			this.subscriptionsConfig.push({
				channel : this._smartLegend.getChannel('ENTRY_ENABLED'),
				callback: '_subSmartLegendEntryEnabled'
			},{
				channel : this._smartLegend.getChannel('ENTRY_DISABLED'),
				callback: '_subSmartLegendEntryDisabled'
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._layerHasData = {};

			this._publish(this._smartLegend.getChannel('SHOW'), {
				node: this.sideNode
			});
		},

		_addChartLayersWithoutData: function() {

			if (!this.chartsData) {
				return;
			}

			var definitionIds = Object.keys(this.chartsData.definitionIndex);

			for (var i = 0; i < definitionIds.length; i++) {
				var category = definitionIds[i];
				this._addChartLayerEntry(category, 'avg');

				var aggregationsInCategory = this._layers[category];
				for (var aggregation in aggregationsInCategory) {
					var aggregationLayer = aggregationsInCategory[aggregation],
						layerId = aggregationLayer.getOwnChannel();

					if (i === 0 || this._layerHasData[layerId]) {
						var dfd = new Deferred();
						this._continueBuildQueryAndRequestData(dfd, category);
					}
				}
			}
		},

		_addChartLayerEntry: function(cat, agg) {

			var catLayers = this._layers[cat],
				layerInstance = catLayers && catLayers[agg];

			if (layerInstance) {
				return;
			}

			layerInstance = this._createChartLayer(cat, agg, {
				pathToValue: agg === 'raw' ? '' : agg,
				hierarchicalInfo: this._getHierarchicalInfo(cat),
				definition: this._getDefinitions(cat),
				parameterName: this._getParameterName(cat),
				label: this._createChartLabel(agg)
			});

			this._once(layerInstance.getChannel('GOT_INFO'), lang.hitch(this, function(layerRes) {

				this._publish(this._smartLegend.getChannel('ADD_ENTRY'), layerRes);
			}));

			this._publish(layerInstance.getChannel('GET_INFO'));
		},

		_subSmartLegendEntryEnabled: function(res) {

			var layerId = res.layerId,
				indexByLayerId = this._layersIndexByLayerId[layerId],
				dataDefinitionIds = indexByLayerId && indexByLayerId.cat;

			if (!dataDefinitionIds || this._layerHasData[layerId]) {
				return;
			}

			var dfd = new Deferred();
			dfd.then(lang.hitch(this, function(id) {

				this._layerHasData[id] = true;
			}, layerId));

			this._continueBuildQueryAndRequestData(dfd, dataDefinitionIds);
		},

		_subSmartLegendEntryDisabled: function(res) {

			var layerId = res.layerId;

			if (!this._layerHasData[layerId]) {
				this._layerHasData[layerId] = true;
			}
		},

		_removeChartLayer: function(cat, agg) {

			var layerId = this._layers[cat][agg];

			delete this._layerHasData[layerId];

			this.inherited(arguments);
		},

		_clearOldChartsData: function() {

			this.inherited(arguments);

			this._layerHasData = {};
		}
	});
});
