define([
	'd3'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function(
	d3
	, declare
	, lang
){
	return declare(null, {
		//	summary:
		//		Componentes propios de rosa de los vientos de categoría única.

		constructor: function(args) {

			this.config = {
			};

			lang.mixin(this, this.config, args);
		},

		_updateMetricsForEachSimpleData: function(d) {

			var value = this._valueAccessor(d);

			this._totalCount += value;

			if (value < this._minValue) {
				this._minValue = value;
			}

			if (value > this._maxValue) {
				this._maxValue = value;
			}
		},

		_getMaxValue: function() {

			return this._maxValue;
		},

		_getSimpleWindRoseTransitionStartProps: function(startProps) {

			startProps.data = {};
			startProps.data[this.valueName] = 0;

			return startProps;
		}
	});
});
