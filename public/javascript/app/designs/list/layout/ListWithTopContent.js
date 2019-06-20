define([
	"dijit/layout/ContentPane"
	, "dijit/layout/BorderContainer"
	, "dojo/_base/declare"
	, "put-selector/put"
], function(
	ContentPane
	, BorderContainer
	, declare
	, put
) {

	return declare(ContentPane, {
		//	summary:
		//		Layout para vistas que contienen un formulario y un listado.

		postCreate: function() {

			this.inherited(arguments);

			var parentNode = new BorderContainer({
				'class': "col-lg-12"
			});

			put(this.containerNode, parentNode.domNode);

			this.parentTopNode = new ContentPane({
				region: "top",
				style: 'height: 70px'
			});

			parentNode.addChild(this.parentTopNode);

			this.parentCenterNode = new ContentPane({
				region: "center"
			});

			parentNode.addChild(this.parentCenterNode);

			this.topNode = put(this.parentCenterNode.domNode, "div.topZone");

			this._titleNode = put(this.topNode, "div.titleZone.col-xs-8.col-sm-8.col-md-8.col-lg-8.col-xl-8");

			this._setTitle(this.title);

			this.keypadZoneNode = put(this.topNode, "div.keypadZone.col-xs-4.col-sm-4.col-md-4.col-lg-4.col-xl-4");

			put(this.titleSpanNode, "a[href]");

			this.centerNode = put(this.parentCenterNode.domNode, "div.centerZone");

			this.listNode = put(this.centerNode, "div.listZone");
		},

		_getNodeToShow: function() {

			return this.containerNode;
		}
	});
});
