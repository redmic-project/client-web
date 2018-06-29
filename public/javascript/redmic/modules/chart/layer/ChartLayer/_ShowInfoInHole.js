define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/chart/layer/ChartLayer/_ChartHoleManagement"
	, "redmic/modules/chart/layer/ChartLayer/_ObtainableValue"
], function(
	declare
	, lang
	, aspect
	, _ChartHoleManagement
	, _ObtainableValue
){
	return declare([_ChartHoleManagement, _ObtainableValue], {
		//	summary:
		//		Extensión para mostrar, en el centro de una gráfica donut, el valor que toma
		//		en una zona concreta. Si el centro es demasiado pequeño, deja que se publique la
		//		información para que el contenedor la use como disponga.

		constructor: function(args) {

			this.config = {
				chartHoleInfoClass: "chartHoleInfo",

				_infoFitsInHole: true
			};

			lang.mixin(this, this.config, args);
		},

		postscript: function() {

			// TODO revisar issue #59
			this.inherited(arguments);

			if (!this.hole) {
				return;
			}

			aspect.after(this, "_createChart", lang.hitch(this, this._createChartHoleInfo));
			aspect.after(this, "_setSize", lang.hitch(this, this._setSizeShowInfoInHole));
			aspect.after(this, "_onChartHoleMouseEnter", lang.hitch(this, this._showInfoInHoleOnChartHoleMouseEnter));
			aspect.before(this, "_updateChart", lang.hitch(this, this._updateChartShowInfoInHole));
			aspect.before(this, "_onMouseLeaveCategory", lang.hitch(this, this._onMouseLeaveCategoryShowInfoInHole));
			aspect.before(this, "_clear", lang.hitch(this, this._clearShowInfoInHole));
		},

		_createChartHoleInfo: function() {

			if (!this._chartHoleInfo) {

				this._chartHoleInfo = this._addChartHoleChild(this.chartHoleInfoClass);
			}

			this._createChartHoleInfoComponents();
		},

		_createChartHoleInfoComponents: function() {

			this._createInfoTitle();
		},

		_createInfoTitle: function() {

			if (!this._infoTitle) {

				this._infoTitle = this._chartHoleInfo.append("svg:text")
					.attr("text-anchor", "middle")
					.attr("dy", ".35em");
			}
		},

		_updateChartHoleInfo: function(infoObj) {

			if (!infoObj || !this._infoTitle) {

				return;
			}

			var percentage = infoObj.percentage;

			if (percentage) {

				this._infoTitle.text(percentage + " %");
			} else {

				this._emptyChartHoleInfo();
			}
		},

		_emptyChartHoleInfo: function() {

			this._infoTitle && this._infoTitle.text("");
		},

		_setSizeShowInfoInHole: function(req) {

			this._evaluateChartHoleInfoVisibility();
		},

		_evaluateChartHoleInfoVisibility: function() {

			this._updateInfoFitsInHole();

			if (!this._chartHoleInfo) {
				return;
			}

			if (this._infoFitsInHole) {
				this._showChartHoleInfo(true);
			} else {
				this._showChartHoleInfo(false);
			}
		},

		_updateInfoFitsInHole: function() {

			if (!this._chartHoleInfo) {
				this._infoFitsInHole = false;
				return;
			}

			var infoBbox = this._chartHoleInfo.node().getBBox(),
				chartHoleDiameter = this._getChartHoleRadius() * 2,
				infoFitsInHole = !(infoBbox.width > chartHoleDiameter || infoBbox.height > chartHoleDiameter);

			this._infoFitsInHole = infoFitsInHole;
		},

		_showChartHoleInfo: function(mustShow, moreTransitionCbks) {

			var transitionCbks = {
				"start": lang.hitch(this, this._beforeInfoShownOrHidden, mustShow)
			};

			lang.mixin(transitionCbks, moreTransitionCbks);

			this._showChartHoleChild(this.chartHoleInfoClass, mustShow, transitionCbks);
		},

		_beforeInfoShownOrHidden: function(visible) {

			this._chartHoleInfo && this._chartHoleInfo.attr("pointer-events", visible ? "all" : "none");
		},

		_publishCategoryValue: function(d, i) {

			var infoObj = this._getObjectToPublishCategoryValue(d, i);

			if (this.hole) {

				this._updateChartHoleInfo(infoObj);
				this._evaluateChartHoleInfoVisibility();
			}

			if (!this.hole || !this._infoFitsInHole) {

				this._showChartHoleInfo(false);
				this.inherited(arguments);
			}
		},

		_onMouseLeaveCategoryShowInfoInHole: function(d, i) {

			this._showChartHoleInfo(false);
		},

		_showInfoInHoleOnChartHoleMouseEnter: function() {

			var cbk = lang.hitch(this, this._emptyChartHoleInfo);

			this._showChartHoleInfo(false, {
				end: cbk,
				interrupt: cbk
			});
		},

		_updateChartShowInfoInHole: function() {

			this._emptyChartHoleInfo();
		},

		_clearShowInfoInHole: function() {

			this._chartHoleInfo && this._chartHoleInfo.remove();
			this._chartHoleInfo = null;
		}
	});
});
