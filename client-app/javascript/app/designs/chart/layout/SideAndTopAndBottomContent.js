define([
	'app/designs/base/_Layout'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector/put'
], function(
	_Layout
	, declare
	, lang
	, put
) {

	return declare(_Layout, {
		//	summary:
		//		Layout para diseño de vistas que contienen gráficas y añadidos a la misma.

		constructor: function(args) {

			this.config = {
				layoutAdditionalClasses: 'sideAndTopAndBottomContentLayoutChartDesign',
				centerContentClass: "mediumSolidContainer.chartCenterContainer",
				sideContentClass: "mediumSolidContainer.chartSideContainer"
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);

			this.centerNode = put(this.domNode, 'div.' + this.centerContentClass);

			this._createChartsTopNode(this.centerNode);
			this._createChartsNode(this.centerNode);
			this._createChartsBottomNode(this.centerNode);

			this._createSideContentNode(this.domNode);
		},

		_createChartsTopNode: function(parentNode) {

			this.chartsTopNode = put(parentNode, 'div.aboveChartContent');

			this.toolbarContainerChartsTopNode = put(this.chartsTopNode, 'div');

			this.buttonsContainerChartsTopNode = put(this.chartsTopNode, "div.flexAndAlignCenter");
		},

		_createChartsNode: function(parentNode) {

			this.chartsNode = put(parentNode, 'div.centerChartContent');
		},

		_createChartsBottomNode: function(parentNode) {

			this.chartsBottomNode = put(parentNode, 'div.underChartContent');
		},

		_createSideContentNode: function(parentNode) {

			this.sideNode = put(parentNode, 'div.' + this.sideContentClass);
		}
	});
});
