define([
	"app/designs/base/_Main"
	, "app/designs/details/Controller"
	, "app/designs/details/Layout"
	, "app/designs/details/_AddBasicTitle"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/layout/templateDisplayer/TemplateDisplayer"
	, "templates/SurveyStationDashboard"
], function(
	_Main
	, Controller
	, Layout
	, _AddBasicTitle
	, redmicConfig
	, declare
	, lang
	, TemplateDisplayer
	, SurveyStationDashboardTemplate
){
	return declare([Layout, Controller, _Main, _AddBasicTitle], {
		//	summary:
		//		Vista detalle de datos en tiempo real, dashboards.

		constructor: function(args) {

			this.config = {
				title: ' ',
				noScroll: true,
				target: redmicConfig.services.timeSeriesStations,
				dashboardTarget: 'realTimeDashboard'
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.widgetConfigs = this._merge([{
				dashboard: {
					width: 6,
					height: 6,
					type: TemplateDisplayer,
					props: {
						title: this.i18n.dashboard,
						template: SurveyStationDashboardTemplate,
						target: this.dashboardTarget
					}
				}
			}, this.widgetConfigs || {}]);
		},

		_refreshModules: function() {

			this._checkPathVariableId();

			this._emitEvt('GET', {
				target: this.target,
				requesterId: this.ownChannel,
				id: this.pathVariableId
			});

			this._refreshChildrenDataModules();
		},

		_refreshChildrenDataModules: function() {

			this._publish(this._widgets.dashboard.getChannel('CHANGE_TEMPLATE'), {
				template: SurveyStationDashboardTemplate
			});
		},

		_itemAvailable: function(res) {

			var itemData = res.data;

			if (!itemData || !itemData.properties) {
				return;
			}

			var siteData = itemData.properties.site;

			if (!siteData) {
				return;
			}

			this.title = siteData.name + ' (' + siteData.code + ')';
			this._updateTitle();

			this.dashboardUrl = siteData.dashboard;

			this._emitEvt('INJECT_ITEM', {
				data: {
					url: this.dashboardUrl
				},
				target: this.dashboardTarget
			});
		}
	});
});
