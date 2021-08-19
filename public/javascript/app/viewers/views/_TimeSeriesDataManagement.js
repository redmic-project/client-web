define([
	'app/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "dojo/Deferred"
	, "redmic/modules/base/_Filter"
	, "redmic/modules/base/_Store"
	, "redmic/modules/search/FacetsImpl"
], function(
	redmicConfig
	, declare
	, lang
	, aspect
	, Deferred
	, _Filter
	, _Store
	, FacetsImpl
) {

	return declare([_Filter, _Store], {
		//	summary:
		//		Extensión para la vista de timeSeries para el manejo de datos.
		//	description:
		//		Añade funcionalidades de manejo de datos a la vista.

		constructor: function(args) {

			this.config = {
				dataViewEvents: {},
				dataViewActions: {},
				_listDataReturnFields: redmicConfig.returnFields.timeSeriesStationsList,
				_mapReturnFields: redmicConfig.returnFields.timeSeriesStationsMap,
				_dataList: [],
				_indexDataList: {},
				_getListDataDfd: null
			};

			lang.mixin(this, this.config);

			aspect.before(this, "_afterSetConfigurations", lang.hitch(this, this._setDataViewConfigurations));
			aspect.after(this, "_beforeInitialize", lang.hitch(this, this._initializeDataView));
			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixDataViewEventsAndActions));
			aspect.before(this, "_prepareShowChart", lang.hitch(this, this._prepareTimeSeriesData));
		},

		_setDataViewConfigurations: function() {

			this.facetsConfig = this._merge([{
				parentChannel: this.getChannel(),
				aggs: redmicConfig.aggregations.timeSeriesStations
			}, this.facetsConfig || {}]);
		},

		_initializeDataView: function() {

			this.facetsConfig.queryChannel = this.queryChannel;
			this.facets = new FacetsImpl(this.facetsConfig);
		},

		_mixDataViewEventsAndActions: function() {

			lang.mixin(this.events, this.dataViewEvents);
			lang.mixin(this.actions, this.dataViewActions);

			delete this.dataViewEvents;
			delete this.dataViewActions;
		},

		_dataAvailable: function(res) {

			var data = res.data;

			if (!data.features || !data.features.length) {
				return;
			}

			var embeddedButtonKeys = Object.keys(this.embeddedButtons),
				embeddedListKey = embeddedButtonKeys[1],
				currentEmbeddedContentKey = this._getCurrentContentKey();

			// TODO hay cosas en el injectDataToList que no son solo para el listado, revisar para no tener que
			// llamar a este, sino solo a la parte necesaria
			this._injectDataToList(data.features);
			if (currentEmbeddedContentKey === embeddedListKey) {
				//this._injectDataToList(data.features);
			} else {
				this._injectDataToMap(data);
			}

			if (this._getListDataDfd && !this._getListDataDfd.isFulfilled()) {
				this._generateTimeSeriesData();
				this._getListDataDfd.resolve();
				this._getListDataDfd = null;
			}
		},

		_itemAvailable: function(response) {

			var dataToInject = this._parseData(response.data.properties);

			this._publish(this.browserPopup.getChannel("SHOW"));

			this._emitEvt('INJECT_DATA', {
				data: dataToInject,
				target: this.browserPopupTarget
			});
		},

		_injectDataToMap: function(data) {

			this._emitEvt('INJECT_DATA', {
				data: data,
				target: this.mapTarget
			});
		},

		_injectDataToList: function(features) {

			this._dataList = [];
			this._indexDataList = {};

			for (var i = 0; i < features.length; i++) {
				this._parseData(features[i].properties);
			}

			this._emitEvt('INJECT_DATA', {
				data: lang.clone(this._dataList),
				target: this.browserTarget
			});
		},

		_parseData: function(item) {

			var site = item.site,
				measurementsSize = item.measurements.length,
				parameters = [],
				dataList = [];

			for (var n = 0; n < measurementsSize; n++) {
				var measurement = item.measurements[n],
					parameter = measurement.parameter,
					dataDefinition = measurement.dataDefinition,
 					index = this._isInserted(dataList, parameter.path);
 				if (index < 0) {
 					parameter.leaves = 0;
 					parameter.dataDefinitions = [dataDefinition];
 					parameter.unit = measurement.unit.name;

 					parameters.push(parameter);
 					dataList.push(parameter);
 				} else {
 					dataList[index].dataDefinitions.push(dataDefinition);
 				}
			}

			site.activityId = item.activityId;
			site.leaves = parameters.length;

			dataList.push(site);
			this._addToDataList(dataList);

			return dataList;
		},

		_isInserted: function(data, itemId) {

 			for (var n = 0; n < data.length; n++) {
 				if (data[n].path === itemId) {
 					return n;
 				}
 			}

 			return -1;
 		},

		_addToDataList: function(data) {

			for (var i = 0; i < data.length; i++) {
				this._dataList.push(data[i]);
				this._indexDataList[data[i].path] = this._dataList.length - 1;
			}
		},

		_getMapData: function() {

			this._emitEvt('ADD_TO_QUERY', {
				query: {
					returnFields: this._mapReturnFields
				}
			});
		},

		_prepareTimeSeriesData: function(argument) {

			if (this._showChartIsValid()) {
				return;
			}

			if (this._dataListIsEmpty()) {
				this._getListDataDfd = new Deferred();
				this._getListData();
			} else {
				this._generateTimeSeriesData();
			}
		},

		_dataListIsEmpty: function() {

			return !this._dataList || this._dataList.length === 0;
		},

		_getListData: function() {

			this._emitEvt('ADD_TO_QUERY', {
				query: {
					returnFields: this._listDataReturnFields
				}
			});
		}
	});
});
