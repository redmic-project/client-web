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
		//		Layout para vistas que contienen un buscador de texto, por facets y un listado.

		constructor: function(args) {

			this.config = {};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);

			this.topNode = put(this.containerNode, "div.topZone");

			this._titleNode = put(this.topNode, "div.titleZone.col-xs-3.col-sm-3.col-md-5.col-lg-4.col-xl-3");

			this._setTitle(this.title);

			var optionNode = put(this.topNode, "div.optionZone.col-xs-4.col-sm-4.col-md-3.col-lg-4.col-xl-4");

			this.buttonsNode = put(optionNode, "div.buttonsZone");

			this.textSearchNode = put(this.topNode, "div.textSearchZone.col-xs-5.col-sm-5.col-md-4.col-lg-4.col-xl-5");

			this.centerNode = put(this.containerNode, "div.centerZone");

			this.listNode = put(this.centerNode, "div.listZone");
		},

		// TODO esto arregla un fallo: Uncaught TypeError: this._startAtWatchHandles is not a function
		startup: function() {

		}
	});
});