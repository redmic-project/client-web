define([
	'app/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'redmic/modules/base/_Module'
	, 'redmic/modules/base/_Store'
	, 'redmic/base/Credentials'
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
		//		Módulo para manejar las credenciales de los usuarios.
		//	Description:
		//		Obtiene las credenciales del servidor y escucha cambios relativos a las mismas, publicando los cambios.

		//	_loginPath: String
		//		Ruta correspondiente a la vista de acceso

		constructor: function(args) {

			this.config = {
				ownChannel: 'credentials',
				events: {
					GET_CREDENTIALS: 'getCredentials',
					GET_ALLOWED_MODULES: 'getAllowedModules',
					REMOVE: 'remove',
					ACCEPT_COOKIES: 'acceptCookies',
					REQUEST_FAILED: 'requestFailed'
				},
				actions: {
					GET_CREDENTIALS: 'getCredentials',
					GET_ALLOWED_MODULES: 'getAllowedModules',
					AVAILABLE: 'available',
					AVAILABLE_ALLOWED_MODULES: 'availableAllowedModules',
					REMOVED: 'removed',
					COOKIES_ACCEPTED: 'cookiesAccepted',
					ACCEPT_COOKIES: 'acceptCookies',
					COOKIES_STATE: 'cookiesState',
					REQUEST_FAILED: 'requestFailed'
				},

				_loginPath: '/login'
			};

			lang.mixin(this, this.config, args);

			this._initializeCredentials();
			this._listenCredentials();
		},

		_initializeCredentials: function() {

			if (!Credentials.get('selectIds')) {
				Credentials.set('selectIds', {});
			}
		},

		_listenCredentials: function() {

			Credentials.on('changed:accessToken', lang.hitch(this, this._onAccessTokenChanged));
			Credentials.on('removed:accessToken', lang.hitch(this, this._onAccessTokenRemoved));
			Credentials.on('changed:cookiesAccepted', lang.hitch(this, this._cookiesAccepted));
			Credentials.on('changed:allowedModules', lang.hitch(this, this._allowedModulesChanged));
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.getChannel('GET_CREDENTIALS'),
				callback: '_subGetCredentials'
			},{
				channel : this.getChannel('GET_ALLOWED_MODULES'),
				callback: '_subGetAllowedModules'
			},{
				channel : this.getChannel('COOKIES_STATE'),
				callback: '_subCookiesState'
			},{
				channel : this.getChannel('ACCEPT_COOKIES'),
				callback: '_subAcceptCookies'
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'GET_CREDENTIALS',
				channel: this.getChannel('AVAILABLE')
			},{
				event: 'GET_ALLOWED_MODULES',
				channel: this.getChannel('AVAILABLE_ALLOWED_MODULES')
			},{
				event: 'REMOVE',
				channel: this.getChannel('REMOVED')
			},{
				event: 'ACCEPT_COOKIES',
				channel: this.getChannel('COOKIES_ACCEPTED')
			},{
				event: 'REQUEST_FAILED',
				channel: this.getChannel('REQUEST_FAILED')
			});
		},

		_subCookiesState: function() {

			if (Credentials.get('cookiesAccepted')) {
				this._emitEvt('ACCEPT_COOKIES');
			}
		},

		_subGetCredentials: function(req) {

			this._getCredentials();
		},

		_subGetAllowedModules: function(req) {

			this._allowedModulesChanged(req ? req.id : null);
		},

		_allowedModulesChanged: function(id) {

			var resObj = {
				data: Credentials.get('allowedModules')
			};

			if (id && typeof id !== 'object') {
				resObj.id = id;
			}

			this._emitEvt('GET_ALLOWED_MODULES', resObj);
		},

		_subAcceptCookies: function() {

			Credentials.set('cookiesAccepted', 'true');
		},

		_onAccessTokenChanged: function(evt) {

			var value = evt.value,
				oldValue = evt.oldValue;

			if (!value) {
				this._onAccessTokenRemoved();
				return;
			}

			var location = window.location;
			if (oldValue || location.pathname === this._loginPath) {
				this._getCredentials();
			} else {
				location.reload();
			}
		},

		_onAccessTokenRemoved: function() {

			this._emitEvt('REMOVE');
		},

		_cookiesAccepted: function(evt) {

			this._emitEvt('ACCEPT_COOKIES');
		},

		_getCredentials: function() {
			//	summary:
			//		Permite obtener las credenciales del usuario/invitado pidiéndolas al servidor
			//	tags:
			//		private

			var envDfd = window.env;
			if (envDfd) {
				envDfd.then(lang.hitch(this, function(envData) {

					this.target = redmicConfig.getServiceUrl(redmicConfig.services.profile, envData) + '/';

					this._emitEvt('GET', {
						target: this.target
					});
				}));
			}
		},

		_itemAvailable: function(res) {

			var data = res.data[0];

			if (!data) {
				Credentials.set('accessToken', null);
				return;
			}

			this.dataCredentials = data;

			Credentials.set('userId', data.id.toString());
			Credentials.set('userName', data.firstName);
			Credentials.set('userEmail', data.email);
			Credentials.set('userRole', data.role.name);
			Credentials.set('allowedModules', data.category);

			this._emitEvt('GET_CREDENTIALS', {
				found: !!Credentials.get('accessToken')
			});
		},

		_errorAvailable: function(err) {

			this._emitEvt('REQUEST_FAILED');
		}
	});
});
