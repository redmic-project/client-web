define([
	"dijit/layout/ContentPane"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "put-selector/put"
], function (
	ContentPane
	, declare
	, lang
	, aspect
	, put
){
	return declare(ContentPane, {
		//	summary:
		//		Layout para vistas de detalle.

		constructor: function(args) {

			lang.mixin(this, args);

			this.centerNode = put("div.infoContainer");
		},

		postCreate: function() {

			put(this.containerNode, ".infoView");
			put(this.containerNode, this.centerNode);

			this.inherited(arguments);
		}
	});
});
