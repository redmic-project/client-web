define([
	"app/base/views/extensions/_CompositeInTooltipFromIconKeypad"
	, "app/base/views/extensions/_LocalSelectionView"
	, "app/designs/chart/main/_ProcessDataDefinitionAndGetTimeSeries"
	, "app/designs/chart/main/ChartsWithToolbarsAndSlider"
	, "app/designs/dynamicDualContent/Controller"
	, "app/designs/dynamicDualContent/layout/LeftSecondaryContent"
	, "app/designs/embeddedContentWithTopbar/main/EmbeddedContentSelectionInTopbar"
	, "app/designs/list/Controller"
	, "app/designs/list/layout/Layout"
	, "app/viewers/views/_SeriesSelectionManagement"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "dojo/Deferred"
	, "dojo/promise/all"
	, "redmic/modules/base/_Store"
	, "redmic/modules/base/_Filter"
	, "redmic/modules/browser/_Select"
	, "redmic/modules/browser/_EditionTable"
	, "redmic/modules/browser/bars/Pagination"
	, "redmic/modules/browser/bars/Total"
	, "templates/DataDefinitionList"
	, "templates/LoadingEmpty"
], function(
	_CompositeInTooltipFromIconKeypad
	, _LocalSelectionView
	, _ProcessDataDefinitionAndGetTimeSeries
	, ChartsWithToolbarsAndSlider
	, dynamicDualContentController
	, dynamicDualContentLayout
	, EmbeddedContentSelectionInTopbar
	, ListController
	, ListLayout
	, _SeriesSelectionManagement
	, redmicConfig
	, declare
	, lang
	, aspect
	, Deferred
	, all
	, _Store
	, _Filter
	, _Select
	, _EditionTable
	, Pagination
	, Total
	, DataDefinitionListTemplate
	, NoDataTemplate
){
	return declare([EmbeddedContentSelectionInTopbar, _Store, _Filter, _CompositeInTooltipFromIconKeypad,
		_LocalSelectionView, _SeriesSelectionManagement], {
		//	summary:
		//		Base común para vistas de SeriesData.
		//	description:
		//		Permite visualizar y editar los datos en serie.

		constructor: function(args) {

			this.config = {
				title: "{viewContent} - {stationName} ({activityName})",
				dataDefinitionListTitle: this.i18n.dataDefinitions,
				dataSeriesListTitle: this.i18n.dataSeries,

				activityTarget: redmicConfig.services.activity,
				dataDefinitionLocalTarget: "dataDefinitionLocal",

				loadPath: redmicConfig.viewPaths.activityGeoDataLoad,

				idProperty: "id",

				_queryDefault: {},

				embeddedButtons: {
					"showList": {
						className: "fa-list",
						title: this.i18n.list
					},
					"showCharts": {
						className: "fa-line-chart",
						title: this.i18n.charts
					}
				},

				seriesDataViewEvents: {
					UPDATE_TARGET: "updateTarget",
					SET_BUTTONS_PROPS: "setButtonsProps"
				},

				seriesDataViewActions: {},

				ownChannel: "seriesData"
			};

			lang.mixin(this, this.config, args);

			if (!this.pathVariableId) {
				console.error("Path variables not found");
			}

			aspect.before(this, "_setConfigurations", lang.hitch(this, this._setSeriesDataViewConfigurations));
			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixSeriesDataViewEventsAndActions));
			aspect.before(this, "_initialize", lang.hitch(this, this._initializeSeriesDataView));
			aspect.before(this, "_beforeShow", lang.hitch(this, this._beforeSeriesDataViewShow));
			aspect.before(this, "_setOwnCallbacksForEvents", lang.hitch(this,
				this._setSeriesDataViewOwnCallbacksForEvents));

			aspect.before(this, "_definePublications", lang.hitch(this, this._defineSeriesDataViewPublications));
		},

		_setSeriesDataViewConfigurations: function() {

			this.embeddedContentConfig = this._merge([{
				parentChannel: this.getChannel()
			}, this.embeddedContentConfig || {}]);

			this.filterConfig = this._merge([{
				initQuery: {
					vFlags: null,
					qFlags: null,
					accessibilityIds: null
				}
			}, this.filterConfig || {}]);

			this.dataDefinitionListConfig = this._merge([{
				parentChannel: this.getChannel(),
				title: this.dataDefinitionListTitle,
				buttonsInTopZone: true,
				buttons: {
					"uploadNewData": {
						className: "fa-upload",
						title: this.i18n.upload
					}
				},
				browserExts: [_Select],
				browserConfig: {
					bars: [{
						instance: Total
					}],
					selectorChannel: this.getChannel(),
					target: this.dataDefinitionLocalTarget,
					simpleSelection: true,
					template: DataDefinitionListTemplate
				}
			}, this.dataDefinitionListConfig || {}]);

			this.dataSeriesListConfig = this._merge([{
				parentChannel: this.getChannel(),
				title: this.dataSeriesListTitle,
				browserExts: [_EditionTable],
				browserConfig: {
					bars: [{
						instance: Total
					},{
						instance: Pagination
					}],
					target: this.dataSeriesTarget,
					noDataMessage: NoDataTemplate({
						i18n: this.i18n
					})
				},
				buttonsInTopZone: true,
				buttons: {
					"filters": {
						className: "fa-filter",
						title: this.i18n.filterTitle
					}
				}
			}, this.dataSeriesListConfig || {}]);
		},

		_mixSeriesDataViewEventsAndActions: function() {

			lang.mixin(this.events, this.seriesDataViewEvents);
			lang.mixin(this.actions, this.seriesDataViewActions);
			delete this.seriesDataViewEvents;
			delete this.seriesDataViewActions;
		},

		_initializeSeriesDataView: function() {

			var listDefinition = declare([ListLayout, ListController]);

			this.dataDefinitionList = new listDefinition(this.dataDefinitionListConfig);

			this.dataSeriesListConfig.browserConfig.queryChannel = this.queryChannel;

			this.dataSeriesList = new listDefinition(this.dataSeriesListConfig);

			this.dataSeriesCharts = new declare([
				ChartsWithToolbarsAndSlider,
				_ProcessDataDefinitionAndGetTimeSeries
			])(this.dataSeriesChartsConfig);

			this.embeddedContent = new declare([
				dynamicDualContentLayout,
				dynamicDualContentController
			])(this.embeddedContentConfig);

			this.iconKeypadChannel = this.dataSeriesList.getChildChannel("iconKeypad");
		},

		_defineSeriesDataViewPublications: function () {

			this.publicationsConfig.push({
				event: 'UPDATE_TARGET',
				channel: this.dataSeriesList.getChildChannel("browser", "UPDATE_TARGET")
			},{
				event: 'SET_BUTTONS_PROPS',
				channel: this.dataDefinitionList.getChildChannel("iconKeypad", "SET_BUTTONS_PROPS")
			});
		},

		_setSeriesDataViewOwnCallbacksForEvents: function() {

			this._onEvt('CHANGE_EMBEDDED_CONTENT', lang.hitch(this, this._onChangeEmbeddedContent));
			this._onEvt('ME_OR_ANCESTOR_HIDDEN', lang.hitch(this, this._cleanLoadedDataSeries));
		},

		postCreate: function() {

			this.inherited(arguments);

			this._publish(this.embeddedContent.getChannel("SET_PROPS"), {
				secondaryContent: this.dataDefinitionList
			});

			this._showDataSeriesListAndDisableChartsButton();
		},

		_showDataSeriesListAndDisableChartsButton: function() {

			var embeddedListKey = Object.keys(this.embeddedButtons)[0];
			this._showDataSeriesList(embeddedListKey);

			this._emitEvt("DISABLE_BUTTON", {
				key: "showCharts"
			});
		},

		_beforeSeriesDataViewShow: function() {

			this.target && this._publish(this.filter.getChannel("RESET"));

			var dataDefinitionTarget = lang.replace(this.dataDefinitionTarget, this.pathVariableId);
			this.target = [dataDefinitionTarget, this.activityTarget];

			this._stationDfd = new Deferred();
			this._activityDfd = new Deferred();
			all([this._activityDfd, this._stationDfd]).then(lang.hitch(this, this._updateTitle));

			this._emitEvt('GET', {
				target: dataDefinitionTarget,
				id: this.pathVariableId.id,
				requesterId: this.getOwnChannel()
			});

			this._emitEvt('GET', {
				target: this.activityTarget,
				id: this.pathVariableId.activityid,
				query: {
					returnFields: ['name']
				},
				requesterId: this.getOwnChannel()
			});

			this._replacedLoadPath = lang.replace(this.loadPath, this.pathVariableId);
			this._emitEvt('SET_BUTTONS_PROPS', {
				uploadNewData: {
					href: this._replacedLoadPath
				}
			});
		},

		_onChangeEmbeddedContent: function(evt) {

			var inputKey = evt.inputKey,
				buttonKeys = Object.keys(this.embeddedButtons),
				embeddedContentIndex = buttonKeys.indexOf(inputKey);

			if (embeddedContentIndex === 0) {
				this._showDataSeriesList(inputKey);
			} else if (embeddedContentIndex === 1) {
				this._showDataSeriesCharts(inputKey);
			}
		},

		_showDataSeriesList: function(inputKey) {

			this._publish(this.embeddedContent.getChannel("SET_PROPS"), {
				primaryContent: this.dataSeriesList
			});

			this._embedModule(this.embeddedContent, inputKey);
		},

		_showDataSeriesCharts: function(inputKey) {

			this._publish(this.dataSeriesCharts.getChannel("SET_PROPS"), {
				chartsData: this.seriesData
			});

			this._publish(this.embeddedContent.getChannel("SET_PROPS"), {
				primaryContent: this.dataSeriesCharts
			});

			this._embedModule(this.embeddedContent, inputKey);
		},

		_itemAvailable: function(res, resWrapper) {

			var target = resWrapper.target,
				data = res.data;

			if (target === this.activityTarget) {
				this._processActivityItem(data);
			} else {
				this._processStationItem(data);
			}
		},

		_updateTitle: function(results) {

			var activityName = results[0],
				stationName = results[1];

			this._setTitle(lang.replace(this.title, {
				viewContent: this.i18n.registers,
				stationName: stationName,
				activityName: activityName
			}));
		},

		_processActivityItem: function(data) {

			this._activityDfd.resolve(data.name);
		},

		_processStationItem: function(data) {

			var props = data.properties,
				measurements = props.measurements,
				site = props.site,
				dataDefinitions = this._getDataDefinitionsAsArray(measurements);

			this._stationDfd.resolve(site.name);

			this._updateDataDefinitionList(dataDefinitions);
			this._loadStationToChartsDataSeries(site);
		},

		_getDataDefinitionsAsArray: function(/*Array*/ measurements) {

			this._dataDefinitions = {};
			var dataDefinitionsArray = [];

			for (var i = 0; i < measurements.length; i++) {
				var measurement = lang.clone(measurements[i]),
					dataDefinition = measurement.dataDefinition,
					dataDefinitionId = dataDefinition[this.idProperty];

				dataDefinition.unit = measurement.unit;

				measurement.parameter.unit = measurement.unit.name;
				dataDefinition.parameter = measurement.parameter;

				this._dataDefinitions[dataDefinitionId] = dataDefinition;
				dataDefinitionsArray.push(dataDefinition);
			}

			return dataDefinitionsArray;
		},

		_updateDataDefinitionList: function(measurements) {

			this._emitEvt('INJECT_DATA', {
				data: measurements,
				target: this.dataDefinitionLocalTarget,
				total: measurements.length
			});
		},

		_loadStationToChartsDataSeries: function(station) {

			var stationsObj = {},
				stationId = station[this.idProperty];

			stationsObj[stationId] = station;
			this.seriesData.data.stations = stationsObj;
		},

		_localSelected: function(item) {

			var dataDefinitionId;

			if (Number.isInteger(item.ids)) {
				dataDefinitionId = item.ids;
			} else {
				dataDefinitionId = item.ids[0];
			}

			this._updateDataSeriesForm(dataDefinitionId);
			this._updateDataSeriesList(dataDefinitionId);
			this._updateDataSeriesCharts(dataDefinitionId);
		},

		_updateDataSeriesList: function(dataDefinitionId) {

			this._emitEvt('ADD_TO_QUERY', {
				query: {
					terms: {
						dataDefinition: [dataDefinitionId]
					}
				}
			});
		},

		_updateDataSeriesForm: function(dataDefinitionId) {

			var dataDefinition = this._dataDefinitions[dataDefinitionId];
			if (!dataDefinition) {
				return;
			}

			var replacingObj = {
					datadefinitionid: dataDefinitionId
				},
				dataSeriesFormTarget = lang.replace(this.dataSeriesFormTarget, replacingObj);

			this._publish(this.dataSeriesList.getChildChannel("browser", "UPDATE_TARGET_FORM"), {
				target: dataSeriesFormTarget
			});
		},

		_updateDataSeriesCharts: function(dataDefinitionId) {

			this._loadDefinitionAndParameterToChartsDataSeries(dataDefinitionId);

			var embeddedButtonKeys = Object.keys(this.embeddedButtons),
				embeddedChartsKey = embeddedButtonKeys[1];

			if (this._getCurrentContentKey() === embeddedChartsKey) {
				this._showDataSeriesCharts(embeddedChartsKey);
			} else {
				this._emitEvt("ENABLE_BUTTON", {
					key: "showCharts"
				});
			}
		},

		_loadDefinitionAndParameterToChartsDataSeries: function(dataDefinitionId) {

			var dataDefinition = this._dataDefinitions[dataDefinitionId];
			if (!dataDefinition) {
				return;
			}

			var definitionsObj = {},
				parameter = dataDefinition.parameter,
				parametersObj = {},
				parameterId = parameter[this.idProperty];

			definitionsObj[dataDefinitionId] = dataDefinition;
			this.seriesData.data.definitions = definitionsObj;

			parametersObj[parameterId] = parameter;
			this.seriesData.data.parameters = parametersObj;

			this._updateChartsDataSeriesIndexes(dataDefinition);
		},

		_updateChartsDataSeriesIndexes: function(dataDefinition) {

			var data = this.seriesData.data,
				stationId = parseInt(Object.keys(data.stations)[0], 10),
				parameterId = dataDefinition.parameter.id,
				definitionId = dataDefinition.id;

			var stationIndexObj = {};
			stationIndexObj[stationId] = [parameterId];
			this.seriesData.stationIndex = stationIndexObj;

			var parameterIndexObj = {};
			parameterIndexObj[parameterId] = [stationId];
			this.seriesData.parameterIndex = parameterIndexObj;

			var definitionIndexObj = {};
			definitionIndexObj[definitionId] = {
				pIds: parameterId,
				sIds: stationId
			};
			this.seriesData.definitionIndex = definitionIndexObj;
		},

		_localDeselected: function() {

			this._localClearSelection();
		},

		_localClearSelection: function() {

			this._publish(this.dataDefinitionList.getChildChannel("browser", "CLEAR_SELECTION"));
			this._publish(this.dataSeriesList.getChildChannel("browser", "CLEAR"));
			this._publish(this.dataSeriesCharts.getChildChannel("chartsContainer", "CLEAR"));
			this._clear();
		},

		_cleanLoadedDataSeries: function(evt) {

			this._showDataSeriesListAndDisableChartsButton();
			this._emitEvt("CLEAR_SELECTION");
		}
	});
});
