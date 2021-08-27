define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
], function(
	declare
	, lang
) {

	return declare(null, {
		//	summary:
		//		Extensión para la vista de detalle de actividad para el manejo de series temporales.

		constructor: function(args) {

			this.config = {
				pathSeparator: '.',
				_timeseriesDefinitionList: [],
				_timeseriesStationList: [],
				_timeseriesDefinitionIndexByPath: {},
				_timeseriesStationIndexByPath: {},
				// TODO renombrar, esqueleto de 'seriesData'
				_emptySeriesData: {
					data: {
						stations: {},
						parameters: {},
						definitions: {}
					},
					stationIndex: {},
					parameterIndex: {},
					definitionIndex: {}
				},
				// TODO renombrar, definición de datos de timeseries disponibles para consultar
				// por ejemplo, '_chartsDefinitionData'
				seriesData: null
			};

			lang.mixin(this, this.config);
		},

		_buildChartData: function(sourceData) {

			this._clear();

			this._parseData(sourceData);
			this._generateChartsDefinitionDataFromTimeseriesInternalStructures();
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

			this._addSourceDataToTimeseriesInternalStructures(dataList);
		},

		_isInserted: function(data, itemId) {

 			for (var n = 0; n < data.length; n++) {
 				if (data[n].path === itemId) {
 					return n;
 				}
 			}

 			return -1;
 		},

		_addSourceDataToTimeseriesInternalStructures: function(data) {

			for (var i = 0; i < data.length; i++) {
				var item = data[i],
					itemPath = item.path,
					isStationItem = itemPath.split(this.pathSeparator).length < 3;

				if (isStationItem) {
					this._timeseriesStationList.push(item);
					this._timeseriesStationIndexByPath[itemPath] = this._timeseriesStationList.length - 1;
				} else {
					this._timeseriesDefinitionList.push(item);
					this._timeseriesDefinitionIndexByPath[itemPath] = this._timeseriesDefinitionList.length - 1;
				}
			}
		},

		_timeseriesDefinitionListIsEmpty: function() {

			return !this._timeseriesDefinitionList || this._timeseriesDefinitionList.length === 0;
		},

		_getTimeseriesDefinitionList: function() {

			return this._timeseriesDefinitionList;
		},

		_generateChartsDefinitionDataFromTimeseriesInternalStructures: function() {

			for (var i = 0; i < this._timeseriesDefinitionList.length; i++) {
				var item = this._timeseriesDefinitionList[i],
					path = item.path;

				this._insertItemInDataChart(path);
			}
		},

		// TODO renombrar
		_insertItemInDataChart: function(path) {

			var itemIndex = this._timeseriesDefinitionIndexByPath[path];

			if (itemIndex === undefined) {
				return false;
			}

			var item = this._timeseriesDefinitionList[itemIndex],
				parentPath = this._getParentPath(path),
				parentIndex = this._timeseriesStationIndexByPath[parentPath],
				parentItem = this._timeseriesStationList[parentIndex],

				stationId = this._insertStation(parentItem),
				parameterId = this._insertParameter(item),
				dataDefinitionIds = this._insertDataDefinitions(item);

			this._insertOrUpdateIndex(stationId, parameterId, dataDefinitionIds);

			return true;
		},

		_getParentPath: function(path) {

			var regex = /(.+)\.[0-9]+$/;

			return path.replace(regex, '$1');
		},

		// TODO renombrar
		_insertStation: function(itemStation) {

			if (itemStation && !this.seriesData.data.stations[itemStation.id]) {
				this.seriesData.data.stations[itemStation.id] = itemStation;
			}

			return itemStation.id;
		},

		// TODO renombrar
		_insertParameter: function(item) {

			var parameter = lang.clone(item);
			if (!this.seriesData.data.parameters[item.id]) {
				delete parameter.id;
				this.seriesData.data.parameters[item.id] = parameter;
			}

			return item.id;
		},

		// TODO renombrar
		_insertDataDefinitions: function(item) {

			var ids = {},
				dataDefinitions = item.dataDefinitions;

			for (var n = 0; n < dataDefinitions.length; n++) {
				if (!ids[dataDefinitions[n].z]) {
					ids[dataDefinitions[n].z] = [];
				}

				ids[dataDefinitions[n].z].push(dataDefinitions[n].id);

				if (!this.seriesData.data.definitions[dataDefinitions[n].id]) {
					var dataDef = lang.clone(dataDefinitions[n]);
					delete dataDef.id;
					delete dataDef.unit;

					this.seriesData.data.definitions[dataDefinitions[n].id] = dataDef;
				}
			}

			return ids;
		},

		// TODO renombrar
		_insertOrUpdateIndex: function(stationId, parameterId, dataDefinitionIds) {

			if (!this.seriesData.stationIndex[stationId]) {
				this.seriesData.stationIndex[stationId] = [parameterId];
			} else {
				this.seriesData.stationIndex[stationId].push(parameterId);
			}

			if (!this.seriesData.parameterIndex[parameterId]) {
				this.seriesData.parameterIndex[parameterId] = [stationId];
			} else {
				this.seriesData.parameterIndex[parameterId].push(stationId);
			}

			for (var z in dataDefinitionIds) {
				var dataDefinitionIdsJoined = dataDefinitionIds[z].join(this.idSeparator);
				if (!this.seriesData.definitionIndex[dataDefinitionIdsJoined]) {

					this.seriesData.definitionIndex[dataDefinitionIdsJoined] = {
						sIds: stationId,
						pIds: parameterId
					};
				}
			}
		},

		_getChartsDefinitionData: function() {

			return this.seriesData;
		},

		_clear: function() {

			this.inherited(arguments);

			this._clearChartsDefinitionData();
			this._clearTimeseriesInternalStructures();
		},

		_clearChartsDefinitionData: function() {

			this.seriesData = lang.clone(this._emptySeriesData);
		},

		_clearTimeseriesInternalStructures: function() {

			this._timeseriesDefinitionList = [];
			this._timeseriesStationList = [];
			this._timeseriesDefinitionIndexByPath = {};
			this._timeseriesStationIndexByPath = {};
		}
	});
});
