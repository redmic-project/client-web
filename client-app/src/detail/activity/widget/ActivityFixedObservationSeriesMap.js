define([
	'app/designs/details/main/ActivityMap'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'src/redmicConfig'
	, 'templates/ObservationStationPopup'
	, 'templates/ObservationStationList'
], function(
	ActivityMap
	, declare
	, lang
	, aspect
	, redmicConfig
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
				target: redmicConfig.services.activity,
				templateTargetChange: redmicConfig.services.activityObservationSeriesStations,
				_activeRadius: false
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
										icon: 'fa-database',
										btnId: 'showObservations',
										returnItem: true,
										title: this.i18n.observations
									}]
								}
							}
						}
					}
				}
			}, this.widgetConfigs || {}], {
				arrayMergingStrategy: 'concatenate'
			});
		},

		_afterShow: function() {

			this.inherited(arguments);

			this._subscribe(this.getChildChannel('layerInstance', 'POPUP_LOADED'),
				lang.hitch(this, this._onStationPopupLoaded));

			this._subscribe(this._getWidgetInstance('geographic').getChildChannel('browser', 'BUTTON_EVENT'),
				lang.hitch(this, this._onBrowserButtonEvent));
		},

		_onStationPopupLoaded: function(res) {

			if (!res) {
				return;
			}

			var popupNode = res._contentNode,
				popupData = res._source.feature.properties;

			if (!popupNode || !popupData) {
				return;
			}

			var showChartsNode = query('.' + this._showChartsButtonClass, popupNode)[0];

			if (!showChartsNode) {
				return;
			}

			showChartsNode.onclick = lang.hitch(this, this._loadObservationSeriesData, popupData);
		},

		_getPopupContent: function(data) {

			console.log('popup', data)
			return TemplatePopup({
				i18n: this.i18n,
				feature: data.feature
			});
		},

		_onBrowserButtonEvent: function(evt) {

			if (evt.btnId === 'showObservations') {
				this._loadObservationSeriesData(evt.item);
			}
		},

		_loadObservationSeriesData: function(item) {

			this._publish(this.getChannel('TIMESERIES_DATA'), item);
		}
	});
});
