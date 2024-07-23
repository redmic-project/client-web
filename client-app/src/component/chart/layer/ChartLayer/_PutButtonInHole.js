define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "src/component/chart/layer/ChartLayer/_ChartHoleManagement"
	, "./_PutButtonInHoleItfc"
], function(
	declare
	, lang
	, aspect
	, _ChartHoleManagement
	, _PutButtonInHoleItfc
){
	return declare([_ChartHoleManagement, _PutButtonInHoleItfc], {
		//	summary:
		//		Extensión para mostrar, en el centro de una gráfica donut, un botón para ejecutar
		//		alguna acción (definida en quien extienda, a su vez, a esta extensión).

		constructor: function(args) {

			this.config = {
				chartHoleButtonClass: "chartHoleButton",
				chartHoleButtonIcon: '\uf118',

				_buttonReducingRatio: 0.9
			};

			lang.mixin(this, this.config, args);
		},

		postscript: function() {

			// TODO revisar issue #59
			this.inherited(arguments);

			if (!this.hole) {
				return;
			}

			aspect.after(this, "_createChart", lang.hitch(this, this._createChartHoleButton));
			aspect.after(this, "_setSize", lang.hitch(this, this._setSizeChartHoleButton));
			aspect.after(this, "_onChartHoleMouseEnter", lang.hitch(this, this._putButtonInHoleOnChartHoleMouseEnter));
			aspect.after(this, "_onChartHoleMouseLeave", lang.hitch(this, this._putButtonInHoleOnChartHoleMouseLeave));
			aspect.after(this, "_onChartHoleMouseOver", lang.hitch(this, this._putButtonInHoleOnChartHoleMouseOver));
			aspect.before(this, "_enableChartHole", lang.hitch(this, this._enableChartHolePutButtonInHole));
			aspect.before(this, "_onMouseLeaveCategory", lang.hitch(this, this._onMouseLeaveCategoryPutButtonInHole));
			aspect.before(this, "_clear", lang.hitch(this, this._clearPutButtonInHole));
		},

		_createChartHoleButton: function() {

			if (!this._chartHoleButton) {

				this._chartHoleButton = this._addChartHoleChild(this.chartHoleButtonClass);
			}

			this._createChartHoleButtonComponents();
		},

		_createChartHoleButtonComponents: function() {

			this._createButtonIcon();
		},

		_createButtonIcon: function() {

			if (!this._buttonIcon) {

				this._buttonIcon = this._chartHoleButton.append('svg:text')
					.attr("text-anchor", "middle")
					.attr('font-family', 'FontAwesome')
					.attr('font-size', this._buttonSmallSize)
					.text(this.chartHoleButtonIcon)
					.attr("dy", ".35em")
					.on('mouseenter', lang.hitch(this, this._onButtonIconMouseEnter))
					.on('mouseleave', lang.hitch(this, this._onButtonIconMouseLeave))
					.on('mouseover', lang.hitch(this, this._onButtonIconMouseOver))
					.on('mouseup', lang.hitch(this, this._onButtonIconMouseUp));
			}
		},

		_onButtonIconMouseEnter: function() {

			this._setButtonIconSize(this._buttonBigSize);

			this._showChartHoleButton(true);
		},

		_onButtonIconMouseLeave: function() {

			this._setButtonIconSize(this._buttonSmallSize);
		},

		_setButtonIconSize: function(size) {

			this._buttonIcon && this._buttonIcon
				.attr('font-size', size)
				.attr("dy", ".35em");
		},

		_setSizeChartHoleButton: function() {

			var chartHoleRadius = this._getChartHoleRadius();

			this._buttonSmallSize = chartHoleRadius * this._buttonReducingRatio;
			this._buttonBigSize = chartHoleRadius;

			this._setButtonIconSize(this._buttonSmallSize);
		},

		_showChartHoleButton: function(mustShow) {

			var reallyMustShow = mustShow && this._canButtonBeShown(mustShow),
				transitionCbks = {
					"end": lang.hitch(this, this._afterButtonShownOrHidden, reallyMustShow)
				};

			this._showChartHoleChild(this.chartHoleButtonClass, reallyMustShow, transitionCbks);
		},

		_afterButtonShownOrHidden: function(visible) {

			this._chartHoleButton && this._chartHoleButton
				.attr("pointer-events", visible ? "all" : "none");
		},

		_canButtonBeShown: function(mustShow) {

			return true;
		},

		_putButtonInHoleOnChartHoleMouseEnter: function() {

			this._showChartHoleButton(true);
		},

		_putButtonInHoleOnChartHoleMouseLeave: function() {

			this._showChartHoleButton(false);
		},

		_putButtonInHoleOnChartHoleMouseOver: function() {

			this._showChartHoleButton(true);
		},

		_onButtonIconMouseOver: function() {

			this._setButtonIconSize(this._buttonBigSize);
		},

		_enableChartHolePutButtonInHole: function(mustEnable) {

			this._showChartHoleButton(!!mustEnable);
		},

		_onMouseLeaveCategoryPutButtonInHole: function(d, i) {

			this._showChartHoleButton(false);
		},

		_clearPutButtonInHole: function() {

			this._chartHoleButton && this._chartHoleButton.remove();
			this._chartHoleButton = null;
		}
	});
});
