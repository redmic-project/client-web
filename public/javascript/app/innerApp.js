define([
	'app/_app'
	, 'app/components/Topbar'
	, 'dijit/layout/BorderContainer'
	, 'dijit/layout/ContentPane'
	, 'dijit/layout/LayoutContainer'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
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
	, BorderContainer
	, ContentPane
	, LayoutContainer
	, declare
	, lang
	, aspect
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
				isLayoutContainer: true,
				innerAppActions: {
					UPDATE_ACTIVE: 'updateActive'
				},
				innerAppEvents: {
					UPDATE_ACTIVE: 'updateActive'
				}
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, '_mixEventsAndActions', lang.hitch(this, this._mixEventsAndActionsInnerApp));
			aspect.after(this, '_setOwnCallbacksForEvents', lang.hitch(this,
				this._setInnerAppOwnCallbacksForEvents));

			aspect.before(this, '_definePublications', lang.hitch(this, this._defineInnerAppPublications));

			this._createStructure();
			this._createModules();
		},

		_mixEventsAndActionsInnerApp: function () {

			lang.mixin(this.events, this.innerAppEvents);
			lang.mixin(this.actions, this.innerAppActions);
			delete this.innerAppEvents;
			delete this.innerAppActions;
		},

		_setInnerAppOwnCallbacksForEvents: function() {

			this._onEvt('MODULE_SHOWN', lang.hitch(this, this._updateActiveSidebarItem));
		},

		_defineInnerAppPublications: function() {

			this.publicationsConfig.push({
				event: 'UPDATE_ACTIVE',
				channel: this.sidebar.getChannel('UPDATE_ACTIVE')
			});
		},

		postCreate: function() {

			this.addChild(this.bc);
			this.addChild(this.sidebarNode);
			this.addChild(this.topbar);

			this._publish(this.sidebar.getChannel('SHOW'), {
				node: this.sidebarNode
			});

			this.inherited(arguments);

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

			this.bc = new BorderContainer({
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

		_doResize: function() {

			if (this._getNodeToShow()) {
				this.resize(arguments);
			}
		}
	});
});
