define([
	'app/details/views/ActivityChart'
	, 'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
], function(
	ActivityChart
	, redmicConfig
	, declare
	, lang
) {

	return declare(ActivityChart, {
		//	summary:
		//

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.timeSeriesTemporalData,
				activityCategory: ['ft']
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._subscribe(this.timeseriesDataChannel, lang.hitch(this, function(data) {

				this._buildAndLoadChartData(data);
			}));
		}
	});
});
