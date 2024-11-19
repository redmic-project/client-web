define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "dojo/dom-class"
	, 'put-selector'
	, "./_DragAndDrop"
], function(
	declare
	, lang
	, aspect
	, domClass
	, put
	, _DragAndDrop
){
	return declare(_DragAndDrop, {
		//	summary:
		//
		//	description:
		//

		constructor: function(args) {

			this.config = {
				expandTimeout: 800,
				redmicDataSuffix: "redmicId",
				_temporaryNodes: {}
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_prepareRowForDragAndDrop", lang.hitch(this, this._prepareRowForHierarchicalDragAndDrop));
			aspect.after(this, "_dragOver", lang.hitch(this, this._dragOverHierarchicalDragAndDrop));

			this._buttonEventRow &&
				aspect.before(this, "_buttonEventRow", lang.hitch(this, this._buttonEventHierarchicalDragAndDropRow));
		},

		_prepareRowForHierarchicalDragAndDrop: function(node, idProperty) {

			if (node) {
				node.ondragleave = lang.hitch(this, this._dragLeave, idProperty, node);
			}
		},

		_buttonEventHierarchicalDragAndDropRow: function(req) {

			req.parentId = this._getParentDataId(req.node);
		},

		_updatePositionData: function(idProperty) {

			var row = this._getRow(idProperty),
				data = {
					id: idProperty,
					item: row.data,
					indexOld: this._calcNodeIndex(this._nodeDrag),
					total: Object.keys(this._rows).length
				},
				oldParentId = this._getParentDataId(this._nodeDrag);

			this._updatePositionRow(row);

			oldParentId && this._emitEvt('TRY_TO_UPDATE_EXPAND_COLLAPSE', {
				idProperty: oldParentId
			});

			data.indexList = this._calcNodeIndex(this._nodeDrag);
			data.parentId = this._getParentDataId(this._nodeDrag);

			if (data.indexList !== data.indexOld || data.parentId !== oldParentId) {
				this._emitEvt("DRAG_AND_DROP", data);
			}

			this._clearTemporaryNodes();
		},

		_dragOverHierarchicalDragAndDrop: function(objRet, args) {

			var id = args[0],
				node = args[1],
				evt = args[2];

			if (!this._nodeDrag) {
				return;
			}

			if (!this._expandTimeoutHandler) {
				this._expandTimeoutHandler = setTimeout(lang.hitch(this, this._expand, {
					idProperty: id
				}), this.expandTimeout);
			}
		},

		_dragLeave: function(id, node, evt) {

			clearTimeout(this._expandTimeoutHandler);
			this._expandTimeoutHandler = null;
		},

		_prepareToDragToNode: function(obj) {

			if (this._canDragToNode(obj)) {
				if (obj.posInsideNode <= this._minPosXToNest) {
					this._dragToNode(obj);
				} else if (!this._nodesAreParentAndChild(obj.node, this._nodeDrag)) {
					this._dragToNodeInside(obj);
				}
			} else {
				this._resetDragPreparation();
			}
		},

		_canDragToNode: function(obj) {

			if (!this.inherited(arguments)) {
				return false;
			}

			var node = obj.node;

			return !this._nodeDrag.contains(node);
		},

		//TODO comprobar si hace falta
		_nodesAreParentAndChild: function(parentNode, childNode) {

			var childrenRowsContainer = parentNode.lastChild.firstChild;

			if (!childrenRowsContainer || !childrenRowsContainer.children.length) {
				return false;
			}

			var childrenNodes = childrenRowsContainer.children;
			for (var i = 0; i < childrenNodes.length; i++) {
				if (childrenNodes[i] === childNode) {
					return true;
				}
			}

			return false;
		},

		_dragToNodeInside: function(obj) {

			var node = obj.node,
				id = obj.id,
				newNode = node.lastChild.firstChild.firstChild;

			this._idLastNode = obj.id;
			this._removeBorder();

			if (!newNode) {
				newNode = put(node.lastChild.firstChild, "div." + this.rowContainerClass);
				this._temporaryNodes[id] = newNode;
			}

			put(newNode, "." + obj.nameClass);

			this._nodeBorderLast = newNode;
			this._dropCorrect = true;
		},

		_updatePositionRow: function(objRet, args) {

			this.inherited(arguments);

			this._updateParentRow();

			//this._updateItemHierarchy(this._getDataId(this._nodeDrag), parentId);
		},

		_updateParentRow: function() {

			var parentId = this._getParentDataId(this._nodeDrag);

			if (parentId) {
				this._emitEvt('TRY_TO_UPDATE_EXPAND_COLLAPSE', {
					idProperty: parentId
				});

				this._expand({
					idProperty: parentId
				});
			}
		},

		/*_updateItemHierarchy: function(elementIdToUpdate, newParentId) {

			this.collection.get(elementIdToUpdate).then(lang.hitch(this, function(parentId, item) {
				if (!parentId) {
					this._placeItemAtRoot(item, parentId);
				} else {
					this._placeItemAtParent(item, parentId);
				}
			}, newParentId));
		},*/

		_getParentDataId: function(rowNode) {

			var container = rowNode.parentNode.parentNode;

			if (domClass.contains(container, this.listContentClass)) {
				return;
			}

			return this._getDataId(container.parentNode);
		},

		_getDataId: function(rowNode) {

			var rowDataContainer = rowNode.firstChild,
				children = rowDataContainer.children;

			for (var i = 0; i < children.length; i++) {
				var child = children[i],
					dataset = child.dataset;

				if (dataset && dataset.hasOwnProperty(this.redmicDataSuffix)) {
					return parseInt(dataset[this.redmicDataSuffix], 10);
				}
			}
		},

		_clearTemporaryNodes: function() {

			var node;

			for (var key in this._temporaryNodes) {
				put(this._temporaryNodes[key], "!");

				key && this._emitEvt('TRY_TO_UPDATE_EXPAND_COLLAPSE', {
					idProperty: key
				});
			}

			delete this._temporaryNodes;

			this._temporaryNodes = {};
		}
	});
});
