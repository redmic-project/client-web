define([
	"app/components/steps/MainDataStep"
	, "app/components/steps/RecoverySetStep"
	, "app/components/steps/SpecimenTagSetStep"
	, "app/designs/edition/Controller"
	, "app/designs/edition/Layout"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function(
	AnimalMainDataStep
	, RecoverySetStep
	, SpecimenTagSetStep
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
){
	return declare([Layout, Controller], {
		//	summary:
		//		Vista de edición de Animal.
		//	description:
		//		Muestra el wizard para la edición de un animal.
		//
		//	propsToClean: Array
		// 		Lista de propiedades a limpiar cuando se realiza una copia.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.animal,
				propsToClean: ["code", "id"]
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.editorConfig = this._merge([{
				title: this.i18n.newAnimal,
				editionTitle: {
					primary: this.i18n.editAnimal,
					secondary: "{name}"
				},
				modelTarget: this.target,
				steps: [{
					definition: AnimalMainDataStep,
					props: {
						formTemplate: "administrative/views/templates/forms/Animal",
						label: this.i18n.animal
					}
				},{
					definition: RecoverySetStep,
					props: {
						propertyName: 'recoveries'
					},
					skippable: true
				},{
					definition: SpecimenTagSetStep,
					props: {
						propertyName: 'specimenTags'
					},
					skippable: true
				}]
			}, this.editorConfig || {}]);
		}
	});
});
