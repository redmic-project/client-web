define([
	'd3'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "./Axis"
], function(
	d3
	, declare
	, lang
	, Axis
){
	return declare(Axis, {
		//	summary:
		//		Implementación de rejilla vertical (correspondiente al eje temporal).

		constructor: function(args) {

			this.config = {
				ownChannel: "horizontalGridAxis",
				className: "gridAxis",
				opacity: 0.3
			};

			lang.mixin(this, this.config, args);
		},

		_createAxis: function(container) {

			var axis = d3.axisLeft()
				.tickSizeInner(-this._width)
				.tickFormat('');

			container.attr("class", this.className);

			return axis;
		},

		_updateAxis: function(axis) {

			axis.tickSizeInner(-this._width);
		}
	});
});
