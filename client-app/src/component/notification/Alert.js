define([
	'alertify/alertify.min'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/base/_Module"
], function(
	alertify
	, declare
	, lang
	, _Module
){
	return declare(_Module, {
		//	summary:
		//		Módulo encargado de procesar las alerts de los demás.
		//	description:
		//

		//	config: Object
		//		Opciones por defecto.

		constructor: function(args) {

			this.config = {
				actions: {
					ERROR: "error",
					COMMUNICATION_SEND: "communicationSend"
				},
				ownChannel: "alert",
				timeout: 5,
				availableLevel: {
					"warning": true,
					"message": true,
					"error": true,
					"success": true
				}
			};

			lang.mixin(this, this.config, args);
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("COMMUNICATION_SEND"),
				callback: "_subAlert"
			});
		},

		_subAlert: function(/*Object*/ alert) {

			if (!this.availableLevel[alert.level]) {
				alert.level = "message";
			}

			if (alert.type == "alert" || alert.showAlert) {

				var timeout = this.timeout;

				if (alert.timeout >= 0) {
					timeout = alert.timeout;
				}

				if (alert.position) {
					alertify.set('notifier','position', alert.position);
				}

				alertify.notify(alert.description, alert.level, timeout, alert.callback || null);
			}
		}
	});
});
