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

			this.contentNode = new BorderContainer({
				'class': "col-lg-12",
				region: "center"
			});

			this.leftNode = new ContentPane({
				'class': "leftZone",
				region: "left",
				style: "width: 30%",
				splitter: true
			});

			this.rightNode = new ContentPane({
				'class': "rightZone",
				region: "center",
				style: "width: 70%",
				splitter:true
			});

			this.contentNode.addChild(this.leftNode);
			this.contentNode.addChild(this.rightNode);

			this.addChild(this.contentNode);
			this.contentNode.startup();

			this.inherited(arguments);
		},

		_getNodeToShow: function() {

			return this.containerNode;
		}
	});
});