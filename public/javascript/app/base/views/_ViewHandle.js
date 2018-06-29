define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "dojo/topic"
],
function(
	declare
	, lang
	, aspect
	, topic
){
	return declare(null, {
		//	summary:
		//		Controlador de suscripciones para los módulos.
		//	description:
		//		Permite comunicar los módulos con el Manager común a todos.

		//TODO: esto tiene que dejar de usar topic, y ya veremos si se conserva o se elimina

		constructor: function(args) {

			aspect.after(this, "_subShow", lang.hitch(this, this.onEnable));
			aspect.after(this, "_subHide", lang.hitch(this, this.onDisable));
		},

		onEnable: function(/*Object*/ evt) {
			//	summary:
			//		Activa la suscripción del módulo.
			//	evt:
			//		Datos procedentes del evento disparado.

			if (this.mask) {
				if (this.perms < 2) {
					delete this.mask.add;
					delete this.mask.edit;
					delete this.mask.remove;
				}

				topic.publish("/manager/create", this.mask);
				/*if (this.title.length)
					topic.publish("/manager/location", this.title);*/
				// Por defecto se limpia la info del manager
				//topic.publish("/manager/info", "");
			}

			if ((!this.handleSubs) || ((this.handleSubs) && (!this.handleSubs.advice))) {
			this.handleSubs = topic.subscribe("/manager/event", lang.hitch(this, function(args){
				if(this[args.action])
					this[args.action](args.args);
				}));
			}
		},

		onDisable: function(/*Object*/ evt) {
			//	summary:
			//		Desactiva la suscripción del módulo.
			//	evt:
			//		Datos procedentes del evento disparado.

			this.handleSubs && this.handleSubs.remove();
		}

	});
});
