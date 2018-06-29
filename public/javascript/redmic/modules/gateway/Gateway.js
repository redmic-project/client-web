define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "RWidgets/Utilities"
	, "redmic/modules/base/_Module"
	, "./_GatewayItfc"
], function(
	declare
	, lang
	, Utilities
	, _Module
	, _GatewayItfc
){
	return declare([_Module, _GatewayItfc], {
		//	summary:
		//		Módulo generador de pasarelas entre otros módulos.
		//	description:
		//		Recibe canales de entrada y de salida, y en su implementación se encuentra
		//		la lógica a ejecutar entre la entrada y la salida.
		//
		//		Recibe un objeto de configuración 'channelsDefinition'
		//		que define varios canales de entrada y salida.
		//
		//		Cada elemento en 'channelsDefinition' puede definir varios canales de entrada y
		//		varios canales de salida, sin necesidad de crear elementos duplicados (por ejemplo,
		//		para definir varios canales de salida para un único canal de entrada).
		//
		//		Para lanzar la publicación asociada, se ha de emitir desde el callback de la
		//		subscripción un evento autogenerado, que comparte nombre con el mismo callback.

		//	config: Object
		//		Opciones por defecto.

		constructor: function(args) {

			this.config = {
				actions: {
					ADD_CHANNELS_DEFINITION: "addChannelsDefinition"
				},

				channelsDefinition: null
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function () {

			if (this.channelsDefinition) {
				this._buildInputsAndOutputs(this.channelsDefinition);
			}
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("ADD_CHANNELS_DEFINITION"),
				callback: "_subAddChannelsDefinition"
			});
		},

		_subAddChannelsDefinition: function(res) {

			var channelsDefinition = res.channelsDefinition;

			channelsDefinition && this._buildInputsAndOutputs(channelsDefinition);
		},

		_buildInputsAndOutputs: function (channelsDefinition) {

			for (var i = 0; i < channelsDefinition.length; i++) {
				var channelsGroup = channelsDefinition[i],
					inputChannel = channelsGroup.input,
					outputChannel = channelsGroup.output,
					subMethodAndEvent = channelsGroup.subMethod;

				if (!subMethodAndEvent) {
					this._buildRetransmission(inputChannel, outputChannel);
				} else {
					inputChannel && this._addSubscriptions(inputChannel, subMethodAndEvent);
					outputChannel && this._addPublications(outputChannel, subMethodAndEvent);
				}
			}
		},

		_buildRetransmission: function (inputChannel, outputChannel) {

			this._setSubscription({
				channel: inputChannel,
				callback: lang.hitch(this, function(outputChannel) {

					this._publish(outputChannel, arguments[1]);
				}, outputChannel)
			});
		},

		_addSubscriptions: function (inputChannel, subMethod) {

			var subCallbackName = "_sub" + Utilities.capitalize(subMethod);

			if (!this[subCallbackName]) {
				console.error("Callback '%s' for subscription is missing at '%s'", subCallbackName, this.getChannel());
			}

			if (typeof inputChannel !== "object") {
				inputChannel = [inputChannel];
			}

			for (var i = 0; i < inputChannel.length; i++) {
				this._setSubscription({
					channel: inputChannel[i],
					callback: subCallbackName
				});
			}
		},

		_addPublications: function (outputChannel, evtName) {

			evtName = evtName.replace(/([a-z])([A-Z])/g, "$1_$2");

			var inputActionAndEventName = evtName.toUpperCase();
			this.events[inputActionAndEventName] = evtName;

			if (typeof outputChannel !== "object") {
				outputChannel = [outputChannel];
			}

			for (var i = 0; i < outputChannel.length; i++) {
				this._setPublication({
					event: inputActionAndEventName,
					channel: outputChannel[i]
				});
			}
		}
	});
});
