define([
	'd3/d3.min'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
], function(
	d3
	, declare
	, lang
	, aspect
){
	return declare(null, {
		//	summary:
		//		Componentes propios de rosa de los vientos de categoría múltiple.

		constructor: function(args) {

			this.config = {
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_updateDataMetrics", lang.hitch(this._updateMultipleDataMetrics));
		},

		_updateMultipleDataMetrics: function() {

			this._totalCountByDirection = [];
			this._maxDirectionValue = Number.NEGATIVE_INFINITY;
		},

		_updateMetricsForEachMultipleData: function(d) {

			var currentTotal = this._totalCount;
			for (var i = 0; i < d.length; i++) {
				this._updateMetricsForEachSimpleData(d[i]);
			}

			var directionValue = this._totalCount - currentTotal;
			if (directionValue > this._maxDirectionValue) {
				this._maxDirectionValue = directionValue;
			}

			this._totalCountByDirection.push(directionValue);
		},

		_getMaxDirectionValue: function() {

			return this._maxDirectionValue;
		},

		_getMultipleWindRoseTransitionStartProps: function(startProps) {

			var data = [];
			for (var i = 0; i < this._domainLevels; i++) {
				var item = {};
				item[this.valueName] = 0;
				data.push(item);
			}
			startProps.data = data;

			return startProps;
		}
	});
});
