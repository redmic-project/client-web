define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "./_VerticalCommons"
	, "./Axis"
], function(
	declare
	, lang
	, _VerticalCommons
	, Axis
){
	return declare([Axis, _VerticalCommons], {
		//	summary:
		//		Implementación de eje radial.

		constructor: function(args) {

			this.config = {
				ownChannel: 'radialAxis',
				className: 'axis radialAxis',
				opacity: 0.6,
				domainLevels: 3
			};

			lang.mixin(this, this.config, args);
		},

		_getAxisInstance: function() {

			var axis = this.inherited(arguments);

			axis.ticks(this.domainLevels);

			return axis;
		},

		_onRefreshed: function() {

			this._removeUndesiredTick();

			this.inherited(arguments);
		},

		_removeUndesiredTick: function() {

			this._container.selectAll(".tick")
				.filter(this._filterRadialAxisTick)
				.remove();
		},

		_filterRadialAxisTick: function(d, i) {

			return !i;
		},

		_getLabelTransform: function(leftOriented) {

			var rotation = leftOriented ? 90 : -90;

			return 'rotate(' + rotation + ')';
		},

		_getLabelYPosition: function(leftOriented) {

			var labelHeight = this._textElement.node().getBBox().height;

			return -labelHeight / 2;
		}
	});
});
