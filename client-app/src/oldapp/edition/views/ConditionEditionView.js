define([
	"app/maintenance/domains/observations/views/AttributeTypesView"
	, "app/components/steps/MainDataStep"
	, "app/designs/edition/Controller"
	, "app/designs/edition/Layout"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/layout/wizard/_CompleteBySelection"
], function(
	AttributeType
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
		//		Vista de edición de condition.
		//	description:
		//		Muestra el wizard para la edición de una Condition
		//
		//	propsToClean: Array
		// 		Lista de propiedades a limpiar cuando se realiza una copia.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.condition,
				propsToClean: ["id"]
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.editorConfig = this._merge([{
				title: this.i18n.newCondition,
				editionTitle: {
					primary: this.i18n.editCondition,
					secondary: "{name}"
				},
				modelTarget: this.target,
				steps: [{
					definition: declare([AttributeType, _CompleteBySelection]),
					noEditable: true,
					props: {
						// WizardStep params
						label: this.i18n.attributeType,
						propertyName: "attributeType"
					}
				},{
					definition: MainDataStep,
					props: {
						formTemplate: "administrative/views/templates/forms/Condition",
						label: this.i18n.condition
					}
				}]
			}, this.editorConfig || {}]);
		}
	});
});
