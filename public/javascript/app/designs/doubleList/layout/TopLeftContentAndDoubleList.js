define([
	"dijit/layout/BorderContainer"
	, "dijit/layout/ContentPane"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
], function (
	BorderContainer
	, ContentPane
	, declare
	, lang
	, put
){
	return declare(ContentPane, {
		//	summary:
		//		Layout para vistas que contienen .

		constructor: function(args) {

			lang.mixin(this, args);
		},

		postCreate: function() {

			put(this.containerNode, ".twoColumnsLayout.row");

			this._leftZone();
			this._rightZone();

			this.inherited(arguments);
		},

		_leftZone: function() {

			var leftNode = new BorderContainer({
				'class': "leftZone col-lg-6",
				style: "width: 50%"
			});
			put(this.containerNode, leftNode.domNode);

			this.topLeftNode = new ContentPane({
				region: "top",
				'class': "notFormZone"
			});
			leftNode.addChild(this.topLeftNode);

			this.leftNode = new ContentPane({
				region: "center",
				'class': "stretchZone",
				style: "width: 100%"
			});
			leftNode.addChild(this.leftNode);
		},

		_rightZone: function() {

			var rightNode = new BorderContainer({
				'class': "col-lg-6",
				style: "width: 50%"
			});
			put(this.containerNode, rightNode.domNode);

			this.rightNode = new ContentPane({
				region: "center",
				style: "height: 100%"
			});
			rightNode.addChild(this.rightNode);
		},

		_getNodeToShow: function() {

			return this.containerNode;
		}
	});
});