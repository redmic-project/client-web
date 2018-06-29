define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
], function(
	declare
	, lang
){
	return declare(null, {
		//	summary:
		//		Extensión para la vista de  para el manejo de seleccionados.
		//	description:
		//		Añade funcionalidades de manejo de seleccionados a la vista.

		constructor: function(args) {

			this.config = {
				seriesData: {
					data: {
						stations: {},
						parameters: {},
						definitions: {}
					},
					stationIndex: {},
					parameterIndex: {},
					definitionIndex: {}
				}
			};

			lang.mixin(this, this.config);
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

			if (this.seriesData) {
				this.seriesData.stationIndex = {};
				this.seriesData.parameterIndex = {};
				this.seriesData.definitionIndex = {};

				if (this.seriesData.data) {
					this.seriesData.data.stations = {};
					this.seriesData.data.parameters = {};
					this.seriesData.data.definitions = {};
				}
			}
		}
	});
});
