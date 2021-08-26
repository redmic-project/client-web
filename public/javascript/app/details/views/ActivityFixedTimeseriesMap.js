define([
	'app/designs/details/main/ActivityMap'
	, 'app/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'dojo/query'
	, 'templates/SurveyStationTimeseriesPopup'
	, 'templates/SurveyStationList'
], function(
	ActivityMap
	, redmicConfig
	, declare
	, lang
	, aspect
	, query
	, TemplatePopup
	, TemplateList
) {

	return declare(ActivityMap, {
		//	summary:
		//

		constructor: function(args) {

			this.config = {
				actions: {
					TIMESERIES_DATA: 'timeseriesData'
				},
				templateTargetChange: redmicConfig.services.activityTimeSeriesStations,
				templatePopup: TemplatePopup,
				_activeRadius: false,
				activityCategory: ['ft'],
				targetReplaceParameter: 'activityid',
				_showChartsButtonClass: 'showCharts'
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, '_afterSetConfigurations', lang.hitch(this, this._setBaseConfigurations));
		},

		_setBaseConfigurations: function() {

			this.widgetConfigs = this._merge([{
				geographic: {
					props: {
						browserConfig: {
							template: TemplateList,
							rowConfig: {
								buttonsConfig: {
									listButton: [{
										icon: 'fa-bar-chart',
										title: this.i18n.charts,
										btnId: 'showCharts',
										returnItem: true
									},{
										icon: 'fa-map-marker',
										title: this.i18n.map,
										btnId: 'mapCentering',
										returnItem: true
									}]
								}
							}
						}
					}
				}
			}, this.widgetConfigs || {}]);
		},

		_afterShow: function() {

			this.inherited(arguments);

			this._subscribe(this.getChildChannel('layerInstance', 'POPUP_LOADED'),
				lang.hitch(this, this._onStationPopupLoaded));

			this._subscribe(this._getWidgetInstance('geographic').getChildChannel('browser', 'BUTTON_EVENT'),
				lang.hitch(this, this._onBrowserShowChartsButtonEvent));
			},

		_onStationPopupLoaded: function(res) {

			if (!res) {
				return;
			}

			var popupNode = res._contentNode,
				popupData = res._source.feature.properties;

			if (popupNode && popupData) {
				var showChartsNode = query('.' + this._showChartsButtonClass, popupNode)[0];
				if (!showChartsNode) {
					return;
				}

				showChartsNode.onclick = lang.hitch(this, this._loadTimeseriesData, popupData);
			}
		},

		_getPopupContent: function(data) {

			return this.templatePopup({
				i18n: this.i18n,
				feature: data.feature
			});
		},

		_onBrowserShowChartsButtonEvent: function(evt) {

			this._loadTimeseriesData(evt.item);
		},

		_loadTimeseriesData: function(itemData) {

			this._publish(this.getChannel('TIMESERIES_DATA'), itemData);
		}
	});
});
