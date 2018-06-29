define([
	"dijit/layout/ContentPane"
	, "dijit/layout/BorderContainer"
	, "dojo/_base/declare"
	, "put-selector/put"
], function (
	ContentPane
	, BorderContainer
	, declare
	, put
){

	return declare(ContentPane, {
		//	summary:
		//		Layout para vistas que contienen un formulario y un listado.

		postCreate: function() {

			this.inherited(arguments);

			put(this.containerNode, ".twoColumnsLayout.row");

			var bc = new BorderContainer({});

			put(this.containerNode, bc.domNode);

			this.leftNode = new ContentPane({
				'class': "leftZone col-md-6 col-lg-6",
				region: "left"
			});
			bc.addChild(this.leftNode);

			this.formNode = put(this.leftNode.domNode, "div");

			this.centerRightNode = new ContentPane({
				'class': "rightZone col-md-6 col-lg-6",
				region: "center"
			});
			bc.addChild(this.centerRightNode);
		},

		_getNodeToShow: function() {

			return this.containerNode;
		}
	});
});