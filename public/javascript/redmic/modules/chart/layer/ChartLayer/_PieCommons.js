define([
	'd3/d3.min'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "./_CategoryLayerCommons"
	, "./_CircularLayerCommons"
	, "./ChartLayer"
], function(
	d3
	, declare
	, lang
	, _CategoryLayerCommons
	, _CircularLayerCommons
	, ChartLayer
){
	return declare([ChartLayer, _CategoryLayerCommons, _CircularLayerCommons], {
		//	summary:
		//		Base común para las gráficas de tipo (multi) tarta/donut.

		constructor: function(args) {

			this.config = {
				transitionDuration: 1300,
				transitionEase: d3.easeExpInOut,
				clockwiseTransition: true,
				padAngle: 0.01
			};

			lang.mixin(this, this.config, args);
		},

		_onUpdateDataFulfilled: function() {

			if (!this._getTotalCount()) {
				this._emitEvt("ZERO_VALUE_DATA_ADDED", this._getLayerInfo());
			}
		},

		_valueAccessor: function(d) {

			return this._getComponentValue(d, this._getValuePath(this.valueName));
		},

		_getCategoryPercentage: function(value, total) {

			return total ? Math.round(10000 * value / total) / 100 : null;
		}
	});
});
