define([
	"app/designs/base/_Main"
	, "app/designs/details/Controller"
	, "app/designs/details/Layout"
	, "app/designs/details/_AddTitle"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/browser/_ButtonsInRow"
	, "redmic/modules/browser/ListImpl"
	, "templates/AdministrativeStatisticsList"
	, "templates/StatisticsTitle"
], function(
	_Main
	, Controller
	, Layout
	, _AddTitle
	, redmicConfig
	, declare
	, lang
	, _ButtonsInRow
	, ListImpl
	, TemplateList
	, TemplateTitle
){
	return declare([Layout, Controller, _Main, _AddTitle], {
		//	summary:
		//		Vista detalle de

		constructor: function(args) {

			this.targetAdministrative = redmicConfig.services.administrativeStatistics;

			this.targetBrowser = "browserStatistics";

			this.config = {
				_titleRightButtonsList: [],
				centerTitle: true,
				noScroll: true,
				propsWidget: {
					omitTitleButtons: true,
					resizable: false
				}
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.titleWidgetConfig = this._merge([{
				template: TemplateTitle,
				target: "statistics_title"
			}, this.titleWidgetConfig || {}]);

			this.widgetConfigs = this._merge([{
				administrative: {
					width: 6,
					height: 6,
					type: declare([ListImpl, _ButtonsInRow]),
					props: {
						title: this.i18n.administrative,
						target: this.targetBrowser,
						template: TemplateList,
						rowConfig: {
							buttonsConfig: {
								listButton: [{
									icon: "fa-arrow-right",
									btnId: "details",
									title: this.i18n.info,
									href: "/admin/{href}"
								}]
							}
						}
					}
				}
			}, this.widgetConfigs || {}]);
		},

		_clearModules: function() {

			this._publish(this._widgets.administrative.getChannel("CLEAR"));
		},

		_refreshModules: function() {

			this._emitEvt('INJECT_ITEM', {
				data: {},
				target: "statistics_title"
			});

			this._emitEvt('REQUEST', this._getRequestObj());

			this.target = this.targetAdministrative;
		},

		_getRequestObj: function() {

			return {
				target: this.targetAdministrative,
				method: "GET",
				type: "API"
			};
		},

		_itemAvailable: function(response) {

		},

		_dataAvailable: function(res, resWrapper) {

			var data = res.data;

			if (data && resWrapper.target === this.targetAdministrative) {
				var id = 1;

				for (var item in data) {
					var result = {};
					result.data = data[item];
					result.name = item;
					result.id = id;

					if ("activityOutProject" === item) {
						result.href = "activity";
					} else if ("projectOutProgram" === item) {
						result.href = "project";
					} else {
						result.href = item;
					}

					this._emitEvt('INJECT_ITEM', {
						data: result,
						target: this.targetBrowser
					});

					id++;
				}
			}
		}
	});
});
