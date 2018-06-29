define([
	"app/base/views/_View"
	, "app/components/steps/ContactSetStep"
	, "app/components/steps/DocumentSetStep"
	, "app/components/steps/MainDataStep"
	, "app/components/steps/OrganisationSetStep"
	//, "app/components/steps/PlatformSetStep"
	, "app/designs/edition/Controller"
	, "app/designs/edition/Layout"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function(
	_View
	, ContactSetStep
	, DocumentSetStep
	, ProgramMainDataStep
	, OrganisationSetStep
	//, PlatformSetStep
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
){
	return declare([_View, Layout, Controller], {
		//	summary:
		//		Vista de edición de Program.
		//	description:
		//		Muestra el wizard para la edición de un Programa
		//
		//	propsToClean: Array
		// 		Lista de propiedades a limpiar cuando se realiza una copia.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.program,
				propsToClean: ["code", "id"]
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.editorConfig = this._merge([{
				title: this.i18n.newProgram,
				editionTitle: {
					primary: this.i18n.editProgram,
					secondary: "{name}"
				},
				modelTarget: this.target,
				steps: [{
					definition: ProgramMainDataStep,
					props: {
						formTemplate: "administrative/views/templates/forms/Program",
						label: this.i18n.program
					}
				},{
					definition: OrganisationSetStep,
					props: {
						propertyName: 'organisations'
					},
					skippable: true
				},{
					definition: ContactSetStep,
					props: {
						propertyName: 'contacts'
					},
					skippable: true
				}/*,{
					definition: PlatformSetStep,
					props: {
						propertyName: 'platforms'
					},
					skippable: true
				}*/,{
					definition: DocumentSetStep,
					props: {
						propertyName: 'documents'
					},
					skippable: true
				}]
			}, this.editorConfig || {}]);
		}

	});
});
