define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/query'
	, 'src/component/base/_Filter'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
	, 'src/component/base/_Store'
	, 'src/design/map/_AddAtlasComponent'
	, 'src/design/map/_AddBrowserComponent'
	, 'src/design/map/_AddMapLayerComponent'
	, 'src/design/map/_MapDesignWithContentLayout'
	, 'src/redmicConfig'
	, 'templates/SurveyStationTimeseriesPopup'
	, 'templates/SurveyStationList'
], function(
	declare
	, lang
	, query
	, _Filter
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

	return declare([_Module, _Show, _Store, _Filter, _MapDesignWithContentLayout, _AddAtlasComponent,
		_AddBrowserComponent, _AddMapLayerComponent], {
		//	summary:
		//		Widget para mostrar un mapa de estaciones que producen series de datos temporales.

		constructor: function(args) {

			const defaultConfig = {
				ownChannel: 'activityFixedTimeseriesMap',
				actions: {
					TIMESERIES_DATA: 'timeseriesData'
				},
				_dataTarget: redmicConfig.services.activityTimeSeriesStations,
				mapLayerPopupTemplate: TemplatePopup,
				_showChartsButtonClass: 'showCharts'
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
							icon: 'fa-bar-chart',
							title: this.i18n.charts,
							btnId: 'showCharts',
							href: '#activityFixedTimeseriesLineCharts',
							returnItem: true
						}]
					}
				}
			}, {
				arrayMergingStrategy: 'concatenate'
			});
		},

		_beforeInitialize: function() {

			this.inherited(arguments);

			const queryChannel = this.queryChannel;

			this.mergeComponentAttribute('browserConfig', {
				queryChannel
			});

			this.mergeComponentAttribute('searchConfig', {
				queryChannel
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
				callback: '_subBrowserShowChartsButtonEvent',
				options: {
					predicate: (evt) => evt?.btnId === 'showCharts'
				}
			});
		},

		_subMapLayerStationPopupLoaded: function(res) {

			var popupNode = res?._contentNode,
				popupData = res?._source?.feature?.properties;

			if (!popupNode || !popupData) {
				return;
			}

			var showChartsNode = query('.' + this._showChartsButtonClass, popupNode)[0];

			if (!showChartsNode) {
				return;
			}

			showChartsNode.onclick = lang.hitch(this, this._loadTimeseriesData, popupData);
		},

		_subBrowserShowChartsButtonEvent: function(evt) {

			this._loadTimeseriesData(evt.item);
		},

		_loadTimeseriesData: function(item) {

			this._publish(this.getChannel('TIMESERIES_DATA'), item);
		},

		_onMeOrAncestorShown: function() {

			const replacedTarget = this._getTargetWithVariableReplaced();

			this._updateComponentTargetValues(replacedTarget);
			this._requestDataFromReplacedTarget(replacedTarget);
		},

		_getTargetWithVariableReplaced: function() {

			const replaceObj = {
				activityid: this.pathVariableId
			};

			return lang.replace(this._dataTarget, replaceObj);
		},

		_updateComponentTargetValues: function(replacedTarget) {

			const browserInstance = this.getComponentInstance('browser'),
				searchInstance = this.getComponentInstance('search'),
				mapLayerInstance = this.getComponentInstance('mapLayer');

			this._publish(mapLayerInstance.getChannel('CHANGE_TARGET'), {
				target: replacedTarget
			});

			this._publish(browserInstance.getChannel('UPDATE_TARGET'), {
				target: replacedTarget,
				refresh: true
			});

			this._publish(searchInstance.getChannel('UPDATE_TARGET'), {
				target: replacedTarget,
				refresh: true
			});
		},

		_requestDataFromReplacedTarget: function(replacedTarget) {

			this._publish(this.getChannel('UPDATE_TARGET'), {
				target: replacedTarget,
				refresh: true
			});
		}
	});
});
