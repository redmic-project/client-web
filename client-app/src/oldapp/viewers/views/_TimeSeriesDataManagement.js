define([
	'src/redmicConfig'
	, 'app/details/views/_ActivityTimeSeriesDataManagement'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "dojo/Deferred"
	, "src/component/base/_Filter"
	, "src/component/base/_Store"
	, "src/component/search/FacetsImpl"
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

			if (this._getListDataDfd && !this._getListDataDfd.isFulfilled()) {
				this._buildTimeseriesData(data.features);
				this._getListDataDfd.resolve();
				return;
			}

			var embeddedButtonKeys = Object.keys(this.embeddedButtons),
				embeddedListKey = embeddedButtonKeys[1],
				currentKey = this._getCurrentContentKey();

			if (currentKey === embeddedListKey) {
				var itemsFromFeatures = this._getItemsFromFeaturesData(data.features);
				this._injectDataToList(itemsFromFeatures);
			} else {
				this._injectDataToMap(data);
			}
		},

		_itemAvailable: function(response) {

			this._publish(this.browserPopup.getChannel('SHOW'));

			var featureProps = response.data.properties,
				itemsFromFeature = this._getItemsFromFeatureProperties(featureProps);

			this._injectDataToPopupList(itemsFromFeature);
		},

		_buildTimeseriesData: function(features) {

			this._clearTimeseriesInternalStructures();

			for (var i = 0; i < features.length; i++) {
				this._parseAndAddTimeseriesData(features[i].properties);
			}
		},

		_getItemsFromFeaturesData: function(features) {

			var parsedItems = [];

			for (var i = 0; i < features.length; i++) {
				var featureProps = features[i].properties,
					parsedItem = this._getItemsFromFeatureProperties(featureProps);

				parsedItems = parsedItems.concat(parsedItem);
			}

			return parsedItems;
		},

		_injectDataToMap: function(data) {

			this._emitEvt('INJECT_DATA', {
				data: data,
				target: this.mapTarget
			});
		},

		_injectDataToList: function(data) {

			this._emitEvt('INJECT_DATA', {
				data: data,
				target: this.browserTarget
			});
		},

		_injectDataToPopupList: function(data) {

			this._emitEvt('INJECT_DATA', {
				data: data,
				target: this.browserPopupTarget
			});
		},

		_prepareTimeSeriesData: function() {

			if (this._showChartIsValid() || this._getSelectionIsEmpty()) {
				return;
			}

			var callback = lang.hitch(this, this._generateTimeSeriesDataFromSelectedData);
			if (this._timeseriesDefinitionListIsEmpty()) {
				this._getListDataDfd = new Deferred();
				this._getListDataDfd.then(callback);
				this._getTimeseriesData();
			} else {
				callback();
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
		},

		_getTimeseriesData: function() {

			this._emitEvt('REQUEST', {
				target: this.target
			});
		}
	});
});
