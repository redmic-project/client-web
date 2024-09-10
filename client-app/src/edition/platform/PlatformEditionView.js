define([
	"app/components/steps/MainDataStep"
	, "app/designs/edition/Controller"
	, "app/designs/edition/Layout"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, 'src/edition/step/ContactSetStep'
	, 'src/redmicConfig'
], function(
	MainDataStep
	, Controller
	, Layout
	, declare
	, lang
	, ContactSetStep
	, redmicConfig
) {

	return declare([Layout, Controller], {
		//	summary:
		//		Vista de edición de Platform.
		//	description:
		//		Muestra el wizard para la edición de una Plataforma
		//
		//	propsToClean: Array
		// 		Lista de propiedades a limpiar cuando se realiza una copia.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.platform,
				propsToClean: ["code", "id"]
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.editorConfig = this._merge([{
				title: this.i18n.newPlatform,
				editionTitle: {
					primary: this.i18n.editPlatform,
					secondary: "{name}"
				},
				modelTarget: this.target,
				steps: [{
					definition: MainDataStep,
					props: {
						formTemplate: "administrative/views/templates/forms/Platform",
						label: this.i18n.platform
					}
				},{
					definition: ContactSetStep,
					props: {
						propertyName: 'contacts'
					},
					skippable: true
				}]
			}, this.editorConfig || {}]);
		}

	});
});
