define([
	"dojo/_base/declare"
], function(
	declare
){
	return declare(null, {
		//	summary:
		//		Extensión de gráfica de tarta/donut multi-nivel para dar diferente radio a unos niveles que a otros.
		//		Da más importancia a la menor profundidad (más cercano al centro) que a las sucesivas.

		_variableRadiusMultiplier: 0.2,

		_getRingRadiusDivisor: function() {

			return 3;
		},

		_calculateInnerRadius: function(d) {

			var depth = d.depth;

			if (depth === 1) {
				return this._getPrimaryRingInnerRadius();
			}

			return this._getSecondaryRingsInnerRadius(depth);
		},

		_calculateOuterRadius: function(d) {

			var depth = d.depth;

			if (depth === 1) {
				return this._getPrimaryRingOuterRadius();
			}

			return this._getSecondaryRingsOuterRadius(depth);
		},

		_updateDataMetrics: function() {

			this.inherited(arguments);

			this._updateSecondaryRingsMeasurements();
		},

		_setSize: function(req) {

			this.inherited(arguments);

			this._updateSecondaryRingsMeasurements();
		},

		_updateSecondaryRingsMeasurements: function() {

			if (!this._ringRadius || (!this._maxDepthReached || this._maxDepthReached < 2)) {
				return;
			}

			this._secondaryRingRadiusOrigin = this._getPrimaryRingOuterRadius();

			var secondaryRingsRadius = this._ringRadius * (1 - this._variableRadiusMultiplier),
				secondaryRingsCount = this._maxDepthReached - 1;

			this._secondaryRingRadius = secondaryRingsRadius / secondaryRingsCount;
		},

		_getPrimaryRingInnerRadius: function() {

			return this.hole ? this._ringRadius : 0;
		},

		_getPrimaryRingOuterRadius: function() {

			if (this._maxDepthReached < 2) {
				return this._radius;
			}

			return this._ringRadius * (2 + this._variableRadiusMultiplier);
		},

		_getSecondaryRingsInnerRadius: function(depth) {

			if (depth === 2) {
				return this._secondaryRingRadiusOrigin;
			}

			var secondaryLevel = depth - 2;

			return this._secondaryRingRadiusOrigin + this._secondaryRingRadius * secondaryLevel;
		},

		_getSecondaryRingsOuterRadius: function(depth) {

			if (depth === this._maxDepthReached || depth === this.visibleDepths) {
				return this._radius;
			}

			var secondaryLevel = depth - 1;

			return this._secondaryRingRadiusOrigin + this._secondaryRingRadius * secondaryLevel;
		}
	});
});
