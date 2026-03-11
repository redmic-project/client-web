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
	, 'src/design/map/_AddQueryOnMapComponent'
	, 'src/design/map/_MapDesignWithContentLayout'
	, 'src/redmicConfig'
	, 'templates/SurveyStationTimeseriesPopup'
	, 'templates/SurveyStationList'
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
	, _AddQueryOnMapComponent
	, _MapDesignWithContentLayout
	, redmicConfig
	, TemplatePopup
	, TemplateList
) {

	return declare([_Module, _Show, _Store, _MapDesignWithContentLayout, _AddAtlasComponent, _AddQueryOnMapComponent,
		_AddBrowserComponent, _AddMapLayerComponent], {
		//	summary:
		//		Widget para mostrar un mapa de estaciones que producen series de datos temporales.

		postMixInProperties: function() {

			const defaultConfig = {
				ownChannel: 'activityFixedTimeseriesMap',
				target: redmicConfig.services.activityTimeSeriesStations,
				stationDataTarget: 'stationData',
				mapLayerPopupTemplate: TemplatePopup,
				_showChartsButtonClass: 'showCharts'
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
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
							href: '#fixedTimeseriesLineCharts',
							returnItem: true
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
				callback: '_subBrowserShowChartsButtonEvent',
				options: {
					predicate: (evt) => evt?.btnId === 'showCharts'
				}
			});
		},

		_onMeOrAncestorShown: function() {

			this._requestData();
		},

		_requestData: function() {

			const path = {
				activityid: this.pathVariableId
			};

			const sharedParams = true;

			this._emitEvt('REQUEST', {
				method: 'POST',
				target: this.target,
				params: {path, sharedParams}
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

			this._emitEvt('INJECT_ITEM', {
				target: this.stationDataTarget,
				data: item
			});
		}
	});
});
