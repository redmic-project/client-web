define([
	'd3'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, 'moment'
	, "src/component/chart/ChartsContainer/_DomainHistoryNavigation"
	, "src/component/chart/layer/Axis/TemporalAxisImpl"
	, "./_AxesDrawing"
], function(
	d3
	, declare
	, lang
	, moment
	, _DomainHistoryNavigation
	, TemporalAxisImpl
	, _AxesDrawing
) {
	return declare([_AxesDrawing, _DomainHistoryNavigation], {
		//	summary:
		//		Extensión para dibujar un eje temporal en la gráfica.

		constructor: function(args) {

			this.config = {
				omitMargin: false,
				rotateLabels: false,

				_temporalAxis: null,
				_temporalAxisDomain: {},
				_temporalAxisRange: {},
				_temporalAxisScale: null,
				_temporalAxisContainer: null,
				_temporalAxisDomainLimits: {
					min: Number.POSITIVE_INFINITY,
					max: Number.NEGATIVE_INFINITY
				}
			};

			lang.mixin(this, this.config, args);
		},

		_drawAxes: function(res) {

			this.inherited(arguments);

			var xMin = res.xMin,
				xMax = res.xMax;

			if (!xMin || !xMax) {
				console.error("Invalid limits for temporal axis (%s, %s)", xMin, xMax);
				return;
			}

			this._updateHorizontalLimitsOnLayerShown(xMin, xMax);

			if (!this._temporalAxis) {
				this._drawTemporalAxis(xMin, xMax);
			} else {
				this._updateTemporalAxis(xMin, xMax);
			}
		},

		_updateHorizontalLimitsOnLayerShown: function(min, max) {

			if (!min || !max) {

				return;
			}

			this._updateHorizontalDomainLimits(min, max);

			this._emitEvt("DOMAIN_CHANGED", this._getTemporalDomainLimits());
		},

		_getTemporalDomainLimits: function() {

			var min = this._temporalAxisDomainLimits.min,
				max = this._temporalAxisDomainLimits.max;

			return {
				min: moment(min).format(),
				max: moment(max).format()
			};
		},

		_updateHorizontalDomainLimits: function(min, max) {

			var oldMin = moment(this._temporalAxisDomainLimits.min),
				oldMax = moment(this._temporalAxisDomainLimits.max);

			if (!oldMin.isValid() || moment(min).isBefore(oldMin)) {
				this._temporalAxisDomainLimits.min = min;
			}
			if (!oldMax.isValid() || moment(max).isAfter(oldMax)) {
				this._temporalAxisDomainLimits.max = max;
			}
		},

		_updateHorizontalLimitsOnLayerHiddenOrUpdated: function(res) {

			var layerId = res.chart,
				layerLimits = this._layersLimits[layerId];

			if (!layerLimits) {
				return;
			}

			var removedMin = layerLimits.xMin,
				removedMax = layerLimits.xMax,
				hasToUpdateMin = removedMin === this._temporalAxisDomainLimits.min,
				hasToUpdateMax = removedMax === this._temporalAxisDomainLimits.max;

			if (hasToUpdateMax || hasToUpdateMin) {
				this._findNewHorizontalLimitsInRemainingLayers(layerId);
				this._emitEvt("DOMAIN_CHANGED", this._getTemporalDomainLimits());
			}
		},

		_findNewHorizontalLimitsInRemainingLayers: function(removedLayerId) {

			this._temporalAxisDomainLimits.min = Number.POSITIVE_INFINITY;
			this._temporalAxisDomainLimits.max = Number.NEGATIVE_INFINITY;

			for (var key in this._layersLimits) {
				var otherLayerLimits = this._layersLimits[key],
					min = otherLayerLimits.xMin,
					max = otherLayerLimits.xMax;

				if (key !== removedLayerId && !this._hiddenLayers[key]) {
					this._updateHorizontalDomainLimits(min, max);
				}
			}
		},

		_clearAxes: function() {

			this.inherited(arguments);

			this._clearTemporalAxis();
		},

		_clearTemporalAxis: function() {

			if (this._temporalAxis) {
				this._clearAxis(this._temporalAxis);
				this._unsubscribeFromAxis(this._temporalAxis);
				this._temporalAxis = null;
			}
		},

		_drawTemporalAxis: function(min, max) {

			this._temporalAxisDomain = {
				min: min,
				max: max
			};

			this._temporalAxis = new TemporalAxisImpl({
				parentChannel: this.getChannel(),
				omitMargin: this.omitMargin,
				rotateLabels: this.rotateLabels
			});

			this._subscribeToAxis(this._temporalAxis);
			this._updateAxisSize(this._temporalAxis);
			this._createTemporalAxisContainer();
			this._redrawTemporalAxis();
		},

		_updateTemporalAxis: function(min, max, force) {

			var modified = moment(min).isBefore(moment(this._temporalAxisDomain.min)) ||
				moment(max).isAfter(moment(this._temporalAxisDomain.max));

			if (!modified && !force) {
				return;
			}

			var temporalDomainStillValid = moment(min).isSame(this._temporalAxisDomain.min) &&
				moment(max).isSame(this._temporalAxisDomain.max);

			this._temporalAxisDomain.min = min;
			this._temporalAxisDomain.max = max;

			var newMin = d3.isoParse(min),
				newMax = d3.isoParse(max);

			this._temporalAxisScale && this._temporalAxisScale.domain([newMin, newMax]);
			this._setAxisScale(this._temporalAxis, this._temporalAxisScale);
			this._redrawTemporalAxis();

			if (!temporalDomainStillValid) {
				this._emitEvt("FOCUS_CHANGED", {
					min: newMin,
					max: newMax
				});
			}
		},

		_createTemporalAxisContainer: function() {

			var container = this.axesArea.append("svg:g")
				.attr("id", "temporalAxis");

			this._temporalAxisContainer = container;
		},

		_redrawTemporalAxis: function() {

			this._setTemporalAxisLimits();
			this._translateTemporalAxisContainer();
			this._drawAxis(this._temporalAxis, this._temporalAxisContainer);
		},

		_setTemporalAxisLimits: function() {

			var minD = this._temporalAxisDomain.min,
				maxD = this._temporalAxisDomain.max,
				minR = this._temporalAxisRange.min,
				maxR = this._temporalAxisRange.max;

			this._temporalAxisScale = this._getTemporalScale(minD, maxD, minR, maxR);
			this._setAxisScale(this._temporalAxis, this._temporalAxisScale);
		},

		_getTemporalScale: function(minD, maxD, minR, maxR) {

			var domain = [d3.isoParse(minD), d3.isoParse(maxD)],
				range = [minR || 0, maxR || this._innerWidth],
				scale = d3.scaleTime()
					.range(range)
					.domain(domain);

			return scale;
		},

		_translateTemporalAxisContainer: function() {

			var translate = this._innerHeight;

			this._temporalAxisContainer
				.attr("transform", "translate(0," + translate + ")");
		},

		_adjustHorizontalAxisToVerticalAxes: function() {

			var min = this._leftLimit || 0,
				max = this._rightLimit || this._innerWidth;

			this._temporalAxisRange.min = min;
			this._temporalAxisRange.max = max;

			this._redrawTemporalAxis();

			this._resizeVisibleDrawing();
		},

		_resizeAxes: function() {

			this.inherited(arguments);

			this._resizeTemporalAxis();
		},

		_resizeTemporalAxis: function() {

			if (this._temporalAxis) {
				this._updateAxisSize(this._temporalAxis);
				this._redrawTemporalAxis();
			}
		},

		_showOrHideTemporalAxis: function() {

			var layerCount = Object.keys(this._layers).length,
				hiddenLayerCount = Object.keys(this._hiddenLayers).length;

			if (!layerCount || layerCount === hiddenLayerCount) {
				this._hideTemporalAxis();
			} else {
				this._showTemporalAxis();
			}
		},

		_showTemporalAxis: function() {

			this._showAxis(this._temporalAxis);
		},

		_hideTemporalAxis: function() {

			this._hideAxis(this._temporalAxis);
		},

		_hideAxisBecauseItIsNotUsed: function(param) {

			this.inherited(arguments);

			this._showOrHideTemporalAxis();
		},

		_adjustAxesAfterLayerCleared: function(res) {

			this.inherited(arguments);

			this._showOrHideTemporalAxis();
		},

		_setNewAxesLimits: function(limits, param) {

			this.inherited(arguments);

			var xMin = limits.xMin,
				xMax = limits.xMax;

			if (xMin && xMax) {
				this._setHorizontalAxisLimits(xMin, xMax);
			}
		},

		_setHorizontalAxisLimits: function(min, max) {

			if (this._temporalAxis) {
				this._updateTemporalAxis(min, max, true);
				this._drawAxis(this._temporalAxis);
			} else {
				this._drawTemporalAxis(min, max);
			}
		},

		_showAxisIfNotShown: function(res) {

			this.inherited(arguments);

			this._showTemporalAxis();
		},

		_getHorizontalScale: function() {

			return this._temporalAxisScale;
		}

	});
});
