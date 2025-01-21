define([
	'app/base/views/extensions/_AddCompositeSearchInTooltipFromTextSearch'
	, 'app/designs/textSearchFacetsList/Controller'
	, 'app/designs/textSearchFacetsList/Layout'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/browser/bars/Order'
	, 'src/component/browser/bars/Total'
	, 'src/redmicConfig'
	, 'templates/ObservationFilterForm'
	, 'templates/ObservationRegisterList'
], function(
	_AddCompositeSearchInTooltipFromTextSearch
	, TextSearchFacetsListController
	, TextSearchFacetsListLayout
	, declare
	, lang
	, Order
	, Total
	, redmicConfig
	, TemplateFilter
	, TemplateList
) {

	return declare([
		TextSearchFacetsListLayout, TextSearchFacetsListController, _AddCompositeSearchInTooltipFromTextSearch
	], {
		//	summary:
		//		Widget para mostrar un listado de las observaciones registradas en el punto seleccionado.

		constructor: function(args) {

			this.config = {
				ownChannel: 'activityFixedObservationSeriesList',
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
						defaultOrderField: 'date',
						options: [
							{value: 'date'}
						]
					}
				}]
			}], {
				arrayMergingStrategy: 'concatenate'
			});

			this.facetsConfig = this._merge([{
				aggs: redmicConfig.aggregations.observationSeries
			}, this.facetsConfig || {}]);

			this.textSearchConfig = this._merge([{
				showExpandIcon: true
			}, this.textSearchConfig || {}]);

			this.compositeConfig = this._merge([this.compositeConfig || {}, {
				template: TemplateFilter
			}]);
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.timeseriesDataChannel,
				callback: '_subObservationStationSet'
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._setTitle('');
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
					},
					returnFields: redmicConfig.returnFields.observationSeries
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
