define([
	'd3'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/chart/layer/Axis/VerticalAxisImpl"
	, "./_AxesDrawing"
], function(
	d3
	, declare
	, lang
	, VerticalAxisImpl
	, _AxesDrawing
) {
	return declare(_AxesDrawing, {
		//	summary:
		//		Extensión para dibujar ejes verticales en la gráfica.

		constructor: function(args) {

			this.config = {
				_additionalRightAxisMargin: 10,
				_axisWidthAdjustment: 30,

				_verticalAxes: {},
				_verticalAxesDomains: {},
				_verticalAxesRanges: {},
				_verticalAxesScales: {},
				_verticalAxesContainers: {},

				_verticalAxesCounter: 0,
				_hiddenAxes: {},
				_axesOrder: [],
				_rightLimits: {}
			};

			lang.mixin(this, this.config, args);
		},

		_drawAxes: function(res) {

			this.inherited(arguments);

			var yMin = res.yMin,
				yMax = res.yMax,
				param = res.parameterName;

			if ((isNaN(yMin) || !isFinite(yMin)) || (isNaN(yMax) || !isFinite(yMax))) {
				console.error("Invalid limits for '%s' vertical axis (%s, %s)", param, yMin, yMax);
				return;
			}

			if (!this._verticalAxes[param]) {
				this._drawVerticalAxis(yMin, yMax, param);
			} else {
				this._updateVerticalAxis(yMin, yMax, param);
			}
		},

		_clearAxes: function() {

			this.inherited(arguments);

			for (var param in this._verticalAxes) {
				this._clearVerticalAxis(param);
			}
		},

		_clearVerticalAxis: function(param) {

			var axisInstance = this._verticalAxes[param];

			if (!axisInstance) {
				return;
			}

			this._clearAxis(axisInstance);
			this._unsubscribeFromAxis(axisInstance);

			delete this._verticalAxes[param];
			this._verticalAxesCounter--;

			delete this._hiddenAxes[param];
			delete this._rightLimits[param];

			var axisOrder = this._axesOrder.indexOf(param);
			this._axesOrder.splice(axisOrder, 1);

			this._relocateVerticalAxes();
		},

		_drawVerticalAxis: function(min, max, param) {

			this._verticalAxesDomains[param] = {
				min: min,
				max: max
			};
			this._verticalAxesRanges[param] = {};

			this._verticalAxesCounter++;

			var orient = this._verticalAxesCounter > 1 ? "right" : "left",
				verticalAxis = new VerticalAxisImpl({
					parentChannel: this.getChannel(),
					orient: orient,
					parameterName: param
				});

			this._verticalAxes[param] = verticalAxis;
			this._axesOrder.push(param);

			this._subscribeToAxis(verticalAxis);
			this._updateAxisSize(verticalAxis);
			this._createVerticalAxisContainer(param);
			this._prepareRepositionVerticalAxis(verticalAxis, param);
			this._redrawVerticalAxis(param);
		},

		_updateVerticalAxis: function(min, max, param, force) {

			var modified;

			if (force || min < this._verticalAxesDomains[param].min) {
				this._verticalAxesDomains[param].min = min;
				modified = true;
			}
			if (force || max > this._verticalAxesDomains[param].max) {
				this._verticalAxesDomains[param].max = max;
				modified = true;
			}

			if (modified) {
				var newMin = this._verticalAxesDomains[param].min,
					newMax = this._verticalAxesDomains[param].max;

				this._verticalAxesScales[param].domain([newMin, newMax]);
				this._setAxisScale(this._verticalAxes[param], this._verticalAxesScales[param]);
			}
		},

		_createVerticalAxisContainer: function(param) {

			var container = this.axesArea.append("svg:g")
				.attr("id", "verticalAxis_" + param);

			this._verticalAxesContainers[param] = container;
		},

		_redrawVerticalAxis: function(param) {

			var verticalAxis = this._verticalAxes[param],
				container = this._verticalAxesContainers[param];

			this._updateVerticalAxisLimits(param);
			this._drawAxis(verticalAxis, container);
		},

		_updateVerticalAxisLimits: function(param) {

			var domain = this._verticalAxesDomains[param],
				minD = domain.min,
				maxD = domain.max,
				range = this._verticalAxesRanges[param],
				minR = range.min,
				maxR = range.max;

			this._verticalAxesScales[param] = this._createVerticalScale(minD, maxD, minR, maxR);
			this._setAxisScale(this._verticalAxes[param], this._verticalAxesScales[param]);
		},

		_createVerticalScale: function(minD, maxD, minR, maxR) {

			var domain = [minD, maxD],
				range = [maxR || this._innerHeight, minR || 0],
				scale = d3.scaleLinear()
					.range(range)
					.domain(domain);

			return scale;
		},

		_prepareRepositionVerticalAxis: function(axisInstance, param) {

			this._subscribe(axisInstance.getChannel("DRAWN"), lang.hitch(this, function(param) {

				var container = this._verticalAxesContainers[param],
					order = this._getAxisOrder(param);

				this._relocateVerticalAxis(param, container, order);
			}, param));
		},

		_getAxisOrder: function(param) {

			var order = 1;

			for (var i = 0; i < this._axesOrder.length; i++) {
				var currentParam = this._axesOrder[i];

				if (currentParam === param) {
					return order;
				}

				if (!this._hiddenAxes[currentParam]) {
					order++;
				}
			}
		},

		_relocateVerticalAxis: function(param, container, counter) {

			var axisXTranslate = this._getVerticalAxisXTranslate(container, counter),
				transform = "translate(" + axisXTranslate + ",0)";

			container.attr("transform", transform);

			this._updateSideLimits(param, counter, axisXTranslate);
			this._adjustHorizontalAxisToVerticalAxes();
		},

		_getVerticalAxisXTranslate: function(container, counter) {

			var element = container.node(),
				bbox = element.getBBox(),
				elementWidth = bbox.width,
				xTranslate;

			if (counter > 1) {
				xTranslate = this._getXTranslateForRightAlignedAxis(counter, elementWidth);
			} else {
				xTranslate = elementWidth - this._axisWidthAdjustment;
			}

			return xTranslate;
		},

		_getXTranslateForRightAlignedAxis: function(counter, elementWidth) {

			var xTranslate = this._innerWidth;

			if (counter > 2) {
				var prevParam = this._axesOrder[counter - 2],
					prevAxisLimit = this._rightLimits[prevParam];

				xTranslate = prevAxisLimit - this._additionalRightAxisMargin;
			} else {
				xTranslate += this._axisWidthAdjustment;
			}

			return xTranslate - elementWidth;
		},

		_updateSideLimits: function(param, counter, axisXTranslate) {

			if (counter === 1) {
				this._leftLimit = axisXTranslate;
			}

			this._rightLimits[param] = counter > 1 ? axisXTranslate : this._innerWidth;
			this._updateRightLimit();
		},

		_updateRightLimit: function() {

			this._rightLimit = Number.POSITIVE_INFINITY;

			for (var param in this._rightLimits) {
				var limit = this._rightLimits[param];

				if (limit < this._rightLimit) {
					this._rightLimit = limit;
				}
			}
		},

		_resizeAxes: function() {

			this.inherited(arguments);

			for (var param in this._verticalAxes) {
				this._resizeVerticalAxis(param);
			}
		},

		_resizeVerticalAxis: function(param) {

			var axisInstance = this._verticalAxes[param];
			if (axisInstance) {
				this._updateAxisSize(axisInstance);
				this._redrawVerticalAxis(param);
			}
		},

		_findAnotherChartWithSameParam: function(param, layerId) {

			for (var key in this._paramsByLayerId) {
				if (this._paramsByLayerId[key] === param &&
					key !== layerId && !this._hiddenLayers[key]) {

					return true;
				}
			}

			return false;
		},

		_findHiddenChartWithSameParam: function(param, layerId) {

			for (var key in this._hiddenLayers) {
				if (this._paramsByLayerId[key] === param && key !== layerId) {
					return true;
				}
			}

			return false;
		},

		_removeAxisIfNotUsed: function(res) {

			var layerId = res.chart,
				param = res.parameterName,
				axisUserFound = this._findAnotherChartWithSameParam(param, layerId),
				hiddenAxisUserFound = this._findHiddenChartWithSameParam(param, layerId);

			this._updateRightLimit();

			if (axisUserFound) {
				return;
			}

			if (!hiddenAxisUserFound) {
				this._clearVerticalAxis(param);
			} else {
				this._hideVerticalAxis(param);
			}
		},

		_hideAxisIfNotUsed: function(res) {

			var layerId = res.chart,
				param = res.parameterName,
				axisUserFound = this._findAnotherChartWithSameParam(param, layerId);

			this._updateRightLimit();

			if (!axisUserFound) {
				this._hideAxisBecauseItIsNotUsed(param);
			}

			var newLimits = this._findNewAxesLimits(layerId, param);
			this._setNewAxesLimits(newLimits, param);
		},

		_hideAxisBecauseItIsNotUsed: function(param) {

			this.inherited(arguments);

			this._hideVerticalAxis(param);
		},

		_setNewAxesLimits: function(limits, param) {

			this.inherited(arguments);

			var yMin = limits.yMin,
				yMax = limits.yMax;

			if (!isNaN(yMin) && !isNaN(yMax)) {
				this._verticalAxes[param] && this._setVerticalAxisLimits(yMin, yMax, param);
			}
		},

		_setVerticalAxisLimits: function(min, max, param) {

			if (this._verticalAxes[param]) {
				this._updateVerticalAxis(min, max, param, true);
				this._drawAxis(this._verticalAxes[param]);
			}
		},

		_showAxisIfNotShown: function(res) {

			this.inherited(arguments);

			var param = res.parameterName;
			this._showVerticalAxis(param);
		},

		_showVerticalAxis: function(param) {

			var axisInstance = this._verticalAxes[param];
			this._showAxis(axisInstance);
			delete this._hiddenAxes[param];

			this._relocateVerticalAxes();
		},

		_hideVerticalAxis: function(param) {

			var axisInstance = this._verticalAxes[param];
			this._hideAxis(axisInstance);
			this._hiddenAxes[param] = true;
			delete this._rightLimits[param];

			this._relocateVerticalAxes();
		},

		_relocateVerticalAxes: function() {

			var counter = 1;

			for (var i = 0; i < this._axesOrder.length; i++) {
				var param = this._axesOrder[i];

				if (!this._hiddenAxes[param]) {
					var container = this._verticalAxesContainers[param];

					this._publish(this._verticalAxes[param].getChannel("SET_PROPS"), {
						orient: counter > 1 ? "right" : "left"
					});

					this._relocateVerticalAxis(param, container, counter);
					counter++;
				}
			}
		},

		_getVerticalScale: function(param) {

			return this._verticalAxesScales[param];
		}

	});
});
