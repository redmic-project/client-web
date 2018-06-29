define([
	"app/designs/details/Controller"
	, "app/designs/details/Layout"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/browser/_MultiTemplate"
	, "redmic/modules/browser/HierarchicalImpl"
	, "redmic/modules/layout/templateDisplayer/TemplateDisplayer"
	, "templates/ActivityInfo"
	, "templates/MeasurementChildList"
	, "templates/MeasurementParentList"
	, "templates/SiteInfo"
], function(
	DetailsController
	, DetailsLayout
	, redmicConfig
	, declare
	, lang
	, _MultiTemplate
	, HierarchicalImpl
	, TemplateDisplayer
	, ActivityInfoTemplate
	, MeasurementChildListTemplate
	, MeasurementParentListTemplate
	, SiteInfoTemplate
){
	return declare([DetailsLayout, DetailsController], {
		//	summary:
		//		Vista de información para trashCollection.
		//	description:
		//		Permite visualizar la información de los datos de las recolecciones de basura.

		constructor: function(args) {

			this.config = {
				ownChannel: "trashInfo",

				activityInfoTarget: "activityInfo",
				siteInfoTarget: "siteInfo",
				measurementListTarget: "measurementList",

				typeGroupProperty: "dataType",
				_measurementParentType: "parameter",
				_measurementChildType: "measurement"
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.widgetConfigs = this._merge([{
				siteInfo: {
					width: 6,
					height: 2,
					type: TemplateDisplayer,
					props: {
						title: this.i18n.site,
						template: SiteInfoTemplate,
						"class": "containerDetails",
						target: this.siteInfoTarget
					}
				},
				measurementList: {
					width: 6,
					height: 4,
					type: declare([HierarchicalImpl, _MultiTemplate]),
					props: {
						title: this.i18n.measurements,
						target: this.measurementListTarget,
						typeGroupProperty: this.typeGroupProperty
					}
				},
				activityInfo: {
					width: 6,
					height: 6,
					type: TemplateDisplayer,
					props: {
						title: this.i18n.activity,
						"class": "containerDetails",
						target: this.activityInfoTarget,
						template: ActivityInfoTemplate
					}
				}
			}, this.widgetConfigs || {}]);
		},

		_afterShow: function(req) {

			this._updateListTemplates();

			var data = req.data,
				activityInfo = data ? data.activityInfo : null,
				siteInfo = data ? data.siteInfo : null,
				measurementData = data ? data.measurementData : null;

			activityInfo && this._emitEvt('INJECT_DATA', {
				data: activityInfo,
				target: this.activityInfoTarget
			});

			siteInfo && this._emitEvt('INJECT_DATA', {
				data: siteInfo,
				target: this.siteInfoTarget
			});

			if (measurementData) {
				measurementData[0][this.typeGroupProperty] = this._measurementParentType;
				measurementData[1][this.typeGroupProperty] = this._measurementChildType;

				this._emitEvt('INJECT_DATA', {
					data: measurementData,
					target: this.measurementListTarget
				});
			}
		},

		_updateListTemplates: function() {

			var measurementsInstance = this._widgets.measurementList,
				addTemplateChannel = measurementsInstance.getChannel("ADD_TEMPLATE");

			this._publish(addTemplateChannel, {
				typeGroup: this._measurementParentType,
				template: MeasurementParentListTemplate
			});

			this._publish(addTemplateChannel, {
				typeGroup: this._measurementChildType,
				template: MeasurementChildListTemplate
			});
		}
	});
});
