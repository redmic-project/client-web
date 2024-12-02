define([
	'app/designs/list/Controller'
	, 'app/designs/list/layout/Layout'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/base/_Store'
	, 'src/redmicConfig'
	, 'templates/ObservationRegisterList'
], function(
	ListController
	, ListLayout
	, declare
	, lang
	, _Store
	, redmicConfig
	, TemplateList
) {

	return declare([ListLayout, ListController, _Store], {
		//	summary:
		//

		constructor: function(args) {

			this.config = {
				observationTarget: redmicConfig.services.observationSeries,
				observationItemsPerPage: 25
			};

			lang.mixin(this, this.config, args);
		},

		_afterSetConfigurations: function() {

			this.browserConfig = this._merge([this.browserConfig || {}, {
				template: TemplateList,
				target: this.observationTarget
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

			this._emitEvt('REQUEST', {
				method: 'POST',
				target: this.observationTarget,
				action: '_search',
				requesterId: this.browser.getOwnChannel(),
				query: {
					size: this.observationItemsPerPage,
					sorts: [{
						field: 'date',
						order: 'DESC'
					}],
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
