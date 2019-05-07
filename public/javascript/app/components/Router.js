define([
	'app/innerApp'
	, 'app/outerApp'
	, 'app/components/CookieLoader'
	, 'app/components/ModuleStore'
	, 'app/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/Deferred'
	, 'dojo/dom'
	, 'dojo/dom-attr'
	, 'dojo/has'
	, 'dojo/io-query'
	, 'dojo/mouse'
	, 'dojo/request'
	, 'put-selector/put'
	, 'redmic/base/CheckBrowser'
	, 'redmic/modules/notification/CommunicationCenter'
	, 'redmic/modules/notification/Alert'
	, 'redmic/modules/base/Credentials'
	, 'redmic/modules/base/Analytics'
	//, 'redmic/modules/base/NavegationHistory'
	, 'redmic/modules/base/MetaTags'
	, 'redmic/modules/base/_Module'
	, 'redmic/modules/base/Loading'
	, 'templates/LoadingCustom'
], function(
	InnerApp
	, OuterApp
	, CookieLoader
	, ModuleStore
	, redmicConfig
	, declare
	, lang
	, Deferred
	, dom
	, domAttr
	, has
	, ioQuery
	, mouse
	, request
	, put
	, CheckBrowser
	, CommunicationCenter
	, Alert
	, Credentials
	, Analytics
	//, NavegationHistory
	, MetaTags
	, _Module
	, Loading
	, LoadingCustomTemplate
) {

	var rootNode = dom.byId('rootContainer'),
		nativeLoadingNode = dom.byId('loadingContainer'),

		getGlobalContext = function() {

			if (has('host-browser')) {
				return window;
			} else if (has('host-node')) {
				return global;
			} else {
				console.error('Environment not supported');
			}
		},

		hideNativeLoadingNode = function() {

			if (nativeLoadingNode) {
				put('!', nativeLoadingNode);
				nativeLoadingNode = undefined;
			}
		};

	getGlobalContext().env = new Deferred();

	if (!CheckBrowser.isSupported()) {
		hideNativeLoadingNode();
		getGlobalContext().location.href = '/noSupportBrowser';

		return;
	}

	return declare(_Module, {
		//	summary:
		//		Módulo encargado de controlar el acceso a la aplicación.
		//	description:
		//		Escucha las rutas accedidas por el usuario. Diferencia entre los destinos pertenecientes a la parte
		//		externa (antes de obtener permisos) y a la parte interna (después de identificarse, aunque sea como
		//		usuario invitado). Maneja las instancias de layout de aplicación y de los módulos cargados dentro de
		//		dichos layouts.

		//	query: String
		//		Filtros de consulta procedentes de Router.
		//	paths: Object
		//		Constantes de rutas base

		//	_credentials: Object
		//		Instancia del módulo de control de permisos y accesos de usuario.
		//	_moduleStore: Object
		//		Instancia del módulo de control de los módulos vista a los que el usuario puede acceder.
		//	_loading: Object
		//		Instancia del módulo para gestionar el nodo cargando desde cualquier módulo.

		//	_currLayoutInstance: Object
		//		Instancia del layout de aplicación actual (innerApp o outerApp).
		//	_currModuleInstance: Object
		//		Instancia del módulo que está activado actualmente.
		//	_currModuleKey: String
		//		Clave del módulo actual dentro de moduleStore.
		//	_prevModuleKey: String
		//		Clave del módulo antiguo dentro de moduleStore.
		//	_userFound: Boolean
		//		Indica si hay presente algún token de usuario.

		constructor: function(args) {

			this.config = {
				ownChannel: 'app',
				events: {
					GET_CREDENTIALS: 'getCredentials',
					GET_MODULE: 'getModule'/*,
					ADD_NAV_HISTORY: 'addNavHistory'*/
				},
				query: '',
				paths: {
					ERROR: '/404',
					ROOT: '/',
					HOME: 'home',
					LOGIN: 'login'
				},
				_reconnectTimeout: 10000
			};

			lang.mixin(this, this.config, args);

			new CookieLoader();

			var eventListener = getGlobalContext().addEventListener ? ['addEventListener', ''] : ['attachEvent', 'on'];

			this._routerRegister(eventListener);

			this._getEnv();
		},

		_initialize: function() {

			new CommunicationCenter({
				parentChannel: this.ownChannel
			});

			new Alert({
				parentChannel: this.ownChannel
			});

			new Analytics({
				parentChannel: this.ownChannel
			});

			new MetaTags({
				parentChannel: this.ownChannel
			});

			/*this.navegationHistory = new NavegationHistory({
				parentChannel: this.ownChannel
			});*/

			this._credentials = new Credentials({
				parentChannel: this.ownChannel
			});

			this._moduleStore = new ModuleStore({
				parentChannel: this.ownChannel
			});

			this._loading = new Loading({
				parentChannel: this.ownChannel,
				globalNode: rootNode
			});
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this._credentials.getChannel('AVAILABLE'),
				callback: '_subAvailableCredentials'
			},{
				channel : this._credentials.getChannel('REMOVED'),
				callback: '_subCredentialsRemoved'
			},{
				channel : this._credentials.getChannel('REQUEST_FAILED'),
				callback: '_subCredentialsRequestFailed'
			},{
				channel : this._moduleStore.getChannel('AVAILABLE_MODULE'),
				callback: '_subAvailableModule'
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'GET_CREDENTIALS',
				channel: this._credentials.getChannel('GET_CREDENTIALS')
			},{
				event: 'GET_MODULE',
				channel: this._moduleStore.getChannel('GET_MODULE')
			}/*,{
				event: 'ADD_NAV_HISTORY',
				channel: this.navegationHistory.getChannel('ADD')
			}*/);
		},

		postCreate: function() {

			this._emitEvt('GET_CREDENTIALS');

			this.inherited(arguments);
		},

		_routerRegister: function(eventInfo) {
			//	summary:
			//		Se ejecuta al inicio de la aplicación para añadir un evento a cada
			//		href del dom para cambiar de módulo cuando se ejecuta
			//	tags:
			//		private
			//	eventInfo:
			//		Información del evento (addEventListener | attachEvent:on)

			var globalContext = getGlobalContext(),
				location = globalContext.history.location || globalContext.location;

			// hang on the event, all references in this document
			document[eventInfo[0]](eventInfo[1] + 'click', lang.hitch(this, function(evt) {

				var event = evt || globalContext.event,
					target = event.currentTarget.activeElement || event.srcElement;

				// looking for all the links with 'ajax' class found
				if (target && target.nodeName === 'A' && domAttr.get(target, 'd-state-url')) {
					var url = target.pathname + target.search;
					if (mouse.isMiddle(event)) {
						globalContext.open(globalContext.location.protocol + '//' + globalContext.location.hostname +
							url, '_blank');
					} else {
						// keep the link in the browser history
						this._addHistory(url);
						this._onRouteChange();
					}
					if (event.preventDefault) {
						event.preventDefault();
					} else {
						event.returnValue = false;
					}
				}
			}), false);

			// hang on popstate event triggered by pressing back/forward in browser
			globalContext[eventInfo[0]](eventInfo[1] + 'popstate', lang.hitch(this, function(evt) {

				this._onRouteChange();
			}), false);
		},

		_addHistory: function(value) {

			history.pushState(null, null, value);

			/*this._emitEvt('ADD_NAV_HISTORY', {
				url: value
			});*/
		},

		_onRouteChange: function() {

			var locationObj = getGlobalContext().location,
				locationPath = locationObj.pathname,
				moduleUrl = locationPath.substr(1),
				urlSplitted = moduleUrl.split('?'),
				route = urlSplitted[0],
				query = urlSplitted[1],
				routeIsEmpty = !route || route === '' || route === this.paths.ROOT,
				loginWasSuccessful = route === this.paths.LOGIN && this._userFound;

			if (routeIsEmpty || loginWasSuccessful) {
				route = this.paths.HOME;
				this._addHistory(route);
			}

			this._changeModule(route, query);
		},

		_getEnv: function() {

			var envDfd = getGlobalContext().env;

			if (envDfd && !envDfd.isFulfilled()) {
				request('/env', {
					handleAs: 'json'
				}).then(lang.hitch(envDfd, function(data) {

					this.resolve(data);
				}),lang.hitch(envDfd, function(error) {

					this.reject(error);
				}));
			}
		},

		_subCredentialsRemoved: function() {

			delete this._userFound;
			getGlobalContext().location.href = this.paths.ROOT;
		},

		_subAvailableCredentials: function(res) {

			this._userFound = res.found;
			this._onRouteChange();
		},

		_subCredentialsRequestFailed: function() {

			if (!this._reconnectingMessageNode) {
				this._showReconnectingMessage();
			}

			setTimeout(lang.hitch(this, this._emitEvt, 'GET_CREDENTIALS'), this._reconnectTimeout);
		},

		_showReconnectingMessage: function() {

			var template = LoadingCustomTemplate({
				message: this.i18n.tryingToReconnect,
				iconClass: 'hourglass-spin'
			});

			this._reconnectingMessageNode = put(rootNode, 'div.reconnectContainer');
			this._reconnectingMessageNode.innerHTML = template;

			hideNativeLoadingNode();
		},

		_changeModule: function(route, query) {
			//	summary:
			//		Actualiza el módulo que se visualiza.
			//	tags:
			//		private
			//	route:
			//		ruta del nuevo módulo
			//	query:
			//		queryString [Opcional]

			this._currModuleKey = route;

			var newQuery = query ? query : '';

			if (this._currModuleKey === this._prevModuleKey && this.query === newQuery) {
				return;
			}

			this._prevModuleKey = this._currModuleKey;
			this.query = newQuery;

			this._emitEvt('TRACK', {
				type: TRACK.type.page,
				info: query ? (route + '?' + query) : route
			});

			this._once(this._loading.getChannel('LOADING_DRAWN'), lang.hitch(this, this._onLoadingDrawn));
			this._publish(this._loading.getChannel('LOADING'), {
				instant: !this._currModuleInstance
			});
		},

		_onLoadingDrawn: function() {

			if (this._currModuleInstance) {
				this._closeModule();
			} else {
				this._openModule();
			}
		},

		_openModule: function() {
			//	summary:
			//		Abre un nuevo módulo a partir de su clave, que recoge de las propiedades de App.
			//	tags:
			//		private

			this._prepareApplicationLayout();

			this._emitEvt('GET_MODULE', {
				key: this._currModuleKey,
				query: ioQuery.queryToObject(this.query)
			});
		},

		_prepareApplicationLayout: function() {

			if (!redmicConfig.isOuterPath(this._currModuleKey)) {
				!this._innerAppRunning && this._createInnerApp();
			} else if (!this._outerAppRunning) {
				this._createOuterApp();
			}
		},

		_subAvailableModule: function(/*Object*/ instance) {
			//	summary:
			//		Se ejecuta este callback cuando recibe el modulo dedido
			//	tags:
			//		private

			if (!instance || !instance.getChannel) {
				getGlobalContext().location.href = this.paths.ERROR;
				return;
			}

			this._currModuleInstance = instance;

			this._once(this._currLayoutInstance.getChannel('MODULE_SHOWN'), lang.hitch(this, this._onModuleShown));

			this._publish(this._currLayoutInstance.getChannel('SHOW_MODULE'), {
				moduleKey: this._currModuleKey,
				moduleInstance: instance
			});
		},

		_closeModule: function() {
			//	summary:
			//		Cierra un módulo.
			//	tags:
			//		private

			this._once(this._currModuleInstance.getChannel('HIDDEN'), lang.hitch(this, this._onModuleHidden));

			this._publish(this._currModuleInstance.getChannel('HIDE'));
		},

		_createInnerApp: function() {
			//	summary:
			//		Crea la instancia de App interno y la prepara para su uso.
			//	tags:
			//		private

			delete this._outerAppRunning;
			this._innerAppRunning = true;

			this._deleteLayout();

			this._currLayoutInstance = new InnerApp();

			this._setCurrentLayout(this._currLayoutInstance);
		},

		_createOuterApp: function() {
			//	summary:
			//		Crea la instancia de layout de aplicación para entorno externo y la muestra.
			//	tags:
			//		private

			delete this._innerAppRunning;
			this._outerAppRunning = true;

			this._deleteLayout();

			this._currLayoutInstance = new OuterApp();

			this._setCurrentLayout(this._currLayoutInstance);
		},

		_setCurrentLayout: function(/*Object*/ layout) {
			//	summary:
			//		Muestra el layout de aplicación recibido.
			//	tags:
			//		private
			//	layout:
			//		Instancia del layout a mostrar

			this._once(layout.getChannel('SHOWN'), lang.hitch(this, this._onLayoutShown));

			this._publish(layout.getChannel('SHOW'), {
				node: rootNode
			});
		},

		_onLayoutShown: function() {

			hideNativeLoadingNode();

			if (this._reconnectingMessageNode) {
				put('!', this._reconnectingMessageNode);
			}
		},

		_deleteLayout: function() {
			//	summary:
			//		Elimina el layout actual y lo manda a destruir tras ocultarse
			//	tags:
			//		private

			if (!this._currLayoutInstance) {
				return;
			}

			this._once(this._currLayoutInstance.getChannel('HIDDEN'), lang.hitch(this, this._onLayoutHidden));
			this._publish(this._currLayoutInstance.getChannel('HIDE'));
		},

		_onLayoutHidden: function() {
			//	summary:
			//		Se ejecuta cuando el layout actual se ha terminado de ocultar. Destruye la instancia de dicho
			//		layout.
			//	tags:
			//		private

			this._currLayoutInstance.destroy();
			delete this._currLayoutInstance;
		},

		_onModuleShown: function(/*Object*/ res) {

			this._publish(this._loading.getChannel('LOADED'));
		},

		_onModuleHidden: function(/*Object*/ res) {
			//	summary:
			//		Se ejecuta cuando el módulo actual se ha terminado de cerrar. Lo desconecta y abre el siguiente
			//		módulo tras recibir la confirmación de desconexión del actual.
			//	tags:
			//		private
			//	res:
			//		Respuesta recibida en la suscripción

			this._once(this._currModuleInstance.getChannel('DISCONNECTED'), lang.hitch(this, this._openModule));
			this._publish(this._currModuleInstance.getChannel('DISCONNECT'));
		}
	});
});