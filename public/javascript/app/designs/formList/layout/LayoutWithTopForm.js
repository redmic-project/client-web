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

			var leftNode = new BorderContainer({
				'class': "leftZone col-md-6 col-lg-6",
				style: "width: 50%"
			});

			put(this.containerNode, leftNode.domNode);

			this.topLeftNode = new ContentPane({
				region: "top",
				'class': "titleContainer"
			});

			leftNode.addChild(this.topLeftNode);

			this.formNode = new ContentPane({
				region: "center",
				'class': "stretchZone"
			});
			leftNode.addChild(this.formNode);


			var rightNode = new BorderContainer({
				'class': "rightZone col-md-6 col-lg-6",
				style: "width: 50%"
			});

			put(this.containerNode, rightNode.domNode);

			this.centerRightNode = new ContentPane({
				region: "center"
			});
			rightNode.addChild(this.centerRightNode);
		},

		_getNodeToShow: function() {

			return this.containerNode;
		}
	});
});