define([
	"app/viewers/views/_SeriesSelectionManagement"
	, "app/viewers/views/_TimeSeriesDataManagement"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/base/_Selection"
], function(
	_SeriesSelectionManagement
	, _TimeSeriesDataManagement
	, declare
	, lang
	, aspect
	, _Selection
){
	return declare([_TimeSeriesDataManagement, _SeriesSelectionManagement, _Selection], {
		//	summary:
		//		Extensión para la vista de  para el manejo de seleccionados.
		//	description:
		//		Añade funcionalidades de manejo de seleccionados a la vista.

		constructor: function(args) {

			this.config = {
				_selected: {},
				_insertedInTimeSeriesData: {},
				pathSeparator: "."
			};

			lang.mixin(this, this.config);

			aspect.before(this, "_select", lang.hitch(this, this._selectTimeSeriesSelectionManagement));
			aspect.before(this, "_deselect", lang.hitch(this, this._deselectTimeSeriesSelectionManagement));
		},

		postCreate: function() {

			this.inherited(arguments);

			this._emitEvt("GROUP_SELECTED");
		},

		_selectTimeSeriesSelectionManagement: function(path) {

			this._selected[path] = true;
			this._insertedInTimeSeriesData = {};
		},

		_deselectTimeSeriesSelectionManagement: function(path) {

			delete this._selected[path];
			this._insertedInTimeSeriesData = {};
		},

		_generateTimeSeriesData: function() {

			this._clear();

			for (var path in this._selected) {
				if (path.split(".").length > 2) {
					this._insertItemInDataChart(path);
				}
			}
		},

		_insertItemInDataChart: function(path) {

			if (this._indexDataList[path] !== undefined && !this._insertedInTimeSeriesData[path]) {

				this._updateDataChart = true;
				this._insertedInTimeSeriesData[path] = true;

				var item = this._dataList[this._indexDataList[path]],
					stationId = this._insertStation(this._dataList[this._indexDataList[this._pathParent(path)]]),
					parameterId = this._insertParameter(item),
					dataDefinitionIds = this._insertDataDefinitions(item);

				this._insertOrUpdateIndex(stationId, parameterId, dataDefinitionIds);
			}
		},

		_pathParent: function(path) {

			var regex = /(.+)\.[0-9]+$/;

			return path.replace(regex, "$1");
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

		_showChartIsValid: function() {

			return !!Object.keys(this._insertedInTimeSeriesData).length;
		},

		_clear: function() {

			this._insertedInTimeSeriesData = {};

			this.inherited(arguments);
		}
	});
});
