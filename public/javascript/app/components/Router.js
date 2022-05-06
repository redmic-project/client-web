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
	, 'put-selector/put'
	, 'redmic/base/CheckBrowser'
	, 'redmic/modules/notification/CommunicationCenter'
	, 'redmic/modules/notification/Alert'
	, 'redmic/modules/base/Credentials'
	, 'redmic/modules/base/Analytics'
	, 'redmic/modules/base/MetaTags'
	, 'redmic/modules/base/_Module'
	, 'redmic/modules/base/_Store'
	, 'redmic/modules/base/Loading'
	, 'redmic/modules/store/RestManagerImpl'
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
	, put
	, CheckBrowser
	, CommunicationCenter
	, Alert
	, Credentials
	, Analytics
	, MetaTags
	, _Module
	, _Store
	, Loading
	, RestManagerImpl
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

	return declare([_Module, _Store], {
		//	summary:
		//		Módulo encargado de controlar el acceso a la aplicación.
		//	description:
		//		Escucha las rutas accedidas por el usuario. Diferencia entre los destinos pertenecientes a la parte
		//		externa (antes de obtener permisos) y a la parte interna (después de identificarse, aunque sea como
		//		usuario invitado). Maneja las instancias de layout de aplicación y de los módulos cargados dentro de
		//		dichos layouts.

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
				ownChannel: this.rootChannel,
				events: {
					GET_CREDENTIALS: 'getCredentials',
					GET_MODULE: 'getModule',
					GET_QUERY_PARAMS: 'getQueryParams',
					CLEAR_MODULE: 'clearModule'
				},
				actions: {
					GET_QUERY_PARAMS: 'getQueryParams',
					GOT_QUERY_PARAMS: 'gotQueryParams'
				},

				paths: {
					ERROR: '/404',
					ROOT: '/',
					HOME: 'home',
					LOGIN: 'login'
				},
				target: '/env',
				_reconnectTimeout: 10000
			};

			lang.mixin(this, this.config, args);

			new CookieLoader();

			this._setRouterListeners();
		},

		_initialize: function() {

			new RestManagerImpl({
				parentChannel: this.getChannel()
			});

			new CommunicationCenter({
				parentChannel: this.getChannel()
			});

			new Alert({
				parentChannel: this.getChannel()
			});

			new Analytics({
				parentChannel: this.getChannel()
			});

			new MetaTags({
				parentChannel: this.getChannel()
			});

			this._credentials = new Credentials({
				parentChannel: this.getChannel()
			});

			this._moduleStore = new ModuleStore({
				parentChannel: this.getChannel()
			});

			this._loading = new Loading({
				parentChannel: this.getChannel(),
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
			},{
				channel : this.getChannel('GET_QUERY_PARAMS'),
				callback: '_subGetQueryParams'
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'GET_CREDENTIALS',
				channel: this._credentials.getChannel('GET_CREDENTIALS')
			},{
				event: 'GET_MODULE',
				channel: this._moduleStore.getChannel('GET_MODULE')
			},{
				event: 'CLEAR_MODULE',
				channel: this._moduleStore.getChannel('CLEAR_MODULE')
			},{
				event: 'GET_QUERY_PARAMS',
				channel: this.getChannel('GOT_QUERY_PARAMS')
			});
		},

		postCreate: function() {

			this._getEnv();

			this._emitEvt('GET_CREDENTIALS');

			this.inherited(arguments);
		},

		_setRouterListeners: function() {
			//	summary:
			//		Prepara la escucha en toda la aplicación de los eventos requeridos para controlar la navegación en
			//		una sola página
			//	tags:
			//		private

			var gCtx = getGlobalContext(),
				dCtx = gCtx.document,
				listenMethod, eventPrefix;

			if (gCtx.addEventListener) {
				listenMethod = dCtx.addEventListener;
				eventPrefix = '';
			} else {
				listenMethod = dCtx.attachEvent;
				eventPrefix = 'on';
			}

			listenMethod.call(dCtx, eventPrefix + 'click', lang.hitch(this, this._evaluateClickEvt));
			listenMethod.call(gCtx, eventPrefix + 'popstate', lang.hitch(this, this._evaluatePopStateEvt));
		},

		_evaluateClickEvt: function(evt) {
			//	summary:
			//		Recibe eventos de click y, en caso de detectar un enlace de navegación interno, lo captura
			//	tags:
			//		private

			var event = evt || getGlobalContext().event,
				targets = this._getClickTargets(event);

			for (var i = 0; i < targets.length; i++) {
				var target = targets[i],
					targetIsNotAppHref = !target || target.nodeName !== 'A' || !domAttr.get(target, 'd-state-url');

				if (targetIsNotAppHref) {
					continue;
				}

				this._handleAppHref(event, target);
				break;
			}
		},

		_handleAppHref: function(event, target) {

			var url = target.pathname + target.search + target.hash;

			if (mouse.isMiddle(event)) {
				var gCtx = getGlobalContext(),
					newPageUrl = target.protocol + '//' + target.hostname + url;

				gCtx.open(newPageUrl, '_blank');
			} else {
				this._addHistory(url);
				this._onRouteChange();
			}

			if (event.preventDefault) {
				event.preventDefault();
			} else {
				event.returnValue = false;
			}
		},

		_addHistory: function(value) {

			getGlobalContext().history.pushState(null, null, value);
		},

		_onRouteChange: function() {

			var locationObj = getGlobalContext().location,
				locationPath = locationObj.pathname,
				route = locationPath.substr(1),
				routeIsEmpty = !route || route === '' || route === this.paths.ROOT,
				loginWasSuccessful = route === this.paths.LOGIN && this._userFound;

			if (routeIsEmpty || loginWasSuccessful) {
				route = this.paths.HOME;
				this._addHistory(route);
			}

			var locationQuery = locationObj.search;

			this._handleQueryParameters(locationQuery.substr(1));

			var routeChanged = this._changeModule(route);
			if (routeChanged) {
				this._emitEvt('TRACK', {
					type: TRACK.type.page,
					info: route + locationQuery
				});
			}
		},

		_evaluatePopStateEvt: function(evt) {
			//	summary:
			//		Recibe eventos de popstate para navegar por la aplicación usando los botones de retroceder/avanzar
			//	tags:
			//		private

			this._onRouteChange();
		},

		_getEnv: function() {

			var envDfd = getGlobalContext().env;

			if (envDfd && !envDfd.isFulfilled()) {
				this._emitEvt('GET', {
					target: this.target
				});
			}
		},

		_itemAvailable: function(res) {

			var envDfd = getGlobalContext().env;
			envDfd.resolve(res.data);
		},

		_errorAvailable: function(error, status, resWrapper) {

			var envDfd = getGlobalContext().env;
			envDfd.reject(error);
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

		_handleQueryParameters: function(queryString) {

			this._currentQueryParams = this._getQueryParameters(queryString);

			this._removeQueryParametersFromHref();
		},

		_getQueryParameters: function(queryString) {

			return ioQuery.queryToObject(queryString);
		},

		_removeQueryParametersFromHref: function() {

			var locationObj = getGlobalContext().location,
				locationPort = locationObj.port,
				isNotStandardPort = locationPort !== '80',
				hrefPort = isNotStandardPort ? (':' + locationPort) : '',
				href = locationObj.protocol + '//' + locationObj.hostname + hrefPort + locationObj.pathname + locationObj.hash;

			getGlobalContext().history.replaceState(null, null, href);
		},

		_changeModule: function(route) {
			//	summary:
			//		Actualiza el módulo que se visualiza.
			//	tags:
			//		private
			//	route:
			//		ruta del nuevo módulo

			this._currModuleKey = route;

			if (this._currModuleKey === this._prevModuleKey) {
				return false;
			}

			this._prevModuleKey = this._currModuleKey;

			this._once(this._loading.getChannel('LOADING_DRAWN'), lang.hitch(this, this._onLoadingDrawn));

			this._publish(this._loading.getChannel('LOADING'), {
				instant: !this._currModuleInstance
			});

			return true;
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
				key: this._currModuleKey
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
			//		Se ejecuta este callback cuando recibe el módulo pedido
			//	tags:
			//		private

			if (!instance || !instance.getChannel) {
				getGlobalContext().location.href = this.paths.ERROR;
				return;
			}

			this._currModuleInstance = instance;

			this._once(this._currModuleInstance.getChannel('DESTROYED'), lang.hitch(this, this._onModuleDestroyed,
				this._currModuleKey));

			this._once(this._currLayoutInstance.getChannel('MODULE_SHOWN'), lang.hitch(this, this._onModuleShown));

			this._publish(this._currLayoutInstance.getChannel('SHOW_MODULE'), {
				moduleKey: this._currModuleKey,
				moduleInstance: instance
			});
		},

		_subGetQueryParams: function(req) {

			this._emitEvt('GET_QUERY_PARAMS', {
				requesterId: req.requesterId,
				queryParams: this._currentQueryParams || {}
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

			this._currLayoutInstance = new InnerApp({
				parentChannel: this.getChannel()
			});

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

			this._currLayoutInstance = new OuterApp({
				parentChannel: this.getChannel()
			});

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
			//		Oculta el layout actual
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

			this._once(this._currLayoutInstance.getChannel('DESTROYED'), lang.hitch(this, this._onLayoutDestroyed));
			this._publish(this._currLayoutInstance.getChannel('DESTROY'));
		},

		_onLayoutDestroyed: function() {

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
		},

		_onModuleDestroyed: function(/*String*/ moduleKey) {
			//	summary:
			//		Se ejecuta cuando el módulo actual se ha terminado de destruir. Manda a borrar su instancia del
			//		almacén de modulos.
			//	tags:
			//		private
			//	moduleKey:
			//		Clave del módulo destruido

			this._emitEvt('CLEAR_MODULE', {
				key: moduleKey
			});
		}
	});
});
