define([
	"app/designs/base/_Main"
	, "app/designs/list/_AddFilter"
	, "app/designs/list/Controller"
	, "app/designs/list/layout/Layout"
	, "app/designs/sidebarAndContent/Controller"
	, "app/designs/sidebarAndContent/layout/Layout"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Store"
	, "redmic/modules/browser/bars/Pagination"
	, "redmic/modules/browser/_GeoJsonParser"
	, "redmic/modules/layout/templateDisplayer/TemplateDisplayer"
	, "templates/ActivityInfo"
], function(
	_Main
	, ListFilter
	, ListController
	, ListLayout
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
	, _Store
	, Pagination
	, _GeoJsonParser
	, TemplateDisplayer
	, templateActivityInfo
){
	return declare([Layout, Controller, _Main, _Store], {
		//	summary:
		//		Main para visor genérico.
		//	description:
		//

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.activity,
				labelActiveDefault: 'registers',
				targetInfoActivities: 'infoActivities'
			};

			lang.mixin(this, this.config, args);
		},

		_setMainConfigurations: function() {

			this.sidebarConfig = this._merge([{
				items: [{
					label: "info",
					icon: "fa-info"
				},{
					label: "registers",
					icon: "fa-tasks",
					active: true
				}]
			}, this.sidebarConfig || {}],
			{
				arrayMergingStrategy: "concatenate"
			});

			this.browserRegistersConfig = this._merge([{
				parentChannel: this.getChannel(),
				title: this.i18n.registers,
				browserExts: [_GeoJsonParser],
				browserConfig: {
					rowConfig: {
						buttonsConfig: {
							listButton: []
						}
					},
					bars: [{
						instance: Pagination
					}],
					existsPropertyWithTemplate: true,
					expandOrCollapse: true
				}
			}, this.browserRegistersConfig || {}]);

			this.infoActivitiesConfig = this._merge([{
				parentChannel: this.getChannel(),
				template: templateActivityInfo,
				"class": "containerDetails",
				target: this.targetInfoActivities
			}, this.infoActivitiesConfig || {}]);
		},

		_initializeMain: function() {

			this.browserRegisters = new declare([ListLayout, ListController, ListFilter])(this.browserRegistersConfig);

			this.infoActivities = new TemplateDisplayer(this.infoActivitiesConfig);
		},

		_registersCallback: function() {

			return {
				instance: this.browserRegisters
			};
		},

		_infoCallback: function() {

			return {
				instance: this.infoActivities
			};
		},

		_beforeShow: function(req) {

			this._updateConfig(req.data);
		},

		_updateConfig: function(data) {

			var activityCategory = data.activityCategory,
				config = this.viewerConfigByActivityCategory[activityCategory];

			if (this._lastActivityCategory === activityCategory) {
				return;
			}

			if (config) {
				this._lastActivityCategory = activityCategory;

				var template = config.activityContent.register.template;
				this._updateTemplateInBrowserRegisters(template);

				var target = config.activityContent.register.target;
				this._updateTargetRegisters(target, data);
			}

			this._emitEvt('INJECT_DATA', {
				data: data,
				target: this.targetInfoActivities
			});
		},

		_updateTargetRegisters: function(target, data) {

			var resolvedTarget = lang.replace(target, data);

			this._publish(this.browserRegisters.getChannel("UPDATE_TARGET"), {
				target: resolvedTarget,
				refresh: true
			});
		},

		_updateTemplateInBrowserRegisters: function(template) {

			if (!template) {
				return;
			}

			this._publish(this.browserRegisters.getChildChannel("browser", "UPDATE_TEMPLATE"), {
				template: template
			});
		}
	});
});
