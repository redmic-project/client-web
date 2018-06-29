define([
	"dijit/_TemplatedMixin"
	, "dijit/_WidgetBase"
	, "dijit/_WidgetsInTemplateMixin"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/text!./templates/NoSupportBrowser.html"
	, "dojo/i18n!./nls/translation"
], function(
	_TemplatedMixin
	, _WidgetBase
	, _WidgetsInTemplateMixin
	, declare
	, lang
	, template
	, i18n
){
	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		//	summary:
		//		Widget para cuando el navegador no soporta la aplicación.
		//
		// description:
		//		Contiene enlace a la actualización de los navegadores

		//	templateString: [readonly const] String
		//		Html template obtenido de la variable template ["dojo/text!./templates/NoSupportBrowser.html"]


		constructor: function (args) {

			this.config = {
				templateString: template,
				i18n: i18n
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);
		}

	});
});
