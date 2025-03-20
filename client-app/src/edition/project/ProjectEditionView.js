define([
	'app/components/steps/MainDataStep'
	, "app/designs/edition/Controller"
	, "app/designs/edition/Layout"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, 'src/edition/step/ContactSetStep'
	, 'src/edition/step/DocumentSetStep'
	, 'src/edition/step/OrganisationSetStep'
	, 'src/edition/step/PlatformSetStep'
	, 'src/redmicConfig'
], function(
	MainDataStep
	, Controller
	, Layout
	, declare
	, lang
	, ContactSetStep
	, DocumentSetStep
	, OrganisationSetStep
	, PlatformSetStep
	, redmicConfig
) {

	return declare([Layout, Controller], {
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
				propsToClean: ['code', 'id', 'contacts.{i}.id', 'organisations.{i}.id', 'documents.{i}.id',
					'platforms.{i}.id']
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
					definition: MainDataStep,
					props: {
						formTemplate: "administrative/views/templates/forms/Project",
						label: this.i18n.project
					}
				},{
					definition: DocumentSetStep,
					skippable: true,
					props: {
						propertyName: 'documents'
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
				},{
					definition: PlatformSetStep,
					props: {
						propertyName: 'platforms'
					},
					skippable: true
				}]
			}, this.editorConfig || {}]);
		}

	});
});
