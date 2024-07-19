define([
	'dijit/registry'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'redmic/layout/_DialogBase'
], function(
	registry
	, declare
	, lang
	, _DialogBase
){
	return declare(_DialogBase, {
		//	summary:
		//		Widget para los Dialog más simples, sin contenido innecesario.
		//	description:
		//		Permite eliminar el bloqueo del fondo y reposicionar el lugar en que se muestra al abrirlo.

		//	preventDark: Boolean
		//		Si queremos que se oscurezca y bloquee el fondo, pasarle un false.
		//	reposition: String
		//		Localización donde reposicionar el Dialog (["n","ne", ... ,"nw"]).

		constructor: function(args) {

			this.config = {
				preventDark: true,
				reposition: null,
				_dialogType: 'dialogSimple'
			};

			lang.mixin(this, this.config, args);
		},

		show: function() {
			//	summary:
			//		Extendemos el método 'show' del widget para personalizar la visualización.
			//	tags:
			//		extension

			var originalReturnValue = this.inherited(arguments);

			// Ampliamos para quitar el fondo
			this.preventDark && this.unlockBackground();

			// Ampliamos para el reposicionado
			this.reposition && this._reposition();

			return originalReturnValue;
		},

		hide: function() {
			//	summary:
			//		Extendemos el método 'hide' del widget para poder controlar el reajuste del bloqueo con varios
			//		Dialog.
			//	tags:
			//		extension

			var underlay = registry.byId(this.underlayId);

			if (underlay && !this._classWatchHandler) {
				this._classWatchHandler = underlay.watch('class', lang.hitch(this, function() {

					this.preventDark && this.unlockBackground();
				}));
			}

			this.inherited(arguments);
		},

		focus: function() {

			// No hacemos nada intencionadamente
			// Esto permite que podamos trabajar con varios Dialog a la vez
		},

		_setCenterContentAttr: function(value) {
			//	summary:
			//		Método set para un atributo concreto.
			//	tags:
			//		extension private
			//	value:
			//		Valor que se le va a asignar al atributo.

			value.set('region', 'center');
			this._set('centerContent', value);
			this.container.addChild(value);
		},

		_reposition: function() {
			//	summary:
			//		Método para reposicionar el Dialog al abrirlo.
			//	tags:
			//		private

			var top, left,

				currentSize = this._getCurrentDialogSize(),
				curWidth = currentSize.w,
				curHeight = currentSize.h,

				maxSize = this._getMaximumDialogSize(),
				maxWidth = maxSize.width - this.marginToEdge,
				maxHeight = maxSize.height - this.marginToEdge;

			switch (this.reposition) {
				case 'n':
					top = this.marginToEdge;
					break;
				case 'ne':
					top = this.marginToEdge;
					left = maxWidth - curWidth;
					break;
				case 'e':
					left = maxWidth - curWidth;
					break;
				case 'se':
					top = maxHeight - curHeight;
					left = maxWidth - curWidth;
					break;
				case 's':
					top = maxHeight - curHeight;
					break;
				case 'sw':
					top = maxHeight - curHeight;
					left = this.marginToEdge;
					break;
				case 'w':
					left = this.marginToEdge;
					break;
				case 'nw':
					top = this.marginToEdge;
					left = this.marginToEdge;
					break;
				default:
					console.error('Unexpected dialog position:', this.reposition);
			}

			this._applyNewSize({
				w: curWidth,
				h: curHeight,
				l: left,
				t: top
			});
		}
	});
});
