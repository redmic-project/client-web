define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
], function(
	declare
	, lang
	, aspect
) {
	return declare(null, {
		//	summary:
		//		Extensión para crear una caja que muestre información resumida de la representación actual.

		constructor: function(args) {

			this.config = {
				summaryBoxClass: 'chartSummaryBox',
				summaryKeys: ['count', 'avg', 'min', 'max']
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, '_createElements', lang.hitch(this, this._createSummaryBoxElements));
			aspect.after(this, '_resize', lang.hitch(this, this._summaryBoxAfterResize));
			aspect.before(this, '_clear', lang.hitch(this, this._summaryBoxBeforeClear));
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

			this._clearSummaryBox();

			for (var i = 0; i < this.summaryKeys.length; i++) {
				var key = this.summaryKeys[i],
					value = data[key];

				this.summaryBoxArea.append('svg:text')
					.text((this.i18n[key] || key) + ': ' + value)
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
		},

		_summaryBoxBeforeClear: function() {

			this._clearSummaryBox();
		},

		_clearSummaryBox: function() {

			this.summaryBoxArea.selectAll('*').remove();
		}
	});
});
