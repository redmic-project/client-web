define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/Deferred'
	, 'src/component/base/_Module'
	, 'src/component/base/_Store'
	, 'src/redmicConfig'
	, 'src/util/Credentials'
], function(
	declare
	, lang
	, Deferred
	, _Module
	, _Store
	, redmicConfig
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
					REMOVED: 'removed',
					ADDED: 'added',
					ACCEPT_COOKIES: 'acceptCookies',
					REQUEST_FAILED: 'requestFailed',
					USER_HAS_EDITION_CAPABILITIES: 'userHasEditionCapabilities',
					GOT_USER_GRANTS_FOR_ENTITY: 'gotUserGrantsForEntity'
				},
				actions: {
					GET_CREDENTIALS: 'getCredentials',
					GET_ALLOWED_MODULES: 'getAllowedModules',
					AVAILABLE: 'available',
					AVAILABLE_ALLOWED_MODULES: 'availableAllowedModules',
					REMOVED: 'removed',
					ADDED: 'added',
					COOKIES_ACCEPTED: 'cookiesAccepted',
					ACCEPT_COOKIES: 'acceptCookies',
					COOKIES_STATE: 'cookiesState',
					REQUEST_FAILED: 'requestFailed',
					HAS_USER_EDITION_CAPABILITIES: 'hasUserEditionCapabilities',
					USER_HAS_EDITION_CAPABILITIES: 'userHasEditionCapabilities',
					GET_USER_GRANTS_FOR_ENTITY: 'getUserGrantsForEntity',
					GOT_USER_GRANTS_FOR_ENTITY: 'gotUserGrantsForEntity'
				},

				_profileTarget: redmicConfig.services.profile,
				_tokenPayloadTarget: redmicConfig.services.getTokenPayload,

				_loginPath: '/login'
			};

			lang.mixin(this, this.config, args);

			this.target = [this._profileTarget, this._tokenPayloadTarget];

			this._initializeCredentials();
			this._listenCredentials();
		},

		_initializeCredentials: function() {

			if (!Credentials.get('selectIds')) {
				this._setEmptySelectionIds();
			}
		},

		_setEmptySelectionIds: function() {

			Credentials.set('selectIds', {});
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
			},{
				channel : this.getChannel('HAS_USER_EDITION_CAPABILITIES'),
				callback: '_subHasUserEditionCapabilities'
			},{
				channel : this.getChannel('GET_USER_GRANTS_FOR_ENTITY'),
				callback: '_subGetUserGrantsForEntity'
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
				event: 'REMOVED',
				channel: this.getChannel('REMOVED')
			},{
				event: 'ADDED',
				channel: this.getChannel('ADDED')
			},{
				event: 'ACCEPT_COOKIES',
				channel: this.getChannel('COOKIES_ACCEPTED')
			},{
				event: 'REQUEST_FAILED',
				channel: this.getChannel('REQUEST_FAILED')
			},{
				event: 'USER_HAS_EDITION_CAPABILITIES',
				channel: this.getChannel('USER_HAS_EDITION_CAPABILITIES')
			},{
				event: 'GOT_USER_GRANTS_FOR_ENTITY',
				channel: this.getChannel('GOT_USER_GRANTS_FOR_ENTITY')
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

		_subHasUserEditionCapabilities: function(_req) {

			this._emitEvt('USER_HAS_EDITION_CAPABILITIES', {
				editionCapabilities: Credentials.userIsEditor()
			});
		},

		_subGetUserGrantsForEntity: function(req) {

			this._getTokenPayload().then(tokenPayload => this._evaluateUserGrants(tokenPayload, req));
		},

		_getTokenPayload: function() {

			if (!this._tokenPayloadDfd) {
				this._tokenPayloadDfd = new Deferred();

				const token = Credentials.get('oidAccessToken');

				if (token?.length) {
					this._requestTokenPayload(token);
				} else {
					this._tokenPayloadDfd.resolve();
				}
			}

			return this._tokenPayloadDfd;
		},

		_evaluateUserGrants: function(payload, req) {

			const allowedRoles = this._getAllowedRoles(req),
				userRoles = payload?.resource_access?.['web-client']?.roles;

			const accessGranted = allowedRoles?.some(role => userRoles?.includes(role)) ?? false;

			this._emitEvt('GOT_USER_GRANTS_FOR_ENTITY', {
				accessGranted
			});
		},

		_getAllowedRoles: function(req) {

			const idPlaceholder = '{id}',
				idValue = req.entityId;

			return req.roles?.map(role => role.replace(idPlaceholder, idValue));
		},

		_onAccessTokenChanged: function(evt) {

			var value = evt.value;

			if (!value) {
				this._onAccessTokenRemoved();
				return;
			}

			this._setEmptySelectionIds();

			this._emitEvt('ADDED');
		},

		_onAccessTokenRemoved: function() {

			this._setEmptySelectionIds();

			this._emitEvt('REMOVED');
		},

		_cookiesAccepted: function(evt) {

			this._emitEvt('ACCEPT_COOKIES');
		},

		_getCredentials: function() {
			//	summary:
			//		Permite obtener las credenciales del usuario/invitado pidiéndolas al servidor
			//	tags:
			//		private

			this._emitEvt('GET', {
				target: this._profileTarget
			});
		},

		_requestTokenPayload: function(token) {
			// summary:
			//   Permite obtener el contenido del JWT del usuario pidiéndoselo al servidor para su verificación
			// tags:
			//   private

			this._emitEvt('REQUEST', {
				method: 'POST',
				target: this._tokenPayloadTarget,
				params: {
					query: {
						token
					}
				}
			});
		},

		_itemAvailable: function(res) {

			this._onProfileItemAvailable(res);
		},

		_dataAvailable: function(res, resWrapper) {

			if (resWrapper.target !== this._tokenPayloadTarget) {
				return;
			}

			this._onTokenPayloadDataAvailable(res);
		},

		_errorAvailable: function(err, status, resWrapper) {

			if (resWrapper.target === this._profileTarget) {
				this._onProfileErrorAvailable();
			}
		},

		_onProfileItemAvailable: function(res) {

			const data = res.data[0];

			if (!data) {
				Credentials.remove('accessToken');
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

		_onProfileErrorAvailable: function() {

			this._emitEvt('REQUEST_FAILED');
		},

		_onTokenPayloadDataAvailable: function(res) {

			const payload = res.data;

			this._tokenPayloadDfd?.resolve(payload);
		}
	});
});
