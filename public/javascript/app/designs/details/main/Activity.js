define([
	"app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/layout/TabsDisplayer"
	, "redmic/modules/layout/templateDisplayer/TemplateDisplayer"
	, "templates/ActivityInfo"
	, "templates/ActivityInfoHelp"
	, "./_ActivityBase"
], function(
	redmicConfig
	, declare
	, lang
	, TabsDisplayer
	, TemplateDisplayer
	, TemplateInfo
	, TemplateInfoHelp
	, _ActivityBase
) {

	return declare([_ActivityBase], {
		//	summary:
		//		Vista detalle de Activity.

		constructor: function(args) {

			this.target = redmicConfig.services.activity;
			this.reportService = "activity";
			this.ancestorsTarget = redmicConfig.services.activityAncestors;

			this.infoTarget = "infoWidgetTarget";
		},

		_setMainConfigurations: function() {

			this.widgetConfigs = this._merge([{
				helpText: {
					width: 6,
					height: 1,
					type: TemplateDisplayer,
					props: {
						title: this.i18n.dataDownload,
						template: TemplateInfoHelp,
						"class": "templateInfo",
						target: "helpTextActivity"
					}
				},
				info: this._infoConfig({
					height: 5,
					template: TemplateInfo
				}),
				additionalInfo: {
					width: 3,
					height: 5,
					type: TabsDisplayer,
					props: {
						title: this.i18n.additionalInfo,
						childTabs: [
							this._organisationsConfig(),
							this._platformsConfig(),
							this._contactsConfig(),
							this._documentsConfig()
						]
					}
				}
			}, this.widgetConfigs || {}]);
		},

		_refreshModules: function() {

			var object = {};

			object.info = this.i18n.helpTextActivityDetails;

			this._emitEvt('INJECT_ITEM', {
				data: object,
				target: "helpTextActivity"
			});

			this.inherited(arguments);
		},

		_itemAvailable: function(res) {

			var path = res.data.path,
				ancestorsTarget = lang.replace(this.ancestorsTarget, { path: path });

			this._activityData = res.data;
			this._originalTarget = this.target;
			this.target = ancestorsTarget;

			this._emitEvt('INJECT_DATA', {
				data: this._activityData,
				target: this.infoTarget
			});

			this._emitEvt('REQUEST', {
				method: "POST",
				target: ancestorsTarget,
				action: '_search',
				query: {
					returnFields: ['id', 'path', 'name']
				}
			});

			this.inherited(arguments);
		},

		_dataAvailable: function(res) {

			this.target = this._originalTarget;

			var data = res.data,
				ancestors = data.data;

			this._activityData.ancestors = ancestors;

			this._emitEvt('INJECT_DATA', {
				data: this._activityData,
				target: this.infoTarget
			});
		}
	});
});
