define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/base/Mediator"
	, "redmic/modules/store/MasterStore"

], function(
	declare
	, lang
	, Mediator
	, MasterStore
){
	var timeout, masterStore;

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite("MasterStore tests", {
		before: function() {
			timeout = 100;
			masterStore = new MasterStore({
				parentChannel: "app"
			});
		},

		after: function() {
			Mediator.publish(masterStore.getChannel("DISCONNECT"));
		},

		tests: {
			"Creation": function() {
				//assert.ok(masterStore.collection, "La colección no se ha creado correctamente.");
			},

			"Subscribe get data by id ": function() {
				var dfd = this.async(timeout);
				Mediator.once(masterStore.getChannel("GET"),
					dfd.callback(function(request) {
						assert.equal(request.id, 1, "No se recibió el id enviado.");
						assert.deepEqual(request.target, "https://redmic.local/test/contacts/",
							"No se recibió el target enviado.");
				}));
				Mediator.publish(masterStore.getChannel("GET"),
					{options: {}, target: "https://redmic.local/test/contacts/", id: 1});
			},

			"Publish item available": function() {
				var dfd = this.async(timeout);
				Mediator.once(masterStore.getChannel("ITEM_AVAILABLE"),
					dfd.callback(function(response) {
						assert.equal(response.body.data.id, 1, "El primer item debe tener id 1.");
				}));
				Mediator.publish(masterStore.getChannel("GET"),
					{options: {}, target: "https://redmic.local/test/contacts/", id: 1});
			},

			"Subscribe request data with query empty and pagination ": function() {
				var dfd = this.async(timeout);
				Mediator.once(masterStore.getChannel("REQUEST"), dfd.callback(function(request) {
					assert.deepEqual(request.query, {}, "No se recibió la query enviada.");
					assert.deepEqual(request.target, "https://redmic.local/test/contacts/",
						"No se recibió el target enviado.");
				}));
				Mediator.publish(masterStore.getChannel("REQUEST"), {query: {}, options: {},
					target: "https://redmic.local/test/contacts/"});
			},

			"Publish available data with pagination 2 items": function() {
				var dfd = this.async(timeout);
				Mediator.once(masterStore.getChannel("AVAILABLE"), dfd.callback(function(response) {
					assert.equal(response.body.data[0].id, 1, "El primer item debe tener id 1.");
					assert.equal(response.body.data[1].id, 2, "El segundo item debe tener id 2.");
					assert.equal(response.body.data.length, 2, "No se recibieron los datos esperados.");
				}));
				Mediator.publish(masterStore.getChannel("REQUEST"), {query: {}, options: {start:1, count:2},
					target: "https://redmic.local/test/contacts/"});
			},

			"Request data with error by global error channel (Timeout - wrong target)": function() {
				var dfd = this.async(timeout);
				Mediator.once(masterStore.errorChannel, dfd.callback(function(item) {
					assert.isNotNull(item.error, "No se emitió el error correctamente");
				}));
				Mediator.publish(masterStore.getChannel("REQUEST"), {query: {}, options: {},
					target: "https://redmic.local/test/contact/"});
			},

			"Request data with error by local error channel (Timeout - wrong target)": function() {
				var dfd = this.async(timeout);
				Mediator.once(masterStore.errorChannel, dfd.callback(function(item) {
					assert.isNotNull(item.error, "No se emitió el error correctamente");
				}));
				Mediator.publish(masterStore.getChannel("REQUEST"), {query: {}, options: {},
					target: "https://redmic.local/test/contact/"});
			}
		}
	});

});
