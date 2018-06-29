define([
	"dijit/layout/BorderContainer"
	, "dijit/layout/ContentPane"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
], function (
	BorderContainer
	, ContentPane
	, declare
	, lang
	, put
){
	return declare(ContentPane, {
		//	summary:
		//		Layout para diseño de vistas que contienen gráficas y añadidos a la misma.

		constructor: function(args) {

			this.config = {
				sideContentClass:
					"col-xs-5 col-sm-5 col-md-4 col-lg-3 mediumTexturedContainer mapSideContainer",
				sideContentSplitter: true,
				sideContentRegion: "right"
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.contentNode = new BorderContainer();

			this._createExtendedChartsNode(this.contentNode);
			this._createSideContentNode(this.contentNode);

			this.addChild(this.contentNode);
			this.contentNode.startup();

			this.inherited(arguments);
		},

		_createExtendedChartsNode: function(container) {

			var extendedChartsNode = new ContentPane({
					region: "center"
				}),
				bc = new BorderContainer();

			this._createChartsTopNode(bc);
			this._createChartsNode(bc);
			this._createChartsBottomNode(bc);

			extendedChartsNode.addChild(bc);
			container.addChild(extendedChartsNode);
		},

		_createChartsTopNode: function(container) {

			this.chartsTopNode = new ContentPane({
				region: "top",
				'class': "aboveChartContent"
			});

			container.addChild(this.chartsTopNode);

			this.toolbarContainerChartsTopNode = put(this.chartsTopNode.domNode, 'div');

			this.optionsContainerChartsTopNode = put(this.chartsTopNode.domNode, 'div');

			this.buttonsContainerChartsTopNode = put(this.chartsTopNode.domNode,
				"div.flexAndAlignCenter");
		},

		_createChartsNode: function(container) {

			this.chartsNode = new ContentPane({
				region: "center"
			});

			container.addChild(this.chartsNode);
		},

		_createChartsBottomNode: function(container) {

			this.chartsBottomNode = new ContentPane({
				region: "bottom",
				'class': "underChartContent"
			});

			container.addChild(this.chartsBottomNode);
		},

		_createSideContentNode: function(container) {

			this.sideNode = new ContentPane({
				region: this.sideContentRegion,
				'class': this.sideContentClass,
				splitter: this.sideContentSplitter
			});

			container.addChild(this.sideNode);
		}
	});
});
