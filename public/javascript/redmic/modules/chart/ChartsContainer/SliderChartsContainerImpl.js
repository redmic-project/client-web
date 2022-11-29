define([
	'd3/d3.min'
	, 'd3Tip/d3-v6-tip.min'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/_base/kernel'
	, 'dojo/aspect'
	, 'dojo/Deferred'
	, 'moment/moment.min'
	, 'redmic/modules/chart/ChartsContainer/_TemporalAxisDrawing'
	, './ChartsContainer'
], function(
	d3
	, d3Tip
	, declare
	, lang
	, kernel
	, aspect
	, Deferred
	, moment
	, _TemporalAxisDrawing
	, ChartsContainer
) {

	return declare([ChartsContainer, _TemporalAxisDrawing], {
		//	summary:
		//		Implementación de contenedor de capas con slider horizontal.

		constructor: function(args) {

			this.config = {
				ownChannel: 'sliderChartsContainer',

				sliderBrushClass: 'sliderBrush',
				sliderBrushHandleClass: 'handle',
				sliderBrushBackgroundClass: 'overlay',
				tooltipClass: 'chartsTooltip',
				tooltipAnimationInClass: 'animateIn',
				tooltipAnimationOutClass: 'animateOut',
				hiddenClass: 'hidden',

				brushingTimeout: 100,
				omitMargin: true,
				sliderTooltipOffset: 10,

				_sliderHeight: 10,
				_sliderHandleSize: 10
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, '_setOwnCallbacksForEvents', lang.hitch(this, this._setSliderOwnCallbacksForEvents));
			aspect.after(this, '_defineSubscriptions', lang.hitch(this, this._defineSliderSubscriptions));
			aspect.after(this, '_createElements', lang.hitch(this, this._createSliderElements));
			aspect.after(this, '_resize', lang.hitch(this, this._resizeSlider));
		},

		_setSliderOwnCallbacksForEvents: function() {

			this._onEvt('CHARTS_CONTAINER_READY', lang.hitch(this, this._onSliderReady));
		},

		_defineSliderSubscriptions: function() {

			if (!this.getChartsContainerChannel) {
				console.error('ChartsContainer channel not defined for slider "%s"', this.getChannel());
			}

			this.subscriptionsConfig.push({
				channel: this.getChartsContainerChannel('DOMAIN_CHANGED'),
				callback: '_subDomainChanged'
			},{
				channel: this.getChartsContainerChannel('FOCUS_CHANGED'),
				callback: '_subFocusChanged',
				options: {
					predicate: lang.hitch(this, this._chkSliderExists)
				}
			});
		},

		_createSliderElements: function() {

			var sliderAreaTransform = 'translate(' + this._horizontalTranslate + ',' + this._verticalTranslate + ')';
			this.sliderArea = this.toolsArea.append('svg:g')
				.attr('id', 'sliderArea')
				.attr('transform', sliderAreaTransform);

			this.sliderBrush = d3.brushX()
				.handleSize(this._sliderHandleSize)
				.on('start.brushSlider', lang.hitch(this, this._onSliderBrushStart))
				.on('brush.brushSlider', lang.hitch(this, this._onSliderBrush))
				.on('end.brushSlider', lang.hitch(this, this._onSliderBrushEnd));

			this.sliderBrushGroup = this.sliderArea.append('svg:g')
				.attr('class', this.sliderBrushClass);

			this._setSliderBrushExtent(0, this._innerWidth);
			this._setSliderBrushPosition(0, this._innerWidth);

			this.sliderBrushGroup.selectAll('.' + this.sliderBrushHandleClass)
				.attr('style', 'y:0')
				.attr('rx', 15)
				.attr('ry', 15)
				.on('mouseenter', lang.hitch(this, this._onHandleMouseEnter))
				.on('mouseleave', lang.hitch(this, this._onHandleMouseLeave));

			this.sliderBrushGroup.select('.' + this.sliderBrushBackgroundClass)
				.attr('rx', 5)
				.attr('ry', 5);

			this.sliderTooltip = d3Tip.tip()
				.attr('class', this.tooltipClass)
				.offset([-this.sliderTooltipOffset, 0]);

			this.svg.call(this.sliderTooltip);
		},

		_resizeSlider: function() {

			if (!this.sliderBrush) {
				return;
			}

			this._setSliderBrushExtent(0, this._innerWidth);

			if (!this._temporalAxisScale || !this._oldTemporalFocus) {
				return;
			}

			var minAfterResize = this._temporalAxisScale(this._oldTemporalFocus[0]),
				maxAfterResize = this._temporalAxisScale(this._oldTemporalFocus[1]);

			this._setSliderBrushPosition(minAfterResize, maxAfterResize);
		},

		_setSliderBrushExtent: function(min, max) {

			var filteredLimits = this._getFilteredLimits(min, max),
				topLeftPoint = [filteredLimits[0], 0],
				bottomRightPoint = [filteredLimits[1], this._sliderHeight],
				extent = [topLeftPoint, bottomRightPoint];

			this.sliderBrush.extent(extent);
			this.sliderBrushGroup.call(this.sliderBrush);
		},

		_setSliderBrushPosition: function(min, max) {

			if (!this._limitsNeedToBeFiltered(min, max)) {
				this.sliderBrush.move(this.sliderBrushGroup, [min, max]);
				this._showSlider();
			} else {
				this._hideSlider();
			}
		},

		_getFilteredLimits: function(min, max) {

			if (this._limitsNeedToBeFiltered(min, max)) {
				return [0, 0];
			}

			return [min, max];
		},

		_limitsNeedToBeFiltered: function(min, max) {

			return isNaN(min) || isNaN(max) || min < 0 || max < 0 || max <= min;
		},

		_onSliderBrushStart: function(event) {

			var originalEvt = event.sourceEvent,
				evtNode = originalEvt ? originalEvt.currentTarget || originalEvt.target : null,
				sliderGroup = this.sliderBrushGroup.node();

			this._brushEventFromDescendant = sliderGroup && sliderGroup.contains(evtNode);
		},

		_onSliderBrush: function(event) {

			var focus = event.selection;

			if (!focus || !this._brushEventFromDescendant) {
				return;
			}

			clearTimeout(this._brushingTimeoutHandler);
			this._brushingTimeoutHandler = setTimeout(lang.hitch(this, this._updateDomain, focus),
				this.brushingTimeout);
		},

		_updateDomain: function(positionalRange) {

			if (!this._temporalAxisScale) {
				return;
			}

			var minDate = this._temporalAxisScale.invert(positionalRange[0]),
				maxDate = this._temporalAxisScale.invert(positionalRange[1]),
				temporalRange = [minDate, maxDate];

			this._rememberInfoOnValidBrush(positionalRange, temporalRange);

			this._emitEvt('DOMAIN_CHANGED', {
				min: moment(minDate).format(),
				max: moment(maxDate).format()
			});
		},

		_rememberInfoOnValidBrush: function(positionalRange, temporalRange) {

			this._oldFocus = positionalRange;
			this._oldTemporalFocus = temporalRange;
		},

		_onSliderBrushEnd: function(event) {

			var focus = event.selection;
			if (focus || !this._oldFocus) {
				return;
			}

			var mousePos = d3.pointer(event),
				mouseX = mousePos[0],
				focusAmplitude = this._oldFocus[1] - this._oldFocus[0];

			this._refocusOnPosition(mouseX, focusAmplitude / 2);
		},

		_refocusOnPosition: function(center, halfAmplitude) {

			var focusMin = center - halfAmplitude,
				focusMax = center + halfAmplitude,
				focusRange = this._getValidFocusRange(focusMin, focusMax);

			this._updateDomain(focusRange);
		},

		_getValidFocusRange: function(focusMin, focusMax) {

			var validMin = focusMin,
				validMax = focusMax;

			if (validMin < 0) {
				validMax -= validMin;
				validMin = 0;
			}

			if (validMax > this._innerWidth) {
				validMin -= validMax - this._innerWidth;
				validMax = this._innerWidth;

				if (validMin < 0) {
					validMin = 0;
				}
			}

			return [validMin, validMax];
		},

		_subDomainChanged: function(res) {

			var min = res.min,
				max = res.max;

			if (this.svg) {
				this._onDomainChanged(min, max);
			} else {
				if (this._setDomainDfd && !this._setDomainDfd.isFulfilled()) {
					this._setDomainDfd.cancel();
				}

				this._setDomainDfd = new Deferred();
				this._setDomainDfd.then(lang.hitch(this, this._onDomainChanged, min, max));
			}
		},

		_onSliderReady: function() {

			this._setDomainDfd && this._setDomainDfd.resolve();
		},

		_onDomainChanged: function(min, max) {

			this._setHorizontalAxisLimits(min, max);
			this.sliderBrush && this._tryToSetFocus(min, max);
		},

		_chkSliderExists: function() {

			return !!this.sliderBrush;
		},

		_subFocusChanged: function(res) {

			var min = res.min,
				max = res.max;

			this._tryToSetFocus(min, max);
		},

		_tryToSetFocus: function(min, max) {

			var firstMoment = moment(min),
				secondMoment = moment(max);

			if (!firstMoment.isValid() || !secondMoment.isValid()) {
				this._hideTemporalAxis();
				this._hideSlider();
			} else {
				this._showTemporalAxis();
				this._showSlider();

				if (this._temporalAxisScale) {
					this._setFocus(firstMoment, secondMoment);
				}
			}
		},

		_setFocus: function(firstMoment, secondMoment) {

			var minDate, maxDate;
			if (firstMoment.isBefore(secondMoment)) {
				minDate = firstMoment;
				maxDate = secondMoment;
			} else {
				minDate = secondMoment;
				maxDate = firstMoment;
			}

			var temporalRange = [minDate, maxDate],
				minPos = this._temporalAxisScale(minDate),
				maxPos = this._temporalAxisScale(maxDate),
				positionalRange = [minPos, maxPos];

			this._updateFocus(positionalRange);
			this._rememberInfoOnValidBrush(positionalRange, temporalRange);
		},

		_updateFocus: function(positionalRange) {

			this._setSliderBrushPosition(positionalRange[0], positionalRange[1]);
		},

		_showSlider: function() {

			this.sliderBrushGroup.classed(this.hiddenClass, false);
		},

		_hideSlider: function() {

			this.sliderBrushGroup.classed(this.hiddenClass, true);
		},

		_onHandleMouseEnter: function(evt) {

			var handleSelector = evt.type,
				handleNode = evt.currentTarget,
				tooltipContent = this._getTooltipContent(handleSelector);

			this._updateTooltip(tooltipContent, handleNode);
		},

		_onHandleMouseLeave: function() {

			var classes = this.tooltipClass + ' ' + this.tooltipAnimationOutClass;
			this.sliderTooltip.attr('class', classes);
			this.sliderTooltip.hide();
		},

		_getTooltipContent: function(handleSelector) {

			if (!this._oldTemporalFocus) {
				return '';
			}

			var format = kernel.locale === 'en' ? 'MM/DD/YYYY HH:mm:ss' : 'DD/MM/YYYY HH:mm:ss',
				handleIndex = handleSelector === 'w' ? 0 : 1,
				content = this._oldTemporalFocus[handleIndex];

			return moment(content).format(format);
		},

		_updateTooltip: function(content, node) {

			this.sliderTooltip.html(content);

			var classes = this.tooltipClass + ' ' + this.tooltipAnimationInClass;
			this.sliderTooltip.attr('class', classes);
			this.sliderTooltip.show(null, node);
		}
	});
});
