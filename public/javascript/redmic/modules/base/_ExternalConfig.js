define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
], function(
	declare
	, lang
	, aspect
) {

	return declare(null, {
		//	summary:
		//		Permite a los módulos obtener configuraciones externas.

		constructor: function(args) {

			this.config = {
				externalConfigEvents: {
					GET_EXTERNAL_CONFIG: 'getExternalConfig',
					GOT_EXTERNAL_CONFIG: 'gotExternalConfig'
				},

				externalConfigActions: {
					GOT_EXTERNAL_CONFIG: 'gotExternalConfig',
					GET_CONFIG: 'getConfig',
					GOT_CONFIG: 'gotConfig',
					REQUEST_FAILED: 'requestFailed'
				},

				externalConfigChannel: this._buildChannel(this.rootChannel, this.globalOwnChannels.EXTERNAL_CONFIG),

				_requestedExternalConfigProperty: null
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, '_mixEventsAndActions', lang.hitch(this, this._mixExternalConfigEventsAndActions));
			aspect.after(this, '_defineSubscriptions',
				lang.hitch(this, this._defineExternalConfigSubscriptions));

			aspect.after(this, '_definePublications',
				lang.hitch(this, this._defineExternalConfigPublications));

			aspect.before(this, '_setOwnCallbacksForEvents',
				lang.hitch(this, this._setExternalConfigOwnCallbacksForEvents));
		},

		_mixExternalConfigEventsAndActions: function() {

			lang.mixin(this.events, this.externalConfigEvents);
			lang.mixin(this.actions, this.externalConfigActions);
			delete this.externalConfigEvents;
			delete this.externalConfigActions;
		},

		_defineExternalConfigSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel: this._buildChannel(this.externalConfigChannel, this.actions.GOT_CONFIG),
				callback: '_subGotExternalConfig'
			},{
				channel: this._buildChannel(this.externalConfigChannel, this.actions.REQUEST_FAILED),
				callback: '_subExternalConfigRequestFailed'
			});

			this._deleteDuplicatedChannels(this.subscriptionsConfig);
		},

		_defineExternalConfigPublications: function() {

			this.publicationsConfig.push({
				event: 'GET_EXTERNAL_CONFIG',
				channel: this._buildChannel(this.externalConfigChannel, this.actions.GET_CONFIG)
			},{
				event: 'GOT_EXTERNAL_CONFIG',
				channel: this.getChannel('GOT_EXTERNAL_CONFIG')
			});

			this._deleteDuplicatedChannels(this.publicationsConfig);
		},

		_setExternalConfigOwnCallbacksForEvents: function() {

			this._onEvt('GET_EXTERNAL_CONFIG', lang.hitch(this, this._onGetExternalConfigEvt));
		},

		_onGetExternalConfigEvt: function(evt) {

			this._requestedExternalConfigProperty = evt.propertyName;
		},

		_subGotExternalConfig: function(res) {

			var config = res.config,
				configProp = this._requestedExternalConfigProperty,
				configToEmit;

			if (configProp) {
				configToEmit = {};
				configToEmit[configProp] = config[configProp];
			} else {
				configToEmit = config;
			}

			this._emitEvt('GOT_EXTERNAL_CONFIG', configToEmit);
		},

		_subExternalConfigRequestFailed: function(error) {

			console.error('Got error trying to get externalConfig at "%s"', this.getChannel(), error);

			this._emitEvt('GOT_EXTERNAL_CONFIG', {});
		}
	});
});
