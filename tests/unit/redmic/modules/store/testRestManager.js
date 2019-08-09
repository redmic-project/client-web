define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/Deferred"
	, "redmic/base/Mediator"
	, "redmic/modules/store/RestManagerImpl"

], function(
	declare
	, lang
	, Deferred
	, Mediator
	, RestManagerImpl
) {

	var timeout, restManager, target, idExample, originalOpenMethod;

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite("RestManager tests", {

		before: function() {

			timeout = 1000000;
			target = "http://localhost";
			idExample = 1;

			restManager = new RestManagerImpl({
				parentChannel: "app"
			});

			var envDfd = new Deferred();
			envDfd.resolve({});
			window.env = envDfd;

			originalOpenMethod = window.XMLHttpRequest.prototype.open;
		},

		afterEach: function() {

			window.XMLHttpRequest.prototype.open = originalOpenMethod;
		},

		after: function() {

			Mediator.publish(restManager.getChannel("DISCONNECT"));
		},

		tests: {
			Should_CreateExternalRequest_When_ReceiveGetRequest: function() {

				var dfd = this.async(timeout);

				window.XMLHttpRequest.prototype.open = dfd.callback(function(method, url) {

					var expectedUrl = target + '/' + idExample;
					assert.strictEqual(url, expectedUrl, "La URL de petición no es la esperada");
				});

				Mediator.publish(restManager.getChannel("GET"), {
					target: target,
					id: idExample
				});
			},

			Should_PublishItemAvailable_When_ReceiveGetResponse: function() {

				var dfd = this.async(timeout),
					getTarget = target + '/' + idExample,
					getReq = {},
					getRes = {
						status: 200,
						response: {
							data: {}
						}
					},
					args = {
						getTarget: getTarget,
						getReq: getReq,
						getRes: getRes
					};

				Mediator.once(restManager.getChannel("ITEM_AVAILABLE"), dfd.callback((function(args, res) {

					assert.strictEqual(res.target, args.getTarget, "La URL de respuesta no es la esperada");
					assert.strictEqual(res.req, args.getReq, "El objeto de petición no es el esperado");
					assert.strictEqual(res.res, args.getRes, "El objeto de respuesta no es el esperado");
				}).bind(null, args)));

				restManager._handleGetSuccess(getTarget, getReq, getRes);
			},

			/*"Subscribe request data with query empty and pagination ": function() {
				var dfd = this.async(timeout);
				Mediator.once(restManager.getChannel("REQUEST"), dfd.callback(function(request) {
					assert.deepEqual(request.query, {}, "No se recibió la query enviada.");
					assert.deepEqual(request.target, "https://redmic.local/test/contacts/",
						"No se recibió el target enviado.");
				}));
				Mediator.publish(restManager.getChannel("REQUEST"), {query: {}, options: {},
					target: "https://redmic.local/test/contacts/"});
			},

			"Publish available data with pagination 2 items": function() {
				var dfd = this.async(timeout);
				Mediator.once(restManager.getChannel("AVAILABLE"), dfd.callback(function(response) {
					assert.equal(response.body.data[0].id, 1, "El primer item debe tener id 1.");
					assert.equal(response.body.data[1].id, 2, "El segundo item debe tener id 2.");
					assert.equal(response.body.data.length, 2, "No se recibieron los datos esperados.");
				}));
				Mediator.publish(restManager.getChannel("REQUEST"), {query: {}, options: {start:1, count:2},
					target: "https://redmic.local/test/contacts/"});
			},

			"Request data with error by global error channel (Timeout - wrong target)": function() {
				var dfd = this.async(timeout);
				Mediator.once(restManager.errorChannel, dfd.callback(function(item) {
					assert.isNotNull(item.error, "No se emitió el error correctamente");
				}));
				Mediator.publish(restManager.getChannel("REQUEST"), {query: {}, options: {},
					target: "https://redmic.local/test/contact/"});
			},

			"Request data with error by local error channel (Timeout - wrong target)": function() {
				var dfd = this.async(timeout);
				Mediator.once(restManager.errorChannel, dfd.callback(function(item) {
					assert.isNotNull(item.error, "No se emitió el error correctamente");
				}));
				Mediator.publish(restManager.getChannel("REQUEST"), {query: {}, options: {},
					target: "https://redmic.local/test/contact/"});
			}*/
		}
	});

});
