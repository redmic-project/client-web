define([
	"app/maintenance/domains/observations/views/MetricGroupsView"
	, "app/administrative/views/DeviceView"
	, "app/components/steps/MainDataStep"
	, "app/designs/edition/Controller"
	, "app/designs/edition/Layout"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/layout/wizard/_CompleteBySelection"
], function(
	MetricGroup
	, DeviceView
	, MainDataStep
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
	, _CompleteBySelection
){
	return declare([Layout, Controller], {
		//	summary:
		//		Vista de edición de metricsDefinition.
		//	description:
		//		Muestra el wizard para la edición de una Unidad
		//
		//	propsToClean: Array
		// 		Lista de propiedades a limpiar cuando se realiza una copia.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.metricsDefinition,
				propsToClean: ["id"]
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.editorConfig = this._merge([{
				title: this.i18n.newMetricsDefinition,
				editionTitle: this.i18n.editMetricsDefinition,
				modelTarget: this.target,
				steps: [{
					definition: declare([MetricGroup, _CompleteBySelection]),
					noEditable: true,
					props: {
						// WizardStep params
						label: this.i18n.metricGroup,
						propertyName: "metricGroup"
					}
				},{
					definition: declare([DeviceView, _CompleteBySelection]),
					noEditable: true,
					props: {
						// WizardStep params
						label: this.i18n.device,
						propertyName: "device"
					}
				},{
					definition: MainDataStep,
					props: {
						formTemplate: "administrative/views/templates/forms/MetricsDefinition",
						label: this.i18n.metricsDefinition
					}
				}]
			}, this.editorConfig || {}]);
		}

	});
});
