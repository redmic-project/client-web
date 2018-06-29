define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "RWidgets/Utilities"
], function(
	declare
	, lang
	, Utilities
){
	return declare(null, {
		//	summary:
		//		Extensión para .
		//	description:
		//		Añade funcionalidades de manejo de timeInterval.

		constructor: function(args) {

			this.config = {
				defaultIntervalOptions: [{
					value: 'raw',
					labelKey: "raw"
				}],
				_defaultForEvaluateIntervalOptions: [{
					value: "1h",
					ms: 3600000,
					labelKey: "hour"
				},{
					value: "1d",
					ms: 86400000,
					labelKey: "day"
				},{
					value: "1w",
					ms: 604800000,
					labelKey: "week"
				},{
					value: "1M",
					ms: 2592000000,
					labelKey: "month"
				},{
					value: "1q",
					ms: 7776000000,
					labelKey: "quarter"
				},{
					value: "1y",
					ms: 31104000000,
					labelKey: "year"
				}],
				optionValueDefault: 0
			};

			lang.mixin(this, this.config);

			var intervals = this._defaultForEvaluateIntervalOptions;
			this.intervalValue = intervals[this.optionValueDefault].value;
		},

		_generateOptionsIntervalDefault: function() {

			if (!this.defaultIntervalOptions)
				this.defaultIntervalOptions = [];

			var _intervalOptions = lang.clone(this.defaultIntervalOptions);

			for (i = 0; i < this._defaultForEvaluateIntervalOptions.length; i++)
				_intervalOptions.push(this._defaultForEvaluateIntervalOptions[i]);

			return _intervalOptions;
		},

		_processDataAndOptionsInterval: function(data) {

			var minInterval = null;

			for (var i = 0; i < data.length; i++) {
				var intervalItem = data[i].dataDefinition.timeInterval;
				if (!minInterval || (intervalItem && intervalItem < minInterval))
					minInterval = intervalItem;
			}

			if (!this.defaultIntervalOptions)
				this.defaultIntervalOptions = [];

			var _intervalOptions = lang.clone(this.defaultIntervalOptions);

			for (i = 0; i < this._defaultForEvaluateIntervalOptions.length; i++)
				if (this._defaultForEvaluateIntervalOptions[i].ms >= minInterval)
					_intervalOptions.push(this._defaultForEvaluateIntervalOptions[i]);

			return _intervalOptions;
		}
	});
});