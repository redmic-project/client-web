define([
	'app/base/views/extensions/_AddCompositeSearchInTooltipFromTextSearch'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
	, 'src/component/base/_Store'
	, 'src/design/browser/_AddFacetComponent'
	, 'src/design/browser/_AddOrderBarComponent'
	, 'src/design/browser/_AddPaginationBarComponent'
	, 'src/design/browser/_AddTextSearchComponent'
	, 'src/design/browser/_AddTotalBarComponent'
	, 'src/design/browser/_BrowserWithTopbarAndFilterPanelDesignLayout'
	, 'src/redmicConfig'
	, 'templates/LoadingCustom'
	, 'templates/ObservationFilterForm'
	, 'templates/ObservationRegisterList'
], function(
	_AddCompositeSearchInTooltipFromTextSearch
	, declare
	, lang
	, _Module
	, _Show
	, _Store
	, _AddFacetComponent
	, _AddOrderBarComponent
	, _AddPaginationBarComponent
	, _AddTextSearchComponent
	, _AddTotalBarComponent
	, _BrowserWithTopbarAndFilterPanelDesignLayout
	, redmicConfig
	, LoadingCustom
	, TemplateFilter
	, TemplateList
) {

	return declare([_Module, _Show, _Store, _BrowserWithTopbarAndFilterPanelDesignLayout, _AddTotalBarComponent,
		_AddOrderBarComponent, _AddPaginationBarComponent, _AddFacetComponent, _AddTextSearchComponent], {
		//	summary:
		//		Widget para mostrar un listado de las observaciones registradas en el punto seleccionado.

		constructor: function(args) {

			this.config = {
				ownChannel: 'activityFixedObservationSeriesList',
				dataTarget: redmicConfig.services.acousticDetectionEvents,
				stationDataTarget: 'stationData'
			};

			lang.mixin(this, this.config, args);

			this.target = [this.dataTarget, this.stationDataTarget];
		},

		_setConfigurations: function() {

			this.inherited(arguments);

			this.browserConfig = this._merge([this.browserConfig || {}, {
				template: TemplateList,
				noDataMessage: {
					definition: LoadingCustom,
					props: {
						message: this.i18n.selectStationWithRegisteredData,
						iconClass: 'fr fr-no-data'
					}
				}
			}], {
				arrayMergingStrategy: 'concatenate'
			});

			this.orderBarConfig = this._merge([this.orderBarConfig || {}, {
				defaultOrderField: 'date',
				options: [
					{value: 'date'}
				]
			}], {
				arrayMergingStrategy: 'concatenate'
			});

			this.facetConfig = this._merge([this.facetConfig || {}, {
				aggs: redmicConfig.aggregations.acousticDetectionEvents,
				propertyName: 'query',
				search: lang.hitch(this, this._requestData)
			}]);

			this.textSearchConfig = this._merge([{
				getSuggestionsPathParams: () => ({
					activityid: this.pathVariableId,
					receptorid: this._stationId
				}),
			}, this.textSearchConfig || {}]);

			this.compositeConfig = this._merge([this.compositeConfig || {}, {
				template: TemplateFilter
			}]);
		},

		postCreate: function() {

			this.inherited(arguments);

			this._setBrowserTitle('');
		},

		_itemAvailable: function(res, resWrapper) {

			this.inherited(arguments);

			if (resWrapper.target !== this.stationDataTarget) {
				return;
			}

			this._onObservationStationSet(res.data);
		},

		_onObservationStationSet: function(stationData) {

			const stationName = stationData.site?.name || '';
			this._setBrowserTitle(stationName);

			this._requestObservationEvents(stationData);
		},

		_setBrowserTitle: function(titleValue) {

			this._publish(this.getChannel('SET_PROPS'), {
				browserDesignTitle: titleValue
			});
		},

		_requestObservationEvents: function(stationData) {

			this._stationId = stationData.id;

			const path = {
				activityid: this.pathVariableId,
				receptorid: this._stationId
			};

			const dataDefinitionId = this._getDataDefinitionId(stationData);

			if (!dataDefinitionId) {
				return;
			}

			const query = {
				'data-definition': dataDefinitionId
			};

			const params = {path, query};

			this._requestData(params);
		},

		_getDataDefinitionId: function(data) {

			const countMeasurement = data.measurements?.find(measurement => measurement.parameter?.id === 87);

			return countMeasurement?.dataDefinition?.id;
		},

		_requestData: function(params) {

			params.sharedParams = true;

			this._emitEvt('REQUEST', {
				method: 'GET',
				target: this.dataTarget,
				params
			});
		}
	});
});
