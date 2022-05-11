define([
	'd3/d3.min'
	, 'd3Tip/d3-v6-tip.min'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
], function(
	d3
	, d3Tip
	, declare
	, lang
	, aspect
) {
	return declare(null, {
		//	summary:
		//		Extensión para crear una barra de breadcrumbs que muestre la secuencia de niveles hasta llegar a la
		//		categoría actualmente enfocada. Es decir, sirve para saber por donde hemos pasado tras hacer zoom,
		//		ya que los niveles superiores no son visibles en la multitarta.

		//	_bSize: Object
		//		Dimensiones del breadcrumb: ancho, alto, espaciado, y ancho del pico/hueco.

		constructor: function(args) {

			this.config = {
				breadcrumbsBarClass: "chartBreadcrumbsBar",
				breadcrumbClass: "chartBreadcrumb",
				chartsTooltipClass: "chartsTooltip",
				breadcrumbsBarTransitionDuration: 800,
				breadcrumbsBarTransitionEase: d3.easeExpInOut,

				_bSize: {
					w: 100, h: 30, s: 3, t: 10
				},
				_breadcrumbBarHorizontalTranslate: 5
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_setOwnCallbacksForEvents", lang.hitch(this,
				this._setBreadcrumbsBarOwnCallbacksForEvents));

			aspect.after(this, "_createElements", lang.hitch(this, this._createBreadcrumbsBarElements));
			aspect.after(this, "_doSubscriptionsForLayer", lang.hitch(this,
				this._doBreadcrumbsBarSubscriptionsForLayer));

			aspect.after(this, "_resize", lang.hitch(this, this._breadcrumbsBarAfterResize));
		},

		_setBreadcrumbsBarOwnCallbacksForEvents: function() {

			this._onEvt('LAYER_UPDATED', lang.hitch(this, this._clearBreadcrumbs));
		},

		_clearBreadcrumbs: function() {

			this.breadcrumbsBarArea.selectAll("g").remove();
			this.breadcrumbsBarTooltip.hide();
			delete this._lastRootCategory;
		},

		_createBreadcrumbsBarElements: function() {

			this.breadcrumbsBarArea = this.toolsArea.append("svg:g")
				.attr("id", "breadcrumbsBar")
				.attr("class", this.breadcrumbsBarClass)
				.style("opacity", 0);

			this._originalVerticalTranslate = this._verticalTranslate;
			this._applyBreadcrumbsBarTranslateValues();

			this._reserveVerticalSpace({ above: this._bSize.h * 1.5 });

			this.breadcrumbsBarTooltip = d3Tip.tip()
				.attr("class", this.chartsTooltipClass)
				.direction("s");

			this.svg.call(this.breadcrumbsBarTooltip);
		},

		_doBreadcrumbsBarSubscriptionsForLayer: function(ret, args) {

			var layerId = args[0],
				layerInstance = this._layers[layerId];

			if (!layerInstance) {
				return;
			}

			if (layerInstance.checkAction("GOT_CATEGORY_DATA")) {
				this._subscriptionsForLayers[layerId].push(this._setSubscription({
					channel: layerInstance.getChannel("GOT_CATEGORY_DATA"),
					callback: "_subGotLayerCategoryData"
				}));
			}

			if (layerInstance.checkAction("ZOOMING")) {
				this._subscriptionsForLayers[layerId].push(this._setSubscription({
					channel: layerInstance.getChannel("ZOOMING"),
					callback: "_subLayerZooming"
				}));
			}
		},

		_subGotLayerCategoryData: function(res) {

			var categoryName = res.categoryName,
				childrenColorIndexName = res.childrenColorIndexName,
				layerInfo = res.layerInfo,
				colors = layerInfo.color;

			this._breadcrumbsBarCategoryName = categoryName;
			this._breadcrumbsBarChildrenColorIndexName = childrenColorIndexName;
			this._breadcrumbsBarColors = colors;
		},

		_subLayerZooming: function(res) {

			var newRoot = res.newRoot;

			this._lastRootCategory = newRoot;

			this.breadcrumbsBarArea.transition()
				.duration(this.breadcrumbsBarTransitionDuration)
				.ease(this.breadcrumbsBarTransitionEase)
				.style("opacity", 0)
				.on("end", lang.hitch(this, this._prepareBreadcrumbsOnZooming));
		},

		_prepareBreadcrumbsOnZooming: function() {

			if (!this._lastRootCategory) {
				return;
			}

			var sequence = this._getBreadcrumbsSequence(this._lastRootCategory);
			this._updateBreadcrumbs(sequence);

			this.breadcrumbsBarArea.transition()
				.duration(this.breadcrumbsBarTransitionDuration)
				.ease(this.breadcrumbsBarTransitionEase)
				.style("opacity", 1);

			this.breadcrumbsBarTooltip.hide();
		},

		_getBreadcrumbsSequence: function(data) {

			var sequence = [],
				current = data;

			while (current.parent) {
				sequence.unshift(current);
				current = current.parent;
			}

			this._breadcrumbsCount = sequence.length;

			return sequence;
		},

		_updateBreadcrumbs: function(sequence) {

			var breadcrumbGSelection = this.breadcrumbsBarArea.selectAll("g")
				.data(sequence, lang.hitch(this, this._getDataIndex)),

				breadcrumbG = breadcrumbGSelection.enter()
					.append("svg:g")
						.attr("class", this.breadcrumbClass);

			this._updateBreadcrumbComponents(breadcrumbG);

			breadcrumbGSelection.attr("transform", lang.hitch(this, this._getBreadcrumbTransform));
			breadcrumbGSelection.exit().remove();
		},

		_getDataIndex: function(d) {

			return d[this._breadcrumbsBarCategoryName] + "_" + d.depth;
		},

		_updateBreadcrumbComponents: function(breadcrumbG) {

			breadcrumbG.append("svg:polygon")
				.style("fill", lang.hitch(this, this._getBreadcrumbColor));

			this._updateAllPolygonPoints();

			breadcrumbG.append("svg:text")
				.attr("dy", "0.35em")
				.attr("text-anchor", "middle");

			this._updateAllBreadcrumbTexts();

			breadcrumbG
				.on("mouseenter", lang.partial(this._onBreadcrumbMouseEnter, this))
				.on("mouseleave", lang.hitch(this, this._onBreadcrumbMouseLeave));
		},

		_updateAllPolygonPoints: function() {

			this.breadcrumbsBarArea.selectAll("g." + this.breadcrumbClass)
				.each(lang.partial(this._updatePolygonPoints, this));
		},

		_updatePolygonPoints: function(self, d, i) {

			d3.select(this).select("polygon")
				.attr("points", lang.hitch(self, self._getBreadcrumbPoints, d, i));
		},

		_updateAllBreadcrumbTexts: function() {

			this.breadcrumbsBarArea.selectAll("g." + this.breadcrumbClass)
				.each(lang.partial(this._updateBreadcrumbText, this));
		},

		_updateBreadcrumbText: function(self, d, i) {

			var text = lang.hitch(self, self._getBreadcrumbText);

			d3.select(this).select("text")
				.attr("x", lang.hitch(self, self._getBreadcrumbTextX))
				.attr("y", lang.hitch(self, self._getBreadcrumbTextY))
				.text(text);
		},

		_onBreadcrumbMouseEnter: function(self, _e, d) {

			var text = d.data[self._breadcrumbsBarCategoryName];

			self.breadcrumbsBarTooltip.html(text);
			self.breadcrumbsBarTooltip.show(null, this);
		},

		_onBreadcrumbMouseLeave: function() {

			this.breadcrumbsBarTooltip.hide();
		},

		_getBreadcrumbPoints: function(d, i) {

			var points = [],
				width = this._getBreadcrumbWidth();

			points.push("0,0");
			points.push(width + ",0");
			points.push(width + this._bSize.t + "," + (this._bSize.h / 2));
			points.push(width + "," + this._bSize.h);
			points.push("0," + this._bSize.h);

			i && points.push(this._bSize.t + "," + (this._bSize.h / 2));

			return points.join(" ");
		},

		_getBreadcrumbWidth: function() {

			var originalWidth = this._bSize.w + this._bSize.t + this._bSize.s,
				totalMargin = 2 * this._breadcrumbBarHorizontalTranslate,
				expectedBarWidth = (originalWidth * this._breadcrumbsCount) + totalMargin,
				width;

			if (expectedBarWidth > this._width) {
				var totalArrowLength = this._breadcrumbsCount * this._bSize.t;
				width = (this._width / this._breadcrumbsCount) - totalArrowLength - totalMargin;
			} else {
				width = this._bSize.w;
			}

			this._breadcrumbWidth = width;
			this._breadcrumbLabelMaxLength = Math.floor(width * 0.1);

			return width;
		},

		_getBreadcrumbColor: function(d, i) {

			var colorsInLevel = this._breadcrumbsBarColors ? this._breadcrumbsBarColors[i] : null;

			if (!colorsInLevel) {
				return;
			}

			var parentData = d.parent,
				currentDIndex = this._getBreadcrumbCurrentDIndex(d),
				colorStartIndex = parentData[this._breadcrumbsBarChildrenColorIndexName] || 0,
				color = colorsInLevel[colorStartIndex + currentDIndex];

			return color;
		},

		_getBreadcrumbCurrentDIndex: function(d) {

			var parentData = d.parent,
				parentChildren = parentData.children,
				maxIndex = parentChildren.indexOf(d),
				count = 0;

			for (var i = 0; i < maxIndex; i++) {
				var childData = parentChildren[i],
					childValue = childData.value;

				if (childValue) {
					count++;
				}
			}

			return count;
		},

		_getBreadcrumbTextX: function() {

			return (this._breadcrumbWidth + this._bSize.t) / 2;
		},

		_getBreadcrumbTextY: function() {

			return this._bSize.h / 2;
		},

		_getBreadcrumbText: function(d) {

			var data = d.data,
				text = data[this._breadcrumbsBarCategoryName];

			if (text.length > this._breadcrumbLabelMaxLength) {
				text = text.substring(0, this._breadcrumbLabelMaxLength) + '...';
			}

			return text;
		},

		_getBreadcrumbTransform: function(d, i) {

			return "translate(" + (i * (this._breadcrumbWidth + this._bSize.s)) + ", 0)";
		},

		_breadcrumbsBarAfterResize: function() {

			this._prepareBreadcrumbsOnZooming();
			this._applyBreadcrumbsBarTranslateValues();
		},

		_applyBreadcrumbsBarTranslateValues: function() {

			var translate = "translate(" + this._breadcrumbBarHorizontalTranslate + "," +
				this._originalVerticalTranslate + ")";

			this.breadcrumbsBarArea && this.breadcrumbsBarArea.transition()
				.duration(this.breadcrumbsBarTransitionDuration)
				.ease(this.breadcrumbsBarTransitionEase)
				.attr("transform", translate);
		}
	});
});
