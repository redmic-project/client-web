define([
	'd3/d3.min'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "./Axis"
	, "./_HorizontalCommons"
], function(
	d3
	, declare
	, lang
	, Axis
	, _HorizontalCommons
){
	return declare([Axis, _HorizontalCommons], {
		//	summary:
		//		Implementación de rejilla vertical (correspondiente al eje temporal).

		constructor: function(args) {

			this.config = {
				ownChannel: "verticalGridAxis",
				className: "gridAxis",
				opacity: 0.3,
				parameterName: this.i18n.time
			};

			lang.mixin(this, this.config, args);
		},

		_createAxis: function(container) {

			var axis = d3.axisBottom()
				.tickSizeInner(-this._height)
				.tickFormat('');

			container.attr("class", this.className);

			return axis;
		},

		_updateAxis: function(axis) {

			axis.tickSizeInner(-this._height);
		}
	});
});
