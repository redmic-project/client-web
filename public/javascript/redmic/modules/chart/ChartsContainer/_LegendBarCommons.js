define([
	'd3Tip/index'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "put-selector/put"
	, "RWidgets/Utilities"
	, "./_LegendBarCommonsItfc"
], function(
	d3Tip
	, declare
	, lang
	, aspect
	, put
	, Utilities
	, _LegendBarCommonsItfc
) {
	return declare(_LegendBarCommonsItfc, {
		//	summary:
		//		Base común para extensiones que crean una barra que muestre la leyenda de las capas añadidas al
		//		contenedor.

		constructor: function(args) {

			this.config = {
				legendBarClass: "chartLegendBar",
				legendTitleClass: 'chartLegendTitle',
				legendElementClass: "chartLegendElement",
				legendElementMargin: 20,
				legendLabelMaxLength: 40,
				legendTitleMaxLength: 80,
				disabledLegendClass: "hiddenChartLegend",

				_currentLegendBarHeight: 0,
				_legendBarRowHeight: 20,
				_legendBarRows: {},
				_legendElements: {},
				_currentRow: 0,
				_reorderAndTranslateTimeout: 100
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_setOwnCallbacksForEvents", lang.hitch(this,
				this._setLegendBarCommonsOwnCallbacksForEvents));

			aspect.after(this, "_createElements", lang.hitch(this, this._createLegendBarCommonsElements));
			aspect.after(this, "_resize", lang.hitch(this, this._legendBarCommonsAfterResize));
		},

		_setLegendBarCommonsOwnCallbacksForEvents: function() {

			this._onEvt('LAYER_ADDED', lang.hitch(this, this._onLayerAddedLegendBar));
			this._onEvt('LAYER_CLEARED', lang.hitch(this, this._onLayerClearedLegendBar));
			this._onEvt('LAYER_SHOWN', lang.hitch(this, this._onLayerShownLegendBar));
			this._onEvt('LAYER_HIDDEN', lang.hitch(this, this._onLayerHiddenLegendBar));
			this._onEvt('GOT_LAYER_INFO', lang.hitch(this, this._onGotLayerInfoLegendBar));
			this._onEvt('LAYER_INFO_UPDATED', lang.hitch(this, this._onLayerInfoUpdatedLegendBar));
		},

		_createLegendBarCommonsElements: function() {

			this.legendBarArea = this.toolsArea.append("svg:g")
				.attr("id", "legendBar")
				.attr("class", this.legendBarClass);

			this._createLegendTitle();

			this._applyLegendBarTranslateValues();

			this._currentLegendBarHeight = this._legendBarRowHeight;
			this._reserveHeight(this._legendBarRowHeight * 2);

			this.legendBarTooltip = d3Tip().attr("class", this.chartsTooltipClass);

			this.svg.call(this.legendBarTooltip);
		},

		_createLegendTitle: function() {

			this.legendBarTitleArea = this.legendBarArea.append('svg:g')
				.attr('class', this.legendTitleClass);

			this.legendBarTitleElement = this.legendBarTitleArea.append('svg:text');

			this.legendBarTitleElement
				.on('mouseleave', lang.hitch(this, this._onLegendTitleMouseLeave))
				.on('mouseenter', lang.partial(this._onLegendTitleMouseEnter, this));
		},

		_createLegendElement: function() {

			var legendElement = this.legendBarArea.append("svg:g")
				.attr("class", this.legendElementClass);

			return legendElement;
		},

		_insertLegendElement: function(legendElement) {

			var prevRow = this._currentRow;

			this._placeLegendElement(legendElement);

			if (prevRow !== this._currentRow) {
				var rowDiff = Math.abs(prevRow - this._currentRow);
				this._reserveHeight(this._legendBarRowHeight * rowDiff);
			}
		},

		_listenLegendElement: function(legendElement, props) {

			var chartId = props.chartId,
				label = props.label,
				entryIndex = props.entryIndex;

			legendElement
				.on("mouseup", lang.hitch(this, this._hideLayer, chartId, entryIndex))
				.on("mouseleave", lang.hitch(this, this._onLegendElementMouseLeave))
				.on("mouseenter", lang.partial(this._onLegendElementMouseEnter, this, label));
		},

		_reserveHeight: function(height) {

			this._reserveVerticalSpace({ under: height });
		},

		_releaseHeight: function(height) {

			this._releaseVerticalSpace({ under: height });
		},

		_onLayerAddedLegendBar: function(res) {

			var chartId = res.chart;

			this._getLayerInfo({
				layerId: chartId
			});
		},

		_onLayerShownLegendBar: function(res) {

			var chartId = res.chart,
				index = res.index,
				entriesCount = res.entriesCount || 1,
				legendElementsByChart = this._legendElements[chartId];

			if (Utilities.isValidNumber(index)) {
				this._changeLegendElementToEnabled(chartId, legendElementsByChart[index], index);
			} else {
				for (var i in legendElementsByChart) {
					this._changeLegendElementToEnabled(chartId, legendElementsByChart[i],
						entriesCount > 1 ? i : null);
				}
			}
		},

		_onLayerHiddenLegendBar: function(res) {

			var chartId = res.chart,
				index = res.index,
				entriesCount = res.entriesCount || 1,
				legendElementsByChart = this._legendElements[chartId];

			if (Utilities.isValidNumber(index)) {
				this._changeLegendElementToDisabled(chartId, legendElementsByChart[index], index);
			} else {
				for (var i in legendElementsByChart) {
					this._changeLegendElementToDisabled(chartId, legendElementsByChart[i], entriesCount > 1 ? i : null);
				}
			}
		},

		_getClippedElementText: function(text) {

			return this._getClippedText(text, this.legendLabelMaxLength);
		},

		_getClippedTitleText: function(text) {

			return this._getClippedText(text, this.legendTitleMaxLength);
		},

		_getClippedText: function(text, length) {

			if (text.length > length) {
				text = text.substring(0, length) + '...';
			}

			return text;
		},

		_onLayerClearedLegendBar: function(res) {

			var chartId = res.chart,
				legendElementsByChart = this._legendElements[chartId];

			for (var i in legendElementsByChart) {
				legendElementsByChart[i].remove();
				delete legendElementsByChart[i];
			}

			if (!legendElementsByChart || !Object.keys(legendElementsByChart).length) {
				delete this._legendElements[chartId];
			}

			this._reorderAndTranslateLegend();
		},

		_reorderAndTranslateLegend: function() {

			clearTimeout(this._reorderAndTranslateTimeoutHandler);
			this._reorderAndTranslateTimeoutHandler = setTimeout(lang.hitch(this, function() {

				this._reorderLegendElements();
				this._applyLegendBarTranslateValues();
			}), this._reorderAndTranslateTimeout);
		},

		_reorderLegendElements: function() {

			this._clearLegendRows();

			for (var chartId in this._legendElements) {
				var legendElementsByChart = this._legendElements[chartId];

				for (var i in legendElementsByChart) {
					var legendElement = legendElementsByChart[i];

					put(this.legendBarArea.node(), legendElement.node());
					this._placeLegendElement(legendElement);
				}
			}

			this._reserveHeight(this._legendBarRowHeight * this._currentRow);
		},

		_clearLegendRows: function() {

			for (var i in this._legendBarRows) {
				this._legendBarRows[i].remove();
				delete this._legendBarRows[i];
			}

			this._releaseHeight(this._legendBarRowHeight * this._currentRow);
			this._currentLegendBarHeight = this._legendBarRowHeight;
			this._currentRow = 0;
		},

		_changeLegendElementToEnabled: function(chartId, element, i) {

			element
				.classed(this.disabledLegendClass, false)
				.on("mouseup", lang.hitch(this, this._hideLayer, chartId, Number.parseInt(i)));
		},

		_changeLegendElementToDisabled: function(chartId, element, i) {

			element
				.classed(this.disabledLegendClass, true)
				.on("mouseup", lang.hitch(this, this._showLayer, chartId, Number.parseInt(i)));
		},

		_onGotLayerInfoLegendBar: function(res) {

			this._updateLegendContentWithNewInfo(res);
		},

		_onLayerInfoUpdatedLegendBar: function(res) {

			this._updateLegendContentWithNewInfo(res);
		},

		_updateLegendContentWithNewInfo: function(res) {

			this._createOrUpdateLegendElements(res);
			this._reorderAndTranslateLegend();
		},

		_onLegendTitleMouseEnter: function(self) {

			self.legendBarTooltip.html(self._currentLegendTitle);
			self.legendBarTooltip.show(null, this);
		},

		_onLegendTitleMouseLeave: function() {

			this.legendBarTooltip.hide();
		},

		_onLegendElementMouseEnter: function(self, text) {

			self.legendBarTooltip.html(text);
			self.legendBarTooltip.show(null, this);
		},

		_onLegendElementMouseLeave: function() {

			this.legendBarTooltip.hide();
		},

		_setLegendTitle: function(title) {

			this._currentLegendTitle = title;

			this.legendBarTitleElement.text(this._getClippedTitleText(title));
		},

		_placeLegendElement: function(legendElement) {

			var firstElement = false;
			if (!this._legendBarRows[this._currentRow]) {

				this._insertNewLegendRow();
				firstElement = true;
			}

			var row = this._legendBarRows[this._currentRow],
				rowPrevWidth = row.node().getBBox().width,
				elementWidth = legendElement.node().getBBox().width,
				rowNextWidth = rowPrevWidth + elementWidth + (rowPrevWidth ? this.legendElementMargin : 0);

			if (rowNextWidth > this._innerWidth && rowPrevWidth) {

				this._currentRow++;
				this._currentLegendBarHeight += this._legendBarRowHeight;
				this._insertNewLegendRow();
				firstElement = true;

				row = this._legendBarRows[this._currentRow];
				rowPrevWidth = 0;
				rowNextWidth = elementWidth;
			}

			put(row.node(), legendElement.node());

			var leftMargin = firstElement ? 0 : this.legendElementMargin,
				xTranslate = rowPrevWidth + leftMargin;

			legendElement.attr("transform", "translate(" + xTranslate + "," + 0 + ")");
		},

		_insertNewLegendRow: function() {

			var yTranslate = this._currentRow * this._legendBarRowHeight;

			this._legendBarRows[this._currentRow] = this.legendBarArea.append("svg:g")
				.attr("transform", "translate(" + 0 + "," + yTranslate + ")");
		},

		_legendBarCommonsAfterResize: function() {

			if (this._innerWidth !== this._oldInnerWidth) {
				this._oldInnerWidth = this._innerWidth;
				this._reorderLegendElements();
			}

			this._applyLegendBarTranslateValues();
		},

		_applyLegendBarTranslateValues: function() {

			var node = this.legendBarArea ? this.legendBarArea.node() : null,
				bbox = node ? node.getBBox() : null,
				halfWidth = bbox ? bbox.width / 2 : 0;

			this._translateLegendBarArea(halfWidth);
			this._translateLegendBarTitle(halfWidth);
		},

		_translateLegendBarArea: function(halfWidth) {

			var xTranslate = (this._innerWidth / 2) - halfWidth + this._horizontalTranslate,
				yTranslate = this._height - this._currentLegendBarHeight,
				transform = "translate(" + xTranslate + "," + yTranslate + ")";

			this.legendBarArea && this.legendBarArea.transition().attr("transform", transform);
		},

		_translateLegendBarTitle: function(areaHalfWidth) {

			var titleNode = this.legendBarTitleArea ? this.legendBarTitleArea.node() : null,
				titleBbox = titleNode ? titleNode.getBBox() : null,
				titleHalfWidth = titleBbox ? titleBbox.width / 2 : 0;

			var xTranslate = areaHalfWidth - titleHalfWidth,
				yTranslate = -this._legendBarRowHeight,
				transform = 'translate(' + xTranslate + ',' + yTranslate + ')';

			this.legendBarTitleArea && this.legendBarTitleArea.transition().attr('transform', transform);
		}
	});
});
