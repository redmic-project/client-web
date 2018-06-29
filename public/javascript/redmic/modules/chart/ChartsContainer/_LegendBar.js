define([
	'd3/d3.min'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "RWidgets/Utilities"
	, "./_LegendBarCommons"
], function(
	d3
	, declare
	, lang
	, aspect
	, Utilities
	, _LegendBarCommons
) {
	return declare(_LegendBarCommons, {
		//	summary:
		//		Extensión para crear una barra que muestre la leyenda resumida de las capas añadidas al contenedor.
		//		En caso de que se añada una capa con categorías, se generará un elemento independiente en la leyenda
		//		por cada una.

		constructor: function(args) {

			this.config = {
				legendColorIcon: '\uf043',
				legendLabelIconWidth: 15
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_setOwnCallbacksForEvents", lang.hitch(this, this._setLegendBarOwnCallbacksForEvents));
		},

		_setLegendBarOwnCallbacksForEvents: function() {

			this._onEvt('LAYER_COLOR_SET', lang.hitch(this, this._onLayerColorSetLegendBar));
		},

		_createOrUpdateLegendElements: function(res) {

			var entriesCount = res.entriesCount || 1,
				label = this._getLegendElementLabel(res);

			for (var i = 0; i < entriesCount; i++) {
				this._createOrUpdateLegendElement(i, {
					label: label,
					entriesCount: entriesCount
				}, res);
			}
		},

		_getLegendElementLabel: function(res) {

			var chartLabel = res.label,
				chartParameterName = res.parameterName,
				label = this._translateLabel(chartLabel) + " (" + chartParameterName + ")";

			return label;
		},

		_translateLabel: function(label) {

			var separator = "_";
			if (!label || label.indexOf(separator) === -1) {
				return label;
			}

			var labelSplitted = label.split(separator),
				translatedLabelSplitted = labelSplitted.map(lang.hitch(this, function(value, index, array) {

					var returnValue = this.i18n[value] || value;
					return index === 0 ? Utilities.capitalize(returnValue) : returnValue.toLowerCase();
				}));

			return translatedLabelSplitted.join(" ");
		},

		_createOrUpdateLegendElement: function(i, props, res) {

			var chartId = res.chart,
				chartColor = res.color,
				color = this._getSingleColor(chartColor, i),
				entriesCount = props.entriesCount,
				label = props.label,
				clippedLabel = this._getClippedText(label);

			if (!this._legendElements[chartId]) {
				this._legendElements[chartId] = {};
			}

			var legendElementsByChart = this._legendElements[chartId],
				legendElement = legendElementsByChart[i];

			if (!legendElement) {
				legendElement = this._createLegendElement();
				legendElementsByChart[i] = legendElement;

				this._insertLegendElementChildren(legendElement);

				this._insertLegendElement(legendElement);

				this._listenLegendElement(legendElement, {
					chartId: chartId,
					label: label,
					entryIndex: entriesCount > 1 ? i : null
				});
			}

			legendElement.selectAll("text")
				.each(lang.partial(this._updateLegendElement, color, clippedLabel));
		},

		_getSingleColor: function(colors, i) {

			return colors instanceof Array ?
				(colors[0] instanceof Array ?
					colors[0][i] :
					colors[i]) :
				colors;
		},

		_insertLegendElementChildren: function(legendElement) {

			legendElement.append("svg:text")
				.attr('font-family', 'FontAwesome')
				.text(this.legendColorIcon);

			legendElement.append("svg:text")
				.attr("transform", "translate(" + this.legendLabelIconWidth + ", 0)");
		},

		_updateLegendElement: function(color, label, d, i) {

			var item = d3.select(this);

			if (i === 0) {
				item.attr('fill', color);
			} else if (i === 1) {
				item.text(label);
			}
		},

		_onLayerColorSetLegendBar: function(res) {

			var chartId = res.chart,
				colorSet = res.colorSet || {},
				chartColor = colorSet.color,
				chartColorIndex = colorSet.colorIndex || 0,
				legendElements = this._legendElements[chartId];

			if (!legendElements || !chartColor) {
				return;
			}

			if (typeof chartColor === "string") {
				this._setLegendElementColor(legendElements[chartColorIndex], chartColor);
			} else {
				for (var i = chartColorIndex; i < chartColor.length; i++) {
					this._setLegendElementColor(legendElements[i], chartColor[i]);
				}
			}
		},

		_setLegendElementColor: function(legendElement, color) {

			legendElement.select("text").attr('fill', color);
		}
	});
});
