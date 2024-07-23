define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/Deferred'
	, 'dojo/DeferredList'
	, 'src/utils/Mediator'
	, 'redmic/modules/gateway/_GatewayItfc'
	, 'redmic/modules/gateway/Gateway'
], function(
	declare
	, lang
	, Deferred
	, DeferredList
	, Mediator
	, _GatewayItfc
	, Gateway
){
	var timeout = 100,
		inputChannel = 'testChannel:input',
		outputChannel = 'testChannel:output',
		anotherInputChannel = 'testChannel:input2',
		anotherOutputChannel = 'testChannel:output2',
		gateway;

	var Test2Impl = declare(_GatewayItfc, {

		constructor: function(args) {

			this.flag = false;
		},

		_subCallback1: function() {

			this.emit(this.events.CALLBACK1);
		},

		_subCallback2: function() {

			this.flag = true;
		},

		_pubCallback1: function(channel) {

			this.mediator.publish(channel);
		}
	});

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite('Gateway SISO with complex channels configuration tests', {
		before: function() {

			gateway = new declare([Test2Impl, Gateway])({
				parentChannel: 'view',
				ownChannel: 'test2',
				channelsDefinition: [{
					input: inputChannel,
					output: outputChannel,
					subMethod: 'callback1',
					pubMethod: 'callback1'
				}]
			});
		},

		after: function() {

			Mediator.publish(gateway.getChannel('DISCONNECT'));
		},

		tests: {
			Should_PublishThroughOutputChannel_When_PublishToInputChannel: function() {

				var dfd = this.async(timeout);

				Mediator.once(outputChannel, dfd.callback(function() {}));

				Mediator.publish(inputChannel);
			}
		}
	});

	registerSuite('Gateway SIMO with complex channels configuration tests', {
		before: function() {

			gateway = new declare([Test2Impl, Gateway])({
				parentChannel: 'view',
				ownChannel: 'test3',
				channelsDefinition: [{
					input: inputChannel,
					output: [outputChannel, anotherOutputChannel],
					subMethod: 'callback1',
					pubMethod: 'callback1'
				}]
			});
		},

		after: function() {

			Mediator.publish(gateway.getChannel('DISCONNECT'));
		},

		tests: {
			Should_PublishThroughSeveralOutputChannels_When_PublishToInputChannel: function() {

				var dfd = this.async(timeout),
					dfd1 = new Deferred(),
					dfd2 = new Deferred(),
					dfdList = new DeferredList([dfd1, dfd2]);

				Mediator.once(outputChannel, function() {

					dfd1.resolve();
				});
				Mediator.once(anotherOutputChannel, function() {

					dfd2.resolve();
				});

				dfdList.then(dfd.callback(function() {}));

				Mediator.publish(inputChannel);
			}
		}
	});

	registerSuite('Gateway MISO with complex channels configuration tests', {
		before: function() {

			gateway = new declare([Test2Impl, Gateway])({
				parentChannel: 'view',
				ownChannel: 'test4',
				channelsDefinition: [{
					input: [inputChannel, anotherInputChannel],
					output: outputChannel,
					subMethod: 'callback1',
					pubMethod: 'callback1'
				}]
			});
		},

		after: function() {

			Mediator.publish(gateway.getChannel('DISCONNECT'));
		},

		tests: {
			Should_PublishThroughOutputChannel_When_PublishToSeveralInputChannels: function() {

				var dfd = this.async(timeout),
					dfd1 = new Deferred(),
					dfd2 = new Deferred(),
					dfdList = new DeferredList([dfd1, dfd2]);

				Mediator.once(outputChannel, function() {

					dfd1.resolve();

					Mediator.once(outputChannel, function() {

						dfd2.resolve();
					});

					Mediator.publish(anotherInputChannel);
				});

				dfdList.then(dfd.callback(function() {}));

				Mediator.publish(inputChannel);
			}
		}
	});

	registerSuite('Gateway MIMO with complex channels configuration tests', {
		before: function() {

			gateway = new declare([Test2Impl, Gateway])({
				parentChannel: 'view',
				ownChannel: 'test5',
				channelsDefinition: [{
					input: [inputChannel, anotherInputChannel],
					output: [outputChannel, anotherOutputChannel],
					subMethod: 'callback1',
					pubMethod: 'callback1'
				}]
			});
		},

		after: function() {

			Mediator.publish(gateway.getChannel('DISCONNECT'));
		},

		tests: {
			Should_PublishThroughSeveralOutputChannels_When_PublishToFirstInputChannel: function() {

				var dfd = this.async(timeout),
					dfd1 = new Deferred(),
					dfd2 = new Deferred(),
					dfdList = new DeferredList([dfd1, dfd2]);

				Mediator.once(outputChannel, function() {

					dfd1.resolve();
				});
				Mediator.once(anotherOutputChannel, function() {

					dfd2.resolve();
				});

				dfdList.then(dfd.callback(function() {}));

				Mediator.publish(inputChannel);
			},

			Should_PublishThroughSeveralOutputChannels_When_PublishToSecondInputChannel: function() {

				var dfd = this.async(timeout),
					dfd1 = new Deferred(),
					dfd2 = new Deferred(),
					dfdList = new DeferredList([dfd1, dfd2]);

				Mediator.once(outputChannel, function() {

					dfd1.resolve();
				});
				Mediator.once(anotherOutputChannel, function() {

					dfd2.resolve();
				});

				dfdList.then(dfd.callback(function() {}));

				Mediator.publish(anotherInputChannel);
			}
		}
	});

	registerSuite('Gateway with retransmission of non-interesting channels', {
		before: function() {

			gateway = new declare([Test2Impl, Gateway])({
				parentChannel: 'view',
				ownChannel: 'test6',
				channelsDefinition: [{
					input: inputChannel,
					output: outputChannel
				}]
			});
		},

		after: function() {

			Mediator.publish(gateway.getChannel('DISCONNECT'));
		},

		tests: {
			Should_PublishThroughOutputChannelDirectly_When_PublishToInputChannel: function() {

				var dfd = this.async(timeout);

				Mediator.once(outputChannel, function(obj) {

					assert.isTrue(obj.data,
						'Se ha publicado a través correctamente, pero los datos publicados no son correctos');

					dfd.resolve();
				});

				Mediator.publish(inputChannel, {
					data: true
				});
			}
		}
	});

	registerSuite('Gateway with input channel but without output channel', {
		before: function() {

			gateway = new declare([Test2Impl, Gateway])({
				parentChannel: 'view',
				ownChannel: 'test7',
				channelsDefinition: [{
					input: inputChannel,
					subMethod: 'callback2'
				}]
			});
		},

		after: function() {

			Mediator.publish(gateway.getChannel('DISCONNECT'));
		},

		tests: {
			Should_OmitDefinitionOfUselessEvents_When_NoOutputChannelWasDefined: function() {

				assert.isUndefined(gateway.events.CALLBACK2, 'Se ha definido un evento inútil');
			},

			Should_DoSomethingInternally_When_PublishToInputChannelAndNoOutputChannelWasDefined: function() {

				assert.isFalse(gateway.flag, 'El flag no empieza con el valor esperado');

				Mediator.publish(inputChannel);

				assert.isTrue(gateway.flag, 'El flag no cambia al valor esperado');
			}
		}
	});
});
