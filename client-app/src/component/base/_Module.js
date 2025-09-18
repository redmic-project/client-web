define([
	'deepmerge'
	, "dijit/_WidgetBase"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "dojo/Deferred"
	, "dojo/Evented"
	, "dojo/i18n!app/nls/translation"
	, "dojo/on"
	, "dojo/promise/all"
	, "RWidgets/Utilities"
	, "src/util/Mediator"
	, "./_ChkCollection"
	, "./_CommunicationCenter"
	, "./_ManageClickEvent"
	, "./_ModuleItfc"
], function(
	deepmerge
	, _WidgetBase
	, declare
	, lang
	, aspect
	, Deferred
	, Evented
	, i18n
	, on
	, all
	, Utilities
	, Mediator
	, _ChkCollection
	, _CommunicationCenter
	, _ManageClickEvent
	, _ModuleItfc
) {

	const defaultConfig = {
		commonEvents: {
			CONNECT: "connect",
			DISCONNECT: "disconnect",
			STATUS: "status",
			TRACK: "track",
			GOT_PROPS: "gotProps",
			PROPS_SET: "propsSet",
			DESTROY: "destroy"
		},
		commonActions: {
			CONNECT: "connect",
			DISCONNECT: "disconnect",
			CONNECTED: "connected",
			DISCONNECTED: "disconnected",
			ERROR: "error",
			GETSTATUS: "getStatus",
			GOTSTATUS: "gotStatus",
			TRACK: "track",
			SET_PROPS: "setProps",
			GET_PROPS: "getProps",
			GOT_PROPS: "gotProps",
			DESTROY: "destroy",
			DESTROYED: "destroyed"
		},
		globalOwnChannels: {
			ROUTER: "router",
			STORE: "data",
			SELECTOR: "selection",
			CREDENTIALS: "credentials",
			EXTERNAL_CONFIG: "externalConfig",
			ANALYTICS: "analytics",
			MODULE_STORE: "moduleStore",
			TASK: "task",
			NOTIFICATION: "notification",
			SOCKET: "socket",
			META_TAGS: "metaTags",
			LOADING: "loading",
			ALERT: "alert",
			COMMUNICATION: "communicationCenter",
			AUTH: "auth"
		},

		rootChannel: "app",
		innerAppOwnChannel: 'innerApp',
		outerAppOwnChannel: 'outerApp',
		channelSeparator: Mediator.channelSeparator,

		i18n: i18n,

		ownChannel: "module",
		parentChannel: "",
		ownChannelSeparator: "-",
		childPathSeparator: ".",
		propSetSuffix: "Set",

		_childrenActionsAllowedToListen: ['CONNECTED', 'DISCONNECTED', 'DESTROYED'],
		_childrenActionDfdsNameSuffix: 'ChildrenActionDfds'
	};

	return declare([_WidgetBase, Evented, _ModuleItfc, _ChkCollection, _CommunicationCenter, _ManageClickEvent], {
		// summary:
		//   Base común para todos los componentes.
		// description:
		//   Permite definir los atributos y métodos comunes entre los componentes.
		//   Se acopla al ciclo de vida de los widgets Dijit de Dojo. Las fases disponibles son:
		//     constructor -> postMixInProperties -> buildRendering -> postCreate -> startup

		//	events: Object
		//		Estructura para almacenar los nombres de los eventos del módulo o vista.
		//	actions: Object
		//		Estructura para almacenar los nombres de las acciones del módulo o vista.
		//	commonEvents: Object
		//		Estructura para almacenar los nombres de los eventos comunes a todos los módulos
		//		y vistas.
		//	commonActions: Object
		//		Estructura para almacenar los nombres de las acciones comunes a todos los módulos
		//		y vistas.
		//	globalOwnChannels: Object
		//		Estructura para almacenar los ownChannel de los módulos que se instancian
		//		globalmente.
		//	subscriptions: Object
		//		Estructura para almacenar las subscripciones del módulo o la vista.
		//	publications: Object
		//		Estructura para almacenar las publicaciones del módulo o la vista.
		//	subscriptionsConfig: Array
		//		Estructura para almacenar las subscripciones propias del módulo o vista.
		//	publicationsConfig: Array
		//		Estructura para almacenar las publicaciones propias del módulo o vista.
		//	actionsPaused: Object
		//		Estructura para almacenar los nombres de las acciones pausadas.
		//	associatedIds: Array
		//		Array de ids de módulos a los que estamos asociados. Asociarse permite al módulo
		//		escuchar lo que ellos escuchan. Para las escuchas de datos, han de tener el mismo
		//		'target'.
		//	statusFlags: Object
		//		Flags para indicar el estado y circunstancias actuales del módulo.
		//	rootChannel: String
		//		Canal de comunicación correspondiente a la raíz de la aplicación (base para todos
		//		los demás).
		//	innerAppOwnChannel: String
		//		Terminación del canal de comunicación correspondiente al módulo "innerApp", encargado de contener los
		//		elementos que se encuentran en la parte interna (sidebar, vistas...). Es hijo a su vez de la raíz
		//		de la aplicación.
		//	outerAppOwnChannel: String
		//		Terminación del canal de comunicación correspondiente al módulo "outerApp", encargado de contener los
		//		elementos que se encuentran en la parte externa (login, register...). Es hijo a su vez de la raíz
		//		de la aplicación.
		//	ownChannel: String
		//		Canal de comunicación correspondiente al módulo.
		//	parentChannel: String
		//		Canal de comunicación correspondiente al padre del módulo o vista (por defecto,
		//		vacío).
		//	channelSeparator: String
		//		Separador de niveles de los canales. Por ejemplo, se coloca entre el canal del módulo padre y el
		//		ownChannel del módulo hijo cuando este se instancia.
		//	ownChannelSeparator: String
		//		Separador entre el ownChannel definido y el id de la instancia.
		//	propSetSuffix: String
		//		Sufijo añadido a las propiedades para generar el evento disparado tras su seteo.
		//	_childrenModules: Object
		//		Referencias a los módulos que son hijos (descendientes directos) del módulo.
		//	_childrenActionsAllowedToListen: Array
		//		Acciones que el módulo tiene permitido escuchar de sus hijos (descendientes directos) cuando estos
		//		publiquen.
		//	_childrenActionDfdsNameSuffix: String
		//		Sufijo aplicado al nombre del atributo que almacena los deferred para esperar por publicaciones por
		//		parte de los hijos.
		//	routerChannel: String
		//		Nombre del canal por donde se van a gestionar los cambios de ruta.
		//	storeChannel: String
		//		Nombre del canal por donde se van a recibir los datos.
		//	selectorChannel: String
		//		Nombre del canal por donde se van a seleccionar los items.
		//	credentialsChannel: String
		//		Nombre del canal por donde se va a controlar la cajita de seleccionados
		//	analyticsChannel: String
		//		Nombre del canal por donde se va a controlar el módulo de analytics
		//	moduleStoreChannel: String
		//		Nombre del canal por donde se va a controlar el módulo de moduleStore
		//	communicationChannel: String
		//		Nombre del canal por donde se van a publicar las notificaciones.
		//	authChannel: String
		//		Nombre del canal por donde se gestiona la sesión del usuario autenticado.
		//	i18n: Object
		//		Traducciones globales

		constructor: function() {

			this._mergeOwnAttributes(defaultConfig);

			this._prepareComponentInternalStructures();
			this._prepareComponentGlobalChannels();

			aspect.before(this, "postCreate", lang.hitch(this, this._postCreateMediator));
			aspect.after(this, "_initialize", lang.hitch(this, this._initializeModule));
		},

		_prepareComponentInternalStructures: function() {

			this.events = {};
			this.actions = {};
			this.subscriptions = {};
			this.publications = {};
			this.actionsPaused = {};
			this.associatedIds = [];
			this.statusFlags = {};
			this._childrenModules = {};
		},

		_prepareComponentGlobalChannels: function() {

			this.routerChannel = this._buildChannel(this.rootChannel, this.globalOwnChannels.ROUTER);
			this.storeChannel = this._buildChannel(this.rootChannel, this.globalOwnChannels.STORE);
			this.credentialsChannel = this._buildChannel(this.rootChannel, this.globalOwnChannels.CREDENTIALS);
			this.analyticsChannel = this._buildChannel(this.rootChannel, this.globalOwnChannels.ANALYTICS);
			this.moduleStoreChannel = this._buildChannel(this.rootChannel, this.globalOwnChannels.MODULE_STORE);
			this.metaTagsChannel = this._buildChannel(this.rootChannel, this.globalOwnChannels.META_TAGS);
			this.loadingChannel = this._buildChannel(this.rootChannel, this.globalOwnChannels.LOADING);
			this.alertChannel = this._buildChannel(this.rootChannel, this.globalOwnChannels.ALERT);
			this.communicationChannel = this._buildChannel(this.rootChannel, this.globalOwnChannels.COMMUNICATION);
			this.authChannel = this._buildChannel(this.rootChannel, this.globalOwnChannels.AUTH);

			this.outerAppChannel = this._buildChannel(this.rootChannel, this.outerAppOwnChannel);
			this.innerAppChannel = this._buildChannel(this.rootChannel, this.innerAppOwnChannel);

			this.selectorChannel = this._buildChannel(this.innerAppChannel, this.globalOwnChannels.SELECTOR);
			this.taskChannel = this._buildChannel(this.innerAppChannel, this.globalOwnChannels.TASK);
			this.socketChannel = this._buildChannel(this.innerAppChannel, this.globalOwnChannels.SOCKET);
			this.notificationChannel = this._buildChannel(this.innerAppChannel, this.globalOwnChannels.NOTIFICATION);
		},

		postMixInProperties: function() {
			// summary:
			//   Método perteneciente al ciclo de vida de un widget Dijit.
			// description:
			//   Respetar siempre en la definición del método las posibles definiciones heredadas, llamando siempre a
			//   this.inherited(arguments) en último lugar, para ejecutar la lógica aquí definida y que prevalezcan los
			//   valores procedentes del exterior.

			this.params && this._mergeOwnAttributes(this.params);

			this.inherited(arguments);
		},

		_mergeOwnAttributes: function(/*Object*/ args) {
			// summary:
			//   Recibe atributos definidos desde fuera para mezclarlos en profundidad dentro de la instancia.
			// description:
			//   Es importante que este método se llame desde la fase de postMixInProperties del componente, ya que
			//   justo antes Dijit hace una primera mezcla de args en this, que no tiene en cuenta los cambios. Por
			//   tanto, si se ejecuta antes, los cambios serán sobreescritos, y si se ejecuta después, puede ser
			//   demasiado tarde para asignar algunos valores necesarios en otras fases tempranas.

			lang.mixin(this, this._merge([this, args]));
		},

		_setModuleConfigurations: function() {

			this._setPaused(false);
			this.subscriptionsConfig = [];
			this.publicationsConfig = [];

			this._generateOwnChannel();
			this._mixModuleEventsAndActions();
			this._mixEventsAndActions();

			this._actionsPropNames = Object.keys(this.actions);

			if (this.getOwnChannel() !== this.rootChannel && !this.parentChannel) {
				console.error("The module '%s' does not have a parent", this.getChannel());
			}
		},

		buildRendering: function() {
			// summary:
			//   Método perteneciente al ciclo de vida de un widget Dijit.
			// description:
			//   Respetar siempre en la definición del método las posibles definiciones heredadas, llamando siempre a
			//   this.inherited(arguments) en primer lugar para ejecutar la lógica aquí definida.

			this.inherited(arguments);

			this._setModuleConfigurations();
			this._setConfigurations();
			// TODO hace falta definirlo?? creo que mejor un after de 'setConfigurations' definido por quien necesite
			this._afterSetConfigurations();
		},

		_mixModuleEventsAndActions: function () {

			lang.mixin(this.events, this.commonEvents);
			lang.mixin(this.actions, this.commonActions);
			delete this.commonEvents;
			delete this.commonActions;
		},

		_cleanDijitProblematicFeatures: function() {

			this.domNode.removeAttribute('widgetId');
		},

		_minimalInitialize: function() {

			this._defineInitialSubscriptions();
			this._defineInitialPublications();

			this._setSubscriptions(this._initialSubscriptionsConfig);
			this._setPublications(this._initialPublicationsConfig);

			delete this._initialSubscriptionsConfig;
			delete this._initialPublicationsConfig;
		},

		_initializeModule: function() {

			this._defineSubscriptions();
			this._definePublications();
			this._doEvtFacade();
			this._setOwnCallbacksForEvents();
			this._connectToMediator();
			this._initialized = true;
		},

		_generateOwnChannel: function() {

			if (!this._isGlobalModule()) {
				this.ownChannel += this.ownChannelSeparator + this.id;
			}
		},

		_isGlobalModule: function() {

			return this.parentChannel === this.innerAppChannel || this.parentChannel === this.rootChannel ||
				this.ownChannel === this.rootChannel;
		},

		_defineInitialSubscriptions: function() {

			this._initialSubscriptionsConfig = [{
				channel : this.getChannel('CONNECT'),
				callback: "_subConnect",
				alwaysOn: true
			},{
				channel : this.getChannel('DISCONNECT'),
				callback: "_subDisconnect"
			},{
				channel : this.getChannel('DESTROY'),
				callback: "_subDestroy",
				alwaysOn: true
			},{
				channel : this.getChannel("GETSTATUS"),
				callback: "_subGetStatus",
				alwaysOn: true
			},{
				channel : this.getChannel("SET_PROPS"),
				callback: "_subSetProps"
			},{
				channel : this.getChannel("GET_PROPS"),
				callback: "_subGetProps"
			},{
				channel : this.getChannel(),
				callback: "_subChildActionDone",
				alwaysOn: true,
				options: {
					predicate: lang.hitch(this, this._chkChildActionMustBeListened)
				}
			}];
		},

		_defineInitialPublications: function () {

			this._initialPublicationsConfig = [{
				event: 'CONNECT',
				channel: this.getChannel("CONNECTED")
			},{
				event: 'DISCONNECT',
				channel: this.getChannel("DISCONNECTED"),
				alwaysOn: true
			},{
				event: 'GOT_PROPS',
				channel: this.getChannel("GOT_PROPS")
			},{
				event: 'STATUS',
				channel: this.getChannel("GOTSTATUS"),
				alwaysOn: true
			},{
				event: 'TRACK',
				channel: this._buildChannel(this.analyticsChannel, 'TRACK'),
				alwaysOn: true
			},{
				event: 'DESTROY',
				channel: this.getChannel("DESTROYED"),
				alwaysOn: true
			}];
		},

		_postCreateMediator: function() {

			if (this._initialized) {
				return;
			}

			this._cleanDijitProblematicFeatures();
			this._minimalInitialize();
			this._beforeInitialize();
			this._initialize();
		},

		mergeComponentAttribute: function(/*String*/ attrName, /*Object*/ objToMerge, /*Object?*/ mergeOpts) {
			// summary:
			//   Recibe un nombre de atributo, un objeto para mezclar con el valor actual del atributo y un objeto
			//   opcional para configurar parámetros de la mezcla.
			//   Asigna al atributo indicado el valor resultante entre la mezcla de su valor actual con el valor
			//   recibido por parámetro, siguiendo las opciones de mezcla establecidas.

			this[attrName] = this._merge([this[attrName] || {}, objToMerge], mergeOpts);
		},

		getOwnChannel: function() {

			return this.ownChannel;
		},

		_getActionValue: function(/*String*/ actionPropName) {

			return this.actions[actionPropName];
		},

		checkAction: function(/*String*/ action) {

			if (action === undefined || action === null || action === '') {
				return false;
			}

			var actionIsUpperCase = action === action.toUpperCase();

			if (actionIsUpperCase) {
				var actionIsPropName = this._getActionValue(action) !== undefined;
				return actionIsPropName;
			}

			var actionPropName = this._getActionPropName(action);

			return actionPropName && !!actionPropName.length;
		},

		_getActionPropName: function(/*String*/ actionValue) {

			var actionPropNameFound = this._actionsPropNames.filter(
				lang.hitch(this, function(actionValueToCheck, actionPropName) {

				return this.actions[actionPropName] === actionValueToCheck;
			}, actionValue));

			return actionPropNameFound.length && actionPropNameFound[0];
		},

		getChannel: function(/*String?*/ action) {

			var channel = this._buildChannel(this.getParentChannel(), this.getOwnChannel());

			if (action === undefined || action === null) {
				return channel || '';
			}

			this._checkActionExistence(action);

			return this._buildChannel(channel, action);
		},

		getParentChannel: function(/*String?*/ action) {

			var channel = this.parentChannel;

			if (action === undefined || action === null) {
				return channel || '';
			}

			this._checkActionExistence(action);

			return this._buildChannel(channel, action);
		},

		_checkActionExistence: function(/*String*/ action) {

			if (!this.checkAction(action)) {
				console.error("The action '%s' does not exist at module '%s'", action,
					this._buildChannel(this.parentChannel, this.ownChannel));
			}
		},

		_buildChannel: function(/*String*/ channel, /*String?*/ channelSuffix) {

			var channelBuilt = channel || "";

			if (arguments.length > 1 && !channelSuffix) {
				console.error("Tried to build a channel '%s' with invalid suffix at module '%s'", channel,
					this.parentChannel + this.channelSeparator + this.ownChannel);

				return channelBuilt;
			}

			if (channelSuffix) {
				var actionValue = this.actions && this._getActionValue(channelSuffix),
					suffixValue = actionValue || channelSuffix;

				if (channelBuilt.length) {
					channelBuilt += this.channelSeparator;
				}
				channelBuilt += suffixValue;
			}

			return channelBuilt;
		},

		checkChildChannel: function(/*String*/ childPath) {

			var childInstance = Utilities.getDeepProp(this, childPath),
				isValidChild = !!(childInstance && childInstance.getChannel);

			return isValidChild;
		},

		getChildChannel: function(/*String*/ childPath, /*String?*/ action) {

			if (!this.checkChildChannel(childPath)) {
				console.error("The child '%s' of module '%s' doesn't exist or is not a module", childPath,
					this.getChannel());
			} else {
				var childInstance = Utilities.getDeepProp(this, childPath);
				return lang.hitch(childInstance, childInstance.getChannel)(action);
			}
		},

		_connectToMediator: function() {

			this._setSubscriptions(this.subscriptionsConfig);
			this._setPublications(this.publicationsConfig);

			this._emitEvt('CONNECT', {
				moduleChannel: this.getChannel()
			});
		},

		_setSubscriptions: function(/*Array*/ subscriptions) {

			var subscriptionHandlers = [];
			for (var i = 0; i < subscriptions.length; i++) {
				var subscriptionHandler = this._setSubscription(subscriptions[i]);
				subscriptionHandlers.push(subscriptionHandler);
			}

			return subscriptionHandlers;
		},

		_setSubscription: function(subscription) {

			if (!this._checkSubscriptionData(subscription)) {
				return;
			}

			var itemOptions = this._buildItemOptions(subscription),
				callbackName = subscription.callback,
				callback = typeof callbackName === 'string' ? this[callbackName] : callbackName,
				objHandler = this._subscribe(subscription.channel, callback, itemOptions, subscription.context || this),

				subscriptionHandler = {
					id: objHandler.id,
					callback: callback,
					channel: subscription.channel
				};

			this.subscriptions[subscription.channel] = subscriptionHandler;
			return subscriptionHandler;
		},

		_subscribe: function(chn, cbk, opt, ctx) {

			return Mediator.subscribe(chn, cbk, opt, ctx);
		},

		_once: function(chn, cbk, opt, ctx) {

			return Mediator.once(chn, cbk, opt, ctx);
		},

		_checkSubscriptionData: function(subscription) {

			var channel = subscription.channel,
				callback = subscription.callback;

			if (!channel) {
				console.error("Channel not set for subscription '%O' from module '%s'", subscription,
					this.getChannel());

				return false;
			} else if (!callback) {
				console.error("Callback not set for subscription '%O' from module '%s'", subscription,
					this.getChannel());

				return false;
			} else if (typeof callback === 'string' && !this[callback]) {
				console.error("Callback '%s' not set for subscription '%O' from module '%s'", callback,
					subscription, this.getChannel());

				return false;
			}

			return true;
		},

		_buildItemOptions: function(subscription) {

			var options = subscription.options || {};

			if (!subscription.alwaysOn) {
				var defPredicate = this._chkActionCanBeTriggered,
					predicate = options.predicate;

				if (predicate) {
					options.predicate = function() {

						return defPredicate.apply(this, arguments) && predicate.apply(this, arguments);
					};
				} else {
					options.predicate = defPredicate;
				}
			}

			return options;
		},

		_setPublications: function(/*Array*/ publications) {

			var publicationHandlers = [];
			for (var i = 0; i < publications.length; i++) {
				var publicationHandler = this._setPublication(publications[i]);
				publicationHandlers.push(publicationHandler);
			}

			return publicationHandlers;
		},

		_setPublication: function(publication) {

			if (!publication.callback) {
				publication.callback = "_pubDefaultCallback";
			}

			if (!this._checkPublicationData(publication)) {
				return;
			}

			var callback = this._buildItemCallback(publication),
				publicationHandler = this._onEvt(publication.event, callback),
				publicationObj = {
					handler: publicationHandler,
					channel: publication.channel
				};

			this.publications[publication.channel] = publicationObj;

			return publicationObj;
		},

		_pubDefaultCallback: function(/*String*/ channel, /*Object*/ objFromEvt) {

			this._publish(channel, objFromEvt);
		},

		_publish: function(chn, obj) {

			if (!!obj && typeof obj !== "object") {
				console.error("Tried to publish a valid value '%s' which is not an object at module '%s'", obj,
					this.getChannel());
			}

			const info = this._getComponentInfo();

			return Mediator.publish(chn, info, obj || {});
		},

		_getComponentInfo: function() {

			const publisherChannel = this.getChannel();

			return {publisherChannel};
		},

		_checkPublicationData: function(publication) {

			if (!publication.event) {
				console.error("Event not set for publication '%O' from module '%s'", publication, this.getChannel());
				return false;
			} else if (!this[publication.callback]) {
				console.error("Callback '%s' not set for publication '%O' from module '%s'", publication.callback,
					publication, this.getChannel());
				return false;
			} else if (!publication.channel) {
				console.error("Channel not set for publication '%O' from module '%s'", publication, this.getChannel());
				return false;
			}

			return true;
		},

		_buildItemCallback: function(item) {

			if (item.alwaysOn)
				return lang.hitch(this, this[item.callback], item.channel);

			return lang.hitch(this, this._publicationCallbackWrapper, item);
		},

		_publicationCallbackWrapper: function(item, evt) {

			if (this._chkActionCanBeTriggered({ namespace: item.channel }, this._getComponentInfo())) {
				lang.hitch(this, this[item.callback], item.channel, evt)();
			}
		},

		_subConnect: function(req) {

			var actions = req.actions,
				forceResumeActions = req.forceResumeActions;

			if (actions) {
				this._connectActions(actions);
			} else {
				this._resume(forceResumeActions);

				this._emitEvt('CONNECT', {
					moduleChannel: this.getChannel()
				});
			}

			this._propagateActionToChildren('CONNECT', req);
		},

		_connectActions: function(actionsToReconnect) {

			for (var i = 0; i < actionsToReconnect.length; i++) {
				this._connectAction(actionsToReconnect[i]);
			}
		},

		_connectAction: function(actionToReconnect) {

			var actionValue = this._getActionValue(actionToReconnect);
			delete this.actionsPaused[actionValue];
		},

		_getPaused: function() {

			return this.statusFlags.paused;
		},

		_setPaused: function(value) {

			this.statusFlags.paused = value;
		},

		_resume: function(forceResumeActions) {

			this._getPaused() && this._setPaused(false);

			if (forceResumeActions) {
				this.actionsPaused = {};
			}
		},

		_subDisconnect: function(req) {

			var actions = req.actions;

			if (actions) {
				this._disconnectActions(actions);
			} else {
				this._prepareModuleActionAfterChildrenActionsAreDone({
					action: 'DISCONNECTED',
					cbk: lang.hitch(this, this._disconnectModule)
				});
			}

			this._propagateActionToChildren('DISCONNECT', req);
		},

		_disconnectActions: function(actionsToDisconnect) {

			for (var i = 0; i < actionsToDisconnect.length; i++) {
				this._disconnectAction(actionsToDisconnect[i]);
			}
		},

		_disconnectAction: function(actionToDisconnect) {

			var actionValue = this._getActionValue(actionToDisconnect);
			this.actionsPaused[actionValue] = true;
		},

		_pause: function() {

			!this._getPaused() && this._setPaused(true);
		},

		_disconnectModule: function() {

			var actionOnChildrenDfdsName = '_' + this._getActionValue('DISCONNECTED') +
				this._childrenActionDfdsNameSuffix;

			delete this[actionOnChildrenDfdsName];

			this._pause();
			this._emitEvt('DISCONNECT', {
				moduleChannel: this.getChannel()
			});
		},

		_subGetStatus: function() {

			this._emitEvt('STATUS', this.statusFlags);
		},

		_subSetProps: function(req) {

			const propNames = [];

			for (const [propName, propValue] of Object.entries(req)) {
				if (!this._checkPropIsShareable(propName)) {
					console.error('Tried to set not settable property "%s" at module "%s"', propName, this.getChannel());
					continue;
				}

				propNames.push(propName);

				const newValue = this._getUnmutableValue(propValue),
					oldValue = this[propName];

				this._propagateBeforeSetProp(propName, newValue, oldValue);
				this._setProp(propName, newValue, oldValue);
				this._propagateAfterPropSet(propName, newValue, oldValue);
			}

			this._emitEvt('PROPS_SET', {propNames});
		},

		_getUnmutableValue: function(value) {

			const valueIsObject = value && typeof value === 'object',
				objectHasLifecycle = value?.ownChannel || value?.ownerDocument || value?.constructor;

			if (!valueIsObject || objectHasLifecycle) {
				return value;
			}

			return lang.clone(value);
		},

		_propagateBeforeSetProp: function(propName, newValue, oldValue) {

			const methodName = `_onSetProp${Utilities.capitalize(propName)}`;

			this[methodName]?.({propName, newValue, oldValue});
		},

		_setProp: function(propName, newValue, oldValue) {

			if (newValue === oldValue) {
				console.warn('Tried to update property "%s" using same value "%s" at module "%s"', propName, newValue,
					this.getChannel());
			}

			this[propName] = newValue;
		},

		_propagateAfterPropSet: function(propName, newValue, oldValue) {

			const evtKey = this._createEvent(propName + this.propSetSuffix),
				methodName = `_on${Utilities.capitalize(propName)}PropSet`;

			const changeObj = {
				prop: propName, // TODO eliminar cuando se unifique el uso de los nombres de abajo
				value: newValue, // TODO eliminar cuando se unifique el uso de los nombres de abajo
				propName, newValue, oldValue
			};

			this._emitEvt(evtKey, changeObj);
			this[methodName]?.(changeObj);
		},

		_subGetProps: function(req) {

			var props = {};

			for (var prop in req) {
				if (this._checkPropIsShareable(prop)) {
					props[prop] = this[prop];
				} else {
					console.error("Tried to get not gettable property '%s' at module '%s'", prop, this.getChannel());
				}
			}

			this._emitEvt("GOT_PROPS", props);
		},

		_subChildActionDone: function(res, channelInfo) {

			var triggeredChannel = channelInfo.namespace,
				triggeredAction = this._getActionFromChannel(triggeredChannel),
				callbackName = '_onChild' + Utilities.capitalize(triggeredAction);

			this[callbackName] && this[callbackName](res);
		},

		_onChildConnected: function(res) {

			var childModuleChannel = res.moduleChannel,
				childModuleOwnChannel = this._getActionFromChannel(childModuleChannel);

			this._childrenModules[childModuleOwnChannel] = true;
		},

		_onChildDisconnected: function(res) {

			var childModuleChannel = res.moduleChannel,
				childModuleOwnChannel = this._getActionFromChannel(childModuleChannel);

			this._childrenModules[childModuleOwnChannel] = false;
			this._resolvePendingChildrenActionDfds(childModuleChannel, this._getActionValue('DISCONNECTED'));
		},

		_onChildDestroyed: function(res) {

			var childModuleChannel = res.moduleChannel,
				childModuleOwnChannel = this._getActionFromChannel(childModuleChannel);

			delete this._childrenModules[childModuleOwnChannel];
			this._resolvePendingChildrenActionDfds(childModuleChannel, this._getActionValue('DESTROYED'));
		},

		_resolvePendingChildrenActionDfds: function(childModuleChannel, action) {

			var actionOnChildrenDfdsName = '_' + action + this._childrenActionDfdsNameSuffix,
				actionOnChildrenDfds = this[actionOnChildrenDfdsName];

			if (actionOnChildrenDfds) {
				var actionOnChildDfd = actionOnChildrenDfds[childModuleChannel];

				if (actionOnChildDfd && !actionOnChildDfd.isFulfilled()) {
					actionOnChildDfd.resolve();
				}
			}
		},

		_getChannelDepth: function(channel) {

			var channelSplitted = channel.split(this.channelSeparator);

			return channelSplitted.length - 1;
		},

		_createEvent: function(evtValue) {

			var evtKey = this._getEvtKey(evtValue);

			if (!this.events[evtKey]) {
				this.events[evtKey] = evtValue;
			}

			return evtKey;
		},

		_getEvtKey: function(evtValue) {

			return evtValue.replace(/([A-Z])/g, '_$1').toUpperCase();
		},

		_emitEvt: function(evtKey, valueToEmit) {

			var evtValue = this.events[evtKey];

			if (evtValue) {
				this.emit(evtValue, valueToEmit);
			} else {
				console.error("Tried to emit inexistent event '%s' at module '%s'", evtKey, this.getChannel());
			}
		},

		_tryToEmitEvt: function(evtKey, valueToEmit) {

			var evtValue = this.events[evtKey];

			evtValue && this.emit(evtValue, valueToEmit);
		},

		_onEvt: function(evtKey, cbk) {

			var evtValue = this.events[evtKey];

			if (evtValue) {
				return this.on(evtValue, cbk);
			}

			console.error("Tried to register a callback to an inexistent event '%s' at module '%s'", evtKey,
				this.getChannel());
		},

		_onceEvt: function(evtKey, cbk) {

			var evtValue = this.events[evtKey];

			if (evtValue) {
				return on.once(this, evtValue, cbk);
			}

			console.error("Tried to register a once callback to an inexistent event '%s' at module '%s'", evtKey,
				this.getChannel());
		},

		_checkPropIsShareable: function(propName) {

			return propName.length && propName[0] !== "_";
		},

		_replaceSubscriptions: function(oldSubscriptions, newSubscriptions) {

			var i;
			for (i = 0; i < oldSubscriptions.length; i++) {
				this._removeSubscription(oldSubscriptions[i].channel);
			}

			for (i = 0; i < newSubscriptions.length; i++) {
				this._setSubscription(newSubscriptions[i]);
			}
		},

		_replacePublications: function(oldPublications, newPublications) {

			var i;
			for (i = 0; i < oldPublications.length; i++) {
				this._removePublication(oldPublications[i].channel);
			}

			for (i = 0; i < newPublications.length; i++) {
				this._setPublication(newPublications[i]);
			}
		},

		_removeSubscriptions: function(/*Array?*/ subscriptionsObjsOrChannels) {

			if (!subscriptionsObjsOrChannels){
				subscriptionsObjsOrChannels = Object.keys(this.subscriptions);
			}

			for (var i = 0; i < subscriptionsObjsOrChannels.length; i++) {
				this._removeSubscription(subscriptionsObjsOrChannels[i]);
			}
		},

		_removeSubscription: function(subscriptionObjOrChannel) {

			var channel, subscription;

			if (typeof subscriptionObjOrChannel === "string") {
				channel = subscriptionObjOrChannel;
				subscription = this.subscriptions[channel];
			} else {
				subscription = subscriptionObjOrChannel;
				channel = subscription.channel;
			}

			var subscriptionId = subscription ? subscription.id : null;

			if (subscriptionId) {
				this._unsubscribe(channel, subscriptionId);
				delete this.subscriptions[channel];
			} else {
				console.error("Tried to delete an inexistent subscription to channel '%s' from module '%s'", channel,
					this.getChannel());
			}
		},

		_unsubscribe: function(chn, id) {

			var channel;

			if (typeof chn !== "string") {
				channel = chn.channel.namespace;
				id = chn.id;
			} else {
				channel = chn;
			}

			Mediator.remove(channel, id);
		},

		_removePublications: function(/*Array?*/ publicationsObjsOrChannels) {

			if (!publicationsObjsOrChannels) {
				publicationsObjsOrChannels = Object.keys(this.publications);
			}

			for (var i = 0; i < publicationsObjsOrChannels.length; i++) {
				this._removePublication(publicationsObjsOrChannels[i]);
			}
		},

		_removePublication: function(publicationObjOrChannel) {

			var channel, publicationEvtHandler;

			if (typeof publicationObjOrChannel === "string") {
				channel = publicationObjOrChannel;
				publicationEvtHandler = this.publications[channel] ? this.publications[channel].handler : null;
			} else {
				publicationEvtHandler = publicationObjOrChannel.handler;
				channel = publicationObjOrChannel.channel;
			}

			if (publicationEvtHandler) {
				publicationEvtHandler.remove();
				delete this.publications[channel];
			} else {
				console.error("Tried to delete an inexistent publication to channel '%s' from module '%s'", channel,
					this.getChannel());
			}
		},

		_deleteDuplicatedChannels: function(configArray) {

			configArray = Utilities.uniqBy(configArray, lang.hitch(this, this._isChannelDuplicated));
			return configArray;
		},

		_isChannelDuplicated: function(value, index, array) {

			var channel = value.channel;

			return this._getActionFromChannel(channel);
		},

		_getActionFromChannel: function(channel) {

			var channelSplitted = channel.split(this.channelSeparator);

			return channelSplitted.pop();
		},

		_groupEventArgs: function() {

		// TODO: esta función es igual q la siguiente pero a esta se la pasa el evento a emitir y no
		// se puede refactorizar porq cambia el orden de los parámetros. Pensar otra forma
			var eventArgs;

			if (arguments.length > 2) {
				eventArgs = {};
				for (var i = 1; i < arguments.length; i++) {
					eventArgs[i - 1] = arguments[i];
				}
			} else {
				eventArgs = arguments[1];
			}

			this._emitEvt(arguments[0], eventArgs);
		},

		_getEventArgsGroup: function(args) {

			var eventArgs;

			if (args.length > 1) {
				eventArgs = {};
				var ini = args[0] ? 0 : 1;
				for (var i = ini; i < args.length; i++) {
					eventArgs[i] = args[i];
				}
			} else {
				eventArgs = args[0];
			}

			return eventArgs;
		},

		_merge: function(/*Array*/ objects, options) {
			//	summary:
			//		Mezcla dos o más objetos y devuelve el resultado, sin alterar los objetos originales.
			//	description:
			//		Realiza la mezcla desde la derecha (final del array) hacia la izquierda (principio del array), por
			//		lo que las propiedades de los últimos objetos se impondrán sobre las de los primeros.
			//		Acepta opciones adicionales para concretar su funcionamiento, pasándolas directamente hacia
			// 		deepmerge. También acepta dos opciones propias para personalizar su funcionamiento:
			//		Con 'cloneDescendants' se puede forzar el clonado recursivo de los objetos a mezclar (por defecto,
			//		se usan los anidados originales para disminuir la carga).
			//		Con 'arrayMergingStrategy' se puede alterar el comportamiento de mezclado para los arrays. Permite
			//		elegir entre 'combine' (se combinan todos los elementos de los arrays coincidentes), 'overwrite'
			//		(por defecto, se sobreescribe cualquier array coincidente) y 'concatenate' (acumula todos los
			//		elementos de los arrays coincidentes).

			const clone = options?.cloneDescendants ?? false,
				arrayMergingStrategy = options?.arrayMergingStrategy ?? 'overwrite',
				isMergeableObject = this._isMergeableObject,
				deepmergeOptions = {clone, isMergeableObject};

			if (arrayMergingStrategy === 'combine') {
				// comportamiento por defecto de deepmerge, no se define
			} else if (arrayMergingStrategy === 'overwrite') {
				deepmergeOptions.arrayMerge = lang.hitch(this, this._overwritingArrayMerge);
			} else if (arrayMergingStrategy === 'concatenate') {
				deepmergeOptions.arrayMerge = lang.hitch(this, this._concatenateArrayMerge);
			}

			if (options && options.cloneDescendants) {
				delete options.cloneDescendants;
			}
			if (options && options.arrayMergingStrategy) {
				delete options.arrayMergingStrategy;
			}

			lang.mixin(deepmergeOptions, options);

			return deepmerge.all(objects, deepmergeOptions);
		},

		_isMergeableObject: function(value) {

			// Inspirado por https://github.com/jonschlinkert/is-plain-object
			return !!value?.constructor?.prototype?.hasOwnProperty('isPrototypeOf');
		},

		_overwritingArrayMerge: function(destinationArray, sourceArray, options) {

			return sourceArray;
		},

		_concatenateArrayMerge: function(destinationArray, sourceArray, options) {

			for (var i = 0; i < sourceArray.length; i++) {
				destinationArray.push(sourceArray[i]);
			}

			return destinationArray;
		},

		_subDestroy: function(req) {

			this._prepareModuleActionAfterChildrenActionsAreDone({
				action: 'DESTROYED',
				cbk: lang.hitch(this, this._destroyModule),
				waitForDisconnected: true
			});

			this._propagateActionToChildren('DESTROY', req);
		},

		_prepareModuleActionAfterChildrenActionsAreDone: function(args) {

			var actionValue = this._getActionValue(args.action);
				cbk = args.cbk,
				waitForDisconnected = args.waitForDisconnected || false,
				actionOnChildrenDfdsName = '_' + actionValue + this._childrenActionDfdsNameSuffix,
				currentModuleChannel = this.getChannel();

			this[actionOnChildrenDfdsName] = {};

			for (var key in this._childrenModules) {
				if (!this._childrenModules[key] && !waitForDisconnected) {
					continue;
				}

				var dfd = new Deferred(),
					childModuleChannel = this._buildChannel(currentModuleChannel, key);

				this[actionOnChildrenDfdsName][childModuleChannel] = dfd;
			}

			all(this[actionOnChildrenDfdsName]).then(cbk);
		},

		_propagateActionToChildren: function(action, req) {

			for (var childOwnChannel in this._childrenModules) {
				var childChannel = this._buildChannel(this.getChannel(), childOwnChannel),
					childActionChannel = this._buildChannel(childChannel, action);

				this._publish(childActionChannel, req);
			}
		},

		_destroyModule: function() {

			var currentModuleChannel = this.getChannel(),
				actionOnChildrenDfdsName = '_' + this._getActionValue('DESTROYED') + this._childrenActionDfdsNameSuffix;

			delete this[actionOnChildrenDfdsName];

			this._removeSubscriptions();

			this._emitEvt('DESTROY', {
				moduleChannel: currentModuleChannel
			});

			this._removePublications();

			this._unsubscribe(currentModuleChannel);

			this.destroy();
		}
	});
});
