define([
	"dijit/layout/LayoutContainer"
	, "dijit/layout/BorderContainer"
	, "dijit/layout/ContentPane"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
], function (
	LayoutContainer
	, BorderContainer
	, ContentPane
	, declare
	, lang
	, put
){
	return declare(BorderContainer, {
		//	summary:
		//		Layout para diseño de vistas que contienen gráficas y añadidos a la misma.

		constructor: function(args) {

			this.config = {
				'class': "chartTopAndBottomContent"
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._createChartsTopNode(this);
			this._createChartsNode(this);
			this._createChartsBottomNode(this);
		},

		_createChartsTopNode: function(container) {

			this.chartsTopNode = new ContentPane({
				region: "top",
				'class': "aboveChartContent"
			});

			container.addChild(this.chartsTopNode);

			this.toolbarContainerChartsTopNode = put(this.chartsTopNode.domNode, 'div');

			this.buttonsContainerChartsTopNode = put(this.chartsTopNode.domNode,
				"div.flexAndAlignCenter");
		},

		_createChartsNode: function(container) {

			this.chartsNode = new LayoutContainer({
				region: "center",
				'class': "centerChartContent"
			});

			container.addChild(this.chartsNode);
		},

		_createChartsBottomNode: function(container) {

			this.chartsBottomNode = new ContentPane({
				region: "bottom",
				'class': "underChartContent"
			});

			container.addChild(this.chartsBottomNode);
		}
	});
});
