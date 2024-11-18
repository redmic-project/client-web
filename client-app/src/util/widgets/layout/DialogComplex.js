define([
	'dijit/layout/ContentPane'
	, 'dijit/registry'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/query'
	, 'put-selector'
	, 'RWidgets/layout/_DialogBase'
], function(
	ContentPane
	, registry
	, declare
	, lang
	, query
	, put
	, _DialogBase
){
	return declare(_DialogBase, {
		//	summary:
		//		Widget para los Dialog más complejos, con contenido principal y botonera.
		//	description:
		//		Permite distribuir el contenido como se desee, incluso en pestañas.

		//	preventScroll: Boolean
		//		Si queremos que el contenedor principal no tenga scroll, pasarle un true.

		constructor: function(args) {

			this.config = {
				preventScroll: false,
				_dialogType: 'dialogComplex'
			};

			lang.mixin(this, this.config, args);
		},

		show: function() {
			//	summary:
			//		Extendemos el método 'show' del widget porque es donde ya están todos los nodos generados.
			//	tags:
			//		extension

			// Buscamos si hay algún DialogSimple, para cerrarlo
			this._searchAndDestroyDialogSimple();

			// Ampliamos para poner el fondo en caso de que se haya quitado previamente
			this.lockBackground();

			return this.inherited(arguments);
		},

		_setFullContentAttr: function(value) {
			//	summary:
			//		Método set para un atributo concreto.
			//	tags:
			//		extension private
			//	value:
			//		Valor que se le va a asignar al atributo.

			this._setCenterContentAttr(value);
		},

		_setCenterContentAttr: function(value) {
			//	summary:
			//		Método set para un atributo concreto.
			//	tags:
			//		extension private
			//	value:
			//		Valor que se le va a asignar al atributo.

			// Si el contenedor principal no existe lo saltamos y lo insertamos en el postCreate
			if (this.container) {
				value.set('region', 'center');
				if (!this._checkTabbed(value)) {
					var className = 'mediumSolidContainer';
					if (!this.preventScroll) {
						className += ' detailsContainer';
					}
					value.set('class', className);
				}
				if (this.centerContent) {
					this.container.removeChild(value);
				}
				this.container.addChild(value);
			}

			this._set('centerContent', value);
		},

		_setBottomContentAttr: function(value) {
			//	summary:
			//		Método set para un atributo concreto.
			//	tags:
			//		extension private
			//	value:
			//		Valor que se le va a asignar al atributo.

			if (!value) {
				return;
			}

			value.set('baseClass', '');
			//value.set('class', 'defaultContainer keypad');

			// Si el bottomContent es un BorderContainer, lo englobamos con un ContentPane
			if (value.isBorderContainer) {
				value.set('region', 'center');
				var bottomContentWrap = new ContentPane({
					baseClass: '',
					region: 'bottom'
				});

				bottomContentWrap.addChild(value);
				if (this.container) {
					this.container.addChild(bottomContentWrap);
				}
			// Si no es un BorderContainer lo añadimos sin más
			} else {
				value.set('region', 'bottom');
				if (this.container) {
					this.container.addChild(value);
				}
			}

			this._set('bottomContent', value);
		},

		_searchAndDestroyDialogSimple: function() {
			//	summary:
			//		Busca todo rastro de DialogSimple y, en caso de encontrar alguno, lo cierra.
			//	tags:
			//		private

			var results = query('.dialogSimple');

			for (var i = 0; i < results.length; i++) {
				var dialogSimpleId = results[i].id,
					dialogSimpleWidget = registry.byId(dialogSimpleId);

				dialogSimpleWidget.hide();
			}
		},

		_checkTabbed: function(container) {
			//	summary:
			//		Comprueba si 'centerContent' tiene pestañas.
			//	tags:
			//		private
			//	returns:
			//		Devuelve un booleano según se haya encontrado pestañas o no.

			// Si el contenedor no tiene id alguno, no nos interesa mirarlo
			if (!container.id) {
				return false;	// return Boolean
			}

			// Revisamos si el contenedor actual es un TabContainer
			var widgetType = 'TabContainer',
				separator = '_',
				idComponents = container.id.split(separator);

			for (var i in idComponents) {
				if (idComponents[i] === widgetType) {
					return true;	// return Boolean
				}
			}

			// Si el contenedor no tiene nodo propio, no puede tener hijos
			if (!container.domNode) {
				return false;	// return Boolean
			}

			// Revisamos los siguientes niveles, recursivamente
			var children = container.domNode.childNodes;
			for (var key in children) {
				// Desde que alguno responda que ha encontrado, nos vale
				if (this._checkTabbed(children[key])) {
					return true;	// return Boolean
				}
			}

			// Si llegamos hasta aquí en la llamada inicial, no hay rastro de TabContainer
			return false;	// return Boolean
		},

		hide: function() {

			if (this.centerContent) {
				if (this.centerContent.destroyRecursive && !this.notDestroyRecursive) {
					this.centerContent.destroyRecursive();
				} else {
					put(this.centerContent.domNode, '!');
				}
			}

			if (this.bottomContent && this.bottomContent.activeButtons) {
				this.bottomContent.activeButtons();
			}

			return this.inherited(arguments);
		}
	});
});
