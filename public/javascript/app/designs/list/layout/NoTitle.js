define([
	"dijit/layout/ContentPane"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
], function (
	ContentPane
	, declare
	, lang
	, put
){

	return declare(ContentPane, {
		//	summary:
		//		Layout para vistas que contienen un buscador de texto y un listado.

		constructor: function(args) {

			this.config = {
				classByList: '.noBorderList'
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);

			this.keypadZoneNode = put("div.keypadZone");

			this.centerNode = put(this.containerNode, "div.fHeight");

			this.listNode = put(this.centerNode, "div.listZone" + this.classByList);
		}
	});
});