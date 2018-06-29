define([
	'd3/d3.min'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/Deferred"
	, "./ChartLayer"
], function(
	d3
	, declare
	, lang
	, Deferred
	, ChartLayer
){
	return declare(ChartLayer, {
		//	summary:
		//		Implementación de gráfica lineal.

		constructor: function(args) {

			this.config = {
				ownChannel: "linearChart",
				className: "linearChart",
				pointRadius: 5,
				xName: "x",
				yName: "y",
				markerSize: 4,
				markerClass: "chartMarker",
				transitionDuration: 500,
				transitionEase: d3.easeCubic,
				tooBigDataThreshold: 5000,
				_canShowMarkers: true,
				_defsElementPrefix: "chartMarker",
				_colorsNeeded: 1
			};

			lang.mixin(this, this.config, args);

			this._currentTransitionDuration = this.transitionDuration;
		},

		_isValidData: function(d) {

			var xValue = this._getComponentValue(d, this.xName),
				yValue = this._getComponentValue(d, this._getValuePath(this.yName));

			return xValue !== null && yValue !== null;
		},

		_xAccessor: function(d) {

			if (!this._horizontalScale) {
				return null;
			}

			var xValue = this._getComponentValue(d, this.xName),
				parsedXValue = d3.isoParse(xValue);

			return this._horizontalScale(parsedXValue);
		},

		_yAccessor: function(d) {

			if (!this._verticalScale) {
				return null;
			}

			return this._verticalScale(this._getComponentValue(d, this._getValuePath(this.yName)));
		},

		_getXTranslatedToScale: function(d) {

			return this._xAccessor(d);
		},

		_getYTranslatedToScale: function(d) {

			return this._yAccessor(d);
		},

		_updateChart: function() {

			if (!this._isDataAdded() || !this._container) {
				return;
			}

			this._updateChartSource();

			return this._updateChartWithMultipleData();
		},

		_updateChartWithMultipleData: function() {

			if (!this._chart) {
				this._createChart();
			}

			if (this._canShowMarkers) {
				this._showMarkers();
			} else {
				this._hideMarkers();
			}

			var dfd = this._updateChartData();

			delete this._data;

			return dfd;
		},

		_createChart: function() {

			this._createDefs();

			this._chart = this._container.append("svg:path")
				.attr("class", this.className)
				.style("stroke", this.color);
		},

		_createDefs: function() {

			var defs = this._container.append("svg:defs"),
				halfSize = this.markerSize / 2,
				markerLimit = this.markerSize * 4,
				markerDisplacement = halfSize * 2;

			this._marker = defs.append("svg:marker")
				.attr('id', this._getMarkerId('point'))
				.style('fill', this.color)
				.attr('class', this.markerClass)
				.attr('markerHeight', markerLimit)
				.attr('markerWidth', markerLimit)
				.attr('refX', markerDisplacement)
				.attr('refY', markerDisplacement);

			this._marker.append('svg:circle')
				.attr('cx', markerDisplacement)
				.attr('cy', markerDisplacement)
				.attr('r', halfSize);
		},

		_getMarkerId: function(name) {

			return this._defsElementPrefix + "_" + this.getOwnChannel() + "_" + name;
		},

		_showMarkers: function() {

			var markerUrl = 'url(#' + this._getMarkerId('point') + ')';

			this._chart && this._chart
				.attr('marker-start', markerUrl)
				.attr('marker-mid', markerUrl)
				.attr('marker-end', markerUrl);
		},

		_hideMarkers: function() {

			this._chart && this._chart
				.attr('marker-start', null)
				.attr('marker-mid', null)
				.attr('marker-end', null);
		},

		_updateColor: function() {

			this._chart && this._chart.style("stroke", this.color);
			this._marker && this._marker.style("fill", this.color);
		},

		_updateChartSource: function() {

			if (!this._chartSource) {
				this._chartSource = d3.line()
					.x(lang.hitch(this, this._xAccessor))
					.y(lang.hitch(this, this._yAccessor))
					.defined(lang.hitch(this, this._isValidData));
			}
		},

		_updateChartData: function() {

			if (this._data) {
				this._chart.datum(this._data);
			}

			var dfd = new Deferred();

			this._chart.transition()
				.duration(this._currentTransitionDuration)
				.ease(this.transitionEase)
				.attr("d", this._chartSource)
				.on("interrupt", dfd.resolve)
				.on("end", dfd.resolve);

			return dfd;
		},

		_clear: function() {

			this._chart && this._chart.remove();
			this._chart = null;
		},

		_applyAddedDataToChart: function(data) {

			if (data && data instanceof Array && data.length > this.tooBigDataThreshold) {
				this._setSettingsForTooBigData();
			} else {
				this._setSettingsForNotTooBigData();
			}
		},

		_setSettingsForTooBigData: function() {

			this._currentTransitionDuration = 0;
			this._canShowMarkers = false;
		},

		_setSettingsForNotTooBigData: function() {

			this._currentTransitionDuration = this.transitionDuration;
			this._canShowMarkers = true;
		},

		_isReadyToDraw: function() {

			return this._isDataAdded() && this._horizontalScale && this._verticalScale;
		},

		_getData: function() {

			var data;

			if (this._chart) {
				data = this._chart.datum();
			}

			return data;
		},

		_setLayerAdditionalInfo: function(req) {

			var xMin = req.xMin,
				xMax = req.xMax,
				yMin = this._getComponentValue(req, this._getValuePath("yMin")),
				yMax = this._getComponentValue(req, this._getValuePath("yMax")),
				data = req.data;

			this._xMin = xMin;
			this._xMax = xMax;
			this._yMin = yMin;
			this._yMax = yMax;

			this._emptyDataAdded = data ? !data.length : true;
		},

		_getLayerAdditionalInfo: function(options) {

			return {
				xMin: this._xMin,
				xMax: this._xMax,
				yMin: this._yMin,
				yMax: this._yMax,
				color: this.color
			};
		},

		_show: function(req) {

			var dfd = new Deferred();

			dfd.then(lang.hitch(this, function() {

				this._layerIsHidden = false;
			}));

			return this._changeElementOpacity(this._container, 1, dfd);
		},

		_hide: function(req) {

			var dfd = new Deferred();

			dfd.then(lang.hitch(this, function() {

				this._layerIsHidden = true;
			}));

			return this._changeElementOpacity(this._container, 0, dfd);
		}
	});
});
