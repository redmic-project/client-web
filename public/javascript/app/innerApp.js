define([
	'app/_app'
	, 'app/components/Topbar'
	, 'dijit/layout/ContentPane'
	, 'dijit/layout/LayoutContainer'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, "dojo/dom-class"
	, 'redmic/base/Credentials'
	, 'redmic/modules/base/Selector'
	, 'redmic/modules/components/Sidebar/MainSidebarImpl'
	, 'redmic/modules/store/RestManagerImpl'
	, 'redmic/modules/store/QueryStore'
	, 'redmic/modules/notification/Notification'
	, 'redmic/modules/socket/_IngestData'
	, 'redmic/modules/socket/_Report'
	, 'redmic/modules/socket/_Worms'
	, 'redmic/modules/socket/Socket'
	, 'redmic/modules/socket/Task'
	, 'redmic/modules/user/LanguageSelector'
	, 'redmic/modules/user/UserArea'
], function(
	App
	, Topbar
	, ContentPane
	, LayoutContainer
	, declare
	, lang
	, aspect
	, domClass
	, Credentials
	, Selector
	, MainSidebarImpl
	, RestManagerImpl
	, QueryStore
	, Notification
	, _IngestData
	, _Report
	, _Worms
	, Socket
	, Task
	, LanguageSelector
	, UserArea
) {
	return declare([LayoutContainer, App], {
		//	Summary:
		//		Implementación del módulo App, encargada de mostrar las vistas de la parte interna de la aplicación
		//
		//	Description:
		//		Inicialmente, crea los módulos y estructuras necesarias para la parte interna de la app. También se
		//		encarga de actualizar el estado de sidebar.

		constructor: function(args) {

			this.config = {
				design: 'sidebar',
				'class': 'mainContainer',
				reducedWidthClass: 'reducedWidth',
				uncollapsedSidebarClass: 'uncollapsedSidebar',
				isLayoutContainer: true,
				innerAppEvents: {
					UPDATE_ACTIVE: 'updateActive'
				},
				innerAppActions: {
					UPDATE_ACTIVE: 'updateActive',
					TOGGLE_SIDEBAR: 'toggleSidebar'
				}
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, '_mixEventsAndActions', lang.hitch(this, this._mixEventsAndActionsInnerApp));
			aspect.after(this, '_setOwnCallbacksForEvents', lang.hitch(this,
				this._setInnerAppOwnCallbacksForEvents));

			aspect.before(this, '_defineSubscriptions', lang.hitch(this, this._defineInnerAppSubscriptions));
			aspect.before(this, '_definePublications', lang.hitch(this, this._defineInnerAppPublications));
		},

		_mixEventsAndActionsInnerApp: function () {

			lang.mixin(this.events, this.innerAppEvents);
			lang.mixin(this.actions, this.innerAppActions);
			delete this.innerAppEvents;
			delete this.innerAppActions;
		},

		_setInnerAppOwnCallbacksForEvents: function() {

			this._onEvt('MODULE_SHOWN', lang.hitch(this, this._updateActiveSidebarItem));
			this._onEvt('RESIZE', lang.hitch(this, this._onAppResize));
		},

		_defineInnerAppSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel: this.getChannel('TOGGLE_SIDEBAR'),
				callback: '_subToggleSidebar',
				options: {
					predicate: lang.hitch(this, this._chkModuleCanResize)
				}
			});
		},

		_defineInnerAppPublications: function() {

			this.publicationsConfig.push({
				event: 'UPDATE_ACTIVE',
				channel: this.sidebar.getChannel('UPDATE_ACTIVE')
			});
		},

		_initialize: function() {

			this._createStructure();
			this._createModules();
		},

		postCreate: function() {

			this.inherited(arguments);

			this.addChild(this.bc);
			this.addChild(this.sidebarNode);
			this.addChild(this.topbar);

			this._publish(this.sidebar.getChannel('SHOW'), {
				node: this.sidebarNode
			});

			// TODO esto es un abuso, no deberíamos acceder a los nodos de un módulo desde fuera. Crear canal para
			// añadir hijos al topbar
			//
			// TODO realmente, Topbar habría que replantearlo, ya que no es un módulo sino un ContentPane decorado.
			var topbarRightNode = this.topbar.domNode.lastChild;

			this._publish(this._buildChannel(this.notificationChannel, this.actions.SHOW), {
				node: topbarRightNode
			});

			this._publish(this.languageSelector.getChannel('SHOW'), {
				node: topbarRightNode
			});

			this._publish(this.userArea.getChannel('SHOW'), {
				node: topbarRightNode
			});

			this._evaluateAppSize();
		},

		_subToggleSidebar: function(req) {

			domClass.toggle(this.ownerDocumentBody, this.uncollapsedSidebarClass);

			// TODO vestigio de dijit, desaparecerá
			this.layout();

			this._propagateActionToChildren('RESIZE', {});
		},

		_updateActiveSidebarItem: function(evt) {
			//	summary:
			//		Manda a actualizar el item activo del sidebar

			var moduleKey = evt.key;

			this._emitEvt('UPDATE_ACTIVE', {
				path: moduleKey
			});
		},

		_createModules: function() {
			//	summary:
			//		Crea los módulos globales necesarios para que funcione la parte interna
			//		de la aplicación.
			//	tags:
			//		private

			this.sidebar = new MainSidebarImpl({
				parentChannel: this.ownChannel
			});

			new QueryStore({
				parentChannel: this.ownChannel
			});

			new RestManagerImpl({
				parentChannel: this.ownChannel
			});

			new Selector({
				parentChannel: this.ownChannel
			});

			var userRole = Credentials.get('userRole');
			if (userRole !== 'ROLE_GUEST') {
				new Notification({
					parentChannel: this.ownChannel
				});

				new Socket({
					parentChannel: this.ownChannel
				});
			}

			var definitionTask = declare([Task, _Report, _Worms]);

			if (userRole === 'ROLE_ADMINISTRATOR' || userRole === 'ROLE_OAG') {
				definitionTask = declare([definitionTask, _IngestData]);
			}

			new definitionTask({
				parentChannel: this.ownChannel
			});

			this.userArea = new UserArea({
				parentChannel: this.ownChannel
			});

			this.languageSelector = new LanguageSelector({
				parentChannel: this.ownChannel
			});
		},

		_createStructure: function() {
			//	summary:
			//		Inicializa los componentes de la estructura interna de la app.
			//	tags:
			//		private

			this.sidebarNode = new ContentPane({
				region: 'left',
				'class': 'mainSidebar'
			});

			this.topbar = new Topbar({
				parentChannel: this.ownChannel,
				i18n: this.i18n
			});

			this.bc = new ContentPane({
				region: 'center',
				'class': 'contentContainer'
			});
		},

		_getNode: function() {
			//	summary:
			//		Retorna el nodo donde se van a mostrar los módulos.
			//	tags:
			//		private
			//	returns: Object
			//		Nodo central del layout

			return this.bc.domNode;
		},

		_onAppResize: function(evt) {

			if (!this._getNodeToShow()) {
				return;
			}

			this._evaluateAppSize();

			// TODO vestigio de dijit, desaparecerá
			this.layout();
		},

		_evaluateAppSize: function() {

			if (this._getLowWidth()) {
				this._setReducedWidth();
			} else {
				this._unsetReducedWidth();
			}
		},

		_setReducedWidth: function() {

			domClass.add(this.ownerDocumentBody, this.reducedWidthClass);
			domClass.remove(this.ownerDocumentBody, this.uncollapsedSidebarClass);
		},

		_unsetReducedWidth: function() {

			domClass.remove(this.ownerDocumentBody, this.reducedWidthClass);
			domClass.add(this.ownerDocumentBody, this.uncollapsedSidebarClass);
		},

		_onAppHide: function() {

			// TODO reemplazo a destroy de todo 'app', eliminar cuando router no comparta canal y destruir solo 'app'
			this._publish(this.sidebar.getChannel('DESTROY'));
			this._publish(this.languageSelector.getChannel('DESTROY'));
			this._publish(this.userArea.getChannel('DESTROY'));

			this._publish(this._buildChannel(this.storeChannel, this.actions.DESTROY));
			this._publish(this._buildChannel(this.selectorChannel, this.actions.DESTROY));
			this._publish(this._buildChannel(this.managerChannel, this.actions.DESTROY));
			this._publish(this._buildChannel(this.queryStoreChannel, this.actions.DESTROY));
			this._publish(this._buildChannel(this.taskChannel, this.actions.DESTROY));
			this._publish(this._buildChannel(this.socketChannel, this.actions.DESTROY));
			this._publish(this._buildChannel(this.notificationChannel, this.actions.DESTROY));

			this.sidebarNode.destroy();
			this.topbar.destroy();
			this.bc.destroy();
		}
	});
});
