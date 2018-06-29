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

			this.topNode = put(this.containerNode, "div.topZone");

			this._titleNode = put(this.topNode, "div.titleZone.col-xs-5.col-sm-5.col-md-6.col-lg-6.col-xl-5");

			this._setTitle(this.title);

			var optionNode = put(this.topNode, "div.optionZone.col-xs-1.col-sm-1.col-md-1.col-lg-1.col-xl-1");

			this.buttonsNode = put(optionNode, "div.buttonsZone");

			this.textSearchNode = put(this.topNode, "div.textSearchZone.col-xs-5.col-sm-5.col-md-4.col-lg-4.col-xl-5");

			this.keypadZoneNode = put(this.topNode, "div.keypadZone");

			this.centerNode = put(this.containerNode, "div.centerZone");

			this.listNode = put(this.centerNode, "div.listZone" + this.classByList);
		}
	});
});