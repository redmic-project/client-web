define([
	'src/utils/Mediator'
	, 'redmic/modules/store/RestManagerImpl'

], function(
	Mediator
	, RestManagerImpl
) {

	var timeout, restManager, target, exampleId, originalOpenMethod, communicationChannel, exampleAction;

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite('RestManager tests', {

		before: function() {

			timeout = 100;
			target = 'http://localhost';
			exampleId = 1;
			communicationChannel = 'app:communicationCenter:communication';
			exampleAction = '_search';

			restManager = new RestManagerImpl({
				parentChannel: 'app'
			});

			originalOpenMethod = window.XMLHttpRequest.prototype.open;
		},

		afterEach: function() {

			window.XMLHttpRequest.prototype.open = originalOpenMethod;
		},

		after: function() {

			Mediator.publish(restManager.getChannel('DISCONNECT'));
		},

		tests: {
			Should_CreateExternalRequest_When_ReceiveGetRequest: function() {

				var dfd = this.async(timeout);

				window.XMLHttpRequest.prototype.open = dfd.callback(function(method, url) {

					var expectedUrl = target + '/' + exampleId;
					assert.strictEqual(url, expectedUrl, 'La URL de petición no es la esperada');
				});

				Mediator.publish(restManager.getChannel('GET'), {
					target: target,
					id: exampleId
				});
			},

			Should_PublishItemAvailable_When_ReceiveGetSuccessResponse: function() {

				var dfd = this.async(timeout),
					getTarget = target + '/' + exampleId,
					getReq = {
						target: getTarget
					},
					getRes = {
						status: 200,
						data: {},
						text: undefined,
						getHeader: undefined,
						options: undefined,
						url: undefined
					},
					args = {
						getReq: getReq,
						getRes: getRes
					};

				Mediator.once(restManager.getChannel('ITEM_AVAILABLE'), dfd.callback((function(args, response) {

					var req = response.req,
						res = response.res;

					assert.strictEqual(response.target, req.target, 'La URL de respuesta no es la esperada');
					assert.deepEqual(req, args.getReq, 'El objeto de petición no es el esperado');
					assert.deepEqual(res, args.getRes, 'El objeto de respuesta no es el esperado');
				}).bind(null, args)));

				restManager._handleGetSuccess(getReq, getRes);
			},

			Should_PublishItemAvailable_When_ReceiveGetErrorResponse: function() {

				var dfd = this.async(timeout),
					getReq = {},
					getRes = {
						response: {
							status: 500,
							data: {},
							text: undefined,
							getHeader: undefined,
							options: undefined,
							url: undefined
						},
						message: 'Error message'
					},
					args = {
						getReq: getReq,
						getRes: getRes
					};

				Mediator.once(restManager.getChannel('ITEM_AVAILABLE'), dfd.callback((function(args, response) {

					var req = response.req,
						res = response.res;

					assert.strictEqual(response.target, req.target, 'La URL de respuesta no es la esperada');
					assert.strictEqual(res.error, args.getRes.message, 'El mensaje de error no es el esperado');
					assert.deepEqual(req, args.getReq, 'El objeto de petición no es el esperado');
					assert.nestedInclude(res, args.getRes.response, 'El objeto de respuesta no es el esperado');
				}).bind(null, args)));

				restManager._handleGetError(getReq, getRes);
			},

			Should_PublishErrorCommunication_When_ReceiveGetErrorResponse: function() {

				var dfd = this.async(timeout),
					getTarget = target + '/' + exampleId,
					getReq = {
						target: getTarget
					},
					getRes = {
						response: {
							status: 500,
							data: {},
							text: undefined,
							getHeader: undefined,
							options: undefined,
							url: undefined
						},
						message: 'Error message'
					};

				Mediator.once(communicationChannel, dfd.callback((function(getRes, communication) {

					var description = communication.description;

					assert.include(description, getRes.response.status, 'El mensaje no contiene el código de error');
					assert.include(description, getRes.message, 'El mensaje no contiene el texto de error original');
				}).bind(null, getRes)));

				restManager._handleGetError(getReq, getRes);
			},

			Should_CreateExternalRequest_When_ReceiveRequestRequest: function() {

				var dfd = this.async(timeout);

				window.XMLHttpRequest.prototype.open = dfd.callback(function(method, url) {

					var expectedUrl = target + '/' + exampleAction;
					assert.strictEqual(url, expectedUrl, 'La URL de petición no es la esperada');
				});

				Mediator.publish(restManager.getChannel('REQUEST'), {
					target: target,
					action: exampleAction
				});
			},

			Should_PublishAvailable_When_ReceiveRequestSuccessResponse: function() {

				var dfd = this.async(timeout),
					getTarget = target + '/' + exampleAction,
					getReq = {
						target: getTarget
					},
					getRes = {
						status: 200,
						data: {},
						text: undefined,
						getHeader: undefined,
						options: undefined,
						url: undefined
					},
					args = {
						getReq: getReq,
						getRes: getRes
					};

				Mediator.once(restManager.getChannel('AVAILABLE'), dfd.callback((function(args, response) {

					var req = response.req,
						res = response.res;

					assert.strictEqual(response.target, req.target, 'La URL de respuesta no es la esperada');
					assert.deepEqual(req, args.getReq, 'El objeto de petición no es el esperado');
					assert.deepEqual(res, args.getRes, 'El objeto de respuesta no es el esperado');
				}).bind(null, args)));

				restManager._handleRequestSuccess(getReq, getRes);
			},

			Should_PublishAvailable_When_ReceiveRequestErrorResponse: function() {

				var dfd = this.async(timeout),
					getTarget = target + '/' + exampleAction,
					getReq = {
						target: getTarget
					},
					getRes = {
						response: {
							status: 500,
							data: {},
							text: undefined,
							getHeader: undefined,
							options: undefined,
							url: undefined
						},
						message: 'Error message'
					},
					args = {
						getReq: getReq,
						getRes: getRes
					};

				Mediator.once(restManager.getChannel('AVAILABLE'), dfd.callback((function(args, response) {

					var req = response.req,
						res = response.res;

					assert.strictEqual(response.target, req.target, 'La URL de respuesta no es la esperada');
					assert.strictEqual(res.error, args.getRes.message, 'El mensaje de error no es el esperado');
					assert.deepEqual(req, args.getReq, 'El objeto de petición no es el esperado');
					assert.nestedInclude(res, args.getRes.response, 'El objeto de respuesta no es el esperado');
				}).bind(null, args)));

				restManager._handleRequestError(getReq, getRes);
			},

			Should_PublishErrorCommunication_When_ReceiveRequestErrorResponse: function() {

				var dfd = this.async(timeout),
					getReq = {},
					getRes = {
						response: {
							status: 500,
							data: {},
							text: undefined,
							getHeader: undefined,
							options: undefined,
							url: undefined
						},
						message: 'Error message'
					};

				Mediator.once(communicationChannel, dfd.callback((function(getRes, communication) {

					var description = communication.description;

					assert.include(description, getRes.response.status, 'El mensaje no contiene el código de error');
					assert.include(description, getRes.message, 'El mensaje no contiene el texto de error original');
				}).bind(null, getRes)));

				restManager._handleRequestError(getReq, getRes);
			},

			Should_CreateExternalRequest_When_ReceiveSaveRequest: function() {

				var dfd = this.async(timeout);

				window.XMLHttpRequest.prototype.open = dfd.callback(function(method, url) {

					var expectedUrl = target + '/' + exampleId;
					assert.strictEqual(url, expectedUrl, 'La URL de petición no es la esperada');
				});

				Mediator.publish(restManager.getChannel('SAVE'), {
					target: target,
					data: {
						id: exampleId
					}
				});
			},

			Should_PublishSaved_When_ReceiveSaveSuccessResponse: function() {

				var dfd = this.async(timeout),
					getTarget = target + '/' + exampleId,
					getReq = {
						target: getTarget
					},
					getRes = {
						status: 200,
						data: {},
						text: undefined,
						getHeader: undefined,
						options: undefined,
						url: undefined
					},
					args = {
						getReq: getReq,
						getRes: getRes
					};

				Mediator.once(restManager.getChannel('SAVED'), dfd.callback((function(args, response) {

					var req = response.req,
						res = response.res;

					assert.strictEqual(response.target, req.target, 'La URL de respuesta no es la esperada');
					assert.deepEqual(req, args.getReq, 'El objeto de petición no es el esperado');
					assert.deepEqual(res, args.getRes, 'El objeto de respuesta no es el esperado');
				}).bind(null, args)));

				restManager._handleSaveSuccess(getReq, getRes);
			},

			Should_PublishSaved_When_ReceiveSaveErrorResponse: function() {

				var dfd = this.async(timeout),
					getReq = {},
					getRes = {
						response: {
							status: 500,
							data: {},
							text: undefined,
							getHeader: undefined,
							options: undefined,
							url: undefined
						},
						message: 'Error message'
					},
					args = {
						getReq: getReq,
						getRes: getRes
					};

				Mediator.once(restManager.getChannel('SAVED'), dfd.callback((function(args, response) {

					var req = response.req,
						res = response.res;

					assert.strictEqual(response.target, req.target, 'La URL de respuesta no es la esperada');
					assert.strictEqual(res.error, args.getRes.message, 'El mensaje de error no es el esperado');
					assert.deepEqual(req, args.getReq, 'El objeto de petición no es el esperado');
					assert.nestedInclude(res, args.getRes.response, 'El objeto de respuesta no es el esperado');
				}).bind(null, args)));

				restManager._handleSaveError(getReq, getRes);
			},

			Should_PublishErrorCommunication_When_ReceiveSaveErrorResponse: function() {

				var dfd = this.async(timeout),
					getTarget = target + '/' + exampleId,
					getReq = {
						target: getTarget
					},
					getRes = {
						response: {
							status: 500,
							data: {},
							text: undefined,
							getHeader: undefined,
							options: undefined,
							url: undefined
						},
						message: 'Error message'
					};

				Mediator.once(communicationChannel, dfd.callback((function(getRes, communication) {

					var description = communication.description;

					assert.include(description, getRes.response.status, 'El mensaje no contiene el código de error');
					assert.include(description, getRes.message, 'El mensaje no contiene el texto de error original');
				}).bind(null, getRes)));

				restManager._handleSaveError(getReq, getRes);
			},

			Should_CreateExternalRequest_When_ReceiveRemoveRequest: function() {

				var dfd = this.async(timeout);

				window.XMLHttpRequest.prototype.open = dfd.callback(function(method, url) {

					var expectedUrl = target + '/' + exampleId;
					assert.strictEqual(url, expectedUrl, 'La URL de petición no es la esperada');
				});

				Mediator.publish(restManager.getChannel('REMOVE'), {
					target: target,
					id: exampleId
				});
			},

			Should_PublishRemoved_When_ReceiveRemoveSuccessResponse: function() {

				var dfd = this.async(timeout),
					getTarget = target + '/' + exampleId,
					getReq = {
						target: getTarget
					},
					getRes = {
						status: 200,
						data: {},
						text: undefined,
						getHeader: undefined,
						options: undefined,
						url: undefined
					},
					args = {
						getReq: getReq,
						getRes: getRes
					};

				Mediator.once(restManager.getChannel('REMOVED'), dfd.callback((function(args, response) {

					var req = response.req,
						res = response.res;

					assert.strictEqual(response.target, req.target, 'La URL de respuesta no es la esperada');
					assert.deepEqual(req, args.getReq, 'El objeto de petición no es el esperado');
					assert.deepEqual(res, args.getRes, 'El objeto de respuesta no es el esperado');
				}).bind(null, args)));

				restManager._handleRemoveSuccess(getReq, getRes);
			},

			Should_PublishRemoved_When_ReceiveRemoveErrorResponse: function() {

				var dfd = this.async(timeout),
					getReq = {},
					getRes = {
						response: {
							status: 500,
							data: {},
							text: undefined,
							getHeader: undefined,
							options: undefined,
							url: undefined
						},
						message: 'Error message'
					},
					args = {
						getReq: getReq,
						getRes: getRes
					};

				Mediator.once(restManager.getChannel('REMOVED'), dfd.callback((function(args, response) {

					var req = response.req,
						res = response.res;

					assert.strictEqual(response.target, req.target, 'La URL de respuesta no es la esperada');
					assert.strictEqual(res.error, args.getRes.message, 'El mensaje de error no es el esperado');
					assert.deepEqual(req, args.getReq, 'El objeto de petición no es el esperado');
					assert.nestedInclude(res, args.getRes.response, 'El objeto de respuesta no es el esperado');
				}).bind(null, args)));

				restManager._handleRemoveError(getReq, getRes);
			},

			Should_PublishErrorCommunication_When_ReceiveRemoveErrorResponse: function() {

				var dfd = this.async(timeout),
					getTarget = target + '/' + exampleId,
					getReq = {
						target: getTarget
					},
					getRes = {
						response: {
							status: 500,
							data: {},
							text: undefined,
							getHeader: undefined,
							options: undefined,
							url: undefined
						},
						message: 'Error message'
					};

				Mediator.once(communicationChannel, dfd.callback((function(getRes, communication) {

					var description = communication.description;

					assert.include(description, getRes.response.status, 'El mensaje no contiene el código de error');
					assert.include(description, getRes.message, 'El mensaje no contiene el texto de error original');
				}).bind(null, getRes)));

				restManager._handleRemoveError(getReq, getRes);
			}
		}
	});
});
