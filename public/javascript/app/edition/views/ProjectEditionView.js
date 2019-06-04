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
	, ProjectMainDataStep
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
		//		Vista de edición de Project.
		//	description:
		//		Muestra el wizard para la edición de un Proyecto
		//
		//	propsToClean: Array
		// 		Lista de propiedades a limpiar cuando se realiza una copia.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.project,
				propsToClean: ['code', 'id', 'contacts.{i}.id', 'organisations.{i}.id', 'documents.{i}.id']
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.editorConfig = this._merge([{
				title: this.i18n.newProject,
				editionTitle: {
					primary: this.i18n.editProject,
					secondary: "{name}"
				},
				modelTarget: this.target,
				steps: [{
					definition: ProjectMainDataStep,
					props: {
						formTemplate: "administrative/views/templates/forms/Project",
						label: this.i18n.project
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
