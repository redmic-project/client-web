define([
	"dijit/layout/ContentPane"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "./_Layout"
], function (
	ContentPane
	, declare
	, lang
	, _Layout
){
	return declare(_Layout, {
		//	summary:
		//		Layout para zona de filtrado en el contenido secundario por la izquierda.

		constructor: function(args) {

			this.config = {};

			lang.mixin(this, this.config, args);
		},

		_createSecondaryNode: function(container) {

			var secondaryContent = new ContentPane({
				'class': "isolatedFacetsZone",
				region: "left"
			});

			container.addChild(secondaryContent);
			this.secondaryNode = secondaryContent.domNode;
		}
	});
});
