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
		//		Layout para diseño de vistas que contienen un mapa, contenido a la derecha y barra superior.

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

			this.topbarNode = new ContentPane({
				region: "top",
				'class': this.classTopbar || "mediumSolidContainer rounded titleContainer"
			});

			this.mapNode = new ContentPane({
				region: "center",
				'class': "mediumSolidContainer borderRadius"
			});

			this.contentNode = new BorderContainer({
				region: "center"
			});

			this.contentNode.addChild(this.topbarNode);
			this.contentNode.addChild(this.mapNode);
			this.addChild(this.contentNode);
			this.contentNode.startup();
		}
	});
});
