define([
	'app/viewers/views/_TimeSeriesDataManagement'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
], function(
	_TimeSeriesDataManagement
	, declare
	, lang
) {

	return declare(_TimeSeriesDataManagement, {
		//	summary:
		//		Extensión para la vista de detalle de actividad para el manejo de series temporales.

		constructor: function(args) {

			this.config = {
				emptySeriesData: {
					data: {
						stations: {},
						parameters: {},
						definitions: {}
					},
					stationIndex: {},
					parameterIndex: {},
					definitionIndex: {}
				},
				pathSeparator: '.'
			};

			lang.mixin(this, this.config);
		},

		_buildChartData: function(sourceData) {

			this._dataList = [];
			this._indexDataList = {};

			var parsedData = this._parseData(sourceData);
			this._generateTimeSeriesDataFromParsedData(parsedData);
		},

		_generateTimeSeriesDataFromParsedData: function(parsedData) {

			this._clear();

			for (var i = 0; i < parsedData.length; i++) {
				var item = parsedData[i],
					path = item.path;

				this._insertItemInDataChart(path);
			}
		},

		_insertItemInDataChart: function(path) {

			if (this._indexDataList[path] === undefined || path.split(this.pathSeparator).length < 3) {
				return false;
			}

			var item = this._dataList[this._indexDataList[path]],
				stationId = this._insertStation(this._dataList[this._indexDataList[this._getParentPath(path)]]),
				parameterId = this._insertParameter(item),
				dataDefinitionIds = this._insertDataDefinitions(item);

			this._insertOrUpdateIndex(stationId, parameterId, dataDefinitionIds);

			return true;
		},

		_getParentPath: function(path) {

			var regex = /(.+)\.[0-9]+$/;

			return path.replace(regex, '$1');
		},

		_insertStation: function(itemStation) {

			if (itemStation && !this.seriesData.data.stations[itemStation.id]) {
				this.seriesData.data.stations[itemStation.id] = itemStation;
			}

			return itemStation.id;
		},

		_insertParameter: function(item) {

			var parameter = lang.clone(item);
			if (!this.seriesData.data.parameters[item.id]) {
				delete parameter.id;
				this.seriesData.data.parameters[item.id] = parameter;
			}

			return item.id;
		},

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

		_clear: function() {

			this.inherited(arguments);

			this.seriesData = lang.clone(this.emptySeriesData);
		}
	});
});
