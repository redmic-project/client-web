define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/query'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
	, 'src/component/base/_Store'
	, 'src/design/map/_AddAtlasComponent'
	, 'src/design/map/_AddBrowserComponent'
	, 'src/design/map/_AddMapLayerComponent'
	, 'src/design/map/_MapDesignWithContentLayout'
	, 'src/redmicConfig'
	, 'templates/ObservationStationPopup'
	, 'templates/ObservationStationList'
], function(
	declare
	, lang
	, query
	, _Module
	, _Show
	, _Store
	, _AddAtlasComponent
	, _AddBrowserComponent
	, _AddMapLayerComponent
	, _MapDesignWithContentLayout
	, redmicConfig
	, TemplatePopup
	, TemplateList
) {

	return declare([_Module, _Show, _Store, _MapDesignWithContentLayout, _AddAtlasComponent, _AddBrowserComponent,
		_AddMapLayerComponent], {
		//	summary:
		//		Widget para mostrar un mapa de puntos donde se registran observaciones.

		constructor: function(args) {

			const defaultConfig = {
				ownChannel: 'activityFixedObservationSeriesMap',
				actions: {
					TIMESERIES_DATA: 'timeseriesData'
				},
				mapLayerPopupTemplate: TemplatePopup,
				target: redmicConfig.services.acousticDetectionReceptors,
				_showObservationsButtonClass: 'showObservations'
			};

			lang.mixin(this, this._merge([this, defaultConfig, args]));
		},

		_setOwnCallbacksForEvents: function() {

			this.inherited(arguments);

			this._onEvt('ME_OR_ANCESTOR_SHOWN', lang.hitch(this, this._onMeOrAncestorShown));
		},

		_setConfigurations: function() {

			this.inherited(arguments);

			this.mergeComponentAttribute('browserConfig', {
				template: TemplateList,
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: 'fa-database',
							btnId: 'showObservations',
							returnItem: true,
							href: '#activityFixedObservationSeriesList',
							title: this.i18n.observations
						}]
					}
				}
			}, {
				arrayMergingStrategy: 'concatenate'
			});
		},

		_defineSubscriptions: function() {

			this.inherited(arguments);

			const mapLayerInstance = this.getComponentInstance('mapLayer'),
				browserInstance = this.getComponentInstance('browser');

			this.subscriptionsConfig.push({
				channel : mapLayerInstance.getChannel('POPUP_LOADED'),
				callback: '_subMapLayerStationPopupLoaded'
			},{
				channel : browserInstance.getChannel('BUTTON_EVENT'),
				callback: '_subBrowserShowObservationsButtonEvent',
				options: {
					predicate: (evt) => evt?.btnId === 'showObservations'
				}
			});
		},

		_subMapLayerStationPopupLoaded: function(res) {

			var popupNode = res?._contentNode,
				popupData = res?._source?.feature?.properties;

			if (!popupNode || !popupData) {
				return;
			}

			var showChartsNode = query('.' + this._showObservationsButtonClass, popupNode)[0];

			if (!showChartsNode) {
				return;
			}

			showChartsNode.onclick = lang.hitch(this, this._loadObservationSeriesData, popupData);
		},

		_subBrowserShowObservationsButtonEvent: function(evt) {

			this._loadObservationSeriesData(evt.item);
		},

		_loadObservationSeriesData: function(item) {

			this._publish(this.getChannel('TIMESERIES_DATA'), item);
		},

		_onMeOrAncestorShown: function() {

			this._requestData();
		},

		_getTargetWithVariableReplaced: function() {

			const replaceObj = {
				id: this.pathVariableId
			};

			return lang.replace(this._dataTarget, replaceObj);
		},

		_updateComponentTargetValues: function(replacedTarget) {

			const browserInstance = this.getComponentInstance('browser'),
				searchInstance = this.getComponentInstance('search'),
				mapLayerInstance = this.getComponentInstance('mapLayer');

			this._publish(mapLayerInstance.getChannel('SET_PROPS'), {
				target: replacedTarget
			});

			this._publish(browserInstance.getChannel('SET_PROPS'), {
				target: replacedTarget
			});

			this._publish(searchInstance.getChannel('SET_PROPS'), {
				target: replacedTarget
			});
		},

		_requestData: function() {

			const path = {
				id: this.pathVariableId
			};

			const target = this.target,
				params = {path};

			this._emitEvt('REQUEST', {
				method: 'GET',
				target,
				params
			});
		}
	});
});
