define([
	'app/designs/base/_Layout'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector'
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
				layoutAdditionalClasses: 'chartTopContent'
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._createChartsTopNode();
			this._createChartsNode();
		},

		_createChartsTopNode: function() {

			this.chartsTopNode = put(this.domNode, 'div.aboveChartContent');

			this.toolbarContainerChartsTopNode = put(this.chartsTopNode, 'div');

			this.buttonsContainerChartsTopNode = put(this.chartsTopNode, "div.flexAndAlignCenter");
		},

		_createChartsNode: function() {

			this.chartsNode = put(this.domNode, 'div.centerChartContent');
		}
	});
});
