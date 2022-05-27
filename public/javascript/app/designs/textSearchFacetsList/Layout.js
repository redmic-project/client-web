define([
	'app/designs/base/_Layout'
	, "dijit/layout/ContentPane"
	, "dijit/layout/TabContainer"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "put-selector/put"
], function(
	_Layout
	, ContentPane
	, TabContainer
	, declare
	, lang
	, aspect
	, put
) {

	return declare(_Layout, {
		//	summary:
		//		Layout para vistas que contienen un buscador de texto, por facets y un listado.

		constructor: function(args) {

			this.config = {
				layoutAdditionalClasses: 'layoutTextSearchFacetsListDesign'
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);

			this.topNode = put("div.topZone");

			this._titleNode = put(this.topNode, "div.titleZone");

			this._setTitle(this.title);

			var optionNode = put(this.topNode, "div.optionZone");

			this.buttonsNode = put(optionNode, "div.buttonsZone");

			this.textSearchNode = put(this.topNode, "div.textSearchZone");

			this.centerNode = put("div.centerZone.softSolidContainer");

			if (this.filtersInTabs) {
				this.filterColumn = new TabContainer({
					'class': "facetsZone",
					region: "center",
					tabPosition: "bottom"
				});
				this.filter1 = new ContentPane({
					_subnodeCssMouseEvent: function() {}
				});
				this.filter2 = new ContentPane();

				this.facetsNode = this.filter1.domNode;

				this.filterColumn.addChild(this.filter1);
				this.filterColumn.addChild(this.filter2);
				this.filterColumn.placeAt(this.centerNode);
				this.filterColumn.startup();

			} else {
				this.facetsNode = put(this.centerNode, "div.facetsZone");
			}

			this.listNode = put(this.centerNode, "div.listZone.listZoneWithFacets");

			this.addChild(this.topNode);
			this.addChild(this.centerNode);
		}
	});
});
