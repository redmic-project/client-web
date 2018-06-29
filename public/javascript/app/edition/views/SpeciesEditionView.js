define([
	"app/base/views/_View"
	, "app/components/steps/MainDataStep"
	, "app/components/steps/SpeciesMainDataStep"
	, "app/designs/edition/Controller"
	, "app/designs/edition/Layout"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function(
	_View
	, PeculiarityMainDataStep
	, SpeciesMainDataStep
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
){
	return declare([_View, Layout, Controller], {
		//	summary:
		//		Vista de edición de Species.
		//	description:
		//		Muestra el wizard para la edición de una Specie
		//
		//	propsToClean: Array
		// 		Lista de propiedades a limpiar cuando se realiza una copia.

		constructor: function(args) {

			this.config = {
				target : redmicConfig.services.species
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.editorConfig = this._merge([{
				title: this.i18n.newSpecies,
				editionTitle: {
					primary: this.i18n.editSpecies,
					secondary: "{scientificName}"
				},
				modelTarget: this.target,
				steps: [{
					definition: SpeciesMainDataStep,
					props: {
						label: this.i18n.speciesItem
					}
				},{
					definition: PeculiarityMainDataStep,
					props: {
						formTemplate: "administrative/taxonomy/views/templates/forms/Peculiarity",
						label: this.i18n.peculiarities
					},
					skippable: true
				}]
			}, this.editorConfig || {}]);
		}

	});
});
