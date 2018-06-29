define([
	"app/designs/base/_Main"
	, "app/designs/details/Controller"
	, "app/designs/details/Layout"
	, "app/designs/details/_AddTitle"
	, "app/designs/details/_TitleSelection"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/browser/_ButtonsInRow"
	, "redmic/modules/browser/_Framework"
	, "redmic/modules/browser/_Select"
	, "redmic/modules/browser/ListImpl"
	, "redmic/modules/browser/bars/Total"
	, "redmic/modules/layout/TabsDisplayer"
	, "redmic/modules/layout/templateDisplayer/TemplateDisplayer"
	, "templates/ActivityTitle"
	, "templates/ActivityList"
], function(
	_Main
	, Controller
	, Layout
	, _AddTitle
	, _TitleSelection
	, redmicConfig
	, declare
	, lang
	, _ButtonsInRow
	, _Framework
	, _Select
	, ListImpl
	, Total
	, TabsDisplayer
	, TemplateDisplayer
	, TemplateTitle
	, TemplateActivities
){
	return declare([Layout, Controller, _Main, _AddTitle, _TitleSelection], {
		//	summary:
		//		Vista detalle de Organisation.


		constructor: function(args) {

			this.activityTarget = "activities";

			this.config = {
				noScroll: true,
				_titleRightButtonsList: [],
				templateTitle: TemplateTitle
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.target = [this.target];

			this.titleWidgetConfig = this._merge([{
				template: this.templateTitle,
				target: this.target[0]
			}, this.titleWidgetConfig || {}]);

			this.widgetConfigs = this._merge([{
				info: {
					width: 3,
					height: 6,
					type: TemplateDisplayer,
					props: {
						title: this.i18n.info,
						template: this.templateInfo,
						"class": "containerDetails",
						classEmptyTemplate: "contentListNoData",
						target: this.target[0],
						associatedIds: [this.ownChannel],
						shownOption: this.shownOptionInfo
					}
				},
				additionalInfo: {
					width: 3,
					height: 6,
					type: TabsDisplayer,
					props: {
						title: this.i18n.additionalInfo,
						childTabs: [this._configAdditionalInfoActivity()]
					}
				}
			}, this.widgetConfigs || {}]);
		},

		_configAdditionalInfoActivity: function() {

			return {
				title: this.i18n.activities,
				type: declare([ListImpl, _Framework, _ButtonsInRow, _Select]),
				props: {
					selectionTarget: redmicConfig.services.activity,
					target: this.activityTarget,
					template: TemplateActivities,
					bars: [{
						instance: Total
					}],
					rowConfig: {
						buttonsConfig: {
							listButton: [{
								icon: "fa-info-circle",
								btnId: "details",
								title: this.i18n.info,
								href: this.viewPathsWidgets.activities
							}]
						}
					}
				}
			};
		},

		_afterShow: function(request) {

			this.startup();
		},

		_clearModules: function() {

			this._publish(this._widgets.info.getChannel("CLEAR"));
		},

		_refreshModules: function() {

			this._checkPathVariableId();

			this._emitEvt('GET', {
				target: this.target[0],
				requesterId: this.ownChannel,
				id: this.pathVariableId
			});

			this.target[1] = lang.replace(this.activitiesTargetBase, {
				id: this.pathVariableId
			});

			this._emitEvt('GET', {
				target: this.target[1],
				requesterId: this.ownChannel,
				id: ''
			});
		},

		_itemAvailable: function(response) {

			this.inherited(arguments);

			if (response.target === this.target[1]){
				this._dataToActivities(response);
				return;
			}
		},

		_dataToActivities: function(response) {

			var data = response.data;

			this._emitEvt('INJECT_DATA', {
				data: data,
				target: this.activityTarget
			});
		}
	});
});