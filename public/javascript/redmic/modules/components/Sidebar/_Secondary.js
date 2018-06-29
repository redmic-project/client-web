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
){
	return declare(null, {
		//	summary:
		//		Módulo para la creación del Sidebar de la aplicación.
		//	description:
		//		La barra secundaria se compone de items pertenecientes a un mismo item.
		//		Si se hace click sobre alguna categoría, se desplegará la barra secundaria.
		//		Si se hace click sobre algún módulo, la aplicación lo cargará.
		//		Si se accede con una ruta previa, se detectará para informar del módulo y categoría activos.
		//	secondaryNav: Object
		//		Propiedades de la barra secundaria. Debe de tener "class" para asignarle estilos y
		//		"active" que especificar que módulo está activo.
		//	closeSecNavHandler: Object
		//		Handler del evento de cierre de la barra secundaria.

		constructor: function(args) {

			this.config = {
				secondaryNav: {
					'class': 'secondary.main-nav.retiring',
					active: null
				},
				closeSecNavHandler: null,
				subitems: 'subitems'
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, "_initialize", lang.hitch(this, this._initializeSecondary));
			aspect.before(this, "_updateActive", lang.hitch(this, this._hidesecondaryNavNode));
			aspect.before(this, "_insertItemInPrimaryNav", lang.hitch(this, this._insertItemInSecondaryNav));
		},

		_initializeSecondary: function() {

			this._createSecondaryNavMenu();
		},

		startup: function() {

			this.inherited(arguments);

			this.closeSecNavHandler = on.pausable(document.body, 'click',
				lang.hitch(this, this._onCloseSecNav));

			this.closeSecNavHandler.pause();
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

			// Se busca si el elemento que se pulsó pertenece a la barra principal
			var isPrimaryNav = query(evt.target).parents().some(
				lang.hitch(this, function(node) {

				if (node === this.primaryNavNode) {
					return true;
				} else {
					return false;
				}
			}));
			// Se busca si el elemento que se pulsó pertenece a la barra secundaria
			var isSecondaryNav = query(evt.target).parents().some(function(node) {
				if (node === this.secondaryNavNode) {
					return true;
				} else {
					return false;
				}
			});
			// Si no se pulsó sobre ninguna de las dos barras, se oculta la barra secundaria
			if (!(isSecondaryNav || isPrimaryNav)) {
				this._hidesecondaryNavNode();
			}
		},

		_updateActive: function(res) {

			this._updateItemsActive(res.parentLabel || res.label);

			res.parentLabel && this._updateItemsActiveSecondary(res.label);
		},

		_createSecondaryNavMenu: function() {
			//	Summary:
			//		Función para la creación de la segunda barra creando los tags html correspondientes.
			//		se mantiene oculto en una posición absoulta para que se pueda realizar el wipeout
			//		(el despligue) de forma efectiva cuando se necesite.
			//	tags:
			//		private

			var secondaryNav = "nav";

			if (this.secondaryNav["class"]) {
				secondaryNav += "." + this.secondaryNav["class"];
			}

			if (this.secondaryNav.id) {
				secondaryNav += "#" + this.secondaryNav.id;
			}

			this.secondaryNavNode = put(document.body, secondaryNav);
			this.secondaryNavMenuNode = put(this.secondaryNavNode, "ul");
		},

		_onClickSidebarMenu: function(/*Object*/ evt) {
			//	Summary:
			//		Evento click del menú secundario del sidebar, Se usa para expandir/reducir
			//		el sidebar añadiendo/suprimiendo el label
			//	tags:
			//		private
			//	evt
			//		Evento del click

			if (this.sidebarMenu.getChildren()[0].label == this.i18n.menuTextReduce) {
				domClass.add(this.ownerDocumentBody, "reducedMenu");
				this.resize();
				registry.byId(query("#rootContainer")[0].children[0].id).resize();
				this.sidebarMenu.getChildren()[0].attr("label", this.i18n.menuTextExpand);
			} else {
				domClass.remove(this.ownerDocumentBody, "reducedMenu");
				registry.byId(query("#rootContainer")[0].children[0].id).resize();
				this.sidebarMenu.getChildren()[0].attr("label", this.i18n.menuTextReduce);
			}
		},

		_insertItemInSecondaryNav: function(item) {

			var subitems = item[this.subitems];
			if (subitems) {
				var division = put(this.secondaryNavMenuNode,
					"div." + item.name + "[style='display:none']");

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

			var itemDom = null,
				label = item.name || item.label,
				prelabel = "li." + label,
				iconPrefix = item.icon.split("-")[0],
				icon = iconPrefix + "." + item.icon,
				labelI18n = this.i18n[label + this.suffixI18n] || this.i18n[label];

			itemDom = put(prelabel + "[title=" + labelI18n + "]");

			if (label === this.primaryNav.active) {
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
				this._hidesecondaryNavNode();
				domClass.remove(itemDom, "click");
			} else {
				// si lo hay se elimina
				query("li.click", this.primaryNavMenuNode).forEach(function(node) {
					domClass.remove(node, "click");
				});

				domClass.add(itemDom, "click");
				this._showsecondaryNavNode(label);
			}
		},

		_addSecondaryIcon: function(/*Object*/ item) {
			//	Summary:
			//		Agrega un módulo a la barra secundaria.
			//	Tags:
			//		private
			//	module:
			//		Objeto que representa al módulo actual
			//	returns:
			//		Devuelve el DomNode del elemento creado

			var itemDom = null,
				label = item.name || item.label,
				preLabel = "li." + label,
				parentLabel = item.parent ? item.parent.name : module.name,
				iconPrefix = item.icon.split("-")[0],
				icon = iconPrefix + "." + item.icon,
				labelI18n = this.i18n[label + this.suffixI18n] || this.i18n[label],
				href = item.href;

			if (item.active) {
				this.secondaryNav.active = label;
			}

			if (label === this.secondaryNav.active) {
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
				if (this.secondaryNav.active === obj.label) {
					return false;
				}

				return true;
			}

			return this.inherited;
		},

		_showsecondaryNavNode: function(/*String*/ mainlabel) {
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

			this.closeSecNavHandler && this.closeSecNavHandler.resume();
		},

		_hidesecondaryNavNode: function() {
			// summary:
			//		Oculta la barra secundaria
			// description:
			//		Se elimina la clase click si existe en algún elemento de la barra principal. Se ejecuta la animación y se borra el Listener del body
			// tags:
			//		private

			query("li.click", this.primaryNavMenuNode).forEach(function(node) {
				// Borramos los activos
				domClass.remove(node, "click");
			});

			domClass.remove(this.secondaryNavNode, "overall");
			domClass.add(this.secondaryNavNode, "retiring");

			this.closeSecNavHandler && this.closeSecNavHandler.pause();
		},

		_updateItemsActiveSecondary: function(/*String*/ secondary) {
			//	Summary:
			//		Actualiza los elementos de las barras
			//	Description:
			//		Se pone a activo los elemntos que se hayan especificado por parámetros.
			//		El elemento de la secundaria (especificado en secondary)
			//	Tags:
			//		private

			// Actualizamos la barra de navegación secundaria

			// Si hay algun elemento activo lo actualizamos quitandole la clase activo

			if(this.secondaryNav.active) {
				var itemactive = query("li.active", this.secondaryNavMenuNode);

				if (itemactive.length > 0) {
					domClass.remove(itemactive[0], "active");
				}
			}

			if (!secondary) {
				return;
			}

			// Actualizamos el campo activo de secondaryNav
			this.secondaryNav.active = secondary;

			var itemaddclass = query("li." + secondary, this.secondaryNavMenuNode);

			if (itemaddclass.length > 0) {
				// Añadimos la clase active al nodo que se ha pulsado
				domClass.add(itemaddclass[0], "active");
			}
		}
	});
});
