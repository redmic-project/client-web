define([
	'app/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/request'
	, 'dojo/request/notify'
	, 'dojo/request/registry'
	, 'redmic/modules/base/_Module'
	, 'redmic/base/Credentials'
], function(
	redmicConfig
	, declare
	, lang
	, request
	, notify
	, registry
	, _Module
	, Credentials
){
	return declare(_Module, {
		//	Summary:
		//		Módulo para manejar las credenciales de los usuarios.
		//	Description:
		//		Obtiene las credenciales del servidor y escucha las peticiones para obtener información de las mismas,
		//		además de publicar cambios.
		//		También maneja errores de permisos en peticiones y les añade cabeceras de autentificación.

		//	_filteredUrls: Array
		//		Define las URLs a las que no hay que añadirle caberas de autentificación
		//	_loginPath: String
		//		Ruta correspondiente a la vista de acceso
		//	_serverUrlPrefix: String
		//		Prefijo de rutas hacia el servidor

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

				_filteredUrls: [
					'token',
					'reCaptcha',
					'register',
					'resettingRequest',
					'resettingSetPassword',
					'activateAccount'
				],
				_loginPath: '/login',
				_apiUrl: 'api'
			};

			lang.mixin(this, this.config, args);

			this._prepareRequestHandlers();
			this._initializeCredentials();
			this._listenCredentials();
		},

		_prepareRequestHandlers: function() {

			notify('error', lang.hitch(this, this._requestErrorHandler));
			registry.register(lang.hitch(this, this._preRequestHandler), request);
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

			var headers = {
				'Content-Type': 'application/json',
				'Accept': 'application/javascript, application/json'
			};

			var envDfd = window.env;
			if (envDfd) {
				envDfd.then(lang.hitch(this, function(envData) {

					this._apiUrl = envData.apiUrl;

					var target = redmicConfig.getServiceUrl(redmicConfig.services.profile, envData) + '/';
					request(target, {
						method: 'GET',
						handleAs: 'json',
						headers: headers
					}).then(
						lang.hitch(this, this._onGetCredentialsSuccess),
						lang.hitch(this, this._onGetCredentialsError));
				}));
			}
		},

		_onGetCredentialsSuccess: function(res) {

			var success = res.success,
				data = res.body[0];

			this.dataCredentials = data;

			if (!success) {
				Credentials.set('accessToken', null);
			} else {
				Credentials.set('userId', data.id.toString());
				Credentials.set('userName', data.firstName);
				Credentials.set('userEmail', data.email);
				Credentials.set('userRole', data.role.name);
				Credentials.set('allowedModules', data.category);

				this._emitEvt('GET_CREDENTIALS', {
					found: !!Credentials.get('accessToken')
				});
			}
		},

		_onGetCredentialsError: function(err) {

			this._emitEvt('REQUEST_FAILED');
		},

		_requestErrorHandler: function(err) {
			//	summary:
			//		Se ejecuta cuando un request produce un error y permite manejarlo
			//	tags:
			//		private
			//	err:
			//		respuesta con el error del request

			var res = err.response,
				status = res.status;

			if (status === 401) {
				this._onRequestPermissionError(res);
			} else if (status === 502) {
				this._onRequestReachabilityError(res);
			}
		},

		_onRequestPermissionError: function(res) {

			// TODO notificar al usuario que intentó acceder a algo para lo que no tenía permiso (token caducado o con
			// privilegios insuficientes)
			Credentials.set('accessToken', null);
		},

		_onRequestReachabilityError: function(res) {

			// TODO notificar al usuario que hubo un error de conexión y ofrecerle recargar (para que pueda actuar
			// sobre la página actual antes de recargar)
		},

		_preRequestHandler: function(url, options) {
			//	summary:
			//		Se ejecuta antes de hacer un request y nos permite añadir cabeceras
			//	tags:
			//		private
			//	url:
			//		url del servicio
			//	options:
			//		opciones del request (headers...)

			var urlSplitted = url.split('/'),
				lastUrlItem = urlSplitted.pop();

			if (!lastUrlItem.length) {
				lastUrlItem = urlSplitted.pop();
			}

			var lastUrlItemWithoutParams = lastUrlItem.split('?')[0],
				isFilteredUrlItem = this._filteredUrls.indexOf(lastUrlItemWithoutParams) !== -1,
				isUrlToServer = url.indexOf(this._apiUrl) !== -1,
				urlNeedsAuth = isUrlToServer && !isFilteredUrlItem;

			if (urlNeedsAuth) {
				if (!options.headers) {
					options.headers = {};
				}

				var accessToken = Credentials.get('accessToken');
				if (accessToken) {
					options.headers.Authorization = 'Bearer ' + accessToken;
				}
			}

			return !!options.useXHR;
		}
	});
});
