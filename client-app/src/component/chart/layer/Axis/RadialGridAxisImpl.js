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
		//		Implementación de rejilla radial (correspondiente al eje angular).

		constructor: function(args) {

			this.config = {
				ownChannel: "radialGridAxis",
				className: "gridAxis",
				linesContainerClassName: "radialGridLines",
				opacity: 0.3,
				parameterName: this.i18n.direction,
				marginForLabels: 30
			};

			lang.mixin(this, this.config, args);
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('DATA_SIZE_SET', lang.hitch(this, this._onDataSizeSet));
		},

		_createAxis: function(container) {

			var axis = container.append("svg:g")
				.attr("class", this.linesContainerClassName);

			container.attr("class", this.className);

			return axis;
		},

		_getRadialGridAxisRadius: function() {

			return (Math.min(this._width, this._height) - this.marginForLabels) / 2;
		},

		_updateAxis: function(axis) {

			this._applyRadiusToLines();
		},

		_applyRadiusToLines: function() {

			if (!this._radialLines) {
				return;
			}

			var radius = this._getRadialGridAxisRadius(),
				startPoint = this._isEven(this.dataSize) ? -radius : 0;

			this._radialLines
				.attr("x1", startPoint)
				.attr("x2", radius);
		},

		_isEven: function(num) {

			return !(num & 1);
		},

		_onDataSizeSet: function(changeObj) {

			this._radialLines && this._radialLines.remove();

			var dataSize = changeObj.value;

			if (!dataSize) {
				return;
			}

			this._radialLines = this._createRadialLines();

			this._applyTransformToLines();
			this._applyRadiusToLines();
		},

		_createRadialLines: function() {

			var rangeStart = -90,
				rangeEnd = this._isEven(this.dataSize) ? 90 : 270,
				step = 360 / this.dataSize,

				lineAngles = d3.range(rangeStart, rangeEnd, step),
				lines = this._axis.selectAll("g")
					.data(lineAngles).enter()
						.append("line");

			return lines;
		},

		_applyTransformToLines: function() {

			this._radialLines.attr("transform", this._getRadialLinesTransform);
		},

		_getRadialLinesTransform: function(d) {

			return "rotate(" + d + ")";
		}
	});
});
