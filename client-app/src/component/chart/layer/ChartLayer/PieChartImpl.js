define([
	'd3/d3.min'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "./_PieCommons"
	, "./_SimplePieCommons"
], function(
	d3
	, declare
	, lang
	, _PieCommons
	, _SimplePieCommons
){
	return declare([_PieCommons, _SimplePieCommons], {
		//	summary:
		//		Implementación de gráfica de tarta/donut.

		constructor: function(args) {

			this.config = {
				ownChannel: "pieChart",

				className: "pieChart",
				sectionClass: "pieSection",
				innerRadius: 0
			};

			lang.mixin(this, this.config, args);

			this.hole = this.innerRadius > 0;
		},

		_setSize: function(req) {

			this._outerRadius = this._getMaxRadius();
		},

		_getChartHoleRadius: function() {

			return this.innerRadius;
		},

		_updateChartSource: function() {

			if (!this._chartSource) {
				this._chartSource = d3.arc()
					.innerRadius(this.innerRadius)
					.padAngle(this.padAngle);
			}

			this._chartSource
				.outerRadius(this._outerRadius);
		},

		_updateChartSourceHelper: function() {

			if (!this._chartSourceHelper) {
				this._chartSourceHelper = d3.pie()
					.sort(null)
					.value(lang.hitch(this, this._valueAccessor));
			}
		},

		_updateColor: function() {

			if (this._categories) {
				if (this.color instanceof Array) {
					this._categories.attr("fill", lang.hitch(this, function(d, i) {

						return this.color[i];
					}));
				} else {
					this._categories.attr('fill', this.color);
				}
			}
		},

		_applyChartSourceAndSourceHelper: function(dfd) {

			this._categoryGroup = this._chart.selectAll("g." + this.sectionClass)
				.data(this._chartSourceHelper(this._data));

			this._createChartSections();
			this._updateColor();
			this._updateDataMetrics();

			return this._prepareApplyChartSource(dfd, true);
		},

		_updateDataMetrics: function() {

			this._totalCount = 0;
			this._getData().forEach(lang.hitch(this, function(d) {

				this._totalCount += this._valueAccessor(d);
			}));
		},

		_getAnimateChartSourceStartProps: function(d) {

			return this._getStartingAngles(this.clockwiseTransition);
		},

		_getStartingAngles: function(condition) {

			var value = condition ? 0 : 2 * Math.PI;

			return {
				startAngle: value,
				endAngle: value
			};
		},

		_setLayerAdditionalInfo: function(req) {

			var data = req.data;

			this._colorsNeeded = data ? data.length : 0;
			this._entriesCount = this._colorsNeeded;

			this._emptyDataAdded = data ? !data.length : true;
		}
	});
});
