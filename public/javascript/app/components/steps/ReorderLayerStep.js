define([
	"app/base/views/extensions/_LocalSelectionView"
	, "dojo/_base/declare"
	, "redmic/modules/browser/_HierarchicalSelect"
	, "./ReorderLayersStep"
], function (
	_LocalSelectionView
	, declare
	, _HierarchicalSelect
	, ReorderLayerStep
){
	return declare([ReorderLayerStep, _LocalSelectionView], {
		//	summary:
		//		Step de categorización de capas. Permite anidar y mover entre categorías,
		//		así como crear nuevas categorias.

		constructor: function (args) {

		},

		_setConfigurations: function() {

			this.browserExts.unshift(_HierarchicalSelect);

			this.inherited(arguments);
		},

		_subDragAndDrop: function(res) {

			this._results = res.parentId || null;

			this._emitChangeResults(this._results);
		},

		_instanceDataToResult: function(data) {

			this._defaultData = data;

			this._results = data.parent;
			this._isCompleted = true;

			this._emitChangeResults(this._results);
		},

		_browserRefreshed: function(obj) {

			this._expandItem(this._defaultData);
			this._selectedItem(this._defaultData);
		},

		_restoreToInitialStatus: function() {

			this._publish(this.browser.getChannel("REFRESH"), {
				initData: true
			});

			if (this._defaultData) {
				this._instanceDataToResult(this._defaultData);
			}
		},

		_selectedItem: function(data) {

			this._publish(this.getChannel("CLEAR_SELECTION"));

			this._publish(this.getChannel("SELECT"), {
				items: [data.id],
				selectionTarget: this.getChannel()
			});
		},

		_expandItem: function(data) {

			var path = data.path,
				pathSplit = path.split('.');

			for (var i = 1; i < (pathSplit.length - 1); i++) {
				this._publish(this.browser.getChannel("EXPAND_ROW"), {
					idProperty: parseInt(pathSplit[i], 10)
				});
			}
		}
	});
});
