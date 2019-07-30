define([
	"dijit/layout/LayoutContainer"
	, "dijit/layout/ContentPane"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/base/SelectionBox"
	, "put-selector/put"
], function(
	LayoutContainer
	, ContentPane
	, declare
	, lang
	, aspect
	, SelectionBox
	, put
){
	return declare(null, {
		//	summary:
		//		Extensión para las vistas de selección de datos.

		constructor: function(args) {

			this.config = {};

			lang.mixin(this, this.config);
			aspect.before(this, "_beforeShow", lang.hitch(this, this._beforeShowSelectionBox));
			aspect.before(this, "_initialize", lang.hitch(this, this._initializeSelectionBox));
		},

		_initializeSelectionBox: function() {

			this.selectionBox = new SelectionBox({
				parentChannel: this.getChannel()
			});
		},

		postCreate: function() {

			this.treeNode = new ContentPane({
				region: "center"
			});

			this.selectionBoxNode = new ContentPane({
				region: "bottom",
				'class': "frameworkTree containerSelectionBox"
			});

			this.contentNode = new LayoutContainer({
				region: "center"
			});

			this.contentNode.addChild(this.treeNode);
			this.contentNode.addChild(this.selectionBoxNode);

			this.treeNode.addChild(this.tree);

			this.resultZoneNode = put(this.selectionBoxNode.domNode, "div.resultZone");

			/*var containerTotalResult = put(this.resultZoneNode, "div.totalResult");

			put(containerTotalResult, "span", this.i18n.total + ": ");
			this.totalNode = put(containerTotalResult, "span", "0");*/

			this._publish(this.selectionBox.getChannel("SHOW"), {
				node: this.resultZoneNode
			});

			this.inherited(arguments);
		},

		_beforeShowSelectionBox: function(request) {

			var target = this.selectionTarget ? this.selectionTarget : this.target;

			this._publish(this.selectionBox.getChannel("REFRESH"), {
				selectionTarget: target,
				perms: this.perms
			});

			if (this._getPreviouslyShown())
				this._emitEvt('REFRESH');
		},

		_getNodeToShow: function() {

			return this.contentNode.domNode;
		}/*,

		_insertDataIntoStore: function(data) {

			this.totalLeaves = 0;

			this.inherited(arguments);

			if (this.totalNode)
				this.totalNode.innerHTML = this.totalLeaves;
		},

		_insertItemIntoStore: function(item) {

			this.inherited(arguments);

			if (item.leaves)
				this.totalLeaves += item.leaves;
		}*/
	});
});
