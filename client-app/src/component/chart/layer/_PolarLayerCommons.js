define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "./_PolarLayerCommonsItfc"
], function(
	declare
	, lang
	, _PolarLayerCommonsItfc
){
	return declare(_PolarLayerCommonsItfc, {
		//	summary:
		//		Base para los módulos de capa con coordenadas polares que se añadirán a 'ChartsContainer'.

		constructor: function(args) {

			this.config = {
				polarLabels: [
					'dirN', 'dirNbE', 'dirNNE', 'dirNEbN', 'dirNE', 'dirNEbE', 'dirENE', 'dirEbN', 'dirE', 'dirEbS',
					'dirESE', 'dirSEbE', 'dirSE', 'dirSEbS', 'dirSSE', 'dirSbE', 'dirS', 'dirSbW', 'dirSSW', 'dirSWbS',
					'dirSW', 'dirSWbW', 'dirWSW', 'dirWbS', 'dirW', 'dirWbN', 'dirWNW', 'dirNWbW', 'dirNW', 'dirNWbN',
					'dirNNW', 'dirNbW'
				]
			};

			lang.mixin(this, this.config, args);
		},

		_getLabelsText: function(size) {

			if (!size || size === 1) {
				return [];
			}

			var maxSize = this.polarLabels.length;
			if (size <= maxSize && (size & (size - 1)) === 0) {
				var skipStep = maxSize / size,
					filterCbk = lang.partial(this._filterUndesiredLabel, skipStep),
					filteredLabels = this.polarLabels.filter(filterCbk, this);

				return filteredLabels.map(this._translateLabel, this);
			}

			var step = 360 / size,
				labels = [];

			for (var i = 0; i < size; i++) {
				var label = Math.round((i * step) * 100) / 100;
				labels.push(label);
			}

			return labels;
		},

		_filterUndesiredLabel: function(skipStep, d, i) {

			return i % skipStep === 0;
		},

		_translateLabel: function(d) {

			return this.i18n[d] || d;
		}

	});
});
