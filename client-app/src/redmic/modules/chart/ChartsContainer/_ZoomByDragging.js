define([
	'd3/d3.min'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
], function(
	d3
	, declare
	, lang
	, aspect
) {
	return declare(null, {
		//	summary:
		//		Extensión para permitir al usuario hacer zoom arrastrando sobre la gráfica.

		constructor: function(args) {

			this.config = {
				zoomByDraggingClass: "zoomByDraggingRect"
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_setOwnCallbacksForEvents", lang.hitch(this,
				this._setZoomByDraggingOwnCallbacksForEvents));
			aspect.after(this, "_createElements", lang.hitch(this, this._createZoomByDraggingElements));
		},

		_setZoomByDraggingOwnCallbacksForEvents: function() {

			this._onEvt("FOCUS_CHANGED", lang.hitch(this, this._onZoomByDraggingFocusChanged));
		},

		_onZoomByDraggingFocusChanged: function(res) {

			var min = res.min,
				max = res.max;

			if (this._checkTimeDomainIsRepresentable(min, max)) {
				this._zoomDisabled = false;
			} else {
				this._backToPreviousZoom();
			}
		},

		_createZoomByDraggingElements: function() {

			this.zoomByDraggingArea = this.toolsArea.append("svg:g")
				.attr("id", "zoomByDragging");

			this.svg
				.on("mousedown.zoomByDragging", lang.hitch(this, this._moveStart))
				.on("touchstart.zoomByDragging", lang.hitch(this, this._moveStart));
		},

		_moveStart: function(evt) {

			if (this.zoomRect || this._zoomDisabled) {
				return;
			}

			var pos = d3.pointer(evt);
			this._startX = pos[0];

			if (!this._isValidPosition(this._startX)) {
				return;
			}

			this._pauseInfoOnMouseOver && this._pauseInfoOnMouseOver();

			this._createZoomRect();
			this._subscribeToSvg();
		},

		_createZoomRect: function() {

			this.zoomRect = this.zoomByDraggingArea.append("svg:rect")
				.attr("class", this.zoomByDraggingClass)
				.attr("x", this._startX)
				.attr("y", 0)
				.attr("width", 0)
				.attr("height", this._innerHeight)
				.attr("transform", "translate(0," + this._verticalTranslate + ")");
		},

		_subscribeToSvg: function() {

			this.svg
				.on("mousemove.zoomByDragging", lang.hitch(this, this._move))
				.on("touchmove.zoomByDragging", lang.hitch(this, this._move))
				.on("mouseup.zoomByDragging", lang.hitch(this, this._moveEnd))
				.on("touchend.zoomByDragging", lang.hitch(this, this._moveEnd))
				.on("mouseleave.zoomByDragging", lang.hitch(this, this._moveCancel));
		},

		_isValidPosition: function(xPos) {

			var leftLimit = this._getLeftLimit(),
				rightLimit = this._getRightLimit();

			return xPos >= leftLimit && xPos <= rightLimit;
		},

		_getLeftLimit: function() {

			return this._horizontalTranslate + (this._leftLimit || 0);
		},

		_getRightLimit: function() {

			return this._horizontalTranslate + (this._rightLimit || this._innerWidth);
		},

		_move: function(evt) {

			var pos = d3.pointer(evt),
				currX = pos[0],

				rightLimit = this._getRightLimit(),
				rightLimitedX = currX <= rightLimit ? currX : rightLimit,
				posDiff = rightLimitedX - this._startX,
				leftLimit = this._getLeftLimit(),
				oldWidth = this.zoomRect.attr("width"),

				newX = rightLimitedX >= leftLimit ?
					(posDiff < 0 ? rightLimitedX : this._startX) :
					leftLimit,

				newWidth = rightLimitedX >= leftLimit ? Math.abs(posDiff) : oldWidth;

			this.zoomRect.attr("x", newX);
			this.zoomRect.attr("width", newWidth);
		},

		_moveEnd: function(evt) {

			var pos = d3.pointer(evt);
			if (this._startX !== pos[0]) {
				this._updateXResolution();
			}

			this._cleanZoomByDraggingTools();
		},

		_cleanZoomByDraggingTools: function() {

			this.zoomRect.remove();
			delete this.zoomRect;

			this._unsubscribeFromSvg();
			this._continueInfoOnMouseOver && this._continueInfoOnMouseOver();
		},

		_updateXResolution: function() {

			var xMin = parseInt(this.zoomRect.attr("x") - this._horizontalTranslate, 10),
				xMax = xMin + parseInt(this.zoomRect.attr("width"), 10);

			if (this._temporalAxisScale) {
				var actualXMin = this._temporalAxisScale.invert(xMin),
					actualXMax = this._temporalAxisScale.invert(xMax);

				if (this._checkTimeDomainIsRepresentable(actualXMin, actualXMax)) {
					this._changeDomain(actualXMin, actualXMax);
				} else {
					this._zoomDisabled = true;
				}
			}
		},

		_unsubscribeFromSvg: function() {

			this.svg
				.on("mousemove.zoomByDragging", null)
				.on("touchmove.zoomByDragging", null)
				.on("mouseup.zoomByDragging", null)
				.on("touchend.zoomByDragging", null)
				.on("mouseleave.zoomByDragging", null);
		},

		_moveCancel: function() {

			this._cleanZoomByDraggingTools();
		}

	});
});
