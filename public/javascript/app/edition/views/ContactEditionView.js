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
	, ContactMainDataStep
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
){
	return declare([_View, Layout, Controller], {
		//	summary:
		//		Vista de edición de Contact.
		//	description:
		//		Muestra el wizard para la edición de un Contacto

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.contact
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.editorConfig = this._merge([{
				title: this.i18n.newContact,
				editionTitle: {
					primary: this.i18n.editContact,
					secondary: "{firstName} {surname}"
				},
				modelTarget: this.target,
				steps: [{
					definition: ContactMainDataStep,
					props: {
						formTemplate: "administrative/views/templates/forms/Contact",
						label: this.i18n.contact
					}
				}]
			}, this.editorConfig || {}]);
		}

	});
});
