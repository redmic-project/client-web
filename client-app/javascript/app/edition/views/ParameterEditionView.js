define([
	"app/maintenance/domains/observations/views/ParameterTypesView"
	, "app/components/steps/MainDataStep"
	, "app/components/steps/UnitSetStep"
	, "app/designs/edition/Controller"
	, "app/designs/edition/Layout"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/layout/wizard/_CompleteBySelection"
], function(
	ParameterType
	, ParameterMainDataStep
	, UnitSetStep
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
	, _CompleteBySelection
){
	return declare([Layout, Controller], {
		//	summary:
		//		Vista de edición de Parameter.
		//	description:
		//		Muestra el wizard para la edición de un parametro
		//
		//	propsToClean: Array
		// 		Lista de propiedades a limpiar cuando se realiza una copia.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.parameter,
				idProperty: "id",
				propsToClean: ["code", "id"]
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.editorConfig = this._merge([{
				title: this.i18n.newParameter,
				editionTitle: {
					primary: this.i18n.editParameter,
					secondary: "{name}"
				},
				modelTarget: this.target,
				steps: [{
					definition: declare([ParameterType, _CompleteBySelection]),
					noEditable: true,
					props: {
						// WizardStep params
						label: this.i18n.parameterType,
						propertyName: "parameterType"
					}
				},{
					definition: ParameterMainDataStep,
					props: {
						formTemplate: "administrative/views/templates/forms/Parameter",
						label: this.i18n.parameter
					}
				},{
					definition: UnitSetStep,
					props: {
						propertyName: 'units'
					}
				}]
			}, this.editorConfig || {}]);
		}
	});
});
