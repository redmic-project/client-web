define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/store/Persistence"
	, "redmic/base/Mediator"
], function(
	declare
	, lang
	, Persistence
	, Mediator
){
	var timeout, persistence;

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite("Persistence tests", {
		before: function() {

			timeout = 100;

			persistence = new Persistence({
				parentChannel: ""
			});
		},

		afterEach: function() {

		},

		after: function() {
			Mediator.publish(persistence.getChannel("DISCONNECT"), {});
		},

		tests: {
			"Create test": function() {
				assert.ok(persistence.actions, "No se ha creado bien el módulo de persistencia");
				assert.ok(persistence.events, "No se ha creado bien el módulo de persistencia");
			},

			"save": function() {
				var dfd = this.async(timeout);
				Mediator.once(persistence.getChannel("ADD"),
					dfd.callback(function(request) {
						assert.equal(request.item.id, 1, "No se recibió el id enviado.");
						assert.deepEqual(request.target, "/tests/contacts/", "No se recibió el target enviado.");
				}));

				Mediator.publish(persistence.getChannel("ADD"), {target: "/tests/contacts/", idProperty: "id", item: {id: 1, name: "prueba"}});
			},

			"remove": function() {

				var dfd = this.async(timeout);
				Mediator.once(persistence.getChannel("REMOVE"),
					dfd.callback(function(request) {
						assert.equal(request.id, 1, "No se recibió el id enviado.");
						assert.deepEqual(request.target, "/tests/contacts/", "No se recibió el target enviado.");
				}));

				Mediator.publish(persistence.getChannel("REMOVE"), {target: "/tests/contacts/", id: 1});
			}
		}
	});
});
