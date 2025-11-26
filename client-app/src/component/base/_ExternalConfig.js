define([
	'dojo/_base/declare'
	, 'RWidgets/Utilities'
], function(
	declare
	, Utilities
) {

	return declare(null, {
		// summary:
		//   Permite a los módulos obtener configuraciones externas.

		postMixInProperties: function() {

			const defaultConfig = {
				events: {
					GET_EXTERNAL_CONFIG: 'getExternalConfig',
					GOT_EXTERNAL_CONFIG: 'gotExternalConfig'
				},
				actions: {
					GOT_EXTERNAL_CONFIG: 'gotExternalConfig',
					REQUEST_FAILED: 'requestFailed'
				}
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_defineSubscriptions: function() {

			this.inherited(arguments);

			this.subscriptionsConfig.push({
				channel: this._buildChannel(this.externalConfigChannel, 'REQUEST_FAILED'),
				callback: '_subExternalConfigRequestFailed'
			});

			this._deleteDuplicatedChannels(this.subscriptionsConfig);
		},

		_definePublications: function() {

			this.inherited(arguments);

			this.publicationsConfig.push({
				event: 'GOT_EXTERNAL_CONFIG',
				channel: this.getChannel('GOT_EXTERNAL_CONFIG')
			});

			this._deleteDuplicatedChannels(this.publicationsConfig);
		},

		_setOwnCallbacksForEvents: function() {

			this.inherited(arguments);

			this._onEvt('GET_EXTERNAL_CONFIG', evt => this._onGetExternalConfigEvt(evt));
		},

		_onGetExternalConfigEvt: function(evt) {

			const requestedConfigPropName = evt.propertyName,
				propName = 'externalConfig';

			const gotPropsChannel = this._buildChannel(this.externalConfigChannel, 'GOT_PROPS');
			this._once(gotPropsChannel, res =>
				this._onceGotPropsFromExternalConfig(res[propName], requestedConfigPropName)
			);

			const getPropsChannel = this._buildChannel(this.externalConfigChannel, 'GET_PROPS');
			this._publish(getPropsChannel, { [propName]: true });
		},

		_onceGotPropsFromExternalConfig: function(config, configProp) {

			let configToEmit;

			if (configProp) {
				configToEmit = {
					[configProp]: Utilities.getDeepProp(config, configProp)
				};
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
