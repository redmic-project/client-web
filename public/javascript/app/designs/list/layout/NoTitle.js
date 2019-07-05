define([
	'app/designs/base/_Layout'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
], function (
	_Layout
	, declare
	, lang
	, put
){

	return declare(_Layout, {
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

			this.centerNode = put("div.fHeight");

			this.listNode = put(this.centerNode, "div.listZone" + this.classByList);

			this.addChild(this.centerNode);
		}
	});
});