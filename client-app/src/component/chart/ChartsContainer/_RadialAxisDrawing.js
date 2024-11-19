define([
	'd3'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/chart/layer/Axis/RadialAxisImpl"
	, "./_AxesDrawing"
], function(
	d3
	, declare
	, lang
	, RadialAxisImpl
	, _AxesDrawing
) {
	return declare(_AxesDrawing, {
		//	summary:
		//		Extensión para dibujar un eje radial en la gráfica.

		constructor: function(args) {

			this.config = {
				_radialAxis: null,
				_radialAxisDomain: null,
				_radialAxisScale: null,
				_radialAxisContainer: null
			};

			lang.mixin(this, this.config, args);
		},

		_drawAxes: function(res) {

			this.inherited(arguments);

			var min = res.rMin,
				max = res.rMax,
				param = res.parameterName;

			if ((isNaN(min) || !isFinite(min)) || (isNaN(max) || !isFinite(max))) {
				console.error("Invalid limits for '%s' radial axis (%s, %s)", param, min, max);
				return;
			}

			if (!this._radialAxis) {
				this._drawRadialAxis(min, max, param);
			} else {
				this._updateRadialAxis(min, max, param);
			}
		},

		_clearAxes: function() {

			this.inherited(arguments);

			this._clearRadialAxis();
		},

		_clearRadialAxis: function(param) {

			if (this._radialAxis) {
				this._clearAxis(this._radialAxis);
				this._unsubscribeFromAxis(this._radialAxis);
				this._radialAxis = null;
				this._radialAxisDomain = null;
			}
		},

		_drawRadialAxis: function(min, max, param) {

			this._radialAxisDomain = {
				min: min,
				max: max
			};

			var radialAxis = new RadialAxisImpl({
				parentChannel: this.getChannel(),
				parameterName: param
			});

			this._radialAxis = radialAxis;

			this._subscribeToAxis(radialAxis);
			this._updateAxisSize(radialAxis);
			this._createRadialAxisContainer();
			this._redrawRadialAxis();
		},

		_updateRadialAxis: function(min, max, force) {

			var modified;

			if (min < this._radialAxisDomain.min || max > this._radialAxisDomain.max) {
				modified = true;
			}

			if (force || modified) {
				var newMin = this._radialAxisDomain.min,
					newMax = this._radialAxisDomain.max;

				this._radialAxisScale.domain([newMin, newMax]);
				this._setAxisScale(this._radialAxis, this._radialAxisScale);
			}
		},

		_createRadialAxisContainer: function() {

			this._radialAxisContainer = this.overlayAxesArea.append("svg:g")
				.attr("id", "radialAxis");
		},

		_redrawRadialAxis: function() {

			this._updateRadialAxisLimits();
			this._translateRadialAxisContainer();
			this._drawAxis(this._radialAxis, this._radialAxisContainer);
		},

		_updateRadialAxisLimits: function() {

			var domain = this._radialAxisDomain,
				minD = domain.min,
				maxD = domain.max;

			this._radialAxisScale = this._createRadialScale(minD, maxD);
			this._setAxisScale(this._radialAxis, this._radialAxisScale);
		},

		_createRadialScale: function(minD, maxD) {

			var domain = [minD, maxD],
				maxR = -(Math.min(this._innerWidth, this._innerHeight) - this.marginForLabels) / 2,
				range = [0, maxR],
				scale = d3.scaleLinear()
					.range(range)
					.domain(domain);

			return scale;
		},

		_translateRadialAxisContainer: function() {

			this._radialAxisContainer.attr("transform", this._getRadialAxisContainerTranslate());
		},

		_getRadialAxisContainerTranslate: function() {

			return "translate(" + this._innerWidth / 2 + "," + this._innerHeight / 2 + ")";
		},

		_resizeAxes: function() {

			this.inherited(arguments);

			this._resizeRadialAxis();
		},

		_resizeRadialAxis: function() {

			if (this._radialAxis) {
				this._updateAxisSize(this._radialAxis);
				this._redrawRadialAxis();
			}
		},

		// TODO si hace falta, adaptar a polares
		/*_setNewAxesLimits: function(limits, param) {

			this.inherited(arguments);

			var min = limits.min,
				max = limits.max;

			if (!isNaN(min) && !isNaN(max)) {
				this._radialAxis && this._setRadialAxisLimits(min, max);
			}
		},*/

		_setRadialAxisLimits: function(min, max) {

			if (this._radialAxis) {
				this._updateRadialAxis(min, max, true);
				this._drawAxis(this._radialAxis);
			}
		},

		_showAxisIfNotShown: function(res) {

			this.inherited(arguments);

			this._showRadialAxis();
		},

		_showRadialAxis: function() {

			this._showAxis(this._radialAxis);
		},

		_hideRadialAxis: function() {

			this._hideAxis(this._radialAxis);
		},

		_getRadialScale: function() {

			return this._radialAxisScale;
		},

		_hideAxisIfNotUsed: function(res) {

			this.inherited(arguments);

			var layerId = res.chart,
				param = res.parameterName,
				anyRemainingShownChart = this._getAnyRemainingShownChart();

			if (!anyRemainingShownChart) {
				this._hideAxisBecauseItIsNotUsed(param);
			}

			// TODO si hace falta, adaptar a polares
			//var newLimits = this._findNewAxesLimits(layerId, param);
			//this._setNewAxesLimits(newLimits, param);
		},

		_hideAxisBecauseItIsNotUsed: function(param) {

			this.inherited(arguments);

			this._hideRadialAxis();
		},

		_adjustAxesAfterLayerCleared: function(res) {

			this.inherited(arguments);

			this._showOrHideRadialAxis();
		},

		_showOrHideRadialAxis: function() {

			var anyRemainingShownChart = this._getAnyRemainingShownChart();

			if (!anyRemainingShownChart) {
				this._hideRadialAxis();
			} else {
				this._showRadialAxis();
			}
		}

	});
});
