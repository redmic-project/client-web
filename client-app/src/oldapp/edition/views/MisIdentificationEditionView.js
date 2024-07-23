define([
	"app/viewers/views/BibliographyView"
	, "app/catalog/views/SpeciesCatalogView"
	, "app/components/steps/CitationStep"
	, "app/components/steps/MainDataStep"
	, "app/components/steps/DocumentStepFiltered"
	, "app/designs/edition/Controller"
	, "app/designs/edition/Layout"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/layout/wizard/_CompleteBySelection"
], function(
	DocumentView
	, SpeciesView
	, CitationStep
	, MainDataStep
	, DocumentStepFiltered
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
		//		Muestra el wizard para la edición de una Unidad
		//
		//	propsToClean: Array
		// 		Lista de propiedades a limpiar cuando se realiza una copia.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.misidentification,
				propsToClean: ["id"]
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.editorConfig = this._merge([{
				title: this.i18n.misidentificationAdd,
				editionTitle: {
					primary: this.i18n.misidentificationEdit,
					secondary: "{badIdentity.scientificName}"
				},
				modelTarget: this.target,
				steps: [{
					definition: DocumentStepFiltered,
					props: {
						// WizardStep params
						label: this.i18n.speciesInvalid
					}
				},{
					definition: CitationStep,
					props: {
						// WizardStep params
						label: this.i18n.citationsIncorrect,
						propertyName: "citations"
					}
				},{
					definition: declare([DocumentView, _CompleteBySelection]),
					props: {
						// WizardStep params
						label: this.i18n.correctionDocument,
						propertyName: "document",
						title: this.i18n.selectDocument,
						facetsConfig: {
							aggs: redmicConfig.aggregations.document,
							openFacets: false
						}
					}
				},{
					definition: declare([SpeciesView, _CompleteBySelection]),
					props: {
						// WizardStep params
						label: this.i18n.speciesValid,
						title: this.i18n.selectSpecies,
						propertyName: "taxon"
					}
				},{
					definition: MainDataStep,
					props: {
						formTemplate: "administrative/taxonomy/views/templates/forms/MisIdentification",
						label: this.i18n.note
					},
					skippable: true
				}]
			}, this.editorConfig || {}]);
		}
	});
});
