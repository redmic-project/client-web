define([
	'alertify'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/Deferred"
], function(
	alertify
	, declare
	, lang
	, Deferred
){
	return declare(null, {
		//	summary:
		//		Extensión para las vistas que desean realizar acciones al ser cerradas.
		//	description:
		//		Añade funcionalidades de interceptar su cierre a la vista.


		_subHide: function() {

			var dfd = new Deferred(),
				closeMessage = this.i18n.closeMessage;

			alertify.confirm(this.i18n.closeActivityConfirmationTitle, this.i18n.closeActivityConfirmationMessage,
				lang.hitch(this, this._closeConfirmed, dfd),
				lang.hitch(this, this._closeCancelled, dfd)).set("labels", {
					ok: this.i18n.ok,
					cancel: this.i18n.cancel
				});

			dfd.then(lang.hitch(this, this.inherited, arguments));
		},

		_closeConfirmed: function(dfd) {
			//	summary:
			//		Acciones a realizar cuando se confirma el cierre de la vista.
			//		Al sobreescribirlo, no olvidar resolver el dfd (directamente
			//		o llamando a this.inherited).
			//	tags:
			//		private
			//	dfd:
			//		Deferred para continuar con el cierre de la vista.

			dfd.resolve();
		},

		_closeCancelled: function(dfd) {
			//	summary:
			//		Acciones a realizar cuando se cancela el cierre de la vista.
			//		Al sobreescribirlo, no olvidar rechazar el dfd (directamente
			//		o llamando a this.inherited).
			//	tags:
			//		private
			//	dfd:
			//		Deferred para continuar con el cierre de la vista.

			dfd.reject();
		}
	});
});
