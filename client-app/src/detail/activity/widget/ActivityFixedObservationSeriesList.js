define([
	'app/designs/textSearchList/Controller'
	, 'app/designs/textSearchList/layout/BasicTopZone'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/browser/bars/Order'
	, 'src/component/browser/bars/Total'
	, 'src/redmicConfig'
	, 'templates/ObservationRegisterList'
], function(
	TextSearchListController
	, TextSearchListLayout
	, declare
	, lang
	, Order
	, Total
	, redmicConfig
	, TemplateList
) {

	return declare([TextSearchListLayout, TextSearchListController], {
		//	summary:
		//

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.observationSeries
			};

			lang.mixin(this, this.config, args);
		},

		_afterSetConfigurations: function() {

			this.filterConfig = this._merge([this.filterConfig || {}, {
				serializeOnQueryUpdate: false
			}]);

			this.browserConfig = this._merge([this.browserConfig || {}, {
				template: TemplateList,
				bars: [{
					instance: Total
				},{
					instance: Order,
					config: {
						options: [
							{value: 'date'}
						]
					}
				}]
			}], {
				arrayMergingStrategy: 'concatenate'
			});
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.timeseriesDataChannel,
				callback: '_subObservationStationSet'
			});
		},

		_subObservationStationSet: function(data) {

			var dataDefinitionId = this._getDataDefinitionId(data),
				stationName = data.site && data.site.name;

			this._setTitle(stationName);

			this._publish(this.filter.getChannel('SET_PROPS'), {
				serializeOnQueryUpdate: true
			});

			this._emitEvt('ADD_TO_QUERY', {
				query: {
					terms: {
						dataDefinition: dataDefinitionId
					}
				}
			});
		},

		_getDataDefinitionId: function(data) {

			var measurements = data.measurements;

			var countMeasurement = measurements.find(function(measurement) {

				return measurement.parameter && measurement.parameter.id === 87;
			});

			return countMeasurement && countMeasurement.dataDefinition && countMeasurement.dataDefinition.id;
		}
	});
});
