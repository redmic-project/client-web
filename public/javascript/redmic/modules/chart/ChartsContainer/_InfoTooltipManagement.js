define([
	'd3/d3.min'
	, 'd3Tip/index'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "templates/ChartCategoryTooltip"
	, "templates/ChartTemporalTooltip"
	, "RWidgets/Utilities"
], function(
	d3
	, d3Tip
	, declare
	, lang
	, ChartCategoryTooltipTemplate
	, ChartTemporalTooltipTemplate
	, Utilities
) {
	return declare(null, {
		//	summary:
		//		Extensión para controlar el tooltip donde se muestra la información recogida por
		//		la extensión '_InfoOnMouseOver'.

		constructor: function(args) {

			this.config = {
				chartsTooltipClass: "chartsTooltip",
				chartsTooltipAnimationInClass: "animateIn",
				chartsTooltipAnimationOutClass: "animateOut",
				chartsTooltipOffset: 30,

				_tooltipDirectionBalance: 0,
				_tooltipIsShown: true
			};

			lang.mixin(this, this.config, args);
		},

		_createTooltipElements: function() {

			this.infoOnMouseOverTooltipAnchor = this.infoOnMouseOverArea.append("svg:circle");

			this.infoOnMouseOverTooltip = d3Tip()
				.attr("class", this.chartsTooltipClass);

			this.svg.call(this.infoOnMouseOverTooltip);
		},

		_showInfoOnMouseOverTooltip: function() {

			var classes = this.chartsTooltipClass + " " + this.chartsTooltipAnimationInClass;
			this.infoOnMouseOverTooltip.attr("class", classes);

			this._tooltipIsShown = true;
		},

		_hideInfoOnMouseOverTooltip: function() {

			var classes = this.chartsTooltipClass + " " + this.chartsTooltipAnimationOutClass;
			this.infoOnMouseOverTooltip.attr("class", classes);

			this._tooltipIsShown = false;

			this.infoOnMouseOverTooltip.hide();
		},

		_updateTooltipPosition: function(x, y) {

			this.infoOnMouseOverTooltipAnchor.attr("transform", "translate(" + x + "," + y + ")");

			if (this._infoOnMouseOverTooltipContent) {
				this._showInfoOnMouseOverTooltip();
				this._refreshTooltip();
			}
		},

		_refreshTooltip: function() {

			this.infoOnMouseOverTooltip.show(null, this.infoOnMouseOverTooltipAnchor.node());
		},

		_updateTooltipDirection: function(x) {

			var balanceLimit = 3;

			if (x >= this._lastTooltipX) {
				if (this._tooltipDirectionBalance < balanceLimit) {
					this._tooltipDirectionBalance++;
				}
			} else {
				if (this._tooltipDirectionBalance > -balanceLimit) {
					this._tooltipDirectionBalance--;
				}
			}

			var tooltipNode = d3.select('.' + this.chartsTooltipClass).node(),
				tooltipWidth = tooltipNode ? tooltipNode.clientWidth : 0,
				distanceToRightLimit = this._innerWidth - x,
				direction, offset;

			if (tooltipWidth > distanceToRightLimit) {
				direction = "w";
				offset = -this.chartsTooltipOffset;
			} else if (tooltipWidth > x) {
				direction = "e";
				offset = this.chartsTooltipOffset;
			} else {
				if (this._tooltipDirectionBalance < 0) {
					direction = "e";
					offset = this.chartsTooltipOffset;
				} else {
					direction = "w";
					offset = -this.chartsTooltipOffset;
				}
			}

			this._lastTooltipX = x;

			this.infoOnMouseOverTooltip
				.direction(direction)
				.offset([0, offset]);
		},

		_sendDataToTooltipContent: function(data) {

			if (!data || Utilities.isEqual(this._lastInfoData, data)) {
				return;
			}
			this._lastInfoData = lang.clone(data);

			var template;
			if (data.titleValue) {
				template = ChartCategoryTooltipTemplate;
			} else {
				template = ChartTemporalTooltipTemplate;
			}

			this.infoOnMouseOverTooltip.html(template({	data: data }));
			this._tooltipIsShown && this._refreshTooltip();
		}
	});
});
