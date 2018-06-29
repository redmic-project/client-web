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
		//		Implementación de eje vertical.

		constructor: function(args) {

			this.config = {
				ownChannel: 'verticalAxis',
				className: 'axis yAxis',
				opacity: 0.6,
				_minDomainDiff: 1e-30,
				_domainMarginFactor: 0.05
			};

			lang.mixin(this, this.config, args);
		},

		_getLabelTransform: function(leftOriented) {

			var rotation = leftOriented ? -90 : 90;

			return 'rotate(' + rotation + ')';
		},

		_getLabelYPosition: function(leftOriented) {

			var axisTicks = this._container.selectAll('g.tick').nodes();

			if (!axisTicks || !axisTicks.length) {
				return;
			}

			var labelHeight = this._textElement.node().getBBox().height,
				maxTickWidth = this._getMaxTickWidth(axisTicks);

			return -(maxTickWidth + (labelHeight / 2));
		},

		_getMaxTickWidth: function(axisTicks) {

			var maxTickWidth = 0;

			for (var i = 0; i < axisTicks.length; i++) {
				var tick = axisTicks[i],
					tickWidth = tick.getBBox().width;

				if (tickWidth > maxTickWidth) {
					maxTickWidth = tickWidth;
				}
			}

			return maxTickWidth;
		},

		_getDomainWithMargin: function(domain) {

			var min = domain[0],
				max = domain[1],
				diff = Math.abs(max - min),
				margin;

			if (this.omitMargin || !diff || diff < this._minDomainDiff) {
				margin = 1;
			} else {
				margin = diff * this._domainMarginFactor;
			}

			domain[0] -= margin;
			domain[1] += margin;

			return domain;
		}
	});
});
