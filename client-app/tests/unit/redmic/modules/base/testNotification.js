define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/base/Notification"
	, "src/utils/Mediator"
], function(
	declare
	, lang
	, Notification
	, Mediator
){
	var timeout, error;

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite("Notification tests", {
		before: function() {

			timeout = 100;

			notification = new Notification({
				parentChannel: ""
			});

		},

		afterEach: function() {

		},

		after: function() {
			Mediator.publish(notification.getChannel("DISCONNECT"));
		},

		tests: {
			"get WEB error": function() {

				var dfd = this.async(timeout);

				Mediator.once(notification.notificationChannel, dfd.callback(function(obj) {
					assert.equal(obj.description, "Prueba", "No se recibió correctamente el error.");
					assert.equal(obj.level, "log", "No se recibió correctamente el error.");
				}));

				Mediator.publish(notification.notificationChannel, {
					description: "Prueba",
					level: "log"
				});
			},

			"get API success": function() {

				var dfd = this.async(timeout);

				Mediator.once(notification.notificationChannel, dfd.callback(function(obj) {
					assert.equal(obj.level, "success", "No se recibió correctamente el success.");
				}));

				notification.emit(notification.events.NOTIFICATION, notification._generateExternalSuccess("API", {}));
			},

			"get API error": function() {

				var dfd = this.async(timeout);

				Mediator.once(notification.notificationChannel, dfd.callback(function(obj) {
					assert.equal(obj.level, "error", "No se recibió correctamente el error.");
					assert.equal(obj.description, "Prueba", "No se recibió correctamente el error.");
				}));

				notification.emit(notification.events.NOTIFICATION, notification._generateExternalError("API", {description: "Prueba"}));
			}
		}
	});

});
