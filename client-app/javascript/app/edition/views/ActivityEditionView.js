define([
	"app/maintenance/domains/admin/views/ActivityTypesView"
	, "app/components/steps/ContactSetStep"
	, "app/components/steps/DocumentSetStep"
	, "app/components/steps/EmbeddedContentSetStep"
	, "app/components/steps/MainDataStep"
	, "app/components/steps/OrganisationSetStep"
	, "app/components/steps/PlatformSetStep"
	, "app/components/steps/ResourceSetStep"
	, "app/designs/edition/Controller"
	, "app/designs/edition/Layout"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/layout/wizard/_CompleteBySelection"
], function(
	ActivityType
	, ContactSetStep
	, DocumentSetStep
	, EmbeddedContentSetStep
	, ActivityMainDataStep
	, OrganisationSetStep
	, PlatformSetStep
	, ResourceSetStep
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
	, _CompleteBySelection
){
	return declare([Layout, Controller], {
		//	summary:
		//		Vista de edición de Activity.
		//	description:
		//		Muestra el wizard para la edición de una Actividad
		//
		//	propsToClean: Array
		// 		Lista de propiedades a limpiar cuando se realiza una copia.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.activity,
				propsToClean: [
					'code', 'id', 'contacts.{i}.id', 'organisations.{i}.id', 'documents.{i}.id', 'platforms.{i}.id',
					'resources.{i}.id'
				]
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.editorConfig = this._merge([{
				title: this.i18n.newActivity,
				editionTitle: {
					primary: this.i18n.editActivity,
					secondary: "{name}"
				},
				modelTarget: this.target,
				steps: [{
					definition: declare([ActivityType, _CompleteBySelection]),
					noEditable: true,
					props: {
						label: this.i18n.activityType,
						propertyName: 'activityType'
					}
				},{
					definition: ActivityMainDataStep,
					props: {
						formTemplate: "administrative/views/templates/forms/Activity",
						label: this.i18n.activity
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
				},{
					definition: DocumentSetStep,
					skippable: true,
					props: {
						propertyName: 'documents'
					}
				},{
					definition: ResourceSetStep,
					props: {
						propertyName: 'resources'
					},
					skippable: true
				},{
					definition: EmbeddedContentSetStep,
					props: {
						propertyName: 'embeddedContents'
					},
					skippable: true
				}]
			}, this.editorConfig || {}]);
		}
	});
});
