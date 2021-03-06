define([
	'app/_app'
	, 'app/components/Topbar'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, "dojo/dom-class"
	, 'dojo/on'
	, 'put-selector/put'
	, 'redmic/base/Credentials'
	, 'redmic/modules/selection/Selector'
	, 'redmic/modules/components/Sidebar/MainSidebarImpl'
	, 'redmic/modules/notification/Notification'
	, 'redmic/modules/socket/_IngestData'
	, 'redmic/modules/socket/_Report'
	, 'redmic/modules/socket/_Worms'
	, 'redmic/modules/socket/Socket'
	, 'redmic/modules/socket/Task'
], function(
	App
	, Topbar
	, declare
	, lang
	, aspect
	, domClass
	, on
	, put
	, Credentials
	, Selector
	, MainSidebarImpl
	, Notification
	, _IngestData
	, _Report
	, _Worms
	, Socket
	, Task
) {

	return declare(App, {
		//	Summary:
		//		Implementación del módulo App, encargada de mostrar las vistas de la parte interna de la aplicación
		//
		//	Description:
		//		Inicialmente, crea los módulos y estructuras necesarias para la parte interna de la app. También se
		//		encarga de actualizar el estado de sidebar.

		constructor: function(args) {

			this.config = {
				'class': 'mainContainer',
				reducedWidthClass: 'reducedWidth',
				contentContainerClass: 'contentContainer',
				collapseButtonClass: 'collapseSidebarButton',
				uncollapsedSidebarClass: 'uncollapsedSidebar',
				overlaySidebarBackgroundClass: 'overlaySidebarBackground',

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
			this._createListeners();
		},

		postCreate: function() {

			this.inherited(arguments);

			this._publish(this.topbar.getChannel('SHOW'), {
				node: this.domNode
			});

			this._publish(this.sidebar.getChannel('SHOW'), {
				node: this.domNode
			});

			this._evaluateAppSize();
		},

		_subToggleSidebar: function(req) {

			domClass.toggle(this.ownerDocumentBody, this.uncollapsedSidebarClass);

			this._handleListenersOnToggleSidebar();

			this._propagateActionToChildren('RESIZE', {});
		},

		_handleListenersOnToggleSidebar: function() {

			if (!this._getLowWidth()) {
				return;
			}

			var overlayMainSidebarIsOpen = domClass.contains(this.ownerDocumentBody, this.uncollapsedSidebarClass);

			if (overlayMainSidebarIsOpen) {
				this._appClickHandler.resume();
			} else {
				this._appClickHandler.pause();
			}
		},

		_updateActiveSidebarItem: function(evt) {
			//	summary:
			//		Manda a actualizar el item activo del sidebar

			var moduleKey = evt.key;

			this._emitEvt('UPDATE_ACTIVE', {
				path: moduleKey
			});

			if (this._getLowWidth()) {
				this._collapseMainSidebar();
				this._appClickHandler.pause();
			}
		},

		_createModules: function() {
			//	summary:
			//		Crea los módulos globales necesarios para que funcione la parte interna
			//		de la aplicación.
			//	tags:
			//		private

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

			this.topbar = new Topbar({
				parentChannel: this.ownChannel,
				collapseButtonClass: this.collapseButtonClass
			});

			this.sidebar = new MainSidebarImpl({
				parentChannel: this.ownChannel
			});
		},

		_createStructure: function() {
			//	summary:
			//		Inicializa los componentes de la estructura interna de la app.
			//	tags:
			//		private

			this._contentContainer = put(this.domNode, 'div.' + this.contentContainerClass);

			put(this.domNode, 'div.' + this.overlaySidebarBackgroundClass);
		},

		_createListeners: function() {

			this._appClickHandler = on.pausable(this.ownerDocumentBody, 'click', lang.hitch(this, this._onAppClicked));

			this._appClickHandler.pause();
		},

		_getNode: function() {
			//	summary:
			//		Retorna el nodo donde se van a mostrar los módulos.
			//	tags:
			//		private
			//	returns: Object
			//		Nodo central del layout

			return this._contentContainer;
		},

		_onAppResize: function(evt) {

			// TODO evita que entren instancias viejas (login, logout, login), cuando se destruya bien app, eliminar
			if (!this.domNode) {
				return;
			}

			this._appClickHandler.pause();

			this._evaluateAppSize();
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

			this._collapseMainSidebar();
		},

		_unsetReducedWidth: function() {

			domClass.remove(this.ownerDocumentBody, this.reducedWidthClass);

			this._uncollapseMainSidebar();
		},

		_collapseMainSidebar: function() {

			domClass.remove(this.ownerDocumentBody, this.uncollapsedSidebarClass);
		},

		_uncollapseMainSidebar: function() {

			domClass.add(this.ownerDocumentBody, this.uncollapsedSidebarClass);
		},

		_onAppHide: function() {

			this._appClickHandler.pause();

			// TODO reemplazo a destroy de todo 'app', eliminar cuando router no comparta canal y destruir solo 'app'
			this._publish(this.topbar.getChannel('DESTROY'));
			this._publish(this.sidebar.getChannel('DESTROY'));
			this._publish(this._buildChannel(this.selectorChannel, this.actions.DESTROY));
			this._publish(this._buildChannel(this.managerChannel, this.actions.DESTROY));
			this._publish(this._buildChannel(this.taskChannel, this.actions.DESTROY));
			this._publish(this._buildChannel(this.socketChannel, this.actions.DESTROY));
			this._publish(this._buildChannel(this.notificationChannel, this.actions.DESTROY));
		},

		_onAppClicked: function(evt) {

			var clickedNode = evt.target,
				targets = this._getClickTargets(evt),
				nodeDoesNotBelongToMainSidebar = targets.indexOf(this.sidebar.domNode) === -1,
				nodeDoesNotBelongToToggleButton = !this._findCollapseButtonNode(targets).length;

			if (nodeDoesNotBelongToMainSidebar && nodeDoesNotBelongToToggleButton) {
				this._appClickHandler.pause();
				this._collapseMainSidebar();
			}
		},

		_findCollapseButtonNode: function(nodes) {

			return nodes.filter(lang.hitch(this, function(target) {

				return target && target.classList && target.classList.contains(this.collapseButtonClass);
			}));
		}
	});
});
