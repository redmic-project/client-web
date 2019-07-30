define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, 'put-selector/put'
], function(
	declare
	, lang
	, put
) {

	return declare(null, {
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


		constructor: function(args) {

			lang.mixin(this, args);

			var item;
			if (this.domain) {
				this.moduleNode = put('a.boxButton[href="' + this.url + '"][d-state-url=true]');
				item = put(this.moduleNode, 'div.name.mediumSolidContainer.colorWhite');
				put(item, 'span', this.name);
			} else {
				this.moduleNode = put('a.module[title="' + this.name + '"][href="' + this.url + '"][d-state-url=true]');
				item = put(this.moduleNode, 'div.button.mediumSolidContainer.colorWhite');
				put(item, 'i.iconModule.' + this.icon.replace(/\ /g, '.'));
				put(item, 'div.name', this.name);
			}
		},

		// TODO reemplazo de método de Dijit, eliminar si deja de usarse
		placeAt: function(node) {

			put(node, this.moduleNode);
		}
	});
});
