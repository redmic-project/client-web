define([
	'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/Deferred'
	, 'src/component/base/_Module'
	, 'src/component/base/_Store'
	, 'src/util/Credentials'
], function(
	redmicConfig
	, declare
	, Deferred
	, _Module
	, _Store
	, Credentials
) {

	return declare([_Module, _Store], {
		//	Summary:
		//		Módulo para manejar las variables de configuración externas, procedentes del servidor.

		postMixInProperties: function() {

			const defaultConfig = {
				ownChannel: 'externalConfig',
				events: {
					REMOVE: 'remove',
					REQUEST_FAILED: 'requestFailed'
				},
				actions: {
					REMOVED: 'removed',
					REQUEST_FAILED: 'requestFailed'
				},

				target: redmicConfig.services.getExternalConfig,
				localConfigExpirationMs: 3600000,
				remoteForceRefresh: true
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_initialize: function() {

			if (!Credentials.get('externalConfig')) {
				this._deleteExternalConfig();
			}

			this._listenLocalStorage();
		},

		_listenLocalStorage: function() {

			Credentials.on('changed:externalConfig', evt => this._onExternalConfigChanged(evt));
			Credentials.on('removed:externalConfig', () => this._onExternalConfigRemoved());
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'REMOVE',
				channel: this.getChannel('REMOVED')
			},{
				event: 'REQUEST_FAILED',
				channel: this.getChannel('REQUEST_FAILED')
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._getExternalConfig();
		},

		_getExternalConfig: function() {

			const currentExternalConfig = Credentials.get('externalConfig'),
				currentExternalConfigTimestamp = Credentials.get('externalConfigTimestamp');

			if (currentExternalConfig && currentExternalConfigTimestamp) {
				const configNotExpired = currentExternalConfigTimestamp >= Date.now() - this.localConfigExpirationMs;
				if (configNotExpired) {
					this._setExternalConfig(currentExternalConfig);
					return;
				}
			}

			this._requestExternalConfig();
		},

		_requestExternalConfig: function() {

			this._externalConfigDfd = new Deferred();

			const forceRefresh = this.remoteForceRefresh,
				query = { forceRefresh };

			this._emitEvt('GET', {
				target: this.target,
				params: { query },
				requesterId: this.getOwnChannel()
			});
		},

		_externalConfigGetProp: function(dfd, _propName) {

			if (this.externalConfig) {
				dfd.resolve(this.externalConfig);
				return;
			}

			if (!this._externalConfigDfd) {
				this._requestExternalConfig();
			}

			this._externalConfigDfd.then(
				config => dfd.resolve(config),
				() => dfd.resolve()
			);
		},

		_onExternalConfigChanged: function(evt) {

			const value = evt.value;

			if (!value) {
				this._onExternalConfigRemoved();
			}
		},

		_onExternalConfigRemoved: function() {

			this._emitEvt('REMOVE');
		},

		_setExternalConfig: function(config) {

			this.externalConfig = config;
		},

		_deleteExternalConfig: function() {

			Credentials.remove('externalConfig');
			Credentials.remove('externalConfigTimestamp');

			delete this.externalConfig;
		},

		_itemAvailable: function(res) {

			const data = res.data;

			if (!data) {
				this._onExternalConfigRemoved();
				this._externalConfigDfd.reject();
				return;
			}

			const timestamp = Date.now();

			Credentials.set('externalConfig', data);
			Credentials.set('externalConfigTimestamp', timestamp);

			this._setExternalConfig(data);
			this._externalConfigDfd.resolve(data);
		},

		_errorAvailable: function(err) {

			this._emitEvt('REQUEST_FAILED', err);
			this._externalConfigDfd.reject(err);
		}
	});
});
