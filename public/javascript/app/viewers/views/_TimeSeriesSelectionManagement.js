define([
	'alertify/alertify.min'
	, "app/viewers/views/_SeriesSelectionManagement"
	, "app/viewers/views/_TimeSeriesDataManagement"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/base/_Selection"
], function(
	alertify
	, _SeriesSelectionManagement
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
				pathSeparator: '.',
				maxParams: 10
			};

			lang.mixin(this, this.config);

			aspect.after(this, '_setOwnCallbacksForEvents', lang.hitch(this,
				this._setTimeSeriesSelectionManagementOwnCallbacksForEvents));

			aspect.before(this, "_select", lang.hitch(this, this._selectTimeSeriesSelectionManagement));
			aspect.before(this, "_deselect", lang.hitch(this, this._deselectTimeSeriesSelectionManagement));
		},

		_setTimeSeriesSelectionManagementOwnCallbacksForEvents: function() {

			this._onEvt('HIDE', lang.hitch(this, this._onTimeSeriesSelectionManagementHidden));
		},

		postCreate: function() {

			this.inherited(arguments);

			this._emitEvt("GROUP_SELECTED");
		},

		_selectTimeSeriesSelectionManagement: function(path) {

			this._selected[path] = true;
		},

		_deselectTimeSeriesSelectionManagement: function(path) {

			delete this._selected[path];
			delete this._insertedInTimeSeriesData[path];
		},

		_generateTimeSeriesData: function() {

			this._clear();

			var selectedKeys = Object.keys(this._selected),
				selectedCount = selectedKeys.length;

			if (selectedCount > this.maxParams) {
				this._selectionTooBigAlertify = alertify.message(this.i18n.cannotGetDataWithTooBigSelection, 0);
				selectedCount = this.maxParams;
			}

			for (var i = 0; i < selectedCount; i++) {
				var path = selectedKeys[i];
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
		},

		_onTimeSeriesSelectionManagementHidden: function() {

			this._selectionTooBigAlertify && this._selectionTooBigAlertify.dismiss();
		}
	});
});
