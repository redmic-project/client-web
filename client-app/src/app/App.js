define([
	'app/components/CookieLoader'
	, 'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/dom'
	, 'dojo/has'
	, 'put-selector/put'
	, 'src/app/CheckBrowser'
	, 'src/app/innerApp'
	, 'src/app/ModuleStore'
	, 'src/app/outerApp'
	, 'src/app/Router'
	, 'redmic/modules/notification/CommunicationCenter'
	, 'redmic/modules/notification/Alert'
	, 'redmic/modules/base/Credentials'
	, 'redmic/modules/base/Analytics'
	, 'redmic/modules/metaTags/MetaTags'
	, 'redmic/modules/base/_Module'
	, 'redmic/modules/base/_Store'
	, 'redmic/modules/base/Loading'
	, 'redmic/modules/components/ExternalConfig'
	, 'redmic/modules/store/RestManagerImpl'
	, 'templates/LoadingCustom'
], function(
	CookieLoader
	, redmicConfig
	, declare
	, lang
	, dom
	, has
	, put
	, CheckBrowser
	, InnerApp
	, ModuleStore
	, OuterApp
	, Router
	, CommunicationCenter
	, Alert
	, Credentials
	, Analytics
	, MetaTags
	, _Module
	, _Store
	, Loading
	, ExternalConfig
	, RestManagerImpl
	, LoadingCustomTemplate
) {

	var rootNode = dom.byId('rootContainer'),
		nativeLoadingNode = dom.byId('loadingContainer');

	var getGlobalContext = function() {

		if (has('host-browser')) {
			return window;
		} else if (has('host-node')) {
			return global;
		} else {
			console.error('Environment not supported');
		}
	};

	var hideNativeLoadingNode = function() {

		if (nativeLoadingNode) {
			put('!', nativeLoadingNode);
			nativeLoadingNode = undefined;
		}
	};

	if (!CheckBrowser.isSupported()) {
		hideNativeLoadingNode();
		getGlobalContext().location.href = '/noSupportBrowser';

		return;
	}

	return declare(_Module, {
		//	summary:
		//		Módulo encargado de gestionar los componentes principales de la aplicación.
		//	description:
		//		Crea las instancias de los módulos que componen a la aplicación y coordina su funcionamiento. Maneja
		//		los accesos a las partes interna y externa, junto con los cambios de contenido principal a medida que el
		//		usuario navega por la aplicación.

		//	_router: Object
		//		Instancia del módulo de control de rutas de acceso.
		//	_credentials: Object
		//		Instancia del módulo de control de permisos y accesos de usuario.
		//	_externalConfig: Object
		//		Instancia del módulo de obtención de configuración externa, del lado del servidor.
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

		constructor: function(args) {

			// TODO medida temporal de comienzo de migración de identidad
			var currDomain = getGlobalContext().location.hostname,
				ecomarcanDomainPattern = /.*ecomarcan\..+/;

			this.config = {
				ownChannel: this.rootChannel,
				events: {
					GET_CREDENTIALS: 'getCredentials',
					GET_MODULE: 'getModule',
					CLEAR_MODULE: 'clearModule'
				},
				actions: {
					CHANGE_MODULE: 'changeModule'
				},

				_reconnectTimeout: 10000,
				_ecomarcan: ecomarcanDomainPattern.test(currDomain)
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			var parentChannel = this.getChannel();

			this._router = new Router({
				parentChannel: parentChannel,
				globalContext: getGlobalContext()
			});

			new CookieLoader();

			new RestManagerImpl({
				parentChannel: parentChannel
			});

			new CommunicationCenter({
				parentChannel: parentChannel
			});

			new Alert({
				parentChannel: parentChannel
			});

			new Analytics({
				parentChannel: parentChannel
			});

			new MetaTags({
				parentChannel: parentChannel,
				ecomarcan: this._ecomarcan
			});

			this._credentials = new Credentials({
				parentChannel: parentChannel
			});

			this._externalConfig = new ExternalConfig({
				parentChannel: parentChannel
			});

			this._moduleStore = new ModuleStore({
				parentChannel: parentChannel
			});

			this._loading = new Loading({
				parentChannel: parentChannel,
				globalNode: rootNode
			});
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.getChannel('CHANGE_MODULE'),
				callback: '_subChangeModule'
			},{
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
			},{
				event: 'CLEAR_MODULE',
				channel: this._moduleStore.getChannel('CLEAR_MODULE')
			});
		},

		postCreate: function() {

			this._emitEvt('GET_CREDENTIALS');
		},

		_subCredentialsRemoved: function() {

			this._publish(this._router.getChannel('GO_TO_ROOT_ROUTE'), {
				userGone: true
			});
		},

		_subAvailableCredentials: function(res) {

			this._publish(this._router.getChannel('EVALUATE_ROUTE'), {
				userFound: res.found
			});
		},

		_subCredentialsRequestFailed: function() {

			if (!this._reconnectingMessageNode) {
				this._showReconnectingMessage();
			}

			setTimeout(lang.hitch(this, this._emitEvt, 'GET_CREDENTIALS'), this._reconnectTimeout);
		},

		_subChangeModule: function(req) {

			var route = req.route,
				locationQuery = req.locationQuery,
				routeChanged = this._changeModule(route);

			if (routeChanged) {
				this._emitEvt('TRACK', {
					type: TRACK.type.page,
					info: route + locationQuery
				});
			}
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
				this._publish(this._router.getChannel('GO_TO_ERROR_ROUTE'), {});
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
				parentChannel: this.getChannel(),
				ecomarcan: this._ecomarcan
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
				parentChannel: this.getChannel(),
				ecomarcan: this._ecomarcan
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
