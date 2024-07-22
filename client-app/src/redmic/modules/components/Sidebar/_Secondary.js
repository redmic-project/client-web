define([
	"dijit/registry"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "dojo/dom-class"
	, "dojo/on"
	, "dojo/query"
	, "put-selector/put"
	, "dojo/NodeList-dom"
	, "dojo/NodeList-traverse"
], function(
	registry
	, declare
	, lang
	, aspect
	, domClass
	, on
	, query
	, put
) {

	return declare(null, {
		//	summary:
		//		Módulo para la creación del Sidebar de la aplicación.
		//	description:
		//		La barra secundaria se compone de items pertenecientes a un mismo item.
		//		Si se hace click sobre alguna categoría, se desplegará la barra secundaria.
		//		Si se hace click sobre algún módulo, la aplicación lo cargará.
		//		Si se accede con una ruta previa, se detectará para informar del módulo y categoría activos.

		constructor: function(args) {

			this.config = {
				secondaryClass: 'secondarySidebar.retiring',
				secondaryActiveItem: null,
				clickToCloseSecondaryListener: null,
				subitems: 'modules'
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_initialize", lang.hitch(this, this._initializeSecondary));
			aspect.before(this, "_updateActive", lang.hitch(this, this._hideSecondaryNavNode));
			aspect.before(this, "_insertItemInPrimaryNav", lang.hitch(this, this._insertItemInSecondaryNav));
		},

		_initializeSecondary: function() {

			this._createSecondaryNavMenu();
		},

		postCreate: function() {

			this.inherited(arguments);

			this.clickToCloseSecondaryListener = on.pausable(this.ownerDocumentBody, 'click', lang.hitch(this,
				this._onCloseSecNav));

			this.clickToCloseSecondaryListener.pause();
		},

		_onCloseSecNav: function(/*Object*/ evt) {
			//	Summary:
			//		Evento click del body de la página, activo solamente cuando el secondary
			//		nav está abierto. Si lo pulsado no fué ninguna de las barras del sidebar,
			//		indica de debemos cerrarla
			//	tags:
			//		private
			//	evt: Object
			//		Evento del click

			var parents = query(evt.target).parents();

			var isPrimaryNav = parents.some(lang.hitch(this, function(node) {

				return node === this.primaryNavNode;
			}));

			var isSecondaryNav = parents.some(function(node) {

				return node === this.secondaryNavNode;
			});

			if (!isSecondaryNav && !isPrimaryNav) {
				this._hideSecondaryNavNode();
			}
		},

		_createSecondaryNavMenu: function() {
			//	Summary:
			//		Función para la creación de la segunda barra creando los tags html correspondientes.
			//		se mantiene oculto en una posición absoulta para que se pueda realizar el wipeout
			//		(el despligue) de forma efectiva cuando se necesite.
			//	tags:
			//		private

			var secondaryNav = "nav." + this.secondaryClass;

			this.secondaryNavNode = put(this.domNode, secondaryNav);
			this.secondaryNavMenuNode = put(this.secondaryNavNode, "ul");
		},

		_insertItemInSecondaryNav: function(item) {

			var subitems = item[this.subitems];
			if (subitems) {
				var division = put(this.secondaryNavMenuNode, "div." + item.name + "[style='display:none']");

				for (var j = 0; j < subitems.length; j++) {
					var subitem = subitems[j];

					if (!subitem.hidden && subitem.enable) {
						put(division, this._addSecondaryIcon(subitem));
					}
				}
			}
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

			if (this._notSecondaryNav(item[this.subitems])) {
				return this.inherited(arguments);
			}

			var label = item.name || item.label,
				prelabel = "li." + label,
				iconPrefix = item.icon.split("-")[0],
				icon = iconPrefix + "." + item.icon,
				labelI18n = this.i18n[label + this.suffixI18n] || this.i18n[label],
				itemDom = put(prelabel + "[title=" + labelI18n + "]");

			if (label === this.primaryActiveItem) {
				put(itemDom, ".active");
			}

			put(itemDom, "i." + icon + " +span", labelI18n);

			on(itemDom, "click", lang.hitch(this, this._onClickPrimaryNav, itemDom, label));

			return itemDom;
		},

		_notSecondaryNav: function(items) {

			if (!items) {
				return true;
			}

			for (var i = 0; i < items.length; i++) {
				if (!items[i].hidden) {
					return false;
				}
			}

			return true;
		},

		_onClickPrimaryNav: function(/*Object*/ itemDom, /*String*/ label, /*Object*/ event) {
			//	Summary:
			//		Evento click de un item de la barra principal
			//	tags:
			//		private
			//	itemDom:
			//		Nodo del item
			//	label
			//		Label del item
			//	evt
			//		Evento del click

			// Si se pulsa en el item que ya está con clase activa se oculta el secundario
			if (domClass.contains(itemDom, "click")) {
				this._hideSecondaryNavNode();
				domClass.remove(itemDom, "click");
			} else {
				// si lo hay se elimina
				query("li.click", this.primaryNavMenuNode).forEach(function(node) {

					domClass.remove(node, "click");
				});

				domClass.add(itemDom, "click");
				this._showSecondaryNavNode(label);
			}
		},

		_addSecondaryIcon: function(/*Object*/ item) {
			//	Summary:
			//		Agrega un módulo a la barra secundaria.
			//	Tags:
			//		private
			//	item:
			//		Objeto que representa al módulo actual
			//	returns:
			//		Devuelve el DomNode del elemento creado

			var itemDom = null,
				label = item.name || item.label,
				preLabel = "li." + label,
				parentLabel = item.parent ? item.parent.name : item.name,
				iconPrefix = item.icon.split("-")[0],
				icon = iconPrefix + "." + item.icon,
				labelI18n = this.i18n[label + this.suffixI18n] || this.i18n[label],
				href = item.href;

			if (item.active) {
				this.secondaryActiveItem = label;
			}

			if (label === this.secondaryActiveItem) {
				itemDom = put(preLabel + ".active");
			} else {
				itemDom = put(preLabel);
			}

			if (href) {
				put(itemDom, "a[href=" + ((parentLabel === undefined) ?
					href : ("/" + parentLabel + href)) + "][d-state-url=true] div.icondCenter i." +
					icon + " + +span", labelI18n);
			} else {
				put(itemDom, "i." + icon + " +span", labelI18n);

				on(itemDom, "click", lang.hitch(this, this._onClick, itemDom, {
					label:label,
					parentLabel: parentLabel
				}));
			}

			return itemDom;
		},

		_isValidClick: function(obj) {

			if (obj.parentLabel) {
				return this.secondaryActiveItem !== obj.label;
			}

			return this.inherited;
		},

		_showSecondaryNavNode: function(/*String*/ mainlabel) {
			// summary:
			//		Muestra la barra secundaria y se muestra el bloque cuya clase corresponda
			//		por la que se pase por parámetros
			// description:
			//		Para mostrarlo se necesita saber donde se encuentra la barra principal para poder
			//		colocar la barra secundaria justamente a su lado. Luego se crea la animación
			//		correspondiente para poder desplegarlo lentamente (es necesario saber el ancho
			//		de la barra secundaria que se obtiene de las propiedes).
			//		Luego se escucha cuando termina de desplegarse para poder crear un listener
			//		de un evento de click sobre el body para que se vuelva a cerrar
			// tags:
			//		private

			query("div", this.secondaryNavMenuNode).style("display", "none");
			query("div." + mainlabel, this.secondaryNavMenuNode).style("display", "block");
			query("div.icondCenter", this.secondaryNavMenuNode).style("display", "inline-block");

			domClass.remove(this.secondaryNavNode, "retiring");
			domClass.add(this.secondaryNavNode, "overall");

			this.clickToCloseSecondaryListener && this.clickToCloseSecondaryListener.resume();
		},

		_hideSecondaryNavNode: function() {
			// summary:
			//		Oculta la barra secundaria
			// description:
			//		Se elimina la clase click si existe en algún elemento de la barra principal.
			//		Se ejecuta la animación y se borra el Listener del body
			// tags:
			//		private

			query("li.click", this.primaryNavMenuNode).forEach(function(node) {

				domClass.remove(node, "click");
			});

			domClass.remove(this.secondaryNavNode, "overall");
			domClass.add(this.secondaryNavNode, "retiring");

			this.clickToCloseSecondaryListener && this.clickToCloseSecondaryListener.pause();
		},

		_updateItemsActiveSecondary: function(/*String*/ currentLabel) {
			//	Summary:
			//		Actualiza el estado de los elementos de la barra secundaria
			//	Description:
			//		Se marca como activo el elemento especificado en currentLabel
			//	Tags:
			//		private

			if (this.secondaryActiveItem) {
				var activeItems = query("li.active", this.secondaryNavMenuNode);

				if (activeItems.length) {
					domClass.remove(activeItems[0], "active");
				}
			}

			if (!currentLabel) {
				return;
			}

			this.secondaryActiveItem = currentLabel;

			var currentItems = query("li." + currentLabel, this.secondaryNavMenuNode);

			if (currentItems.length) {
				domClass.add(currentItems[0], "active");
			}
		}
	});
});
