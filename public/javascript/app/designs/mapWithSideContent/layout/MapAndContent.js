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
		//		Layout para diseño de vistas que contienen un mapa y un contenido a la derecha.

		constructor: function(args) {

			lang.mixin(this, args);
		},

		postCreate: function() {

			this._createAndAddContent();

			this.inherited(arguments);
		},

		_createAndAddContent: function() {

			if (this.mapNode) {
				return this.mapNode;
			}

			this.mapNode = new ContentPane({
				region: "center",
				'class': "mediumSolidContainer borderRadius"
			});

			this.contentNode = new BorderContainer({
				region: "center"
			});

			this.contentNode.addChild(this.mapNode);
			this.addChild(this.contentNode);
			this.contentNode.startup();
		}
	});
});
