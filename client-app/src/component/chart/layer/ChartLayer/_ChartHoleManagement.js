define([
	'd3'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
], function(
	d3
	, declare
	, lang
	, aspect
){
	return declare(null, {
		//	summary:
		//		Extensión para gestionar el hueco central de una gráfica donut.
		//		Es una base común para otras extensiones que usen el hueco, por lo que no debe ser usada directamente.

		constructor: function(args) {

			this.config = {
				chartHoleClass: "chartHole",
				backgroundHighOpacity: 0.5,
				backgroundLowOpacity: 0.4,
				chartHoleTransitionDuration: 300,
				chartHoleTransitionEase: d3.easeSin
			};

			lang.mixin(this, this.config, args);
		},

		postscript: function() {

			// TODO revisar issue #59
			this.inherited(arguments);

			if (!this.hole) {
				return;
			}

			aspect.after(this, "_createChart", lang.hitch(this, this._createChartHole));
			aspect.after(this, "_setSize", lang.hitch(this, this._setChartHoleSize));
			aspect.before(this, "_clear", lang.hitch(this, this._fadeToClearChartHole));

			this._onEvt("ZERO_VALUE_DATA_ADDED", lang.hitch(this, this._onChartHoleZeroValueDataAdded));
		},

		_onChartHoleZeroValueDataAdded: function() {

			this._fadeToClearChartHole();
		},

		_createChartHole: function() {

			if (!this._chartHole) {
				this._chartHole = this._chart.append("svg:g")
					.attr("class", this.chartHoleClass);
			}

			if (!this._emptyDataAdded) {
				this._createChartHoleBackground();
			}
		},

		_createChartHoleBackground: function() {

			if (!this._chartHoleBackground) {

				this._chartHoleBackground = this._chartHole.append("svg:circle")
					.attr("opacity", this.backgroundLowOpacity)
					.on("mouseenter", lang.hitch(this, this._onChartHoleMouseEnter))
					.on("mouseleave", lang.hitch(this, this._onChartHoleMouseLeave))
					.on("mouseover", lang.hitch(this, this._onChartHoleMouseOver));

				this._resizeChartHoleBackground();
			}
		},

		_onChartHoleMouseEnter: function() {

			this._showChartHoleBackground(true);
		},

		_onChartHoleMouseLeave: function() {

			this._showChartHoleBackground(false);
		},

		_onChartHoleMouseOver: function() {

			this._showChartHoleBackground(true);
		},

		_setChartHoleSize: function() {

			if (this._chartHole) {
				this._resizeChartHoleComponents();
			}
		},

		_resizeChartHoleComponents: function() {

			this._resizeChartHoleBackground();
		},

		_resizeChartHoleBackground: function() {

			var radius = this._getChartHoleRadius() - (this.margin / 2);

			this._chartHoleBackground && this._chartHoleBackground.transition()
				.duration(this.transitionDuration)
				.ease(this.chartHoleTransitionEase)
				.attr("r", radius > 0 ? radius : 0);
		},

		_showChartHoleBackground: function(mustShow) {

			this._showChartHoleElement(this._chartHoleBackground, mustShow);
		},

		_addChartHoleChild: function(childClass) {

			if (!this._chartHole) {

				return;
			}

			return this._chartHole.append("svg:g")
				.attr("class", childClass)
				.attr("opacity", 0);
		},

		_showChartHoleChild: function(childClass, mustShow, transitionCbks) {

			var children = this._chartHole ?
				this._chartHole.selectAll("g." + this.chartHoleClass + " > g") :
				null;

			children && children.each(lang.partial(
				mustShow ? this._showChildAndHideOthers : this._hideOnlyThisChild,
				this, childClass, transitionCbks));
		},

		_showChildAndHideOthers: function(self, childClass, transitionCbks) {

			var element = d3.select(this),
				className = element.attr("class"),
				mustShow = childClass === className;

			self._showChartHoleElement(element, mustShow, transitionCbks);
		},

		_hideOnlyThisChild: function(self, childClass, transitionCbks) {

			var element = d3.select(this),
				className = element.attr("class"),
				childFound = childClass === className;

			childFound && self._showChartHoleElement(element, false, transitionCbks);
		},

		_showChartHoleElement: function(element, mustShow, transitionCbks) {

			if (!element) {

				return;
			}

			var transition = element.transition()
				.duration(this.chartHoleTransitionDuration)
				.ease(this.chartHoleTransitionEase)
				.attr("opacity", this._getChartHoleElementOpacity(element, mustShow));

			if (transitionCbks) {
				for (var evt in transitionCbks) {
					transition.on(evt, transitionCbks[evt]);
				}
			}
		},

		_getChartHoleElementOpacity: function(element, mustShow) {

			if (element === this._chartHoleBackground) {

				return mustShow ? this.backgroundHighOpacity : this.backgroundLowOpacity;
			}

			return mustShow ? 1 : 0;
		},

		_enableChartHole: function(mustEnable) {

			this._showChartHoleElement(this._chartHole, mustEnable);
		},

		_clearChartHole: function() {

			this._chartHole && this._chartHole.remove();
			this._chartHole = null;
		},

		_fadeToClearChartHole: function() {

			if (!this._chartHoleBackground) {
				this._clearChartHole();
				return;
			}

			this._chartHoleBackground.transition()
				.duration(this.transitionDuration)
				.ease(this.chartHoleTransitionEase)
				.attr("opacity", 0)
				.on("end", lang.hitch(this, this._clearChartHole));
		}
	});
});
