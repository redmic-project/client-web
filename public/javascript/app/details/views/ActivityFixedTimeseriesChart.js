define([
	'app/details/views/ActivityChart'
	, 'app/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'dojo/Deferred'
], function(
	ActivityChart
	, redmicConfig
	, declare
	, lang
	, aspect
	, Deferred
) {

	return declare(ActivityChart, {
		//	summary:
		//

		constructor: function(args) {

			this.config = {
				templateTargetChange: redmicConfig.services.timeSeriesTemporalData,
				activityCategory: ['ft']
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._subscribe(this.timeseriesDataChannel, lang.hitch(this, function(data) {

				this._dataList = [];
				this._indexDataList = {};

				this._dataList = this._parseData(data.properties);
				this._generateTimeSeriesData(this._dataList);

				this._publish(this._getWidgetInstance('chart').getChannel('SET_PROPS'), {
					chartsData: this.seriesData
				});
			}));
		}
	});
});
