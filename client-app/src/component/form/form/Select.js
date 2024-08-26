define([
	"dijit/form/Select"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/text!./templates/Select.html"
], function(
	Selectt
	, declare
	, lang
	, template
){
	return declare(Selectt, {
		// summary:
		// 	Widget para sobreescribir dijit/form/Select.
		// description:
		// 	Cambiamos la plantilla para dejar de usar tablas y demás morralla.
		//
		// 	Author: Pedro E. Trujillo Brito
		// 	<br>
		// 	Last update: 26/11/2014 - Pedro
		//

		// config: Object
		// 	Opciones y asignaciones por defecto.
		// templateString: String
		// 	Plantilla del widget.


		constructor: function(/*Object*/ args) {

			this.config = {
				templateString: template
			};

			lang.mixin(this, this.config, args);
		}

	});
});
