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

			var centerNode = new BorderContainer({
				'class': "leftZone col-lg-6",
				style: "width: 50%"
			});
			put(this.containerNode, centerNode.domNode);

			this.topNode = new ContentPane({
				region: "top",
				'class': "notFormZone"
			});
			centerNode.addChild(this.topNode);

			this.centerNode = new ContentPane({
				region: "center",
				'class': "stretchZone",
				style: "width: 100%"
			});
			centerNode.addChild(this.centerNode);

			this.inherited(arguments);
		},

		_getNodeToShow: function() {

			return this.containerNode;
		}
	});
});