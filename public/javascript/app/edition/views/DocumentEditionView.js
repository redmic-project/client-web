define([
	"app/components/steps/MainDataStep"
	, "app/designs/edition/Controller"
	, "app/designs/edition/Layout"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function(
	DocumentMainDataStep
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
) {

	return declare([Layout, Controller], {
		//	summary:
		//		Vista de edición de Document.
		//	description:
		//		Muestra el wizard para la edición de un Document
		//
		//	propsToClean: Array
		//		Lista de propiedades a limpiar cuando se realiza una copia.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.document,
				propsToClean: ["code", "id"]
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.editorConfig = this._merge([{
				title: this.i18n.newDocument,
				editionTitle: {
					primary: this.i18n.editDocument,
					secondary: "{title}"
				},
				modelTarget: this.target,
				steps: [{
					definition: DocumentMainDataStep,
					props: {
						formTemplate: "administrative/views/templates/forms/Document",
						label: this.i18n.document
					}
				}]
			}, this.editorConfig || {}]);
		}
	});
});
