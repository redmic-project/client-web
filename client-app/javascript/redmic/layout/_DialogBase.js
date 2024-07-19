define([
	'dijit/Dialog'
	, 'dijit/layout/BorderContainer'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'dojo/dom-class'
	, 'dojo/dom-style'
	, 'dojo/query'
	, 'dojo/i18n!app/nls/translation'
	, 'put-selector/put'
], function(
	Dialog
	, BorderContainer
	, declare
	, lang
	, aspect
	, domClass
	, domStyle
	, query
	, i18n
	, put
){
	return declare(Dialog, {
		//	summary:
		//		Widget que sirve de base común a todos los Dialog de Redmic.
		//	description:
		//		Proporciona los elementos comunes a todos los tipos de Dialog.

		//	title: String
		//		Título del Dialog.
		//	region: String
		//		Región para asignar al layout del widget.
		//	width: int
		//		Anchura del Dialog ([1-12]).
		//	height: String
		//		Altura del Dialog (["xs","sm","md","lg"]).
		//	container: Object
		//		Contenedor principal del Dialog (debajo del título).
		//	fullContent: Object
		//		Objeto que incluye la estructura completa ('centerContent' y 'bottomContent').
		//	centerContent: Object
		//		Objeto que se colocará como contenido principal del Dialog.
		//	bottomContent: Object
		//		Objeto que se colocará en el fondo del Dialog (botonera).
		//	hiddenUnderlayClassName: String
		//		Clase para asignar al bloqueo del fondo cuando ha de ocultarse.
		//	underlayId: String
		//		Identificador de la primera instancia del bloquo del fondo, para poderlo buscar.
		//	marginToEdge: Number
		//		Margen que se dejará alrededor del Dialog cuando se manipule.
		//	_maximized: Boolean
		//		Flag de estado de maximización.
		//	_dialogType: String
		//		Identificador del tipo de Dialog requerido, que se usará como clase CSS adicional. Se define en
		//		implementaciones posteriores.

		constructor: function(args) {

			this.config = {
				title: 'title',
				region: 'center',
				width: 12,
				height: 'lg',
				hiddenUnderlayClassName: 'hidden',
				underlayId: 'dijit_DialogUnderlay_0',
				marginToEdge: 10,
				_maximized: false
			};

			lang.mixin(this, this.config, args);
		},

		postscript: function() {

			this._setClassName();

			this.container = new BorderContainer();

			this.inherited(arguments);
		},

		_setClassName: function() {
			//	summary:
			//		Construye y asigna la clase al Dialog.
			//	tags:
			//		protected

			var classNameForWidth = ' col-xs-' + this.width + ' col-sm-' + this.width + ' col-md-' + this.width +
				' col-lg-' + this.width,

				classNameForHeight = ' dijitDialog-' + this.height,
				className = this._dialogType + classNameForWidth + classNameForHeight;

			this['class'] = className;
		},

		postCreate: function() {

			this.inherited(arguments);

			this.container.placeAt(this.containerNode);

			this._updateDialogContent();
			this._customizeTitleBarButtons();
		},

		_updateDialogContent: function() {

			// Si le hemos pasado un contenido completo, lo dividimos en regiones
			if (this.fullContent) {
				if (this.fullContent.centerContent) {
					this.centerContent = this.fullContent.centerContent;
				}
				if (this.fullContent.bottomContent) {
					this.bottomContent = this.fullContent.bottomContent;
				}
			}

			// Añadimos todos los elementos al contenedor
			if (this.centerContent) {
				this.set('centerContent', this.centerContent);
			}
			if (this.bottomContent) {
				this.set('bottomContent', this.bottomContent);
			}
		},

		_customizeTitleBarButtons: function() {

			var parentNode = this.domNode.firstElementChild;

			this._customizeCloseButton(parentNode);
			this._createResizingButtons(parentNode);
		},

		_customizeCloseButton: function(parentNode) {

			var closeNode = query('span[title="' + i18n.cancel + '"] span', parentNode)[0];

			if (closeNode) {
				put(closeNode, '.fa.fa-close');
				closeNode.innerHTML = '';
			}
		},

		_createResizingButtons: function(parentNode) {

			var commonButtonClassName = 'span.dijitDialogCloseIcon',
				commonIconClassName = 'span.maxIcon.fa';

			this._maximizeButton = put(parentNode, commonButtonClassName);
			put(this._maximizeButton, commonIconClassName + '.fa-window-maximize');

			this._restoreButton = put(parentNode, commonButtonClassName + '.hidden');
			put(this._restoreButton, commonIconClassName + '.fa-window-restore');

			this._maximizeButton.onclick = lang.hitch(this, this._onClickMaximizeButton);
			this._restoreButton.onclick = lang.hitch(this, this._onClickRestoreButton);
		},

		_onClickMaximizeButton: function(evt) {

			this.maximizeDialog();
		},

		_onClickRestoreButton: function(evt) {

			this.restoreDialog();
		},

		maximizeDialog: function() {

			this._toggleMaximizeButtonToRestore();

			this._maximized = true;
			this._lastDialogSize = this._getCurrentDialogSize();

			var maxSize = this._getMaximumDialogSize(),
				maxWidth = maxSize.width,
				maxHeight = maxSize.height,
				maximizedSize = this._getMaximizedDialogSize(maxWidth, maxHeight);

			this._applyNewSize(maximizedSize);
		},

		_toggleMaximizeButtonToRestore: function() {

			put(this._maximizeButton, '.hidden');
			put(this._restoreButton, '!hidden');
		},

		_getCurrentDialogSize: function() {

			var computedStyle = domStyle.getComputedStyle(this.domNode),

				currentWidthStr = computedStyle.width.slice(0, -2),
				currentHeightStr = computedStyle.height.slice(0, -2),
				currentLeftStr = computedStyle.left.slice(0, -2),
				currentTopStr = computedStyle.top.slice(0, -2),

				currentWidth = parseFloat(currentWidthStr),
				currentHeight = parseFloat(currentHeightStr),
				currentLeft = parseFloat(currentLeftStr),
				currentTop = parseFloat(currentTopStr);

			return {
				w: currentWidth,
				h: currentHeight,
				l: currentLeft,
				t: currentTop
			};
		},

		_getMaximumDialogSize: function() {

			var parentElement = this.domNode.parentElement,
				maxWidth = parentElement.clientWidth,
				maxHeight = parentElement.clientHeight;

			return {
				width: maxWidth,
				height: maxHeight
			};
		},

		_getMaximizedDialogSize: function(maxWidth, maxHeight) {

			var margin = this.marginToEdge,
				marginDouble = 2 * margin,
				width = maxWidth - marginDouble,
				height = maxHeight - marginDouble;

			return {
				w: width,
				h: height,
				l: margin,
				t: margin
			};
		},

		_applyNewSize: function(size) {

			if (!this._originalDialogSize) {
				this._originalDialogSize = size;
			}

			this.resize(size);
		},

		restoreDialog: function() {

			this._toggleRestoreButtonToMaximize();

			this._maximized = false;

			this._applyNewSize(this._lastDialogSize);
			this._lastDialogSize = null;
		},

		_toggleRestoreButtonToMaximize: function() {

			put(this._maximizeButton, '!hidden');
			put(this._restoreButton, '.hidden');
		},

		lockBackground: function() {
			//	summary:
			//		Bloquea el fondo detrás del Dialog.
			//	tags:
			//		protected

			this._updateBackgroundVisibility('remove');
		},

		unlockBackground: function() {
			//	summary:
			//		Desbloquea el fondo detrás del Dialog.
			//	tags:
			//		protected

			this._updateBackgroundVisibility('add');
		},

		_updateBackgroundVisibility: function(methodName) {

			var underlay = this._findUnderlayNode(),
				method = domClass[methodName];

			if (underlay) {
				method(underlay, this.hiddenUnderlayClassName);

				var underlayContent = underlay.firstChild;
				if (underlayContent) {
					method(underlayContent, this.hiddenUnderlayClassName);
				}
			}
		},

		_findUnderlayNode: function() {
			//	summary:
			//		Busca si ya existe un DialogUnderlay y lo devuelve.
			//	tags:
			//		private
			//	returns:
			//		Devuelve el nodo del DialogUnderlay.

			return query('div#' + this.underlayId)[0];	// return Object
		},

		resizeContainer: function(size) {

			var newSize;

			if (this._maximized) {
				var externalWidth = size.width,
					externalHeight = size.height;

				newSize = this._getMaximizedDialogSize(externalWidth, externalHeight);
			} else {
				newSize = this._originalDialogSize;
			}

			this._applyNewSize(newSize);
		}
	});
});
