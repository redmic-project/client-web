define([
	"dijit/layout/BorderContainer"
	, "dijit/layout/ContentPane"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function (
	BorderContainer
	, ContentPane
	, declare
	, lang
){
	return declare(ContentPane, {
		//	summary:
		//		Layout para sidebar con contenido a la derecha

		constructor: function(args) {

			lang.mixin(this, args);
		},

		postCreate: function() {

			this.centerNode = new ContentPane({
				region: "center",
				"class": "centerContent"
			});

			this.sidebarNode = new ContentPane({
				region: "left"
			});

			this.contentNode = new BorderContainer();

			this.contentNode.addChild(this.sidebarNode);
			this.contentNode.addChild(this.centerNode);
			this.addChild(this.contentNode);
			this.contentNode.startup();

			this.inherited(arguments);
		}
	});
});