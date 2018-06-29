define([
	'd3/d3.min'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "./_InfoOnLayerEventItfc"
], function(
	d3
	, declare
	, lang
	, _InfoOnLayerEventItfc
) {
	return declare(_InfoOnLayerEventItfc, {
		//	summary:
		//		Extensión para mostrar avisos asociados a eventos que tienen lugar en las capas.

		constructor: function(args) {

			this.config = {
				infoOnLayerEventTransitionDuration: 800,
				infoOnLayerEventTransitionEase: d3.easeExpInOut,
				hiddenClass: "hidden",
				infoOnLayerEventWidth: 200,
				infoOnLayerEventHeight: 100
			};

			lang.mixin(this, this.config, args);
		},

		_updateInfoOnLayerEventContainerSize: function(container) {

			container && container
				.attr("width", this.infoOnLayerEventWidth)
				.attr("height", this.infoOnLayerEventHeight)
				.attr("x", (this._width / 2) - (this.infoOnLayerEventWidth / 2))
				.attr("y", (this._height / 2) - (this.infoOnLayerEventHeight / 2));
		},

		_showInfoOnLayerEventMessage: function(area, container) {

			container.classed(this.hiddenClass, false);

			area.transition()
				.duration(this.infoOnLayerEventTransitionDuration)
				.ease(this.infoOnLayerEventTransitionEase)
				.attr("opacity", 1);
		},

		_hideInfoOnLayerEventMessage: function(area, container) {

			area.transition()
				.duration(this.infoOnLayerEventTransitionDuration)
				.ease(this.infoOnLayerEventTransitionEase)
				.attr("opacity", 0)
				.on("end", lang.hitch(this, function(container) {

					container.classed(this.hiddenClass, true);
				}, container));
		}
	});
});
