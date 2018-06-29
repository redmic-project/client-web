define([
	"app/designs/base/_Main"
	, "app/designs/chart/Controller"
	, "app/designs/chart/layout/TopContent"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/chart/ChartsContainer/_InfoOnZeroValueData"
	, "redmic/modules/chart/ChartsContainer/_LayerColorSelection"
	, "redmic/modules/chart/layer/ChartLayer/MultiPieChartImpl"
	, "redmic/modules/chart/layer/ChartLayer/_ObtainableValue"
	, "redmic/modules/chart/layer/ChartLayer/_LevelNavigation"
	, "redmic/modules/chart/layer/ChartLayer/_VariableRadiusByDepth"
	, "redmic/modules/chart/Toolbar/DataSelectorImpl"
	, "RWidgets/Utilities"
], function (
	_Main
	, Controller
	, TopContent
	, declare
	, lang
	, _InfoOnZeroValueData
	, _LayerColorSelection
	, MultiPieChartImpl
	, _ObtainableValue
	, _LevelNavigation
	, _VariableRadiusByDepth
	, DataSelectorImpl
	, Utilities
){
	return declare([TopContent, _Main, Controller], {
		//	summary:
		//		Gráfica de tarta con barra de herramientas.

		constructor: function(args) {

			this.config = {
				ownChannel: "multiPieChartWithToolbar",
				events: {
					ADD_LAYER: "addLayer",
					REMOVE_LAYER: "removeLayer",
					CHARTS_DATA_SET: "chartsDataSet",
					SET_DATA_SELECTOR_PROPS: "setDataSelectorProps"
				},
				actions: {
				},

				_currentDataSelectorValue: 0
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.chartsContainerExts.push(_LayerColorSelection, _InfoOnZeroValueData);
		},

		_initializeMain: function() {

			this._dataSelector = new DataSelectorImpl({
				parentChannel: this.getChannel()
			});
		},

		_defineMainSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this._dataSelector.getChannel("TOOL_ACTUATED"),
				callback: "_subDataSelectorToolActuated",
				options: {
					predicate: lang.hitch(this, this._chkSelectionHasChanged)
				}
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
			},{
				event: 'SET_DATA_SELECTOR_PROPS',
				channel: this._dataSelector.getChannel("SET_PROPS")
			});
		},

		_setMainOwnCallbacksForEvents: function() {

			this._onEvt('CHARTS_DATA_SET', lang.hitch(this, this._onChartsDataSet));
		},

		_onChartsDataSet: function(changeObj) {

			this._updateDataSelectorEntries();

			this._currentDataSelectorValue = 0;

			this._updateChart();
		},

		postCreate: function() {

			this.inherited(arguments);

			this._publish(this._dataSelector.getChannel("SHOW"), {
				node: this.toolbarContainerChartsTopNode
			});

			this._publish(this.chartsContainer.getChannel("SET_PROPS"), {
				buttonsContainer: this.buttonsContainerChartsTopNode
			});
		},

		_updateDataSelectorEntries: function() {

			var data = [];

			for (var i = 0; i < this.chartsData.length; i++) {
				var item = this.chartsData[i];
				data.push({
					value: i,
					label: Utilities.formatDate(item.timeInterval, "dateTime")
				});
			}

			this._emitEvt('SET_DATA_SELECTOR_PROPS', {
				data: data
			});
		},

		_addDataToChart: function() {

			this._publish(this._chartInstance.getChannel("ADD_DATA"), {
				"data": {
					"name": "root",
					"categories": this._getCategoriesOnCurrentDataSelectorValue()
				},
				parameterName: "unidades"
			});
		},

		_getCategoriesOnCurrentDataSelectorValue: function() {

			return this.chartsData[this._currentDataSelectorValue].categories;
		},

		_setChartProps: function(propsObj) {

			this._publish(this._chartInstance.getChannel("SET_PROPS"), propsObj);
		},

		_chkSelectionHasChanged: function(req) {

			var selection = req.value;
			return selection !== this._currentDataSelectorValue;
		},

		_subDataSelectorToolActuated: function(req) {

			var selection = req.value;

			this._currentDataSelectorValue = selection;
			this._updateChart();
		},

		_subChartsContainerShown: function() {

			if (!this._chartInstance) {
				this._updateChart();
			}
		},

		_updateChart: function() {

			// TODO sería preferible no quitar y poner la capa, sino actualizar sus datos y que funcione correctamente.
			// Por el momento, no se actualizan bien los colores, se vuelve negra toda la tarta.
			if (this._chartInstance) {
				this._emitEvt('REMOVE_LAYER', {
					layerId: this._chartInstance.getOwnChannel()
				});
				this._chartInstance = null;
			}

			this._chartInstance = this._createChartLayer();

			var label = this.chartsData[this._currentDataSelectorValue].timeInterval;
			this._publish(this._chartInstance.getChannel("SET_PROPS"), {
				label: Utilities.formatDate(label, "dateTime")
			});

			this._emitEvt('ADD_LAYER', {
				layerInstance: this._chartInstance
			});

			if (this.chartsData) {
				this._addDataToChart();
			}
		},

		_createChartLayer: function(layerConfig) {

			var config = {
				parentChannel: this.getChannel()
			};

			lang.mixin(config, layerConfig);

			var layerInstance = new declare([
				MultiPieChartImpl,
				_VariableRadiusByDepth,
				_ObtainableValue,
				_LevelNavigation
			])(config);

			return layerInstance;
		}
	});
});