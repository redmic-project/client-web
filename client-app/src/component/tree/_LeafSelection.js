define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
], function(
	declare
	, lang
	, aspect
){
	return declare(null, {

		constructor: function(args) {

			this.config = {
				leavesProperty: "leaves",
				_selectionStructure: {}
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_insertItemIntoStore", lang.hitch(this, this._beforeInsertItemIntoStore));
			aspect.after(this, "_insertItemIntoStore", lang.hitch(this, this._afterInsertItemIntoStore));
			aspect.before(this, "_select", lang.hitch(this, this._selectLeafSelection));
			aspect.before(this, "_deselect", lang.hitch(this, this._deselectLeafSelection));
			aspect.after(this, "clear", lang.hitch(this, this.clearLeafSelection));
		},

		_beforeInsertItemIntoStore: function(item) {

			if (item && !this.getItem(item[this.idProperty])) {
				this._updateSelectionStructureFromRequested(item);
			}
		},

		_afterInsertItemIntoStore: function(inheritedReturn, args) {

			var item = args[0];

			if (item) {
				this._evaluateAncestorSelectedState(item[this.idProperty]);
			}
		},

		_updateSelectionStructureFromRequested: function(item) {

			this._addRequestedToSelectionStructure(item[this.idProperty], item[this.leavesProperty]);
		},

		_addRequestedToSelectionStructure: function(path, leaves) {

			if (!this._selectionStructure[path]) {
				this._selectionStructure[path] = {
					leaves: leaves,
					selectedLeaves: 0
				};
			} else {
				this._selectionStructure[path].leaves = leaves;
			}
		},

		_selectLeafSelection: function(itemId) {

			itemId = this._obtainItemId(itemId);

			if (this._selection[itemId])
				return;

			if (!this._selectionStructure[itemId] || !this._selectionStructure[itemId].selectedLeaves) {
				this._updateSelectionStructureFromSelected(itemId);
			}
		},

		_updateSelectionStructureFromSelected: function(path) {

			var pathSplitted = path.split(this.pathSeparator);

			this._addSelectedToSelectionStructure(path, true);
			pathSplitted.pop();

			while (pathSplitted.length > 1) {
				var ancestorPath = pathSplitted.join(this.pathSeparator);
				this._addSelectedToSelectionStructure(ancestorPath);
				this._evaluateAncestorSelectedState(ancestorPath);
				pathSplitted.pop();
			}
		},

		_addSelectedToSelectionStructure: function(path, isLeaf) {

			if (!this._selectionStructure[path]) {
				this._selectionStructure[path] = {
					leaves: isLeaf ? 0 : null,
					selectedLeaves: 1
				};
			} else {
				this._selectionStructure[path].selectedLeaves++;
			}
		},

		_deselectLeafSelection: function(itemId) {

			itemId = this._obtainItemId(itemId);

			if (!this._selection[itemId])
				return;

			if (this._selectionStructure[itemId] && this._selectionStructure[itemId].selectedLeaves) {
				this._updateSelectionStructureFromDeselected(itemId);
			}
		},

		_updateSelectionStructureFromDeselected: function(path) {

			var pathSplitted = path.split(this.pathSeparator);

			while (pathSplitted.length > 1) {
				var itemPath = pathSplitted.join(this.pathSeparator);
				this._removeSelectedFromSelectionStructure(itemPath);
				this._evaluateAncestorSelectedState(itemPath);
				pathSplitted.pop();
			}
		},

		_removeSelectedFromSelectionStructure: function(path) {

			this._selectionStructure[path].selectedLeaves--;
		},

		_evaluateAncestorSelectedState: function(ancestorPath) {

			var ancestorItem = this.getItem(ancestorPath),
				structure = this._selectionStructure[ancestorPath],
				leaves = structure.leaves,
				selectedLeaves = structure.selectedLeaves,
				newState;

			if (selectedLeaves === 0) {
				newState = false;
			} else if (leaves !== null && selectedLeaves >= leaves) {
				newState = true;
			} else {
				newState = "mixed";
			}

			ancestorItem && this.model._setChecked(ancestorItem, newState);
		},

		_clearSelection: function() {

			var keys = Object.keys(this._selection);

			for (var i = 0; i < keys.length; i++) {
				var selectedItemId = keys[i],
					leaves = this._selectionStructure[selectedItemId].leaves;

				if (leaves === 0) {
					this._deselect(selectedItemId);
				}
			}
		},

		clearLeafSelection: function() {

			this._selectionStructure = {};
		}

	});

});
