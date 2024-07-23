define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "./Axis"
], function(
	declare
	, lang
	, aspect
	, Axis
){
	return declare(Axis, {
		//	summary:
		//		Implementación de rejilla angular (correspondiente al eje radial).

		constructor: function(args) {

			this.config = {
				ownChannel: "angularGridAxis",
				className: "gridAxis",
				circlesContainerClassName: "angularGridCircles",
				opacity: 0.3,
				domainLevels: 3
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_setScale", lang.hitch(this, this._setScaleAngularGridAxis));
		},

		_createAxis: function(container) {

			var axis = container.append("svg:g")
				.attr("class", this.circlesContainerClassName);

			container.attr("class", this.className);

			return axis;
		},

		_updateAxis: function(axis) {

			this._applyRadiusToCircles(axis.selectAll("circle"));
		},

		_applyRadiusToCircles: function(circles) {

			circles && circles.attr("r", lang.hitch(this, this._getAngularGridAxisRadius));
		},

		_getAngularGridAxisRadius: function(d, i) {

			return -this._scale(d);
		},

		_setScaleAngularGridAxis: function(ret, args) {

			if (!this._axis) {
				return;
			}

			this._axis.selectAll("circle")
				.remove();

			var circles = this._createAngularCircles();
		},

		_createAngularCircles: function() {

			var circleReferencePoints = this._getAngularGridAxisReferencePoints(),
				circles = this._axis.selectAll("g")
					.data(circleReferencePoints).enter()
						.append("circle");

			this._applyRadiusToCircles(circles);

			return circles;
		},

		_getAngularGridAxisReferencePoints: function() {

			if (!this._scale) {
				return [];
			}

			return this._scale.ticks(this.domainLevels).slice(1);
		}
	});
});
