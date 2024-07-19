define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "./_Select"
	, "./row/_HierarchicalSelect"
], function(
	declare
	, lang
	, aspect
	, _Select
	, _HierarchicalSelectRow
){
	return declare(_Select, {
		//	summary:
		//
		//	description:
		//

		constructor: function(args) {

			this.config = {
				noSelectParent: true
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_configRow", lang.hitch(this, this._configHierarchicalSelectRow));
			aspect.after(this, "_addItemWithoutInstance", lang.hitch(this, this._addItemWithoutInstanceSelect));
			aspect.before(this, "_parentWithRowPending", lang.hitch(this, this._parentWithRowPendingSelect));

			aspect.before(this, "_selectRow", lang.hitch(this, this._hierarchicalSelectRow));
			aspect.before(this, "_deselectRow", lang.hitch(this, this._hierarchicalDeselectRow));

			aspect.after(this, "_addPendingParent", lang.hitch(this, this._addSelectPendingParent));
			aspect.after(this, "_addData", lang.hitch(this, this._addAfterHierarchicalSelectData));

			this.noSeeSelect =  this.rowConfig && this.rowConfignoSeeSelect;
		},

		_definitionSelectRow: function() {

			this._defRow.push(_HierarchicalSelectRow);
		},

		_configHierarchicalSelectRow: function(item) {

			var obj = {
				noSeeSelect: this.noSeeSelect
			};

			if (this.noSelectParent && item[this.leavesProperty]) {
				obj.noSeeSelect = true;
			}

			this.rowConfig = this._merge([this.rowConfig || {}, obj]);
		},

		_addItemWithoutInstanceSelect: function(retObj, args) {

			var path = args[0],
				row = this._getRow(path),
				item = row.data;

			row.selected = {};
			row.mixed = {};

			this._addSelectRow(false, [item[this.idProperty]]);
		},

		_parentWithRowPendingSelect: function(idProperty, item) {

			var row = this._getRow(idProperty),
				rowPending = this._rowsPending[idProperty] || {};

			if (!row) {
				return;
			}

			row.selected = rowPending.selected || {};
			row.mixed = rowPending.mixed || {};

			this._addSelectRow(false, [item[this.idProperty]]);
		},

		_hierarchicalSelectRow: function(idProperty) {

			var row = this._getRow(idProperty);

			if (!row) {
				return;
			}

			row.mixed = {};

			if (row.children) {
				for (var i = 0; i < row.children.length; i++) {
					this._addValueSelected(row, row.children[i]);
				}
			}

			this._evaluateAndUpdateAncestorsStatus(row, 'increase');

			this._selectChildren(row);
		},

		_evaluateAndUpdateAncestorsStatus: function(row, action) {

			var item = row.data,
				idProperty = item[this.idProperty],
				pathProperty = item[this.pathProperty],
				pathSplit = pathProperty.split(this.pathSeparator),
				idPropertyParent, rowParent;

			pathSplit.pop();
			idPropertyParent = this._getIdPropertyParent(pathSplit);
			rowParent = this._getRow(idPropertyParent);

			if (!rowParent) {
				rowParent = this._rowsPending[idPropertyParent];
				this._updateValueSelected(rowParent, idProperty, action);

				return;
			}

			var actionPrev = 1;

			while (pathSplit.length >= 1) {

				if (actionPrev === 1) {
					this._updateValueSelected(rowParent, idProperty, action);
				} else if (actionPrev === 2) {
					this._updateValueMixed(rowParent, idProperty, action);
				}

				actionPrev = this._updateAncestorRowStatus(rowParent);

				idProperty = idPropertyParent;

				idPropertyParent = this._getIdPropertyParent(pathSplit);
				rowParent = this._getRow(idPropertyParent);
			}
		},

		_updateValueMixed: function(row, idProperty, action) {

			if (action === 'increase') {
				this._addValueMixed(row, idProperty);
				this._deleteValueSelected(row, idProperty);
			} else if (action === 'decrease') {
				this._deleteValueMixed(row, idProperty);
			}
		},

		_updateValueSelected: function(row, idProperty, action) {

			if (action === 'increase') {

				this._addValueSelected(row, idProperty);
				this._deleteValueMixed(row, idProperty);
			} else if (action === 'decrease') {
				this._deleteValueSelected(row, idProperty);
			}
		},

		_addValueSelected: function(row, idProperty) {

			if (!row || !idProperty || !row.selected) {
				return;
			}

			row.selected[idProperty] = 't';
		},

		_deleteValueSelected: function(row, idProperty) {

			if (!row || !idProperty || !row.selected || !row.selected[idProperty]) {
				return;
			}

			delete row.selected[idProperty];
		},

		_addValueMixed: function(row, idProperty) {

			if (!row || !idProperty || !row.mixed) {
				return;
			}

			row.mixed[idProperty] = 't';
		},

		_deleteValueMixed: function(row, idProperty) {

			if (!row || !idProperty || !row.mixed || !row.mixed[idProperty]) {
				return;
			}

			delete row.mixed[idProperty];
		},

		_getIdPropertyParent: function(pathSplit) {

			var idPropertyParent = pathSplit.join(this.pathSeparator);

			if (this.idProperty !== this.pathProperty) {
				idPropertyParent = pathSplit.pop();
			} else {
				pathSplit.pop();
			}

			return idPropertyParent;
		},

		_updateAncestorRowStatus: function(row) {

			if (!row) {
				return;
			}

			var leaves = row.leaves,
				selected = Object.keys(row.selected).length,
				mixed = Object.keys(row.mixed).length,
				instance = row.instance,
				idProperty = row.data[this.idProperty],
				actionCode = 1,
				action;

			if (!leaves) {
				return;
			}

			if (leaves === selected) {
				action = 'SELECT';
			} else if (selected || mixed) {
				action = 'MIXED';
				actionCode = 2;
			} else if (!selected && !mixed) {
				action = 'DESELECT';
			}

			instance && this._publish(instance.getChannel(action));

			return actionCode;
		},

		_selectChildren: function(row) {

			var children = row.children;

			if (children && children.length) {
				// Seleciona a los hijos
				for (var i = 0; i < children.length; i++) {
					var rowChild = this._getRow(children[i]),
						instanceChild = rowChild.instance;

					rowChild.mixed = {};

					for (var n = 0; n < rowChild.children.length; n++) {
						this._addValueSelected(rowChild, rowChild.children[n]);
					}

					instanceChild && this._publish(instanceChild.getChannel('SELECT'));
				}
			}
		},

		_hierarchicalDeselectRow: function(idProperty) {

			var row = this._getRow(idProperty);

			if (!row) {
				return;
			}

			row.selected = {};
			row.mixed = {};

			this._evaluateAndUpdateAncestorsStatus(row, 'decrease');

			this._deselectChildren(row);
		},

		_deselectChildren: function(row) {

			var children = row.children;

			if (children && children.length) {
				// Deseleciona a los hijos
				for (var i = 0; i < children.length; i++) {
					var rowChild = this._getRow(children[i]),
						instanceChild = rowChild.instance;

					rowChild.selected = {};
					rowChild.mixed = {};

					instanceChild && this._publish(instanceChild.getChannel('DESELECT'));
				}
			}
		},

		_addAfterHierarchicalSelectData: function() {

			for (var key in this._rows) {
				this._updateAncestorRowStatus(this._getRow(key));
			}
		},

		_addSelectPendingParent: function(retObj, args) {

			var idPropertyParent = args[1];

			if (!this._rowsPending[idPropertyParent].selected) {
				this._rowsPending[idPropertyParent].selected = {};
			}
		}
	});
});
