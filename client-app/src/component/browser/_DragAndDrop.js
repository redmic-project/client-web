define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "dojo/dom-class"
	, "dojo/query"
	, "RWidgets/Utilities"
	, 'put-selector'
], function(
	declare
	, lang
	, aspect
	, domClass
	, query
	, Utilities
	, put
){
	return declare(null, {
		//	summary:
		//
		//	description:
		//

		constructor: function(args) {

			this.config = {
				dragAndDropEvents: {
					DRAG_AND_DROP: "dragAndDrop"
				},
				dragAndDropActions: {
					UPDATE_DRAGGABLE_ITEMS: "updateDraggableItems",
					DRAG_AND_DROP: "dragAndDrop"
				},
				topRowContainerDragAndDropClass: "containerTopRowDragAndDrop",
				topBorderDragAndDropClass: "borderTopDragAndDrop",
				bottomBorderDragAndDropClass: "borderBottomDragAndDrop",
				rowContainerDragAndDropClass: "dragAndDropContainerRow",
				draggableItemIds: null
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixDragAndDropEventsAndActions));
			//aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineDragAndDropSubscriptions));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineDragAndDropPublications));
			aspect.before(this, "_configRow", lang.hitch(this, this._configDragAndDropRow));
			aspect.after(this, "_addRow", lang.hitch(this, this._addDragAndDropRow));

			this._buttonEventRow &&
				aspect.before(this, "_buttonEventRow", lang.hitch(this, this._buttonEventDragAndDropRow));
		},

		_mixDragAndDropEventsAndActions: function () {

			lang.mixin(this.events, this.dragAndDropEvents);
			lang.mixin(this.actions, this.dragAndDropActions);

			delete this.dragAndDropEvents;
			delete this.dragAndDropActions;
		},

		_defineDragAndDropSubscriptions: function () {

			this.subscriptionsConfig.push(/*{
				channel : this.getChannel("UPDATE_ORDER"),
				callback: "_subUpdateOrder"
			},*/{
				channel : this.getChannel("UPDATE_DRAGGABLE_ITEMS"),
				callback: "_subUpdateDraggableItems"
			});
		},

		_defineDragAndDropPublications: function() {

			this.publicationsConfig.push({
				event: 'DRAG_AND_DROP',
				channel: this.getChannel("DRAG_AND_DROP")
			});
		},

		_subUpdateOrder: function(res) {

		},

		_subUpdateDraggableItems: function(req) {

			this.draggableItemIds = req.items;
		},

		postCreate: function() {

			this.inherited(arguments);

			this.contentListNode.ondragover = lang.hitch(this, this._dragOver, -1, this.contentListNode);
			this.contentListNode.ondrop = lang.hitch(this, this._drop, -1);
			this.contentListNode.ondragleave = lang.hitch(this, this._dragLeaveContainer);
		},

		_dragOver: function(id, node, evt) {

			if (!this._nodeDrag) {
				return;
			}

			evt.dataTransfer.dropEffect = 'move';
			evt.preventDefault();
			evt.stopPropagation();

			this._calculateRank(id, node, evt);
		},

		_drop: function(id, evt) {

			evt.preventDefault();
			evt.stopPropagation();

			if (this._isContentRowsContainer(evt.pageY)) {
				id = this._idLastNode;
			}

			if (!this._dropItemIdProperty && this._dropCorrect) {
				this._dropItemIdProperty = id;
			}

			this._minPosXToNest = null;
		},

		_dragLeaveContainer: function(evt) {

			var positionNode = this.contentListNode.getBoundingClientRect(),
				x = true,
				y = true;

			if (positionNode.left > evt.pageX || evt.pageX >= positionNode.right) {
				x = false;
			}

			if (positionNode.top > evt.pageY || evt.pageY >= positionNode.bottom){
				y = false;
			}

			if (!x || !y) {
				this._dropCorrect = false;
				this._removeBorder();
			}
		},

		_addDragAndDropRow: function(objRet, args) {

			var idProperty = args[0],
				instance = this._getRowInstance(idProperty);

			if (!instance) {
				return;
			}

			this._once(instance.getChannel("GOT_PROPS"), lang.hitch(this, this._subDomNodeGotProps, idProperty));

			this._publish(instance.getChannel("GET_PROPS"), {
				domNode: true
			});
		},

		_subDomNodeGotProps: function(idProperty, res) {

			var node = res.domNode;

			node && this._prepareRowForDragAndDrop(node, idProperty);
		},

		_prepareRowForDragAndDrop: function(node, idProperty) {

			if (!node) {
				return;
			}

			if (!this.draggableItemIds || this.draggableItemIds.indexOf(idProperty) !== -1) {
				node.setAttribute('draggable', "true");
				put(node.firstChild, '.' + this.topRowContainerDragAndDropClass);

				node.ondragstart = lang.hitch(this, this._dragStart, idProperty);
				node.ondragend = lang.hitch(this, this._dragEnd, idProperty);
				node.ondrop = lang.hitch(this, this._drop, idProperty);
			}

			node.ondragover = lang.hitch(this, this._dragOver, idProperty, node);
		},

		_dragStart: function(id, evt) {

			if (evt.dataTransfer) {
				evt.dataTransfer.setData('Text', 'anything');
			}

			evt.dataTransfer.effectAllowed = 'move';

			clearTimeout(this.removeBackgroundTimeoutHandler);

			if (this._nodeDrag) {
				this._removeDragAndDropBackground(this._nodeDrag);
			}

			this._insertDragAndDropBackground(evt.target);

			this._dropItemIdProperty = null;
			this._nodeDrag = evt.target;
			this._nodeDrop = null;
			this._nodeBorderLast = null;
			this._dragAndDropInUse = true;
			this._dropCorrect = false;
			this._pageYLast = null;
			this._pageXLast = null;
			this._idLastNode = null;
		},

		_dragEnd: function(idProperty, evt) {

			evt.preventDefault();
			evt.stopPropagation();

			if (this._dropItemIdProperty && idProperty != this._dropItemIdProperty) {
				this._updatePositionData(idProperty);
			} else {
				this.removeBackgroundTimeoutHandler = setTimeout(
					lang.hitch(this, this._removeDragAndDropBackground, evt.target), 750);
			}

			this._removeBorder();

			this._nodeDrag = null;
			this._dragAndDropInUse = false;
		},

		_buttonEventDragAndDropRow: function(req) {

			req.indexList = this._calcNodeIndex(req.node);
			req.total = Object.keys(this._rows).length;
		},

		_updatePositionData: function(idProperty) {

			var row = this._getRow(idProperty),
				data = {
					id: idProperty,
					item: row.data,
					indexOld: this._calcNodeIndex(this._nodeDrag),
					total: Object.keys(this._rows).length
				};

			this._updatePositionRow(row);

			data.indexList = this._calcNodeIndex(this._nodeDrag);

			if (data.indexList !== data.indexOld) {
				this._emitEvt("DRAG_AND_DROP", data);
			}
		},

		_calcNodeIndex: function(node) {

			var i = 0;

			while ((node = node.previousSibling) != null) {
	 			i++;
			}

			return i;
		},

		_updatePositionRow: function(row) {

			// Reordena a la posición correcta
			if (domClass.contains(this._nodeBorderLast, this.topBorderDragAndDropClass)) {
				put(this._nodeBorderLast, "-", this._nodeDrag);
			} if (domClass.contains(this._nodeBorderLast, this.bottomBorderDragAndDropClass)) {
				put(this._nodeBorderLast, "+", this._nodeDrag);
			}

			this._removeDragAndDropBackground(this._nodeDrag);
		},

		_insertDragAndDropBackground: function(node) {

			put(node, '.' + this.rowContainerDragAndDropClass);
		},

		_removeDragAndDropBackground: function(node) {

			put(node, '!' + this.rowContainerDragAndDropClass);
		},

		_calculateRank: function(id, node, evt) {

			var posY = evt.pageY,
				posX = evt.pageX;

			if (((this._pageYLast && this._pageYLast === posY) && (this._pageXLast && this._pageXLast === posX)) || !node) {
				return;
			}

			if (domClass.contains(node, this.rowContainerClass) && this._nodeDrag !== node) {
				this._dragToTopOrBottom(id, node, posX, posY);
			} else if (this._nodeDrag === node) {
				this._resetDragPreparation();
			} else if (this.contentListNode === node) {
				this._dragToEmptyBottomZone(id, node);
			}
		},

		_dragToTopOrBottom: function(id, node, posX, posY) {

			var border = domClass.contains(node, this.rowContainerDragAndDropClass) ? 30 : 0,
				nodeBounding = node.getBoundingClientRect(),
				middleYInsideNode = (nodeBounding.height + border) / 2,
				posYInsideNode = (posY - nodeBounding.top);

			if (!this._minPosXToNest) {
				this._minPosXToNest = posX + 50;
			}

			this._pageYLast = posY;
			this._pageXLast = posX;

			var obj = {
				id: id,
				node: node,
				posInsideNode: posX
			};

			// Mitad superior
			if (this._isDraggingToTop(posYInsideNode, middleYInsideNode)) {
				obj.method = 'previousSibling';
				obj.nameClass = this.topBorderDragAndDropClass;
			// Mitad inferior
			} else {
				obj.method = 'nextSibling';
				obj.nameClass = this.bottomBorderDragAndDropClass;
			}

			this._prepareToDragToNode(obj);
		},

		_isDraggingToTop: function(posYInsideNode, middleYInsideNode) {

			return posYInsideNode <= middleYInsideNode;
		},

		_prepareToDragToNode: function(obj) {

			if (this._canDragToNode(obj)) {
				this._dragToNode(obj);
			} else {
				this._resetDragPreparation();
			}
		},

		_canDragToNode: function(obj) {

			var node = obj.node,
				method = obj.method;

			return (!node[method] || node[method] !== this._nodeDrag);
		},

		/*_dragToBottom: function(id, node) {

			this._idLastNode = id;
			this._removeBorder();

			if (node.nextSibling) {
				put(node.nextSibling, "." + this.topBorderDragAndDropClass);
				this._nodeBorderLast = node.nextSibling;
			} else {
				put(node, "." + this.bottomBorderDragAndDropClass);
				this._nodeBorderLast = node;
			}

			this._dropCorrect = true;
		},*/

		_dragToNode: function(obj) {

			var id = obj.id,
				node = obj.node;

			this._idLastNode = id;
			this._removeBorder();

			put(node, "." + obj.nameClass);

			this._nodeBorderLast = node;
			this._dropCorrect = true;
		},

		_resetDragPreparation: function(/*Boolean?*/ correctState) {

			this._idLastNode = null;
			this._removeBorder();
			this._dropCorrect = !!correctState;
		},

		_dragToEmptyBottomZone: function(id, node) {

			// Si la última fila no es la misma que la arrastrada
			if (this.contentListNode.lastChild.lastChild !== this._nodeDrag) {

				this._resetDragPreparation(true);
				put(this.contentListNode.lastChild.lastChild, "." + this.bottomBorderDragAndDropClass);
				this._inside = false;
				this._nodeBorderLast = this.contentListNode.lastChild.lastChild;
				this._dropCorrect = true;

				return true;
			}
		},

		_isContentRowsContainer: function(pageY) {

			var positionNode = this.rowsContainerNode.getBoundingClientRect();

			if (positionNode.top < pageY && pageY < positionNode.bottom) {
				return true;
			}

			return false;
		},

		_removeBorder: function() {

			if (this._nodeBorderLast) {
				put(this._nodeBorderLast, "!" + this.topBorderDragAndDropClass);
				put(this._nodeBorderLast, "!" + this.bottomBorderDragAndDropClass);

				this._nodeBorderLast = null;
			}
		},

		_configDragAndDropRow: function(item) {

			this.rowConfig = this._merge([this.rowConfig || {}, {
				nodeInBtnEvent: true
			}]);
		}
	});
});
