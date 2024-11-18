define([
	'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/component/base/_Module'
	, 'src/component/base/_Store'
	, 'src/util/Credentials'
], function(
	redmicConfig
	, declare
	, lang
	, _Module
	, _Store
	, Credentials
) {

	return declare([_Module, _Store], {
		//	Summary:
		//		Módulo para manejar las variables de configuración externas, procedentes del servidor.

		constructor: function(args) {

			this.config = {
				ownChannel: 'externalConfig',
				events: {
					GOT_CONFIG: 'gotConfig',
					REMOVE: 'remove',
					REQUEST_FAILED: 'requestFailed'
				},
				actions: {
					GET_CONFIG: 'getConfig',
					GOT_CONFIG: 'gotConfig',
					REMOVED: 'removed',
					REQUEST_FAILED: 'requestFailed'
				},

				target: redmicConfig.services.getExternalConfig,
				externalConfigExpirationMs: 3600000,
				_gettingExternalConfig: false
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			if (!Credentials.get('externalConfig')) {
				this._setEmptyExternalConfig();
			}

			this._listenLocalStorage();
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.getChannel('GET_CONFIG'),
				callback: '_subGetConfig'
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'GOT_CONFIG',
				channel: this.getChannel('GOT_CONFIG')
			},{
				event: 'REMOVE',
				channel: this.getChannel('REMOVED')
			},{
				event: 'REQUEST_FAILED',
				channel: this.getChannel('REQUEST_FAILED')
			});
		},

		_listenLocalStorage: function() {

			Credentials.on('changed:externalConfig', lang.hitch(this, this._onExternalConfigChanged));
			Credentials.on('removed:externalConfig', lang.hitch(this, this._onExternalConfigRemoved));
		},

		postCreate: function() {

			this._getExternalConfig();
		},

		_subGetConfig: function(req) {

			this._getExternalConfig(req);
		},

		_getExternalConfig: function(req) {

			var currentExternalConfig = Credentials.get('externalConfig'),
				currentExternalConfigTimestamp = Credentials.get('externalConfigTimestamp'),
				forceLocalRefresh = req && req.forceLocalRefresh;

			if (currentExternalConfig && currentExternalConfigTimestamp) {
				var configNotExpired = currentExternalConfigTimestamp >= Date.now() - this.externalConfigExpirationMs;
				if (configNotExpired && !forceLocalRefresh) {
					this._emitGotConfig(currentExternalConfig);
					return;
				}
			}

			if (this._gettingExternalConfig) {
				return;
			}

			this._gettingExternalConfig = true;

			var forceRemoteRefresh = req && req.forceRemoteRefresh,
				query = {};

			if (forceRemoteRefresh) {
				query.forceRefresh = true;
			}

			this._emitEvt('GET', {
				target: this.target,
				query: query,
				requesterId: this.getOwnChannel()
			});
		},

		_emitGotConfig: function(data) {

			this._emitEvt('GOT_CONFIG', {
				config: data
			});
		},

		_onExternalConfigChanged: function(evt) {

			var value = evt.value;

			if (!value) {
				this._onExternalConfigRemoved();
			}
		},

		_onExternalConfigRemoved: function() {

			this._emitEvt('REMOVE');
		},

		_setEmptyExternalConfig: function() {

			Credentials.set('externalConfig', null);
			Credentials.set('externalConfigTimestamp', null);
		},

		_itemAvailable: function(res) {

			this._gettingExternalConfig = false;

			var data = res.data;

			if (!data) {
				this._onExternalConfigRemoved();
				return;
			}

			var timestamp = Date.now();

			Credentials.set('externalConfig', data);
			Credentials.set('externalConfigTimestamp', timestamp);

			this._emitGotConfig(data);
		},

		_errorAvailable: function(err) {

			this._gettingExternalConfig = false;

			this._emitEvt('REQUEST_FAILED', err);
		}
	});
});
