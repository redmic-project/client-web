define([
	'alertify/alertify.min'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'redmic/modules/base/_Selection'
], function(
	alertify
	, declare
	, lang
	, aspect
	, _Selection
) {

	return declare(_Selection, {
		//	summary:
		//		Extensión para la vista de gráficas para el manejo de seleccionados.
		//	description:
		//		Añade funcionalidades de manejo de seleccionados a la vista.

		constructor: function(args) {

			this.config = {
				_selected: {},
				_insertedInTimeSeriesData: {},
				maxParams: 10
			};

			lang.mixin(this, this.config);

			aspect.after(this, '_setOwnCallbacksForEvents', lang.hitch(this,
				this._setTimeSeriesSelectionManagementOwnCallbacksForEvents));

			aspect.before(this, '_select', lang.hitch(this, this._selectTimeSeriesSelectionManagement));
			aspect.before(this, '_deselect', lang.hitch(this, this._deselectTimeSeriesSelectionManagement));
			aspect.before(this, '_clearSelection', lang.hitch(this, this._clearSelectionTimeSeriesSelectionManagement));
		},

		_setTimeSeriesSelectionManagementOwnCallbacksForEvents: function() {

			this._onEvt('HIDE', lang.hitch(this, this._onTimeSeriesSelectionManagementHidden));
		},

		postCreate: function() {

			this.inherited(arguments);

			this._emitEvt('GROUP_SELECTED');
		},

		_selectTimeSeriesSelectionManagement: function(path) {

			this._selected[path] = true;
			this._clearChartsDefinitionData();
		},

		_deselectTimeSeriesSelectionManagement: function(path) {

			delete this._selected[path];
			this._clearChartsDefinitionData();
		},

		_clearSelectionTimeSeriesSelectionManagement: function() {

			this._clearChartsDefinitionData();
		},

		_generateTimeSeriesDataFromSelectedData: function() {

			this._clearChartsDefinitionData();

			var selectedKeys = Object.keys(this._selected),
				selectedCount = selectedKeys.length;

			if (selectedCount > this.maxParams) {
				this._selectionTooBigAlertify = alertify.message(this.i18n.cannotGetDataWithTooBigSelection, 0);
				selectedCount = this.maxParams;
			}

			for (var i = 0; i < selectedCount; i++) {
				var path = selectedKeys[i];
				if (!this._insertedInTimeSeriesData[path]) {
					if (this._insertItemInDataChart(path)) {
						this._updateDataChart = true;
						this._insertedInTimeSeriesData[path] = true;
					}
				}
			}
		},

		_showChartIsValid: function() {

			return !!Object.keys(this._insertedInTimeSeriesData).length;
		},

		_onTimeSeriesSelectionManagementHidden: function() {

			this._selectionTooBigAlertify && this._selectionTooBigAlertify.dismiss();
		},

		_clearChartsDefinitionData: function() {

			this.inherited(arguments);

			this._insertedInTimeSeriesData = {};
		}
	});
});
