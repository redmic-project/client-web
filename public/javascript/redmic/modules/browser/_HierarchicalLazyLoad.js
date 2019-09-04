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

			if (this.generatePath) {
				this.pathProperty = "pathGenerate";
			}

			if (!this.childrenIdProperty) {
				this.childrenIdProperty = this.idProperty;
			}

			if (!this.parentIdProperty) {
				this.parentIdProperty = this.idProperty;
			}

			this.inherited(arguments);
		},

		_addHierarchicalLazyLoadItem: function(item) {

			if (this.generatePath && !item[this.idProperty]) {
				this._generatePathItem(item);
			}
		},

		_generatePathItem: function(item) {

			var pathGenerate = (this._pathGenerateParent ? this._pathGenerateParent : 'root') + this.pathSeparator;

			if (Utilities.getDeepProp(item, this.conditionParentProperty)) {
				item[this.pathProperty] = pathGenerate + Utilities.getDeepProp(item, this.parentIdProperty);
			} else {
				item[this.pathProperty] = pathGenerate + Utilities.getDeepProp(item, this.childrenIdProperty);
			}
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

			var row = this._getRow(idProperty),
				item = row.data,
				objRequest,	target;

			this._pathGenerateParent = item[this.pathProperty];

			if (this.targetProperty) {
				target = Utilities.getDeepProp(item, this.targetProperty);
			}

			if (!target) {
				target = lang.replace(this.targetChildren, {
					id: Utilities.getDeepProp(item, this.parentIdProperty)
				});
			}

			this._lastTarget = this.target;
			this.target = target;

			objRequest = {
				method: 'POST',
				target: target,
				action: '_search',
				requesterId: this.getOwnChannel()
			};

			if (this.queryDataChildren) {
				objRequest.query = this.queryDataChildren;
			}

			this._emitEvt('REQUEST', objRequest);
		},

		_dataAvailable: function(response) {

			if (!this._lastTarget) {
				return this.inherited(arguments);
			}

			var data = response.data;

			if (data.data) {
				data = data.data;
			}

			this._addChildrenData(data);

			this.target = this._lastTarget;
			this._lastTarget = null;
		},

		_addChildrenData: function(data) {

			var rowParent = this._getRow(this._pathGenerateParent);

			rowParent.data[this.leavesProperty] = data.length;

			for (var i = 0; i < data.length; i++) {
				var item = data[i],
					idProperty;

				this._addItem(item);

				idProperty = item[this.idProperty];
				this._addRow(idProperty, item);

				this._publish(this._getRowInstance(idProperty).getChannel('SHOW'), {
					data: item,
					node: this._nodeParent
				});
			}

			rowParent.pendingChildren = false;

			this._pathGenerateParent = null;
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
