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

			this._titleNode = put(this.topNode, "div.titleZone.col-xs-7.col-sm-7.col-md-8.col-lg-8.col-xl-7");

			this._setTitle(this.title);

			this.textSearchNode = put(this.topNode, "div.textSearchZone.col-xs-5.col-sm-5.col-md-4.col-lg-4.col-xl-5");

			this.centerNode = put(this.containerNode, "div.centerZone");

			this.listNode = put(this.centerNode, "div.listZone" + this.classByList);
		}
	});
});