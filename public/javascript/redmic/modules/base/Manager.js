define([
	'app/redmicConfig'
	, "dijit/form/Button"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/dom-class"
	, "dojo/topic"
	, "put-selector/put"
	, "redmic/base/Credentials"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Show"
],
function(
	redmicConfig
	, Button
	, declare
	, lang
	, domClass
	, topic
	, put
	, Credentials
	, _Module
	, _Show
){
	var obj = declare([_Module, _Show], {
		//	summary:
		//		Este widget reune todos los elementos dinámicos de la barra superior de la aplicación.
		//	description:
		//		Permite tener una zona común para todos los módulos, donde colocar elementos de
		//		acción o informativos.

		//	zones: Object
		//		Json para generar los elementos del Manager de forma dinámica.
		//	handlers: Object
		//		Controladores de las escuchas a los eventos.
		//	perms: Object
		//		Permisos del usuario para el módulo actual.

		constructor: function(args) {

			this.config = {
				// own events
				events: {
					UPLOAD_FILE: "uploadFile",
					DOWNLOAD_FILE: "downloadFile"
				},
				// own actions
				actions: {
					UPLOAD_FILE: "uploadFile",
					DOWNLOAD_FILE: "downloadFile"
				},
				zones: {
					/*edit: {
						node: null,
						align: "left",
						"class": "div.btnGroup.col-xs-3.col-sm-3.col-md-3.col-lg-3",
						btns: {
						}
					},*/
					filter: {
						node: null,
						align: "right",
						"class": "div.btnGroup",
						btns: {
							upload: {
								node: null,
								shared: 0,
								permission: false,
								props: {
									showLabel: false,
									"class": "primary",
									label: this.i18n.upload,
									iconClass: "fa-upload",
									action: "_uploadFile"
								}
							},
							download: {
								node: null,
								shared: 0,
								permission: true,
								props: {
									showLabel: false,
									"class": "primary",
									label: "download",
									iconClass: "fa-print",
									action: "_downloadFile"
								}
							}
						}
					}
				},
				handlers: {},
				perms: {},
				ownChannel: "manager",
				viewSeparator: "/"
			};

			lang.mixin(this, this.config, args);

			this._listen();  // TODO: cambiar por mediator
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel: this.getParentChannel(),
				callback: "_subChangeView",
				options: {
					predicate: lang.hitch(this, this._chkChangeView)
				}
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'UPLOAD_FILE',
				channel: this.getChannel("UPLOAD_FILE")
			},{
				event: 'DOWNLOAD_FILE',
				channel: this.getChannel("DOWNLOAD_FILE")
			});
		},

		postCreate: function() {

			this.leftContainer = put(this.domNode, "div.left");
			this.rightContainer = put(this.domNode, "div.right");

			this._checkDomainToAddMessage();
		},

		_checkDomainToAddMessage: function() {

			var appScope = redmicConfig.getAppScope();

			if (appScope === 'dev') {
				this._addMessage('.redmicLocal', this.i18n.messageRedmicLocal);
			} else if (appScope === 'pre') {
				this._addMessage('.appDev', this.i18n.messageAppDev);
			}
		},

		_addMessage: function(typeClass, message) {

			put(this.domNode.parentNode, typeClass);
			put(this.leftContainer, 'span.fontExo2', message);
		},

		_listen: function() {
			// summary:
			// 	Pone a escuchar al Manager para que reaccione a los cambios.
			// tags:
			// 	private

			// Eventos procedentes de los módulos
			this.handlers.create = topic.subscribe("/manager/create", lang.hitch(this, this._createManager));
		},

		_findPerms: function(/*String*/ moduleKey) {
			//	summary:
			//		Busca un módulo y devuelve los permisos que tiene el usuario para el mismo.
			//	tags:
			//		private
			//	moduleKey:
			//		Clave completa del módulo buscado
			//	returns:
			//		Permisos del módulo si se encuentra, o 0 si no se encuentra

			// Categorías a las que tiene acceso el usuario
			var categories = Credentials.get("allowedModules"),
				moduleKeySplitted = moduleKey.split(this.viewSeparator);

			if (!categories) {
				return 0;	// Integer
			}

			// Buscamos nuestra categoría
			for (var i = 0; i < categories.length; i++) {
				var category = categories[i];

				// Si es la buscada, miramos sus módulos
				if (category.name === moduleKeySplitted[0]) {
					if (!category.modules) {
						return category.perms;	// Integer
					}

					// Buscamos nuestro módulo
					for (var j = 0; j < category.modules.length; j++) {
						var module = category.modules[j];

						// Si es el buscado, obtenemos sus permisos
						if (module.name === moduleKeySplitted[1]) {
							return module.perms;	// Integer
						}
					}
				}
			}

			// Si no se encontró el módulo
			return 0;	// Integer
		},

		_cleanManager: function() {
			//	summary:
			//		Limpia los contenidos de Manager para que otro módulo lo use.
			//	tags:
			//		private

			for (var item in this.zones) {
				var zone = this.zones[item];

				// Destruimos los botones
				for (var key2 in zone.btns) {
					var btn = zone.btns[key2];
					btn.shared = 0;
					if (btn.node) {
						btn.node.destroyRecursive();
						btn.node = null;
					}
				}
				// Destruimos la zona
				zone.node && put(zone.node, "!");
				zone.node = null;
			}
		},

		_destroyManager: function() {
			//	summary:
			//		Destruye al Manager para que nadie más lo use.
			//	tags:
			//		private

			this.handlers.create.remove();
			this.handlers.location.remove();
			this.handlers.info.remove();
			this._cleanManager();

			this.destroyRecursive();
		},

		_createManager: function(showBtn) {

			for (var item in this.zones){
				var zone = this.zones[item];
				if (!zone.node) {
					if (zone.align == "left")
						zone.node = put(this.leftContainer, zone["class"], {});
					else
						zone.node = put(this.rightContainer, zone["class"], {});
				}
				// Si tiene permisos de edición o no es la zona de edición
				if (this.perms > 0 || item !== "edit") {
					// Elementos tipo botón
					for (var key2 in zone.btns) {
						var btn = zone.btns[key2];
						// Si lo podemos mostrar
						if (showBtn[key2] && (!btn.node)) {
							btn.props.onClick = lang.hitch(this, this[btn.props.action]);
							btn.node = new Button(btn.props).placeAt(zone.node);
							btn.shared += 1;
						}
						// Hay más de un widget usando este botón
						else if (showBtn[key2] && (btn.node))
							btn.shared += 1;
					}
				}
			}
		},

		_chkChangeView: function(data, channel) {

			var namespaceSplitted = this._getNamespaceSplitted(data, channel),
				action = namespaceSplitted.pop(),
				subPath = namespaceSplitted.pop();

			return (action === this.actions.SHOWN) && (namespaceSplitted.length === 1) &&
				(subPath.indexOf(this.viewSeparator) > -1);
		},

		_subChangeView: function(data, channel) {

			var namespaceSplitted = this._getNamespaceSplitted(data, channel),
				viewKey = namespaceSplitted[1];

			this.perms = this._findPerms(viewKey);

			this._cleanManager();
		},

		_getNamespaceSplitted: function(data, channel) {

			var obj = channel || data,
				namespace = obj.namespace;

			return namespace.split(this.channelSeparator);
		},

		_uploadFile: function() {

			this._emitEvt('UPLOAD_FILE');
		},

		_downloadFile: function() {

			this._emitDownloadFile("pdf");
		},

		_emitDownloadFile: function(/*String*/ format) {

			this._emitEvt('DOWNLOAD_FILE', {format: format});
		},

		_getRootChannel: function(/*String*/ channel, /*String?*/ action) {

			if (action)
				channel += this.channelSeparator + action;

			return "app" + this.channelSeparator + channel;
		}
	});

	return obj;
});