define([
	'alertify'
	, 'dojo/_base/declare'
	, 'src/component/base/_Module'
], function(
	alertify
	, declare
	, _Module
) {

	return declare(_Module, {
		// summary:
		//   Módulo encargado de procesar las alerts de los demás.

		postMixInProperties: function() {

			const defaultConfig = {
				ownChannel: 'alert',
				actions: {
					ERROR: 'error',
					COMMUNICATION_SEND: 'communicationSend'
				},
				typesAvailable: ['warning', 'message', 'error', 'success'],
				timeout: 5
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel('COMMUNICATION_SEND'),
				callback: '_subAlert',
				options: {
					predicate: communication => communication.type === 'alert' || communication.showAlert
				}
			});
		},

		_subAlert: function(/*Object*/ alert) {

			const alertDescription = alert.description ?? '',
				alertType = this.typesAvailable.includes(alert.level) ? alert.level : 'message',
				alertTimeout = alert.timeout >= 0 ? alert.timeout : this.timeout,
				alertCallback = alert.callback ?? null;

			if (alert.position) {
				alertify.set('notifier', 'position', alert.position);
			}

			alertify.notify(alertDescription, alertType, alertTimeout, alertCallback);
		}
	});
});
