define([
	"dijit/registry"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/dom-class"
	, "dojo/on"
	, "dojo/query"
	, "put-selector/put"
	, "redmic/modules/base/_ListenWindowResize"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Show"

	, "dojo/NodeList-dom"
	, "dojo/NodeList-traverse"
], function(
	registry
	, declare
	, lang
	, domClass
	, on
	, query
	, put
	, _ListenWindowResize
	, _Module
	, _Show
) {

	return declare([_Module, _Show, _ListenWindowResize], {
		//	summary:
		//		Módulo para la creación del Sidebar de la aplicación.
		//	description:
		//		La barra principal está dividida en iconos que corresponden a las categorías en las que
		//		el usuario, al menos, tiene permiso de visualización de los módulos contenidos.
		//		Si se hace click sobre algún módulo, la aplicación lo cargará.
		//		Si se accede con una ruta previa, se detectará para informar del módulo y categoría activos.

		constructor: function(args) {

			this.config = {
				ownChannel: "sidebar",
				events: {
					ITEM_CLICK: "itemClick",
					GET_ALLOWED_MODULES: "getAllowedModules"
				},
				actions: {
					ADD_ITEMS: "addItems",
					UPDATE_ACTIVE: "updateActive",
					ITEM_CLICKED: "itemClicked",
					GET_ALLOWED_MODULES: "getAllowedModules",
					AVAILABLE_ALLOWED_MODULES: "availableAllowedModules"
				},

				enableCollapseSidebarClass: 'enableCollapseSidebar',
				collapsedSidebarClass: 'collapsedSidebar',
				primaryClass: "primary.main-nav",
				primaryActiveItem: null,
				suffixI18n: '',
				items: null
			};

			lang.mixin(this, this.config, args);
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel('ADD_ITEMS'),
				callback: "_subAddItems"
			},{
				channel : this.getChannel("UPDATE_ACTIVE"),
				callback: "_subUpdateActive"
			},{
				channel : this._buildChannel(this.credentialsChannel, this.actions.AVAILABLE_ALLOWED_MODULES),
				callback: "_subAllowedModules",
				options: {
					predicate: lang.hitch(this, this._chkPublicationIsForMe)
				}
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'ITEM_CLICK',
				channel: this.getChannel('ITEM_CLICKED')
			},{
				event: 'GET_ALLOWED_MODULES',
				channel: this._buildChannel(this.credentialsChannel, this.actions.GET_ALLOWED_MODULES)
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			if (this._getLowWidth()) {
				this._collapseSidebar();
			}
		},

		_afterShow: function() {

			this._createPrimaryNavMenu();

			if (this.items) {
				this._addItems(this.items);
			} else {
				this._emitEvt('GET_ALLOWED_MODULES', {
					id: this.getOwnChannel()
				});
			}
		},

		_resize: function() {

			if (this._getLowWidth()) {
				this._collapseSidebar();
			} else {
				this._uncollapseSidebar();
			}
		},

		_subAddItems: function(/*Object*/ res) {

			this._addItems(res.items);
		},

		_subUpdateActive: function(res) {
			//	Summary:
			//		Se ejecuta este callback cuando recibe el path de la vista visualizada,
			//		a continuación se establece el item del sidebar activo a partir del path recibido
			//	tags:
			//		private
			//	path: String
			//		Path de la vista activa

			this._updateActive(res);
		},

		_subAllowedModules: function(/*Object*/ res) {
			//	summary:
			//		Se ejecuta este callback cuando recibe los módulos permitidos al usuario
			//		mandando a crear la estructura y añadiendo los items con los módulos recibidos
			//	tags:
			//		private
			//	response: Object
			//		Respuesta de la petición que contiene los módulos permitidos.

			this._createPrimaryNavMenu();
			this._addItems(res.data);
		},

		_createPrimaryNavMenu: function() {
			//	Summary:
			//		Función para la creación de la primera barra creando los tags html correspondientes
			//	tags:
			//		private

			if (this.primaryNavMenuNode) {
				return;
			}

			var primaryNav = 'nav.' + this.primaryClass;

			this.primaryNavNode = put(this.domNode, primaryNav);
			this.primaryNavMenuNode = put(this.primaryNavNode, "ul");
		},

		_collapseSidebar: function() {

			var classAction = 'add',
				newLabel = this.i18n.menuTextExpand;

			this._updateSidebarCollapseStatus(classAction, newLabel);
		},

		_uncollapseSidebar: function() {

			var classAction = 'remove',
				newLabel = this.i18n.menuTextReduce;

			this._updateSidebarCollapseStatus(classAction, newLabel);
		},

		_updateSidebarCollapseStatus: function(classAction, newLabel) {

			var globalContainerId = query('#rootContainer')[0].children[0].id,
				globalContainer = registry.byId(globalContainerId),
				updateMethod = domClass[classAction];

			updateMethod(this.ownerDocumentBody, this.enableCollapseSidebarClass);
			updateMethod(this.ownerDocumentBody, this.collapsedSidebarClass);

			if (globalContainer && typeof globalContainer.resize === 'function') {
				globalContainer.resize();
			}
		},

		_addItems: function(/*Array*/ items) {
			//	Summary:
			//		Función para rellenar de elementos las dos barras laterales.
			//	tags:
			//		private
			//	items: Array
			//		Array con los items de primer y segundo nivel para añadirlos al sidebar

			for (var i = 0; i < items.length; i++) {
				if (!items[i].hidden && items[i].enable) {
					this._insertItemInPrimaryNav(items[i]);
				}
			}
		},

		_insertItemInPrimaryNav: function(item) {

			var mainItemNode = this._addPrimaryIcon(item);

			put(this.primaryNavMenuNode, mainItemNode);
		},

		_addPrimaryIcon: function(/*Object*/ item) {
			//	Summary:
			//		Agrega un item a la barra lateral principal.
			//	Tags:
			//		private
			//	item:
			//		Objeto que representa al item actual
			//	returns:
			//		Devuelve el node del elemento creado

			var label = item.name || item.label,
				prelabel = "li." + label,
				iconPrefix = item.icon.split("-")[0],
				icon = iconPrefix + "." + item.icon,
				labelI18n = this.i18n[label + this.suffixI18n] || this.i18n[label],
				itemDom = put(prelabel + "[title=" + labelI18n + "]");

			if (item.active) {
				this.primaryActiveItem = label;
			}

			if (label === this.primaryActiveItem) {
				put(itemDom, ".active");
			}

			if (item.href) {
				put(itemDom, "a[href=" + item.href + "][d-state-url=true] i." + icon + " +span", labelI18n);
			} else {
				put(itemDom, "i." + icon + " +span", labelI18n);

				on(itemDom, "click", lang.hitch(this, this._onClick, itemDom, {label: label}));
			}

			return itemDom;
		},

		_onClick: function(/*Object*/ itemDom, /*Object*/ obj, /*Object*/ event) {
			//	Summary:
			//		Evento click de un item de la barra principal
			//	tags:
			//		private
			//	itemDom:
			//		Nodo del item
			//	obj
			//		Label del item
			//	evt
			//		Evento del click

			if (!this._isValidClick(obj)) {
				return;
			}

			this._emitEvt('ITEM_CLICK', obj);

			this._updateActive(obj);
		},

		_isValidClick: function(obj) {

			return this.primaryActiveItem !== obj.label;
		},

		_updateItemsActive: function(/*String*/ currentLabel) {
			//	Summary:
			//		Actualiza el estado de los elementos de la barra principal
			//	Description:
			//		Se marca como activo el elemento especificado en currentLabel
			//	Tags:
			//		private

			var currentIsNotActiveItem = this.primaryActiveItem !== currentLabel;

			if (this.primaryActiveItem && currentIsNotActiveItem) {
				var activeItems = query("li.active", this.primaryNavMenuNode);
				if (activeItems.length) {
					domClass.remove(activeItems[0], "active");
				}
			}

			if (!this.primaryActiveItem || currentIsNotActiveItem) {
				this.primaryActiveItem = currentLabel;

				var currentItems = query("li." + currentLabel, this.primaryNavMenuNode);

				if (currentItems.length) {
					var currentItem = currentItems[0];
					domClass.remove(currentItem, "click");
					domClass.add(currentItem, "active");
				}
			}
		},

		_getNodeToShow: function() {

			return this.domNode;
		}
	});
});
