define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "./_LegendBarCommons"
], function(
	declare
	, lang
	, _LegendBarCommons
) {
	return declare(_LegendBarCommons, {
		//	summary:
		//		Extensión para crear una barra que muestre la leyenda resumida y agrupada de las capas añadidas al
		//		contenedor. Al ser agrupada, está pensada para gráficas por categorías (tartas, etc.) y no muestra
		//		indicador de color.

		constructor: function(args) {

			this.config = {
			};

			lang.mixin(this, this.config, args);
		},

		_getLegendElementLabel: function(res) {

			var label = res.label;

			return label;
		},

		_createOrUpdateLegendElements: function(res) {

			var chartId = res.chart,
				label = this._getLegendElementLabel(res);
				clippedLabel = this._getClippedText(label);

			if (!this._legendElements[chartId]) {
				this._legendElements[chartId] = {};
			}

			var legendElement = this._legendElements[chartId][0];

			if (!legendElement) {
				legendElement = this._createLegendElement();
				this._legendElements[chartId][0] = legendElement;

				this._insertLegendElement(legendElement);

				this._insertLegendElementChildren(legendElement);

				this._listenLegendElement(legendElement, {
					chartId: chartId,
					label: label
				});
			}

			this._updateLegendElement(legendElement, clippedLabel);
		},

		_insertLegendElementChildren: function(legendElement) {

			legendElement.append("svg:text");
		},

		_updateLegendElement: function(legendElement, label) {

			legendElement.select("text")
				.text(label);
		}
	});
});
