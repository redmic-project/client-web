define([
	"app/designs/base/_Main"
	, "app/designs/chart/Controller"
	, "app/designs/chart/layout/TopContent"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/chart/layer/ChartLayer/WindRoseChartImpl"
	, "src/component/chart/layer/ChartLayer/_ObtainableValue"
	, "src/component/chart/Toolbar/DataSelectorImpl"
	, "src/component/chart/Toolbar/GridManagementImpl"
	, "RWidgets/Utilities"
], function (
	_Main
	, Controller
	, TopContent
	, declare
	, lang
	, WindRoseChartImpl
	, _ObtainableValue
	, DataSelectorImpl
	, GridManagementImpl
	, Utilities
){
	return declare([TopContent, Controller, _Main], {
		//	summary:
		//		Gráfica de rosa de los vientos con barra de herramientas.
		//		TODO seguramente este fichero desaparezca, ya que sería igual que aplicar el multi con el
		//		_domainSplit fijo a 1.

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

				_currentDataSelectorValue: 0,
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

			this._dataSelector = new DataSelectorImpl({
				parentChannel: this.getChannel()
			});

			this.gridManagementConfig = this._merge([{
				parentChannel: this.getChannel(),
				getChartsContainerChannel: lang.hitch(this.chartsContainer,
					this.chartsContainer.getChannel)
			}, this.gridManagementConfig || {}]);

			this.gridManagement = new GridManagementImpl(this.gridManagementConfig);
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

			this._publish(this.gridManagement.getChannel("SHOW"), {
				node: this.buttonsContainerChartsTopNode
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
				data: [{
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
				/*},{
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
					value: 5.715*/
				}],
				parameterName: "%"
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

			this._chartInstance = this._createChartLayer({
				label: "frecuencia"
			});

			/*var label = this.chartsData[this._currentDataSelectorValue].timeInterval;
			this._publish(this._chartInstance.getChannel("SET_PROPS"), {
				label: Utilities.formatDate(label, "dateTime")
			});*/

			this._emitEvt('ADD_LAYER', {
				layerInstance: this._chartInstance
			});

			if (this.chartsData) {
				this._addDataToChart();
			}
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
		}
	});
});
