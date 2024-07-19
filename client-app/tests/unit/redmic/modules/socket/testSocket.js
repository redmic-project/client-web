define([
	"dojo/_base/declare"
	, "dojo/Deferred"
	, "redmic/base/Mediator"
	, "redmic/modules/base/Socket"
], function(
	declare
	, Deferred
	, Mediator
	, Socket
){
	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite("socket tests", {
		before: function() {

			timeout = 200;

		},

		beforeEach: function() {

			socket = new declare(Socket)({
				parentChannel: "parentChannel"
			});

		},

		after: function() {

			Mediator.publish(socket.getChannel("DISCONNECT"));
		},

		tests: {
			"Socket connected": function() {
				var dfd = this.async(timeout);

				setTimeout(dfd.callback(function() {
					assert.ok(socket.stompClient.connected,
					"El socket no se ha conectado correctamente.");
					dfd.resolve();
				}), 100);
			},

			"Socket reconnected": function() {
				var dfd = this.async(timeout);

				setTimeout(function() { // Esperamos a que esté conectado para cerrar el socket
					socket.socket.close();
				}, 100);

				setTimeout(dfd.callback(function() { // Comprueba que se reconecta automáticamente
					assert.ok(socket.stompClient.connected,
					"El socket no se ha reconectado correctamente.");
					dfd.resolve();
				}), 180);
			},

			"Save messages in buffer when socket is closed": function() {
				var dfd = this.async(timeout);

				setTimeout(dfd.callback(function() { // Esperamos a que esté conectado para cerrar el socket
					socket.socket.close();

					var target = "/tasks/activity/report",
						message = JSON.stringify({});

					setTimeout(function() {
						socket._send(target, message);
						assert.equal(socket.bufferMessages.length, 1,
							"El mensaje no se ha almacenado correctamente en el buffer.");
						assert.equal(socket.bufferMessages[0].target, target,
							"El mensaje no es el esperado.");
						assert.equal(socket.bufferMessages[0].message, message,
							"El mensaje no es el esperado.");

					}, 20);
				}), 100);
			}
		}
	});
});