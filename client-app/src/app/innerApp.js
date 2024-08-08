define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'dojo/dom-class'
	, 'put-selector/put'
	, 'src/util/Credentials'
	, 'src/app/_app'
	, 'src/component/components/Sidebar/MainSidebarImpl'
	, 'src/component/components/Topbar'
	, 'src/component/notification/Notification'
	, 'src/component/selection/Selector'
	, 'src/component/socket/_IngestData'
	, 'src/component/socket/Socket'
	, 'src/component/socket/Task'
], function(
	declare
	, lang
	, aspect
	, domClass
	, put
	, Credentials
	, App
	, MainSidebarImpl
	, Topbar
	, Notification
	, Selector
	, _IngestData
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
				ownChannel: this.innerAppOwnChannel,
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

			this._onEvt('MODULE_SHOWN', lang.hitch(this, this._onAppModuleShown));
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

			this._emitEvt('LOADING', {
				global: true
			});

			this.inherited(arguments);

			this._publish(this.topbar.getChannel('SHOW'), {
				node: this.domNode
			});

			this._publish(this.sidebar.getChannel('SHOW'), {
				node: this.domNode
			});

			this._evaluateAppSize();
		},

		_subToggleSidebar: function() {

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

		_onAppModuleShown: function(evt) {

			this._updateActiveSidebarItem(evt);

			this._emitEvt('LOADED');
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
				parentChannel: this.getChannel()
			});

			var userRole = Credentials.get('userRole');
			if (userRole !== 'ROLE_GUEST') {
				new Notification({
					parentChannel: this.getChannel()
				});

				new Socket({
					parentChannel: this.getChannel()
				});
			}

			var TaskDefinition = Task;

			if (userRole === 'ROLE_ADMINISTRATOR' || userRole === 'ROLE_OAG') {
				TaskDefinition = declare([TaskDefinition, _IngestData]);
			}

			new TaskDefinition({
				parentChannel: this.getChannel()
			});

			this.topbar = new Topbar({
				parentChannel: this.getChannel(),
				collapseButtonClass: this.collapseButtonClass,
				ecomarcan: this.ecomarcan
			});

			this.sidebar = new MainSidebarImpl({
				parentChannel: this.getChannel()
			});
		},

		_createStructure: function() {
			//	summary:
			//		Inicializa los componentes de la estructura interna de la app.
			//	tags:
			//		private

			this._contentContainer = put(this.domNode, 'div.' + this.contentContainerClass);

			this._overlaySidebarBackground = put(this.domNode, 'div.' + this.overlaySidebarBackgroundClass);
		},

		_createListeners: function() {

			this._appClickHandler = this._listenGlobalClicks(lang.hitch(this, this._onAppClicked));
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

		_onAppResize: function() {

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
		},

		_onAppClicked: function(evt) {

			var nodeDoesNotBelongToMainSidebar = !this._checkClickBelongsToNode(evt, this.sidebar.domNode),
				nodeBelongsToSidebarOverlay = this._checkClickBelongsToNode(evt, this._overlaySidebarBackground);

			if (nodeDoesNotBelongToMainSidebar && nodeBelongsToSidebarOverlay) {
				this._appClickHandler.pause();
				this._collapseMainSidebar();
			}
		}
	});
});
