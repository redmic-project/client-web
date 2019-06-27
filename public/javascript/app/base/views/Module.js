define([
	"dojo/_base/declare"
	, "dijit/_WidgetBase"
	, "dijit/_TemplatedMixin"
	, "dojo/_base/lang"
], function(
	declare
	, _WidgetBase
	, _TemplatedMixin
	, lang
) {		return declare([_WidgetBase, _TemplatedMixin], {
		//	summary:
		//		Widget para la creación de un elemento boton
		//
		// description:
		//

		//	templateString: [readonly const] String
		//		Html template obtenido de la variable template ["dojo/text!./templates/Module.html"]

		// name: String
		// 	Nombre del módulo
		name: null,

		// icon: String
		//		Nombre del icono
		icon: null,

		// descritpion: String
		description: null,

		// url: String
		// 	Url del módulo
		url: null,

		// cols: String
		// 	Clases correspondientes al griding por columnas
		cols: "col-xs-12 col-sm-6 col-md-4 col-lg-4",

		constructor: function(args){

			lang.mixin(this, args);

			if(this.domain) {
				this.templateString = "<a class='" + this.cols + " boxButton' href='" + this.url +
					"' d-state-url=true>" + "<div class='name mediumTexturedContainer colorWhite'>" + this.name + "</div></a>";
			} else {
				this.templateString = "<a title='" + this.name +
					"' class='module' href='" + this.url + "' d-state-url=true>" +
					"<div class='button mediumTexturedContainer colorWhite'>" +
					"<i class='" + this.icon + " iconModule'></i><div class='name'>" + this.name + "</div></div></a>";
			}
		}
	});
});
