define([
	'd3/d3.min'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "RWidgets/Utilities"
], function(
	d3
	, declare
	, lang
	, aspect
	, Utilities
) {
	return declare(null, {
		//	summary:
		//		Extensión para crear una caja que muestre información resumida de la representación actual.

		constructor: function(args) {

			this.config = {
				summaryBoxClass: 'chartSummaryBox'
			};

			lang.mixin(this, this.config, args);
			aspect.after(this, '_createElements', lang.hitch(this, this._createSummaryBoxElements));
			aspect.after(this, '_resize', lang.hitch(this, this._summaryBoxAfterResize));
		},

		_createSummaryBoxElements: function() {

			this.summaryBoxArea = this.drawBox.append('svg:g')
				.attr('id', 'summaryBox')
				.attr('class', this.summaryBoxClass);
		},

		_summaryBoxAfterResize: function() {

			this._translateSummaryBoxArea();
		},

		_onSummaryDataPropSet: function(res) {

			var data = res.value,
				yTranslate = 0;

			this.summaryBoxArea.selectAll('*').remove();

			for (var key in data) {
				this.summaryBoxArea.append('svg:text')
					.text((this.i18n[key] || key) + ': ' + data[key])
					.attr('transform', 'translate(0,' + yTranslate + ')');
				yTranslate += 15;
			}

			this._translateSummaryBoxArea();
		},

		_translateSummaryBoxArea: function() {

			var node = this.summaryBoxArea ? this.summaryBoxArea.node() : null,
				bbox = node ? node.getBBox() : null,
				height = bbox ? bbox.height : 0,
				xTranslate = this._innerWidth,
				yTranslate = this._innerHeight - height;

			this.summaryBoxArea.attr('transform', 'translate(' + xTranslate + ',' + yTranslate + ')');
		}
	});
});
