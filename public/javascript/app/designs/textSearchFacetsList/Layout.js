define([
	"dijit/layout/ContentPane"
	, "dijit/layout/TabContainer"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "put-selector/put"
], function (
	ContentPane
	, TabContainer
	, declare
	, lang
	, aspect
	, put
){
	return declare(ContentPane, {
		//	summary:
		//		Layout para vistas que contienen un buscador de texto, por facets y un listado.

		postCreate: function() {

			this.topNode = put(this.containerNode, "div.topZone");

			this._titleNode = put(this.topNode, "div.titleZone.col-xs-3.col-sm-3.col-md-4.col-lg-4.col-xl-3");

			this._setTitle(this.title);

			var optionNode = put(this.topNode, "div.optionZone.col-xs-6.col-sm-5.col-md-5.col-lg-4.col-xl-4");

			this.buttonsNode = put(optionNode, "div.buttonsZone");

			this.textSearchNode = put(this.topNode, "div.textSearchZone.col-xs-3.col-sm-4.col-md-3.col-lg-4.col-xl-5");

			this.centerNode = put(this.containerNode, "div.centerZone.mediumTexturedContainer");

			if (this.filtersInTabs) {
				this.filterColumn = new TabContainer({
					'class': "facetsZone",
					tabPosition: "bottom"
				});
				this.filter1 = new ContentPane();
				this.filter2 = new ContentPane();

				this.facetsNode = this.filter1.domNode;
				this.filterColumn.addChild(this.filter1);
				this.filterColumn.addChild(this.filter2);
				put(this.centerNode, this.filterColumn.domNode);
				this.filterColumn.startup();
			} else {
				this.facetsNode = put(this.centerNode, "div.facetsZone");
			}

			this.listNode = put(this.centerNode, "div.listZone.listZoneWithFacets");

			this.inherited(arguments);
		}
	});
});