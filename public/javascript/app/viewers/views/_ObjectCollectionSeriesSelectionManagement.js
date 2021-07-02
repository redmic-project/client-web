define([
	"app/viewers/views/_SeriesSelectionManagement"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function(
	_SeriesSelectionManagement
	, declare
	, lang
){
	return declare([_SeriesSelectionManagement], {
		//	summary:
		//		Extensión para el parseo de los datos.
		//	description:
		//		Añade funcionalidades de manejo de los datos para los object collection series.

		constructor: function(args) {

			this.config = {

			};

			lang.mixin(this, this.config);
		},

		_generateObjectCollectionSeriesData: function(data) {

			this._clear();

			this.seriesData.data.activityId = data.activityId;

			var stationId = this._insertStation(data.site),
				measurements = data.measurements;

			for (var i = 0; i < measurements.length; i++) {
				this._insertItemInDataChart(measurements[i], stationId);
			}
		},

		_insertItemInDataChart: function(item, stationId) {

			item.parameter.unit = item.unit.name;

			var parameterId = this._insertParameter(item.parameter),
				dataDefinitionIds = this._insertDataDefinitions(item.dataDefinition);

			this._insertOrUpdateIndex(stationId, parameterId, dataDefinitionIds);
		},

		_insertDataDefinitions: function(dataDefinitions) {

			var ids = {};

			if (!ids[dataDefinitions.z]) {
				ids[dataDefinitions.z] = [];
			}

			ids[dataDefinitions.z].push(dataDefinitions.id);

			if (!this.seriesData.data.definitions[dataDefinitions.id]) {
				var dataDef = lang.clone(dataDefinitions);
				delete dataDef.id;

				this.seriesData.data.definitions[dataDefinitions.id] = dataDef;
			}

			return ids;
		}
	});
});
