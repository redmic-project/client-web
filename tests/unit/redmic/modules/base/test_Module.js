define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/Deferred'
	, 'dojo/promise/all'
	, 'redmic/modules/base/_Module'
	, 'redmic/base/Mediator'

], function(
	declare
	, lang
	, Deferred
	, all
	, _Module
	, Mediator
){
	var parentModule, module, removableParentModule, removableModule,
		rootChannel = 'rootChannel',
		parentChannel = 'parentChannel',
		timeout = 100;

	var registerSuite = intern.getInterface('object').registerSuite,
		assert = intern.getPlugin('chai').assert;

	registerSuite('_Module communication tests', {
		before: function() {

			module = new _Module({
				parentChannel: parentChannel
			});
		},

		afterEach: function() {

			module._resume();
		},

		after: function() {

			Mediator.publish(module.getChannel('DISCONNECT'));
		},

		tests: {
			Should_SetModuleAsResumed_When_Created: function() {

				assert.isFalse(module._getPaused(), 'El módulo se ha inicializado en estado de desconexión');
			},

			Should_PublishDisconnected_When_ReceiveDisconnectPublication: function() {

				var dfd = this.async(timeout);

				Mediator.once(module.getChannel('DISCONNECTED'), dfd.callback(function() {}));

				Mediator.publish(module.getChannel('DISCONNECT'));
			},

			Should_SetModuleAsPaused_When_ReceiveDisconnectPublication: function() {

				var dfd = this.async(timeout);

				Mediator.once(module.getChannel('DISCONNECTED'), function() {

					assert.isTrue(module._getPaused(), 'El módulo sigue conectado tras recibir la orden de desconectar');
					dfd.resolve();
				});

				Mediator.publish(module.getChannel('DISCONNECT'));
			},

			Should_OmitResponsePublication_When_RequestSubscriptionIsDisconnected: function() {

				var dfd = this.async(timeout),
					cbk = function(obj) {

						dfd.reject({
							message: 'El módulo ha publicado a raíz de una suscripción que estaba desconectada'
						});
					};

				setTimeout(function() {

					Mediator.remove(module.getChannel('GOT_PROPS'), cbk);
					dfd.resolve();
				}, timeout - 1);

				Mediator.publish(module.getChannel('DISCONNECT'), {
					actions: ['GET_PROPS']
				});

				Mediator.once(module.getChannel('GOT_PROPS'), cbk);

				Mediator.publish(module.getChannel('GET_PROPS'), {
					rootChannel: true
				});
			},

			Should_RestoreResponsePublication_When_DisconnectedRequestSubscriptionIsReconnected: function() {

				var dfd = this.async(timeout);

				Mediator.publish(module.getChannel('DISCONNECT'), {
					actions: ['GET_PROPS']
				});

				Mediator.once(module.getChannel('GOT_PROPS'), dfd.callback(function() {}));

				Mediator.publish(module.getChannel('CONNECT'), {
					actions: ['GET_PROPS']
				});

				Mediator.publish(module.getChannel('GET_PROPS'), {
					rootChannel: true
				});
			},

			Should_RestoreResponsePublication_When_ModuleWithDisconnectedActionIsReconnected: function() {

				var dfd = this.async(timeout);

				Mediator.publish(module.getChannel('DISCONNECT'), {
					actions: ['GET_PROPS']
				});

				Mediator.once(module.getChannel('GOT_PROPS'), dfd.callback(function() {}));

				Mediator.publish(module.getChannel('CONNECT'));

				Mediator.publish(module.getChannel('GET_PROPS'), {
					rootChannel: true
				});
			},

			Should_OmitDisconnectedPublication_When_ReceiveDisconnectTwice: function() {

				var dfd = this.async(timeout),
					cbk = function(obj) {

						dfd.reject({
							message: 'El módulo ha publicado su desconexión más de una vez'
						});
					};

				setTimeout(function() {

					Mediator.remove(module.getChannel('DISCONNECTED'), cbk);
					dfd.resolve();
				}, timeout - 1);

				Mediator.publish(module.getChannel('DISCONNECT'));

				Mediator.once(module.getChannel('DISCONNECTED'), cbk);

				Mediator.publish(module.getChannel('DISCONNECT'));
			},

			Should_PublishConnected_When_IsDisconnectedAndReceiveConnectPublication: function() {

				var dfd = this.async(timeout);

				Mediator.once(module.getChannel('CONNECTED'), dfd.callback(function() {}));

				Mediator.publish(module.getChannel('DISCONNECT'));
				Mediator.publish(module.getChannel('CONNECT'));
			},

			Should_SetModuleAsResumed_When_ReceiveConnectPublication: function() {

				var dfd = this.async(timeout);

				Mediator.once(module.getChannel('CONNECTED'), function() {

					assert.isFalse(module._getPaused(), 'El módulo sigue desconectado tras recibir la orden de conectar');
					dfd.resolve();
				});

				Mediator.publish(module.getChannel('DISCONNECT'));
				Mediator.publish(module.getChannel('CONNECT'));
			},

			Should_SetModuleAsPaused_When_DisconnectAndConnectAndDisconnectAgain: function() {

				var dfd = this.async(timeout);

				Mediator.publish(module.getChannel('DISCONNECT'));

				Mediator.once(module.getChannel('DISCONNECTED'), function() {

					assert.isTrue(module._getPaused(), 'El módulo sigue conectado tras recibir la orden de desconectar');
					dfd.resolve();
				});

				Mediator.publish(module.getChannel('CONNECT'));
				Mediator.publish(module.getChannel('DISCONNECT'));
			},

			Should_GetNoResponse_When_PublishToModuleAfterDestroyIt: function() {

				var dfd = this.async(timeout),
					cbk = function(obj) {

						dfd.reject({
							message: 'El módulo ha publicado tras su destrucción'
						});
					};

				removableModule = new _Module({
					parentChannel: parentChannel
				});

				setTimeout(function() {

					Mediator.remove(removableModule.getChannel('CONNECTED'), cbk);
					dfd.resolve();
				}, timeout - 1);

				Mediator.once(removableModule.getChannel('CONNECTED'), cbk);

				Mediator.publish(removableModule.getChannel('DESTROY'));
				Mediator.publish(removableModule.getChannel('CONNECT'));
			}
		}
	});

	registerSuite('_Module hierarchical communication tests', {
		before: function() {

			parentModule = new _Module({
				parentChannel: rootChannel,
				ownChannel: parentChannel
			});

			module = new _Module({
				parentChannel: parentModule.getChannel()
			});
		},

		afterEach: function() {

			var dfd = this.async(timeout),
				childConnectedDfd = new Deferred(),
				parentConnectedDfd = new Deferred();

			all([childConnectedDfd, parentConnectedDfd]).then(dfd.callback(function() {}));

			Mediator.once(module.getChannel('CONNECTED'), lang.hitch(childConnectedDfd,
				childConnectedDfd.resolve));

			Mediator.once(parentModule.getChannel('CONNECTED'), lang.hitch(parentConnectedDfd,
				parentConnectedDfd.resolve));

			Mediator.publish(parentModule.getChannel('CONNECT'));
		},

		after: function() {

			Mediator.publish(parentModule.getChannel('DISCONNECT'));
			Mediator.publish(module.getChannel('DISCONNECT'));
		},

		tests: {
			Should_UpdateParentModuleChildrenReferences_When_CreateOrDisconnectOrDestroyChildModule: function() {

				var prevChildrenReferences = lang.clone(parentModule._childrenModules);

				removableModule = new _Module({
					parentChannel: parentModule.getChannel()
				});

				assert.notDeepEqual(prevChildrenReferences, parentModule._childrenModules,
					'El módulo padre no ha registrado a su nuevo hijo');

				Mediator.publish(removableModule.getChannel('DISCONNECT'));

				assert.isFalse(parentModule._childrenModules[removableModule.getOwnChannel()],
					'El módulo padre no ha actualizado el valor de la referencia a su nuevo hijo');

				Mediator.publish(removableModule.getChannel('DESTROY'));

				assert.deepEqual(prevChildrenReferences, parentModule._childrenModules,
					'El módulo padre no ha olvidado a su antiguo hijo');
			},

			Should_DisconnectDescendantModule_When_DisconnectAncestorModule: function() {

				var dfd = this.async(timeout);

				Mediator.once(module.getChannel('DISCONNECTED'), dfd.callback(function() {}));

				Mediator.publish(parentModule.getChannel('DISCONNECT'));
			},

			Should_OmitChildResponsePublication_When_ParentRequestSubscriptionIsDisconnected: function() {

				var dfd = this.async(timeout),
					cbk = function(obj) {

						dfd.reject({
							message: 'El módulo hijo ha publicado una acción desconectada desde el módulo padre'
						});
					};

				setTimeout(function() {

					Mediator.remove(module.getChannel('GOT_PROPS'), cbk);
					dfd.resolve();
				}, timeout - 1);

				Mediator.publish(parentModule.getChannel('DISCONNECT'), {
					actions: ['GET_PROPS']
				});

				Mediator.once(module.getChannel('GOT_PROPS'), cbk);

				Mediator.publish(module.getChannel('GET_PROPS'), {
					rootChannel: true
				});
			},

			Should_RestoreChildResponsePublication_When_DisconnectedParentRequestSubscriptionIsReconnected: function() {

				var dfd = this.async(timeout);

				Mediator.publish(parentModule.getChannel('DISCONNECT'), {
					actions: ['GET_PROPS']
				});

				Mediator.once(module.getChannel('GOT_PROPS'), dfd.callback(function() {}));

				Mediator.publish(parentModule.getChannel('CONNECT'), {
					actions: ['GET_PROPS']
				});

				Mediator.publish(module.getChannel('GET_PROPS'), {
					rootChannel: true
				});
			},

			Should_RestoreChildResponsePublication_When_ParentModuleWithDisconnectedActionIsReconnected: function() {

				var dfd = this.async(timeout);

				Mediator.publish(parentModule.getChannel('DISCONNECT'), {
					actions: ['GET_PROPS']
				});

				Mediator.once(module.getChannel('GOT_PROPS'), dfd.callback(function() {}));

				Mediator.publish(parentModule.getChannel('CONNECT'));

				Mediator.publish(module.getChannel('GET_PROPS'), {
					rootChannel: true
				});
			},

			Should_PublishChildModuleDisconnectionBeforeParentModuleDisconnection_When_DisconnectParentModule: function() {

				var dfd = this.async(timeout),
					obj = {};

				Mediator.once(parentModule.getChannel('DISCONNECTED'), lang.partial(function(args, res) {

					var moduleChannel = res.moduleChannel,
						childChannelReceived = args.childChannelReceived;

					assert.isDefined(childChannelReceived,
						'No se ha recibido aún la desconexión del módulo hijo cuando se recibe la del módulo padre');

					assert.strictEqual(childChannelReceived, module.getChannel(),
						'No se ha recibido el canal correcto en la desconexión del módulo hijo');

					assert.strictEqual(moduleChannel, parentModule.getChannel(),
						'No se ha recibido el canal correcto en la desconexión del módulo padre');

					dfd.resolve();
				}, obj));

				Mediator.once(module.getChannel('DISCONNECTED'), lang.partial(function(args, res) {

					var moduleChannel = res.moduleChannel;

					args.childChannelReceived = moduleChannel;
				}, obj));

				Mediator.publish(parentModule.getChannel('DISCONNECT'));
			},

			Should_OmitWaitingForAlreadyDisconnectedChildToPublishDisconnected_When_DisconnectParent: function() {

				var dfd = this.async(timeout);

				Mediator.publish(module.getChannel('DISCONNECT'));

				Mediator.once(parentModule.getChannel('DISCONNECTED'), dfd.callback(function() {}));

				Mediator.publish(parentModule.getChannel('DISCONNECT'));
			},

			Should_WaitForReconnectedChildToPublishDisconnected_When_DisconnectParentAfterReconnectChild: function() {

				var dfd = this.async(timeout),
					obj = {};

				Mediator.publish(module.getChannel('DISCONNECT'));

				Mediator.once(parentModule.getChannel('DISCONNECTED'), lang.partial(function(args, res) {

					var moduleChannel = res.moduleChannel,
						childChannelReceived = args.childChannelReceived;

					assert.isDefined(childChannelReceived,
						'No se ha recibido la desconexión del hijo reconectado cuando se recibe la del módulo padre');

					dfd.resolve();
				}, obj));

				Mediator.once(module.getChannel('DISCONNECTED'), lang.partial(function(args, res) {

					var moduleChannel = res.moduleChannel;

					args.childChannelReceived = moduleChannel;
				}, obj));

				Mediator.publish(module.getChannel('CONNECT'));
				Mediator.publish(parentModule.getChannel('DISCONNECT'));
			},

			Should_DestroyDescendantModule_When_DestroyAncestorModule: function() {

				var dfd = this.async(timeout);

				removableParentModule = new _Module({
					parentChannel: rootChannel,
					ownChannel: parentChannel
				});

				removableModule = new _Module({
					parentChannel: removableParentModule.getChannel()
				});

				Mediator.once(removableModule.getChannel('DESTROYED'), dfd.callback(function() {}));

				Mediator.publish(removableParentModule.getChannel('DESTROY'));
			},

			Should_PublishChildModuleDestructionBeforeParentModuleDestruction_When_DestroyParentModule: function() {

				var dfd = this.async(timeout),
					obj = {};

				removableParentModule = new _Module({
					parentChannel: rootChannel,
					ownChannel: parentChannel
				});

				removableModule = new _Module({
					parentChannel: removableParentModule.getChannel()
				});

				Mediator.once(removableParentModule.getChannel('DESTROYED'), lang.partial(function(args, res) {

					var moduleChannel = res.moduleChannel,
						childChannelReceived = args.childChannelReceived;

					assert.isDefined(childChannelReceived,
						'No se ha recibido aún la destrucción del módulo hijo cuando se recibe la del módulo padre');

					assert.strictEqual(childChannelReceived, removableModule.getChannel(),
						'No se ha recibido el canal correcto en la destrucción del módulo hijo');

					assert.strictEqual(moduleChannel, removableParentModule.getChannel(),
						'No se ha recibido el canal correcto en la destrucción del módulo padre');

					dfd.resolve();
				}, obj));

				Mediator.once(removableModule.getChannel('DESTROYED'), lang.partial(function(args, res) {

					var moduleChannel = res.moduleChannel;

					args.childChannelReceived = moduleChannel;
				}, obj));

				Mediator.publish(removableParentModule.getChannel('DESTROY'));
			},

			Should_DestroyRecursivelyAndPublishDestroyedFromParent_When_DestroyParentWithDeepDescendants: function() {

				var dfd = this.async(timeout),
					modulesByDepthLevel = 2;

				removableParentModule = new _Module({
					parentChannel: rootChannel,
					ownChannel: parentChannel
				});

				Mediator.once(removableParentModule.getChannel('DESTROYED'), dfd.callback(function() {}));

				for (var i = 0; i < modulesByDepthLevel; i++) {
					var descendantModule = new _Module({
							parentChannel: removableParentModule.getChannel()
						}),
						descendantModuleChannel = descendantModule.getChannel();

					for (var j = 0; j < modulesByDepthLevel; j++) {
						new _Module({
							parentChannel: descendantModuleChannel
						});
					}
				}

				Mediator.publish(removableParentModule.getChannel('DESTROY'));
			}
		}
	});
});
