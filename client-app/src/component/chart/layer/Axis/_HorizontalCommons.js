define([
	'd3'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, 'moment'
	, "RWidgets/Utilities"
], function(
	d3
	, declare
	, lang
	, aspect
	, moment
	, Utilities
){
	return declare(null, {
		//	summary:
		//		Elementos comunes para los ejes vinculados a la disposición horizontal.

		constructor: function(args) {

			this.config = {
				rotateLabels: false,

				_tickMaxWidth: 70,
				_rotatedTickMaxWidth: 30,
				_updateHorizontalTicksTimeout: 100
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_updateAxis", lang.hitch(this, this._updateAxisHorizontalCommons));
		},

		_updateAxisHorizontalCommons: function(axis) {

			var domain = this._scale ? this._scale.domain() : null;

			if (domain) {
				axis.tickValues([]);

				clearTimeout(this._updateHorizontalTicksTimeoutHandler);
				this._updateHorizontalTicksTimeoutHandler = setTimeout(lang.hitch(this, function(axis, domain) {

					axis.tickValues(this._getHorizontalTickValues(domain));
					this._refresh();
				}, axis, domain), this._updateHorizontalTicksTimeout);
			}
		},

		_getHorizontalTickValues: function(domain) {

			var expectedTicks = Math.floor(this._width / this._getWidthNeededByTick()),
				minDomain = domain[0],
				maxDomain = domain[1],
				domainExtent = moment(maxDomain).diff(minDomain),
				domainDuration = moment.duration(domainExtent),
				intervalNames = ["years", "months", "weeks", "days", "hours", "minutes", "seconds", "milliseconds"],
				lastIntervalIndex = intervalNames.length - 1,
				interval, step;

			for (var i = 0; i <= lastIntervalIndex; i++) {
				var intervalName = intervalNames[i],
					momentMethod = "as" + Utilities.capitalize(intervalName),
					durationInCurrentInterval = domainDuration[momentMethod]();

				if (expectedTicks <= durationInCurrentInterval || i === lastIntervalIndex) {
					var d3Method = 'time' + Utilities.capitalize(intervalName);

					interval = d3[d3Method];
					step = Math.ceil(durationInCurrentInterval / expectedTicks);
					break;
				}
			}

			return interval(minDomain, maxDomain, step);
		},

		_getWidthNeededByTick: function() {

			return this.rotateLabels ? this._rotatedTickMaxWidth : this._tickMaxWidth;
		},

		_rotateLabels: function() {

			this._container.selectAll(".tick text")
				.attr("transform", lang.partial(this._getRotateLabelsTransform, this));
		},

		_getRotateLabelsTransform: function(self, d) {

			var prevTransform = d3.select(this).attr("transform");

			if (prevTransform) {
				return prevTransform;
			}

			var bBox = this.getBBox(),
				translateX = -bBox.width * 0.5,
				translateY = -self.tickPadding,
				translate = "translate(" + translateX + "," + translateY + ")",

				rotateA = -45,
				rotateX = bBox.width * 0.5,
				rotateY = bBox.height,
				rotate = "rotate(" + rotateA + "," + rotateX + "," + rotateY + ")";

			return translate + rotate;
		}
	});
});
