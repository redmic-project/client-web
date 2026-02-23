define([
	'dojo/_base/declare'
	, 'dojo/dom'
	, 'put-selector'
	, 'src/app/component/Analytics'
	, 'src/app/component/auth/Auth'
	, 'src/app/component/Credentials'
	, 'src/app/component/ExternalConfig'
	, 'src/app/component/layout/InnerLayoutImpl'
	, 'src/app/component/layout/OuterLayoutImpl'
	, 'src/app/component/Loading'
	, 'src/app/component/meta/MetaTags'
	, 'src/app/component/ModuleStore'
	, 'src/app/component/request/RestManagerXhrImpl'
	, 'src/app/component/Router'
	, 'src/app/util/CheckBrowser'
	, 'src/component/base/_Module'
	, 'src/component/notification/Alert'
	, 'src/component/notification/CommunicationCenter'
	, 'src/redmicConfig'
	, 'src/util/CookieLoader'
	, 'templates/LoadingCustom'
], function(
	declare
	, dom
	, put
	, Analytics
	, Auth
	, Credentials
	, ExternalConfig
	, InnerLayoutImpl
	, OuterLayoutImpl
	, Loading
	, MetaTags
	, ModuleStore
	, RestManagerXhrImpl
	, Router
	, CheckBrowser
	, _Module
	, Alert
	, CommunicationCenter
	, redmicConfig
	, CookieLoader
	, LoadingCustomTemplate
) {

	const rootNode = dom.byId('rootContainer'),
		nativeLoadingNode = dom.byId('loadingContainer');

	const hideNativeLoadingNode = function() {

		if (nativeLoadingNode) {
			put('!', nativeLoadingNode);
		}
	};

	if (!CheckBrowser.isSupported()) {
		hideNativeLoadingNode();
		globalThis.location.href = '/noSupportBrowser';

		return declare(null);
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
		//		Instancia del componente de layout de aplicación actual (InnerLayoutImpl o OuterLayoutImpl).
		//	_currModuleInstance: Object
		//		Instancia del módulo que está activado actualmente.
		//	_currModuleKey: String
		//		Clave del módulo actual dentro de moduleStore.
		//	_prevModuleKey: String
		//		Clave del módulo antiguo dentro de moduleStore.

		postMixInProperties: function() {

			const defaultConfig = {
				ownChannel: this.rootChannel,
				events: {
					GET_CREDENTIALS: 'getCredentials',
					GET_MODULE: 'getModule',
					CLEAR_MODULE: 'clearModule',
					MODULE_CHANGED: 'moduleChanged'
				},
				actions: {
					CHANGE_MODULE: 'changeModule',
					MODULE_CHANGED: 'moduleChanged'
				},

				_reconnectTimeout: 10000
			};

			this._mergeOwnAttributes(defaultConfig);

			this.inherited(arguments);
		},

		_initialize: function() {

			const parentChannel = this.getChannel();

			this._router = new Router({
				parentChannel
			});

			new CookieLoader();

			new RestManagerXhrImpl({
				parentChannel,
				apiUrl: redmicConfig.getEnvVariableValue('envApiUrl'),
			});

			new CommunicationCenter({
				parentChannel
			});

			new Alert({
				parentChannel
			});

			new Analytics({
				parentChannel
			});

			new MetaTags({
				parentChannel
			});

			this._credentials = new Credentials({
				parentChannel
			});

			this._externalConfig = new ExternalConfig({
				parentChannel
			});

			this._moduleStore = new ModuleStore({
				parentChannel
			});

			this._loading = new Loading({
				parentChannel,
				globalNode: rootNode
			});

			new Auth({
				parentChannel
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
				channel : this._credentials.getChannel('ADDED'),
				callback: '_subCredentialsAdded'
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
			},{
				event: 'MODULE_CHANGED',
				channel: this.getChannel('MODULE_CHANGED')
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._emitEvt('GET_CREDENTIALS');
		},

		_subCredentialsRemoved: function() {

			this._publish(this._router.getChannel('GO_TO_PREV_OR_ROOT_ROUTE'), {
				userGone: true
			});
		},

		_subCredentialsAdded: function() {

			this._publish(this._router.getChannel('GO_TO_PREV_OR_ROOT_ROUTE'));
		},

		_subAvailableCredentials: function(res) {

			this._publish(this._router.getChannel('EVALUATE_ROUTE'));
		},

		_subCredentialsRequestFailed: function() {

			if (!this._reconnectingMessageNode) {
				this._showReconnectingMessage();
			}

			setTimeout(() => this._emitEvt('GET_CREDENTIALS'), this._reconnectTimeout);
		},

		_subChangeModule: function(req) {

			const route = req.route;

			this._currModuleKey = route;
			if (this._currModuleKey === this._prevModuleKey) {
				return;
			}
			this._prevModuleKey = route;

			this._once(this._loading.getChannel('LOADING_DRAWN'), () => this._onLoadingDrawn());

			this._publish(this._loading.getChannel('LOADING'), {
				instant: !this._currModuleInstance
			});

			this._emitEvt('MODULE_CHANGED', {
				route
			});
		},

		_showReconnectingMessage: function() {

			const template = LoadingCustomTemplate({
				message: this.i18n.tryingToReconnect,
				iconClass: 'hourglass-spin'
			});

			this._reconnectingMessageNode = put(rootNode, 'div.reconnectContainer');
			this._reconnectingMessageNode.innerHTML = template;

			hideNativeLoadingNode();
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

			if (!instance?.getChannel) {
				this._publish(this._router.getChannel('GO_TO_ERROR_ROUTE'), {});
				return;
			}

			this._currModuleInstance = instance;
			this._once(instance.getChannel('DESTROYED'), () => this._onModuleDestroyed(this._currModuleKey));

			this._once(this._currLayoutInstance.getChannel('MODULE_SHOWN'), () => this._onModuleShown());
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

			this._once(this._currModuleInstance.getChannel('HIDDEN'), () => this._onModuleHidden());

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

			this._currLayoutInstance = new InnerLayoutImpl({
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

			this._currLayoutInstance = new OuterLayoutImpl({
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

			this._once(layout.getChannel('SHOWN'), () => this._onLayoutShown());

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

			this._once(this._currLayoutInstance.getChannel('HIDDEN'), () => this._onLayoutHidden());
			this._publish(this._currLayoutInstance.getChannel('HIDE'));
		},

		_onLayoutHidden: function() {
			//	summary:
			//		Se ejecuta cuando el layout actual se ha terminado de ocultar. Destruye la instancia de dicho
			//		layout.
			//	tags:
			//		private

			this._once(this._currLayoutInstance.getChannel('DESTROYED'), () => this._onLayoutDestroyed());
			this._publish(this._currLayoutInstance.getChannel('DESTROY'));
		},

		_onLayoutDestroyed: function() {

			delete this._currLayoutInstance;
		},

		_onModuleShown: function() {

			this._publish(this._loading.getChannel('LOADED'));
		},

		_onModuleHidden: function() {
			//	summary:
			//		Se ejecuta cuando el módulo actual se ha terminado de cerrar. Lo desconecta y abre el siguiente
			//		módulo tras recibir la confirmación de desconexión del actual.
			//	tags:
			//		private

			this._once(this._currModuleInstance.getChannel('DISCONNECTED'), () => this._openModule());
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
