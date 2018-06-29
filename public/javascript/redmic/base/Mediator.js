define([
	"dojo/_base/lang"
	, "dojo/has"
	, 'mediatorjs/mediator.min'
], function(
	lang
	, has
	, MediatorJS
){
	//	summary:
	//		Fachada para mediator.js.
	//	description:
	//		Permite sobreescribir y ampliar mediator.js a nuestro gusto, además de facilitar el abandono
	//		del módulo si decidimos cambiar a otro.

	MediatorJS.prototype.channelSeparator = ":";

	MediatorJS.prototype.removeDescendantChannels = function(/*String*/ channel) {

		var procedure = lang.hitch(this, this.remove),
			channelsJson = this._getChannelsJson(channel);

		this._doActionOnDescendantChannels(channel, procedure, channelsJson, true);
	};

	MediatorJS.prototype.removeChildChannels = function(/*String*/ channel) {

		var procedure = lang.hitch(this, this.remove),
			channelsJson = this._getChannelsJson(channel);

		this._doActionOnDescendantChannels(channel, procedure, channelsJson);
	};

	MediatorJS.prototype.publishActionOnChildChannels = function(/*String*/ channel, /*String*/ action) {

		var procedure = lang.hitch(this, function(channel) {
				this.publish(channel + this.channelSeparator + action);
			}),
			channelsJson = this._getChannelsJson(channel);

		this._doActionOnDescendantChannels(channel, procedure, channelsJson);
	};

	MediatorJS.prototype._getChannelsJson = function(/*String*/ channel) {

		var channelSplitted = channel.split(this.channelSeparator),
			actualChannelsJson = this._channels;

		if (!channelSplitted.length)
			return actualChannelsJson;

		for (var i = 0; i < channelSplitted.length; i++)
			actualChannelsJson = actualChannelsJson._channels[channelSplitted[i]];

		return actualChannelsJson._channels;
	};

	MediatorJS.prototype._doActionOnDescendantChannels = function(/*String*/ channel, /*Object*/ procedure,
		/*Object*/ channelsJson, /*Boolean?*/ deep) {

		for (var key in channelsJson) {
			var actualChannel = channel + this.channelSeparator + key,
				actualChannelsJson = channelsJson[key]._channels;

			if (deep && Object.keys(actualChannelsJson).length)
				this._doActionOnDescendantChannels(actualChannel, procedure, actualChannelsJson, deep);

			procedure(actualChannel);
		}
	};

	var mediatorInstance;
	if (has("host-browser")) {
		if (!window.mediator) {
			window.mediator = new MediatorJS();
		}
		mediatorInstance = window.mediator;
	} else if (has("host-node")) {
		if (!global.mediator) {
			global.mediator = new MediatorJS();
		}
		mediatorInstance = global.mediator;
	} else {
		console.error('Cannot create a mediatorjs instance, environment not supported');
	}

	return mediatorInstance;
});
