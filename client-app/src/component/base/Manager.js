define([
	'src/redmicConfig'
	, 'dijit/form/Button'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/topic'
	, 'put-selector/put'
	, 'src/util/Credentials'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
],
function(
	redmicConfig
	, Button
	, declare
	, lang
	, topic
	, put
	, Credentials
	, _Module
	, _Show
) {

	return declare([_Module, _Show], {
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
					UPLOAD_FILE: 'uploadFile',
					DOWNLOAD_FILE: 'downloadFile'
				},
				// own actions
				actions: {
					UPLOAD_FILE: 'uploadFile',
					DOWNLOAD_FILE: 'downloadFile'
				},
				zones: {
					filter: {
						node: null,
						align: 'right',
						'class': 'div.btnGroup',
						btns: {
							upload: {
								node: null,
								shared: 0,
								permission: false,
								props: {
									showLabel: false,
									'class': 'primary',
									label: this.i18n.upload,
									iconClass: 'fa-upload',
									action: '_uploadFile'
								}
							},
							download: {
								node: null,
								shared: 0,
								permission: true,
								props: {
									showLabel: false,
									'class': 'primary',
									label: this.i18n.createReport,
									iconClass: 'fa-print',
									action: '_downloadFile'
								}
							}
						}
					}
				},
				handlers: {},
				perms: {},
				ownChannel: 'manager',
				viewSeparator: '/'
			};

			lang.mixin(this, this.config, args);

			this._listen();  // TODO: cambiar por mediator
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel: this.getParentChannel(),
				callback: '_subChangeView',
				options: {
					predicate: lang.hitch(this, this._chkChangeView)
				}
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'UPLOAD_FILE',
				channel: this.getChannel('UPLOAD_FILE')
			},{
				event: 'DOWNLOAD_FILE',
				channel: this.getChannel('DOWNLOAD_FILE')
			});
		},

		postCreate: function() {

			this.leftContainer = put(this.domNode, 'div.left');
			this.rightContainer = put(this.domNode, 'div.right');

			this._addGobCanLogos();
			this._checkDomainToAddMessage();
		},

		_addGobCanLogos: function() {

			var logosContainer = put(this.leftContainer, 'div.gobcan-logos');

			put(logosContainer, 'img[src=/res/images/logos/gobcan-logos.png]');
		},

		_checkDomainToAddMessage: function() {

			if (redmicConfig.getEnvVariableValue('envProduction') === 'false') {
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
			this.handlers.create = topic.subscribe('/manager/create', lang.hitch(this, this._createManager));
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
			var categories = Credentials.get('allowedModules'),
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
				zone.node && put(zone.node, '!');
				zone.node = null;
			}
		},

		_createManager: function(showBtn) {

			for (var item in this.zones) {
				var zone = this.zones[item];
				if (!zone.node) {
					var node = this.rightContainer;

					if (zone.align == 'left') {
						node = this.leftContainer;
					}

					zone.node = put(node, zone['class'], {});
				}
				// Si tiene permisos de edición o no es la zona de edición
				if (this.perms > 0 || item !== 'edit') {
					// Elementos tipo botón
					for (var key2 in zone.btns) {
						var btn = zone.btns[key2];
						// Si lo podemos mostrar
						if (showBtn[key2] && (!btn.node)) {
							btn.props.onClick = lang.hitch(this, this[btn.props.action]);
							btn.node = new Button(btn.props).placeAt(zone.node);
							btn.node.domNode.removeAttribute('widgetId');
							btn.shared += 1;
						} else if (showBtn[key2] && (btn.node)) { // Hay más de un widget usando este botón
							btn.shared += 1;
						}
					}
				}
			}
		},

		_chkChangeView: function(data, channel) {
			// TODO seguro que hay una manera mejor de limpiar Manager, revisar cuando se integre en Topbar

			var namespaceSplitted = this._getNamespaceSplitted(data, channel),
				channelLength = namespaceSplitted.length;

			// Si el número de eslabones es distinto, la publicación no era de una vista
			if (channelLength !== 4) {
				return;
			}

			var action = namespaceSplitted[channelLength - 1],
				subPath = namespaceSplitted[channelLength - 2];

			return action === this.actions.SHOWN && subPath.indexOf(this.viewSeparator) !== -1;
		},

		_subChangeView: function(data, channel) {

			var namespaceSplitted = this._getNamespaceSplitted(data, channel),
				viewKey = namespaceSplitted[1];

			this.perms = this._findPerms(viewKey);

			this._cleanManager();
		},

		_getNamespaceSplitted: function(data, channel) {

			var channelObj = channel || data,
				namespace = channelObj.namespace;

			return namespace.split(this.channelSeparator);
		},

		_uploadFile: function() {

			this._emitEvt('UPLOAD_FILE');
		},

		_downloadFile: function() {

			this._emitDownloadFile('pdf');
		},

		_emitDownloadFile: function(/*String*/ format) {

			this._emitEvt('DOWNLOAD_FILE', {format: format});
		}
	});
});
