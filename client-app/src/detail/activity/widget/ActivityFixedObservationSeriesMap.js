define([
	"app/designs/details/main/ActivityMap"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "templates/InfrastructurePopup"
	, "templates/InfrastructureList"
], function(
	ActivityMap
	, redmicConfig
	, declare
	, lang
	, aspect
	, TemplatePopup
	, TemplateList
){
	return declare(ActivityMap, {
		//	summary:
		//

		constructor: function (args) {

			this.config = {
				target: redmicConfig.services.activity,
				templateTargetChange: redmicConfig.services.activityObservationSeriesStations,
				templatePopup: TemplatePopup,
				_activeRadius: false,
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_afterSetConfigurations", lang.hitch(this, this._setBaseConfigurations));
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

			if (popupNode && popupData) {
				var showChartsNode = query('.' + this._showChartsButtonClass, popupNode)[0];
				if (!showChartsNode) {
					return;
				}

				showChartsNode.onclick = lang.hitch(this, this._loadObservationSeriesData, popupData);
			}
		},

		_getPopupContent: function(data) {

			return this.templatePopup({
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

			console.log('cargo los datos de observaciones', item);
		}
	});
});
