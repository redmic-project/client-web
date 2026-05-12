define([
	'dojo/_base/declare'
	, 'src/component/base/_Module'
], function(
	declare
	, _Module
) {

	return declare(_Module, {
		// summary:
		//   Módulo encargado de procesar las notificaciones de los demás.

		postMixInProperties: function() {

			const defaultConfig = {
				ownChannel: 'communicationCenter',
				actions: {
					ERROR: 'error',
					COMMUNICATION_SEND: 'communicationSend',
					NOTIFICATION_DELETE: 'notificationDelete'
				},
				events: {
					COMMUNICATION_SEND: 'communicationSend',
					NOTIFICATION_DELETE: 'notificationDelete'
				}
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this._buildChannel(this.communicationChannel, 'COMMUNICATION'),
				callback: '_subCommunication'
			},{
				channel : this._buildChannel(this.communicationChannel, 'COMMUNICATION_DELETE'),
				callback: '_subCommunicationDelete'
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'COMMUNICATION_SEND',
				channel: this._buildChannel(this.notificationChannel, 'COMMUNICATION_SEND')
			},{
				event: 'COMMUNICATION_SEND',
				channel: this._buildChannel(this.alertChannel, 'COMMUNICATION_SEND')
			},{
				event: 'NOTIFICATION_DELETE',
				channel: this._buildChannel(this.notificationChannel, 'NOTIFICATION_DELETE')
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
