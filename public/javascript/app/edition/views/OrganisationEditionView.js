define([
	"app/base/views/_View"
	, "app/components/steps/MainDataStep"
	, "app/designs/edition/Controller"
	, "app/designs/edition/Layout"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function(
	_View
	, OrganisationMainDataStep
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
){
	return declare([_View, Layout, Controller], {
		//	summary:
		//		Vista de edición de Organisation.
		//	description:
		//		Muestra el wizard para la edición de una Organización

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.organisation
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.editorConfig = this._merge([{
				title: this.i18n.newOrganisation,
				editionTitle: {
					primary: this.i18n.editOrganisation,
					secondary: "{name}"
				},
				modelTarget: this.target,
				steps: [{
					definition: OrganisationMainDataStep,
					props: {
						formTemplate: "administrative/views/templates/forms/Organisation",
						label: this.i18n.organisation
					}
				}]
			}, this.editorConfig || {}]);
		}

	});
});
