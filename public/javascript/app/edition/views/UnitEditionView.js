define([
	"app/base/views/_View"
	, "app/components/steps/MainDataStep"
	, "app/maintenance/domains/observations/views/UnitTypesView"
	, "app/designs/edition/Controller"
	, "app/designs/edition/Layout"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/layout/wizard/_CompleteBySelection"
], function(
	_View
	, MainDataStep
	, UnitType
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
	, _CompleteBySelection
){
	return declare([_View, Layout, Controller], {
		//	summary:
		//		Vista de edición de Unit.
		//	description:
		//		Muestra el wizard para la edición de una Unidad
		//
		//	propsToClean: Array
		// 		Lista de propiedades a limpiar cuando se realiza una copia.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.unit,
				propsToClean: ["code", "id"]
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.editorConfig = this._merge([{
				title: this.i18n.newUnit,
				editionTitle: {
					primary: this.i18n.editUnit,
					secondary: "{name}"
				},
				modelTarget: this.target,
				steps: [{
					definition: declare([UnitType, _CompleteBySelection]),
					noEditable: true,
					props: {
						// WizardStep params
						label: this.i18n.unitType,
						propertyName: "unitType"
					}
				},{
					definition: MainDataStep,
					props: {
						formTemplate: "administrative/views/templates/forms/Unit",
						label: this.i18n.unit
					}
				}]
			}, this.editorConfig || {}]);
		}

	});
});
