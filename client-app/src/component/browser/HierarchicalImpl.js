define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, 'put-selector'
	, "./Browser"
	, "./row/_Hierarchical"
], function(
	declare
	, lang
	, aspect
	, put
	, Browser
	, _Hierarchical
){
	return declare([Browser], {
		//	summary:
		//
		//	description:
		//

		constructor: function(args) {

			this.config = {
				hierarchicalEvents: {
					EXPAND_ROW: "expandRow",
					COLLAPSE_ROW: "collapseRow",
					EXPAND: "expand",
					COLLAPSE: "collapse",
					TRY_TO_UPDATE_EXPAND_COLLAPSE: "tryToUpdateExpandCollapse"
				},
				hierarchicalActions: {
					EXPAND_ROW: "expandRow",
					COLLAPSE_ROW: "collapseRow",
					EXPANDED_ROW: "expandedRow",
					COLLAPSED_ROW: "collapsedRow",
					EXPAND: "expand",
					COLLAPSE: "collapse",
					EXPANDED: "expanded",
					COLLAPSED: "collapsed",
					TRY_TO_UPDATE_EXPAND_COLLAPSE: "tryToUpdateExpandCollapse"
				},
				pathProperty: "path",
				pathSeparator: ".",
				pathLengthMinChildren: 2,
				pathLengthMinParent: 1,
				leavesProperty: "leaves",

				_rowsPending: {}
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixHierarchicalEventsAndActions));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineHierarchicalSubscriptions));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineHierarchicalPublications));

			aspect.after(this, "_definitionRow", lang.hitch(this, this._definitionHierarchicalRow));
			aspect.before(this, "_configRow", lang.hitch(this, this._configHierarchicalRow));

			aspect.before(this, "_dataAvailable", lang.hitch(this, this._beforeDataOrItemAvailable));
			aspect.before(this, "_itemAvailable", lang.hitch(this, this._beforeDataOrItemAvailable));
			aspect.after(this, "_dataAvailable", lang.hitch(this, this._afterDataOrItemAvailable));
			aspect.after(this, "_itemAvailable", lang.hitch(this, this._afterDataOrItemAvailable));

			aspect.before(this, "_removeRow", lang.hitch(this, this._removeHierarchicalRow));
		},

		_mixHierarchicalEventsAndActions: function () {

			lang.mixin(this.events, this.hierarchicalEvents);
			lang.mixin(this.actions, this.hierarchicalActions);

			delete this.hierarchicalEvents;
			delete this.hierarchicalActions;
		},

		_defineHierarchicalSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("EXPAND_ROW"),
				callback: "_subExpandRow"
			},{
				channel : this.getChannel("COLLAPSE_ROW"),
				callback: "_subCollapseRow"
			},{
				channel : this.getChannel("EXPANDED"),
				callback: "_subExpanded"
			},{
				channel : this.getChannel("COLLAPSED"),
				callback: "_subCollapsed"
			});
		},

		_defineHierarchicalPublications: function() {

			this.publicationsConfig.push({
				event: 'EXPAND_ROW',
				channel: this.getChannel("EXPANDED_ROW")
			},{
				event: 'COLLAPSE_ROW',
				channel: this.getChannel("COLLAPSED_ROW")
			},{
				event: 'EXPAND',
				channel: this.getChannel("EXPAND")
			},{
				event: 'COLLAPSE',
				channel: this.getChannel("COLLAPSE")
			},{
				event: 'TRY_TO_UPDATE_EXPAND_COLLAPSE',
				channel: this.getChannel("TRY_TO_UPDATE_EXPAND_COLLAPSE")
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			put(this.domNode, ".containerHierarchicalList");
		},

		_subExpandRow: function(req) {

			this._expand(req);
		},

		_subCollapseRow: function(req) {

			this._collapse(req);
		},

		_expand: function(obj) {

			this._emitEvt('EXPAND', obj);
		},

		_collapse: function(obj) {

			this._emitEvt('COLLAPSE', obj);
		},

		_subExpanded: function(req) {

			this._addRowsWithParentExpanded(req);
			this._emitEvt('EXPAND_ROW', req);
		},

		_addRowsWithParentExpanded: function(req) {

			var idProperty = req.idProperty,
				row = this._getRow(idProperty),
				children = row.children,
				node = req.nodeChildren;

			if (row.pendingChildren) {
				for (var i = 0; i < children.length; i++) {
					this._addRowWithParentExpanded(children[i], node);
				}

				this._getRow(idProperty).pendingChildren = false;
			}
		},

		_addRowWithParentExpanded: function(idProperty, node) {

			var row = this._getRow(idProperty);

			if (row && !row.instance) {
				this._addRow(idProperty, row.data);

				this._showInstanceRow(this._getRowInstance(idProperty), row.data, node, false);
			}
		},

		_subCollapsed: function(req) {

			this._emitEvt('COLLAPSE_ROW', req);
		},

		_beforeDataOrItemAvailable: function(response) {

			this._pendingParentsToShow = [];
		},

		_afterDataOrItemAvailable: function(response) {

			this._showPendingParents();
		},

		_addData: function(response) {

			this._clearData();

			this._processNewData(response);
		},

		_addItem: function(item) {

			var idProperty = item[this.idProperty],
				rowInstance = this._getRowInstance(idProperty);

			if (!rowInstance) {
				this._addRowItem(item);
			} else {
				this._updateRow(rowInstance, item);
			}

			this._showRow(item);
		},

		_addRowItem: function(item) {

			var idProperty = item[this.idProperty];

			this._checkParentAndAddChild(item);

			if (this._checkItemBelongRootLevel(item)) {
				this._addRow(idProperty, item);
			} else {
				this._addItemWithoutInstance(idProperty, item);
			}

			this._parentWithRowPending(idProperty, item);
		},

		_updateRow: function(rowInstance, item) {

			var idProperty = item[this.idProperty];

			item = this._mergeRowData(idProperty, item);

			this._publish(rowInstance.getChannel('UPDATE_TEMPLATE'), {
				template: this._getTemplate(item)
			});

			if (!this._checkItemBelongRootLevel(item)) {
				this._publish(rowInstance.getChannel('UPDATE_DATA'), {
					data: item
				});
			}
		},

		_showRow: function(item) {

			var idProperty = item[this.idProperty],
				rowInstance = this._getRowInstance(idProperty),
				itemDoesNotBelongToRootLevel = !this._checkItemBelongRootLevel(item);

			if (!rowInstance || itemDoesNotBelongToRootLevel) {
				return;
			}

			if (itemDoesNotBelongToRootLevel) {
				this._pendingParentsToShow.push(idProperty);
				return;
			}

			this._showInstanceRow(rowInstance, item, this.rowsContainerNode, false);
		},

		_showInstanceRow: function(instance, item, node, inFront) {

			var obj = {
				data: item,
				node: node
			};

			if (inFront) {
				obj.inFront = true;
			}

			instance && this._publish(instance.getChannel('SHOW'), obj);
		},

		_showPendingParents: function() {

			if (!this._pendingParentsToShow) {
				return;
			}

			var pendingParents = this._pendingParentsToShow.length - 1;

			for (var i = pendingParents; i >= 0; i--) {
				this._showPendingParent(this._pendingParentsToShow[i]);
			}
		},

		_showPendingParent: function(idProperty) {

			var row = this._getRow(idProperty),
				item = row.data,
				instance = row.instance;

			if (!instance) {
				return;
			}

			this._showInstanceRow(instance, item, this.rowsContainerNode, true);
		},

		_checkItemBelongRootLevel: function(item) {

			var idProperty = item[this.idProperty],
				path = item[this.pathProperty],
				pathLength = path ? path.split(this.pathSeparator).length : null;

			return pathLength <= this.pathLengthMinChildren && pathLength >= this.pathLengthMinParent;
		},

		_addItemWithoutInstance: function(idProperty, item) {

			this._setRow(idProperty, {
				instance: null,
				data: item
			});
		},

		_parentWithRowPending: function(idProperty, item) {

			var row = this._getRow(idProperty),
				rowPending = this._rowsPending[idProperty],
				children = [];

			if (!row) {
				return;
			}

			if (rowPending) {
				children = rowPending.children;

				delete this._rowsPending[idProperty];
			}

			var leaves = item[this.leavesProperty];

			row.children = children;
			row.pendingChildren = !!leaves;
			row.leaves = item[this.leavesProperty];
		},

		_checkParentAndAddChild: function(item) {

			var idProperty = item[this.idProperty],
				path = item[this.pathProperty],
				pathSplit = path.split(this.pathSeparator);

			pathSplit.pop();

			if (pathSplit.length <= 1) {
				return;
			}

			var pathParent = pathSplit.join('.'),
				idPropertyParent = pathParent;

			if (this.idProperty !== this.pathProperty) {
				idPropertyParent = pathSplit.pop();
			}

			var rowParent = this._getRow(idPropertyParent);

			if (!rowParent) {
				this._addPendingParent(idProperty, idPropertyParent);
			} else {
				if (this._checkItemBelongRootLevel(item)) {
					rowParent.pendingChildren = true;
				}

				rowParent.children.push(idProperty);
			}
		},

		_addPendingParent: function(idProperty, idPropertyParent) {

			if (!this._rowsPending[idPropertyParent]) {
				this._rowsPending[idPropertyParent] = {
					children: [idProperty]
				};
			} else {
				this._rowsPending[idPropertyParent].children.push(idProperty);
			}
		},

		_definitionHierarchicalRow: function() {

			this._defRow.push(_Hierarchical);
		},

		_configHierarchicalRow: function(item) {

			this.rowConfig = this._merge([this.rowConfig || {}, {
				pathProperty: this.pathProperty,
				pathSeparator: this.pathSeparator,
				leavesProperty: this.leavesProperty
			}]);
		},

		_removeHierarchicalRow: function(idProperty) {

			var row = this._getRow(idProperty);

			if (!row) {
				return;
			}

			var children = row.children;

			for (var i = 0; i < children.length; i++) {
				this._removeRow(children[i]);
			}
		}
	});
});
