define([
	"dojo/_base/declare"
	, "dojo/_base/lang"

	, 'colorjs'
], function(
	declare
	, lang
){
	return declare(null, {
		//	summary:
		//		Extensión de gráfica de tarta/donut multi-nivel para calcular los colores de los
		//		niveles anidados, en base a los obtenidos para el primer nivel.

		constructor: function(args) {

			this.config = {
				colorjs: net.brehaut.Color,
				colorHierarchyDelta: 0.05,

				_childrenColorIndexName: "childrenColorIndex"
			};

			lang.mixin(this, this.config, args);
		},

		_applyChartColor: function(depth) {

			var categoriesInDepth = this._categories[depth];

			categoriesInDepth && categoriesInDepth.selectAll("g." + this.sectionClass)
				.attr("fill", lang.hitch(this, function(dataWrapper) {

					var i = dataWrapper.index;
					return this.color[depth][i];
				}));
		},

		_generateColorsForNextLevels: function() {

			for (var depth = 1; depth < this._maxDepthReached; depth++) {
				this.color[depth] = [];

				var categories = this._categories[depth];
				categories && categories.selectAll("g." + this.sectionClass)
					.attr("fill", lang.hitch(this, this._generateColorForChild, depth));
			}
		},

		_generateColorForChild: function(depth, dataWrapper) {

			var d = dataWrapper.data,
				i = dataWrapper.index,
				currentItemParent = d.parent,
				lastGeneratedSiblingColor = this.color[depth][i - 1],
				color;

			if (currentItemParent !== this._lastItemParent || !lastGeneratedSiblingColor) {
				this._lastItemParent = currentItemParent;
				d.parent.data[this._childrenColorIndexName] = i;
				color = this._generateColorForFirstChild(depth, currentItemParent);
			} else {
				color = this._generateNewColor(lastGeneratedSiblingColor);
			}

			this.color[depth][i] = color;

			return color;
		},

		_generateColorForFirstChild: function(depth, currentItemParent) {

			var priorDepth = depth - 1,
				priorLevelCategories = this._categories[priorDepth],
				priorLevelData = priorLevelCategories
					.selectAll("g." + this.sectionClass)
					.data().map(function(dataWrapper) {

						return dataWrapper.data;
					}),

				currentItemParentIndex = priorLevelData.indexOf(currentItemParent),
				parentColor = this.color[priorDepth][currentItemParentIndex];

			this._currentGenerationStrategy = "lighten";
			return this._generateNewColor(parentColor);
		},

		_generateNewColor: function(originalColor) {

			var oldColor = this.colorjs(originalColor),
				oldColorLuminance = oldColor.getLuminance(),
				newColor;

			if (oldColorLuminance > 0.85) {
				this._currentGenerationStrategy = "darken";
			} else if (oldColorLuminance < 0.3) {
				this._currentGenerationStrategy = "lighten";
			}

			if (this._currentGenerationStrategy === "darken") {
				newColor = oldColor.darkenByAmount(this.colorHierarchyDelta);
			} else {
				newColor = oldColor.lightenByAmount(this.colorHierarchyDelta);
			}

			return newColor.toCSS();
		}
	});
});
