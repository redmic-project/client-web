define([
	'app/redmicConfig'
	, 'app/details/views/_ActivityTimeSeriesDataManagement'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "dojo/Deferred"
	, "redmic/modules/base/_Filter"
	, "redmic/modules/base/_Store"
	, "redmic/modules/search/FacetsImpl"
], function(
	redmicConfig
	, _ActivityTimeSeriesDataManagement
	, declare
	, lang
	, aspect
	, Deferred
	, _Filter
	, _Store
	, FacetsImpl
) {

	return declare([_Filter, _Store, _ActivityTimeSeriesDataManagement], {
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

			this._prepareDataToInject(data.features);

			if (currentEmbeddedContentKey === embeddedListKey) {
				this._injectDataToList();
			} else {
				this._injectDataToMap(data);
			}

			if (this._getListDataDfd && !this._getListDataDfd.isFulfilled()) {
				this._generateTimeSeriesDataFromSelectedData();
				this._getListDataDfd.resolve();
				this._getListDataDfd = null;
			}
		},

		_itemAvailable: function(response) {

			this._publish(this.browserPopup.getChannel('SHOW'));

			var browserPopupData = [],
				itemProps = response.data.properties;

			var stationPath = itemProps.site.path,
				stationParsedData = this._getParsedStation(stationPath);

			browserPopupData.push(stationParsedData);

			for (var i = 0; i < itemProps.measurements.length; i++) {
				var measurement = itemProps.measurements[i],
					parameterPath = measurement.parameter.path,
					dataDefinitionParsedData = this._getParsedDataDefinition(parameterPath);

				browserPopupData.push(dataDefinitionParsedData);
			}

			this._emitEvt('INJECT_DATA', {
				data: browserPopupData,
				target: this.browserPopupTarget
			});
		},

		_prepareDataToInject: function(features) {

			this._clearTimeseriesInternalStructures();

			for (var i = 0; i < features.length; i++) {
				this._parseData(features[i].properties);
			}
		},

		_injectDataToMap: function(data) {

			this._emitEvt('INJECT_DATA', {
				data: data,
				target: this.mapTarget
			});
		},

		_injectDataToList: function() {

			this._emitEvt('INJECT_DATA', {
				data: this._getTimeseriesHierarchicalList(),
				target: this.browserTarget
			});
		},

		_prepareTimeSeriesData: function(argument) {

			if (this._showChartIsValid()) {
				return;
			}

			if (this._timeseriesDefinitionListIsEmpty()) {
				this._getListDataDfd = new Deferred();
				this._getListData();
			} else {
				this._generateTimeSeriesDataFromSelectedData();
			}
		},

		_getMapData: function() {

			this._emitEvt('ADD_TO_QUERY', {
				query: {
					returnFields: this._mapReturnFields
				}
			});
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
