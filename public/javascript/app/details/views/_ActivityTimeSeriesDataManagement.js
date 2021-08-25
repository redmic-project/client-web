define([
	'app/viewers/views/_SeriesSelectionManagement'
	, 'app/viewers/views/_TimeSeriesDataManagement'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
], function(
	_SeriesSelectionManagement
	, _TimeSeriesDataManagement
	, declare
	, lang
	, aspect
) {

	return declare([_TimeSeriesDataManagement, _SeriesSelectionManagement], {
		//	summary:
		//		Extensión para la vista de detalle de actividad para el manejo de series temporales.

		constructor: function(args) {

			this.config = {
				_insertedInTimeSeriesData: {},
				pathSeparator: '.'
			};

			lang.mixin(this, this.config);

			aspect.after(this, '_setOwnCallbacksForEvents', lang.hitch(this,
				this._setTimeSeriesSelectionManagementOwnCallbacksForEvents));
		},

		_setTimeSeriesSelectionManagementOwnCallbacksForEvents: function() {

			this._onEvt('HIDE', lang.hitch(this, this._onTimeSeriesSelectionManagementHidden));
		},

		_generateTimeSeriesData: function(listData) {

			this._clear();

			for (var i = 0; i < listData.length; i++) {
				var item = listData[i],
					path = item.path;

				if (path.split(this.pathSeparator).length > 2) {
					this._insertItemInDataChart(path);
				}
			}
		},

		_insertItemInDataChart: function(path) {

			if (this._indexDataList[path] !== undefined && !this._insertedInTimeSeriesData[path]) {
				this._updateDataChart = true;
				this._insertedInTimeSeriesData[path] = true;

				var item = this._dataList[this._indexDataList[path]],
					stationId = this._insertStation(this._dataList[this._indexDataList[this._getParentPath(path)]]),
					parameterId = this._insertParameter(item),
					dataDefinitionIds = this._insertDataDefinitions(item);

				this._insertOrUpdateIndex(stationId, parameterId, dataDefinitionIds);
			}
		},

		_getParentPath: function(path) {

			var regex = /(.+)\.[0-9]+$/;

			return path.replace(regex, '$1');
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

		_clear: function() {

			this._insertedInTimeSeriesData = {};

			this.inherited(arguments);
		}
	});
});
