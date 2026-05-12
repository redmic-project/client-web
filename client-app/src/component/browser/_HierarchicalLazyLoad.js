define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "RWidgets/Utilities"
], function(
	declare
	, lang
	, aspect
	, Utilities
){
	return declare(null, {
		//	summary:
		//
		//	description:
		//

		constructor: function(args) {

			this.config = {
				conditionParentProperty: 'activityType',
				idProperty: 'pathGenerate',
				pathProperty: 'pathGenerate',

				hierarchicalLazyLoadActions: {
					SET_QUERY_DATA_CHILDREN: 'setQueryDataChildren'
				}
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixHierarchicalLazyLoadEventsAndActions));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineHierarchicalLazyLoadSubscriptions));

			aspect.before(this, "_addItem", lang.hitch(this, this._addHierarchicalLazyLoadItem));
		},

		_mixHierarchicalLazyLoadEventsAndActions: function () {

			lang.mixin(this.actions, this.hierarchicalLazyLoadActions);

			delete this.hierarchicalLazyLoadActions;
		},

		_defineHierarchicalLazyLoadSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("SET_QUERY_DATA_CHILDREN"),
				callback: "_subSetQueryDataChildren"
			});
		},

		_subSetQueryDataChildren: function(req) {

			this.queryDataChildren = req.query;
		},

		postCreate: function() {

			if (!this.childrenIdProperty) {
				this.childrenIdProperty = this.idProperty;
			}

			if (!this.parentIdProperty) {
				this.parentIdProperty = this.idProperty;
			}

			this.inherited(arguments);
		},

		_addHierarchicalLazyLoadItem: function(item) {

			if (!item[this.pathProperty]) {
				item[this.pathProperty] = this._getGeneratedItemPath(item);
			}
		},

		_getGeneratedItemPath: function(item) {

			let itemPathPropertyName;
			if (Utilities.getDeepProp(item, this.conditionParentProperty)) {
				itemPathPropertyName = this.parentIdProperty;
			} else {
				itemPathPropertyName = this.childrenIdProperty;
			}

			const parentPath = this._currentParentPath ?? 'root',
				itemPathPropertyValue = Utilities.getDeepProp(item, itemPathPropertyName);

			return `${parentPath}${this.pathSeparator}${itemPathPropertyValue}`;
		},

		_addRowsWithParentExpanded: function(req) {

			var idProperty = req.idProperty,
				row = this._getRow(idProperty),
				node = req.nodeChildren;

			if (row.pendingChildren) {
				this._nodeParent = node;
				this._requestDataChildren(idProperty);
			}
		},

		_requestDataChildren: function(idProperty) {

			const row = this._getRow(idProperty),
				item = row.data;

			this._currentParentPath = item[this.pathProperty];

			const target = this.targetChildren;
			if (!(this.target instanceof Array)) {
				this.target = [this.target];
			}

			if (!this.target.includes(target)) {
				this.target.push(target);
			}

			const path = {
				id: idProperty
			};
			const query = this.queryDataChildren ?? {};

			this._emitEvt('REQUEST', {
				method: 'POST',
				target,
				action: '_search',
				requesterId: this.getOwnChannel(),
				params: {
					path, query
				}
			});
		},

		_dataAvailable: function(res, resWrapper) {

			if (resWrapper.target !== this.targetChildren) {
				return this.inherited(arguments);
			}

			const data = res.data?.data;
			data && this._addChildrenData(data);
		},

		_addChildrenData: function(data) {

			const parentItemId = this._currentParentPath?.split(this.pathSeparator).pop(),
				parentRow = this._getRow(parentItemId);

			if (parentRow) {
				// TODO a veces se usa row.data.leaves y a veces row.leaves, habría que unificarlo
				parentRow.data[this.leavesProperty] = data.length;
				parentRow[this.leavesProperty] = data.length;
				parentRow.pendingChildren = false;
			}

			for (var i = 0; i < data.length; i++) {
				var item = data[i],
					idProperty;

				this._addItem(item);

				idProperty = item[this.childrenIdProperty];
				this._addRow(idProperty, item);

				this._publish(this._getRowInstance(idProperty).getChannel('SHOW'), {
					data: item,
					node: this._nodeParent
				});
			}

			this._currentParentPath = null;
			this._nodeParent = null;
		},

		_showRow: function(item) {

			var idProperty = item[this.idProperty],
				rowInstance = this._getRowInstance(idProperty);

			if (!rowInstance || !this._checkItemBelongRootLevel(item)) {
				return;
			}

			this._showInstanceRow(rowInstance, item, this.rowsContainerNode, false);
		}
	});
});
