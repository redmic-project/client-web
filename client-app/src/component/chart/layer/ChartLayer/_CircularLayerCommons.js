define([
	'd3'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/Deferred"
	, "dojo/promise/all"
	, "./_CircularLayerCommonsItfc"
], function(
	d3
	, declare
	, lang
	, Deferred
	, all
	, _CircularLayerCommonsItfc
){
	return declare(_CircularLayerCommonsItfc, {
		//	summary:
		//		Base común para las gráficas con distribución circular.

		constructor: function(args) {

			this.config = {
				margin: 3
			};

			lang.mixin(this, this.config, args);
		},

		_getMaxRadius: function() {

			return (Math.min(this._width, this._height) - this.margin) / 2;
		},

		_createChart: function() {

			this._chart = this._container.append("svg:g")
				.attr("class", this.className)
				.attr("transform", this._getTranslate());
		},

		_getTranslate: function() {

			return "translate(" + this._width / 2 + "," + this._height / 2 + ")";
		},

		_updateChart: function() {

			if (!this._isDataAdded()) {
				return;
			}

			this._updateChartSource();
			this._updateChartSourceHelper();

			return this._updateChartWithData();
		},

		_updateChartWithData: function() {

			if (!this._chart) {
				this._createChart();
			}

			var dfd = this._updateChartData();

			delete this._data;

			return dfd;
		},

		_updateChartData: function() {

			var dfd = new Deferred();

			if (!this._data) {
				return this._updateChartSize(dfd);
			}

			var dfdCbk = lang.hitch(this, this._onUpdateDataFulfilled),
				clearTimeoutCbk = lang.hitch(this, this._clearAutoRejectTimeout);

			dfd.then(dfdCbk, dfdCbk);
			dfd.then(clearTimeoutCbk, clearTimeoutCbk);

			this._rejectUpdateDfdTimeoutHandler = setTimeout(dfd.reject, this.transitionDuration * 1.1);

			return this._applyChartSourceAndSourceHelper(dfd);
		},

		_clearAutoRejectTimeout: function() {

			clearTimeout(this._rejectUpdateDfdTimeoutHandler);
		},

		_updateChartSize: function(dfd) {

			this._chart.attr("transform", this._getTranslate());

			return this._prepareApplyChartSource(dfd);
		},

		_prepareApplyChartSource: function(dfd, isFirstTime) {

			var applyFunction = lang.hitch(this, function(dfd, isFirstTime) {

				this._lastApplyDfd = dfd;
				this._applyChartSource(dfd, isFirstTime);
			}, dfd, isFirstTime);

			if (!this._lastApplyDfd || this._lastApplyDfd.isFulfilled()) {
				applyFunction();
			} else if (!this._lastApplyDfd.isFulfilled()) {
				this._lastApplyDfd.then(applyFunction);
			}

			return dfd;
		},

		_applyChartSource: function(dfd, isFirstTime) {

			if (this._animationShouldBeOmitted()) {
				this._categoriesPaths.attr('d', this._chartSource);
				dfd.resolve();
				return dfd;
			}

			if (!this._transitionDfd || this._transitionDfd.isFulfilled()) {
				this._transitionDfd = new Deferred();
			}

			this._transitionDfd.then(dfd.resolve, dfd.reject);

			if (isFirstTime) {
				this._animateChartSourceFromStartToEnd(this._transitionDfd);
			} else {
				this._animateChartSourceFromCurrentToEnd(this._transitionDfd);
			}

			return dfd;
		},

		_animateChartSourceFromStartToEnd: function(dfd) {

			this._animateChartSource(dfd, 'attrTween', lang.hitch(this, this._getChartSourceAttrTween));
		},

		_animateChartSourceFromCurrentToEnd: function(dfd) {

			this._animateChartSource(dfd, 'attr', this._chartSource);
		},

		_animateChartSource: function(dfd, methodName, dValue) {

			var size = this._categoriesPaths.size(),
				dfds = [];

			for (var i = 0; i < size; i++) {
				dfds.push(new Deferred());
			}

			all(dfds).then(dfd.resolve, dfd.reject);

			this._categoriesPaths.transition()
				.duration(this.transitionDuration)
				.ease(this.transitionEase)
				[methodName]("d", dValue)
				.on("interrupt", lang.hitch(this, this._onAnimateChartSourceInterrupt, dfds))
				.on("end", lang.hitch(this, this._onAnimateChartSourceEnd, dfds));
		},

		_getChartSourceAttrTween: function(d, i) {

			var startProps = this._getAnimateChartSourceStartProps(d),
				endProps = d,
				interpolate = d3.interpolate(startProps, endProps);

			return lang.hitch(this, function(interpolate, t) {

				return this._chartSource(interpolate(t));
			}, interpolate);
		},

		_onAnimateChartSourceInterrupt: function(dfds, d, i) {

			var dfd = dfds[i];
			dfd.reject();
		},

		_onAnimateChartSourceEnd: function(dfds, d, i) {

			var dfd = dfds[i];
			dfd.resolve();
		}
	});
});
