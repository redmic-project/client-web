define([
	'alertify/alertify.min'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Module"
], function(
	alertify
	, declare
	, lang
	, _Module
){
	return declare(_Module, {
		//	summary:
		//		Módulo encargado de procesar las notificaciones de los demás.
		//	description:
		//

		//	config: Object
		//		Opciones por defecto.

		constructor: function(args) {

			this.config = {
				actions: {
					ERROR: "error",
					COMMUNICATION_SEND: "communicationSend",
					NOTIFICATION_DELETE: "notificationDelete"
				},
				events: {
					COMMUNICATION_SEND: "communicationSend",
					NOTIFICATION_DELETE: "notificationDelete"
				},
				ownChannel: "communicationCenter"
			};

			lang.mixin(this, this.config, args);
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this._buildChannel(this.communicationChannel, this.actions.COMMUNICATION),
				callback: "_subCommunication"
			},{
				channel : this._buildChannel(this.communicationChannel, this.actions.COMMUNICATION_DELETE),
				callback: "_subCommunicationDelete"
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'COMMUNICATION_SEND',
				channel: this._buildChannel(this.notificationChannel, this.actions.COMMUNICATION_SEND)
			},{
				event: 'COMMUNICATION_SEND',
				channel: this._buildChannel(this.alertChannel,  this.actions.COMMUNICATION_SEND)
			},{
				event: 'NOTIFICATION_DELETE',
				channel: this._buildChannel(this.notificationChannel, this.actions.NOTIFICATION_DELETE)
			});
		},

		_subCommunication: function(/*Object*/ communication) {

			this._emitEvt('COMMUNICATION_SEND', communication);
		},

		_subCommunicationDelete: function(request) {

			this._emitEvt('NOTIFICATION_DELETE', request);
		}
	});
});
