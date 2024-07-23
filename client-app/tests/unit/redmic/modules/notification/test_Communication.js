define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/notification/CommunicationCenter"
	, "src/component/notification/Alert"
	, "src/component/notification/Notification"
	, "src/utils/Mediator"
], function(
	declare
	, lang
	, CommunicationCenter
	, Alert
	, Notification
	, Mediator
){
	var communicationCenter, notification, alert;

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite("Communication Center, notification and alert tests", {
		before: function() {

			communicationCenter = new declare(CommunicationCenter)({});
			notification = new declare(Notification)({
				ownChannel: communicationCenter.notificationChannel
			});
			alert = new declare(Alert)({
				ownChannel: communicationCenter.alertChannel
			});
		},

		tests: {
			"creations modules": function() {

				assert.ok(communicationCenter);
				assert.ok(notification);
				assert.ok(alert);
			},

			"new Communication": function() {

				communicationCenter.on(communicationCenter.events.COMMUNICATION_SEND, function(obj) {
					assert.equal(obj.success, true);
				});

				Mediator.publish(communicationCenter.getChannel(), {success: true});
			},

			"new alert": function() {

				alert = new declare(Alert)({
					ownChannel: communicationCenter.alertChannel,
					_subAlert: function(obj) {
						assert.equal(obj.success, true);
					}
				});

				Mediator.publish(communicationCenter.getChannel(), {success: true});
			},

			"new Notification": function() {

				notification = new declare(Notification)({
					ownChannel: communicationCenter.notificationChannel,
					_subNotification: function(obj) {
						assert.equal(obj.success, true);
					}
				});

				Mediator.publish(communicationCenter.getChannel(), {success: true});
			}
		}
	});
});
