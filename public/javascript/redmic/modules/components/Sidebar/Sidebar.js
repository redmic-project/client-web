define([
	"dijit/layout/ContentPane"
	, "dijit/Menu"
	, "dijit/MenuItem"
	, "dijit/registry"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/dom-class"
	, "dojo/on"
	, "dojo/query"
	, "put-selector/put"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Show"
	, "dojo/NodeList-dom"
	, "dojo/NodeList-traverse"
], function(
	ContentPane
	, Menu
	, MenuItem
	, registry
	, declare
	, lang
	, domClass
	, on
	, query
	, put
	, _Module
	, _Show
){
	return declare([_Module, _Show, ContentPane], {
		//	summary:
		//		Módulo para la creación del Sidebar de la aplicación.
		//	description:
		//		La barra principal está dividida en iconos que corresponden a las categorías en las que
		//		el usuario, al menos, tiene permiso de visualización de los módulos contenidos.
		//		Si se hace click sobre algún módulo, la aplicación lo cargará.
		//		Si se accede con una ruta previa, se detectará para informar del módulo y categoría activos.

		//	primaryNav: Object
		//		Propiedades de la barra principal. Debe de tener "class" para asignarle estilos y
		//		"active" para especificar que categoría está activa (con un módulo en uso).

		constructor: function(args) {

			this.config = {
				primaryNav: {
					"class": "primary.main-nav",
					active: null
				},
				// own actions
				actions: {
					ADD_ITEMS: "addItems",
					UPDATE_ACTIVE: "updateActive",
					ITEM_CLICKED: "itemClicked"
				},
				events: {
					ITEM_CLICK: "itemClick"
				},
				suffixI18n: '',
				items: null,
				// mediator params
				ownChannel: "sidebar"
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
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'ITEM_CLICK',
				channel: this.getChannel('ITEM_CLICKED')
			});
		},

		_initialize: function() {

			this._createPrimaryNavMenu();
		},

		postCreate: function() {

			this.inherited(arguments);

			if (this.items) {
				this._addItems(this.items);
			}
		},

		startup: function() {

			this.inherited(arguments);

			this._createMenuSidebar();
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

		_updateActive: function(res) {

			this._updateItemsActive(res.label);
		},

		_createPrimaryNavMenu: function() {
			//	Summary:
			//		Función para la creación de la primera barra creando los tags html correspondientes
			//	tags:
			//		private

			var primaryNav = "nav";

			if (this.primaryNav["class"]) {
				primaryNav += "." + this.primaryNav["class"];
			}

			if (this.primaryNav.id) {
				primaryNav += "#" + this.primaryNav.id;
			}

			if (this.containerNode.children.length !== 0) {
				put(this.containerNode.firstChild, "!");
			}

			this.primaryNavNode = put(this.containerNode, primaryNav);
			this.primaryNavMenuNode = put(this.primaryNavNode, "ul");
		},

		_createMenuSidebar: function(){
			//	Summary:
			//		Función para la creación del menú que se expande en la barra pincipal,
			//		al hacer click derecho
			//	tags:
			//		private

			this.sidebarMenu = new Menu({
				targetNodeIds: [this.id]
			});

			this.sidebarMenu.addChild(new MenuItem({
				label: this.i18n.menuTextReduce,
				disabled: false,
				onClick: lang.hitch(this, this._onClickSidebarMenu)
			}));
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

			var itemDom = null,
				label = item.name || item.label,
				prelabel = "li." + label,
				iconPrefix = item.icon.split("-")[0],
				icon = iconPrefix + "." + item.icon,
				labelI18n = this.i18n[label + this.suffixI18n] || this.i18n[label];

			itemDom = put(prelabel + "[title=" + labelI18n + "]");

			if (item.active) {
				this.primaryNav.active = label;
			}

			if (label === this.primaryNav.active) {
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

			if (this.primaryNav.active === obj.label) {
				return false;
			}

			return true;
		},

		_updateItemsActive: function(/*String*/ primary) {
			//	Summary:
			//		Actualiza los elementos de las barras
			//	Description:
			//		Se pone a activo los elemntos que se hayan especificado por parámetros.
			//		El elemento de la primera barra (especificado en primary)
			//	Tags:
			//		private

			//Actualización de la barra de navegación primaria

			// Si ya hay un elemento activo y no coincide con el padre del elemento pulsado
			if ((this.primaryNav.active) && (this.primaryNav.active !== primary)) {
				// buscamos el elemnto activo
				var itemactive = query("li.active", this.primaryNavMenuNode);
				if (itemactive.length > 0) {
					// le borramos la clase activo
					domClass.remove(itemactive[0], "active");
				}
			}

			// Si el primaryNav.active es nulo y no es igual al padre se actualiza su valor y se añade la clase
			if ((!this.primaryNav.active) || (this.primaryNav.active !== primary)) {
				this.primaryNav.active = primary;

				var itemaddclass = query("li." + primary, this.primaryNavMenuNode);

				if (itemaddclass.length > 0) {
					// Si se ha hecho click con anterioridad, hay que quitarle la clase click antes
					if (domClass.contains(itemaddclass[0], "click")) {
						domClass.remove(itemaddclass[0], "click");
					}

					domClass.add(itemaddclass[0], "active");
				}
			}
		},

		_getNodeToShow: function() {

			return this.domNode;
		}
	});
});
