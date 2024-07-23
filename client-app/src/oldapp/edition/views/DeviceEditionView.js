define([
	"app/maintenance/domains/admin/views/DeviceTypesView"
	, "app/components/steps/CalibrationSetStep"
	, "app/components/steps/MainDataStep"
	, "app/designs/edition/Controller"
	, "app/designs/edition/Layout"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/layout/wizard/_CompleteBySelection"
], function(
	DeviceType
	, CalibrationSetStep
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
		//		Vista de edición de device.
		//	description:
		//		Muestra el wizard para la edición de un device
		//
		//	propsToClean: Array
		// 		Lista de propiedades a limpiar cuando se realiza una copia.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.device,
				propsToClean: ["code", "id"]
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.editorConfig = this._merge([{
				title: this.i18n.newDevice,
				editionTitle: {
					primary: this.i18n.editDevice,
					secondary: "{name}"
				},
				modelTarget: this.target,
				steps: [{
					definition: declare([DeviceType, _CompleteBySelection]),
					noEditable: true,
					props: {
						// WizardStep params
						label: this.i18n.deviceType,
						propertyName: "deviceType"
					}
				},{
					definition: MainDataStep,
					props: {
						formTemplate: "administrative/views/templates/forms/Device",
						label: this.i18n.device
					}
				},{
					definition: CalibrationSetStep,
					skippable: true,
					props: {
						propertyName: "calibrations"
					}
				}]
			}, this.editorConfig || {}]);
		}
	});
});
