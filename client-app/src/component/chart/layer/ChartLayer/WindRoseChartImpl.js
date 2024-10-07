define([
	'd3'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "src/component/chart/layer/_PolarLayerCommons"
	, "./_CategoryLayerCommons"
	, "./_CircularLayerCommons"
	, "./_MultipleWindRose"
	, "./_SimplePieCommons"
	, "./_SimpleWindRose"
	, "./ChartLayer"
], function(
	d3
	, declare
	, lang
	, aspect
	, _PolarLayerCommons
	, _CategoryLayerCommons
	, _CircularLayerCommons
	, _MultipleWindRose
	, _SimplePieCommons
	, _SimpleWindRose
	, ChartLayer
){
	return declare([ChartLayer, _PolarLayerCommons, _CategoryLayerCommons, _CircularLayerCommons, _SimplePieCommons,
		_SimpleWindRose, _MultipleWindRose], {

		//	summary:
		//		Implementación de gráfica de rosa de los vientos.

		constructor: function(args) {

			this.config = {
				ownChannel: "windRoseChart",

				className: "windRoseChart",
				sectionClass: "windRoseSection",
				transitionDuration: 2000,
				transitionEase: d3.easeExpInOut,
				depth: 0,
				padAngleBasis: 1,
				domainMarginFactor: 0.05,

				_entriesCount: 1,
				_sectorValue: 1
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, '_addData', lang.hitch(this, this._updateDataMetrics));
		},

		_onUpdateDataFulfilled: function() {

			if (!this._getTotalCount()) {
				this._emitEvt("ZERO_VALUE_DATA_ADDED", this._getLayerInfo());
			}
		},

		_getLayerAdditionalInfo: function(options) {

			var retObj = {};

			lang.mixin(retObj, this.inherited(arguments), {
				dataSize: this._dataLength,
				rMin: 0,
				rMax: this._maxValueWithMargin
			});

			return retObj;
		},

		_valueAccessor: function(d) {

			return this._getWindRoseValue(d, this.depth);
		},

		_getWindRoseValue: function(d, depth) {

			var prefix = 'data',
				dataObj = d[prefix] ? d[prefix] : d,
				valueObj;

			if (dataObj instanceof Array) {
				valueObj = dataObj[depth || 0];
			} else {
				valueObj = dataObj;
			}

			return valueObj[this.valueName];
		},

		_updateChartSource: function() {

			if (!this._chartSource) {
				this._chartSource = d3.arc()
					.startAngle(lang.hitch(this, this._getStartAngle))
					.endAngle(lang.hitch(this, this._getEndAngle))
					.innerRadius(lang.hitch(this, this._calculateInnerRadius))
					.outerRadius(lang.hitch(this, this._calculateOuterRadius));
			}
		},

		_getStartAngle: function(d, i) {

			return d.startAngle - this._rotationValue + this._padAngle;
		},

		_getEndAngle: function(d, i) {

			return d.endAngle - this._rotationValue - this._padAngle;
		},

		_calculateInnerRadius: function(d) {

			if (!this.depth) {
				d.innerRadius = 0;
				return 0;
			}

			var prevLevelSumValue = 0;
			for (var i = 0; i < this.depth; i++) {
				var prevLevelValue = this._getWindRoseValue(d, i);
				prevLevelSumValue += prevLevelValue;
			}

			var innerRadius = (prevLevelSumValue / this._maxValueWithMargin) * this._getMaxRadius();

			d.innerRadius = innerRadius;

			return innerRadius;
		},

		_calculateOuterRadius: function(d) {

			var value = this._getWindRoseValue(d, this.depth),
				innerRadius = d.innerRadius || this._calculateInnerRadius(d),
				sectionRadius = !value ? 0 : (value / this._maxValueWithMargin) * this._getMaxRadius(),
				outerRadius = innerRadius + sectionRadius;

			d.outerRadius = outerRadius;

			return outerRadius;
		},

		_updateChartSourceHelper: function() {

			if (!this._chartSourceHelper) {
				this._chartSourceHelper = d3.pie()
					.sort(null)
					.value(lang.hitch(this, this._getWindRoseSectorValue));
			}
		},

		_getWindRoseSectorValue: function(d, i) {

			return this._sectorValue;
		},

		_updateColor: function() {

			if (this._categories) {
				this._categories.attr("fill", this.color);
			}
		},

		_applyChartSourceAndSourceHelper: function(dfd) {

			this._categoryGroup = this._chart.selectAll("g." + this.sectionClass)
				.data(this._chartSourceHelper(this._data));

			this._createChartSections();
			this._updateColor();

			return this._prepareApplyChartSource(dfd, true);
		},

		_generateCategoryName: function(data, i) {

			if (!this._labels) {
				return;
			}

			return this._labels[i].toString();
		},

		_updateDataMetrics: function(data) {

			this._dataLength = data.length;
			this._rotationValue = this._getRotationValue();
			this._padAngle = this._getPadAngle();
			this._labels = this._getLabelsText(this._dataLength);

			this._totalCount = 0;
			this._minValue = Number.POSITIVE_INFINITY;
			this._maxValue = Number.NEGATIVE_INFINITY;

			if (this._dataLength) {
				this._domainLevels = data[0] instanceof Array ? data[0].length : 0;
				data.forEach(lang.hitch(this, this._updateMetricsForEachData));
			}
		},

		_getRotationValue: function() {

			if (!this._dataLength) {
				return 0;
			}

			var totalValue = this._dataLength * this._sectorValue,
				sectorHalfAmplitude = Math.PI / totalValue;

			return sectorHalfAmplitude;
		},

		_getPadAngle: function() {

			return this.padAngleBasis / this._dataLength;
		},

		_updateMetricsForEachData: function(d) {

			var maxValue;
			if (this._domainLevels) {
				this._updateMetricsForEachMultipleData(d);
				maxValue = this._getMaxDirectionValue();
			} else {
				this._updateMetricsForEachSimpleData(d);
				maxValue = this._getMaxValue();
			}

			this._maxValueWithMargin = maxValue * (1 + this.domainMarginFactor);
		},

		_getAnimateChartSourceStartProps: function(d) {

			var startProps = {
				data: null
			};

			if (!this._domainLevels) {
				this._getSimpleWindRoseTransitionStartProps(startProps);
			} else {
				this._getMultipleWindRoseTransitionStartProps(startProps);
			}

			return startProps;
		},

		_animationShouldBeOmitted: function() {

			return false;
			/*if (this._dataLength >= 16) {
				return this._domainLevels > 3;
			} else if (this._dataLength >= 8) {
				return this._domainLevels > 7;
			} else {
				return false;
			}*/
		},

		_setLayerAdditionalInfo: function(req) {

			var data = req.data;

			this._emptyDataAdded = data ? !data.length : true;
		}
	});
});
