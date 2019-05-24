define([
	"dojo/_base/lang"
	, "dojo/Deferred"
	, "dojo/dom-attr"
	, "dojo/dom-class"
	, "dojo/dom-style"
	, "put-selector/put"
], function(
	lang
	, Deferred
	, domAttr
	, domClass
	, domStyle
	, put
) {

	return {
		//	summary:
		//		Extensión para asignar una ventana a los módulos con visualización.
		//	description:
		//		Añade al módulo una barra de título con controles.

		windowContainerClass: 'moduleWindow',

		windowTitleClass: 'windowTitle',
		windowTitleValueClass: 'title',
		windowButtonContainerClass: 'buttons',

		buttonPrefixClass: 'fa',
		minimizeButtonClass: 'fa-window-minimize',
		maximizeButtonClass: 'fa-window-maximize',
		restoreButtonClass: 'fa-window-restore',
		closeButtonClass: 'fa-close',

		windowContentClass: 'windowContent',
		windowWithoutTitleContentClass: 'windowWithoutTitleContent',

		hiddenClass: 'hidden',

		titleHeight: 30,
		minWidth: 200,

		minWidthCols: 1,
		maxWidthCols: 6,

		// TODO renombrar estos flags aquí y donde se usen
		noTitleWindow: false,
		noButtonsWindow: false,
		noCloseWindow: false,

		_beforeShow: function(req) {

			if (this._getPreviouslyShown()) {
				this._removeNodeListeners();
			}

			var node;

			if (req && req.node) {
				node = req.node.domNode || req.node;
			} else {
				node = this.currentNode;
			}

			if (node) {
				this._createWindow(node);
			}

			return this.inherited(arguments);
		},

		_createWindow: function(node) {

			this._emitEvt('LOADING');

			this._windowNode = put(node, "div." + this.windowContainerClass);

			if (!this.noTitleWindow) {
				this._createWindowTitle();
				this._decorateTitleNode();
			}

			this._createWindowContent();
			this._addNodeListeners();
		},

		_createWindowTitle: function() {

			this._windowTitleNode = put(this._windowNode, "div." + this.windowTitleClass);

			domStyle.set(this._windowTitleNode, "height", this.titleHeight + "px");
		},

		_createWindowContent: function() {

			var contentClass = this.windowContentClass,
				titleHeight = this.titleHeight;

			if (this.noTitleWindow) {
				contentClass += '.' + this.windowWithoutTitleContentClass;
				titleHeight = 0;
			}

			if (this.classWindowContent) {
				contentClass += '.' + this.classWindowContent;
			}

			this._windowContentNode = put(this._windowNode, "div." + contentClass);

			var contentHeight = "calc(100% - " + titleHeight + "px)";
			domStyle.set(this._windowContentNode, "height", contentHeight);
		},

		_addNodeListeners: function() {

			if (!this._transitionEndCallback) {
				this._transitionEndCallback = lang.hitch(this, this._onWindowTransitionEnd);
			}

			this._windowContentNode.addEventListener('transitionend', this._transitionEndCallback);
			this._windowNode.parentNode.addEventListener('transitionend', this._transitionEndCallback);
		},

		_removeNodeListeners: function() {

			this._windowContentNode.removeEventListener('transitionend', this._transitionEndCallback);

			if (this._windowNode.parentNode) {
				this._windowNode.parentNode.removeEventListener('transitionend', this._transitionEndCallback);
			}
		},

		_onWindowTransitionEnd: function(evt) {

			var propName = evt.propertyName;

			if (propName === 'height' && this._minimizeDfd) {
				this._minimizeDfd.resolve();
			}

			if (propName === 'width' && this._maximizeDfd) {
				this._maximizeDfd.resolve();
			}
		},

		_show: function(req) {

			if (req && req.node) {
				req.node = this._windowContentNode;
			}

			this.inherited(arguments);
		},

		_afterShow: function() {

			var originalRet = this.inherited(arguments),
				afterCbk = lang.hitch(this, this._onWindowShown);

			if (originalRet && originalRet.then) {
				originalRet.then(afterCbk);
			} else {
				afterCbk();
			}

			return originalRet;
		},

		_onWindowShown: function() {

			var validSizeDfd = new Deferred();

			validSizeDfd.then(lang.hitch(this, this._onWindowValidSize));

			this._validSizeIntervalHandler = setInterval(lang.hitch(this, function(dfd) {

				if (this.node.offsetWidth) {
					clearInterval(this._validSizeIntervalHandler);
					dfd.resolve();
				}
			}, validSizeDfd), 100);
		},

		_onWindowValidSize: function() {

			this._emitEvt('LOADED');
			this._emitResize();
		},

		_decorateTitleNode: function() {

			var titleTextValue = this.title || this.getOwnChannel(),
				titleTextNode = put(this._windowTitleNode, "div." + this.windowTitleValueClass, titleTextValue);

			if (!this.noButtonsWindow) {
				this._createWindowButtons();
			}
		},

		_createWindowButtons: function() {

			var	buttonsNode = put(this._windowTitleNode, "div." + this.windowButtonContainerClass),
				minimizeButtonClass = '.' + this.buttonPrefixClass + '.' + this.minimizeButtonClass,
				maximizeButtonClass = '.' + this.buttonPrefixClass + '.' + this.maximizeButtonClass,
				closeButtonClass = '.' + this.buttonPrefixClass + '.' + this.closeButtonClass;

			this._minimizeButton = put(buttonsNode, "i" + minimizeButtonClass);
			this._minimizeButton.onclick = lang.hitch(this, this._minimizeModule);

			this._maximizeButton = put(buttonsNode, "i" + maximizeButtonClass);
			this._maximizeButton.onclick = lang.hitch(this, this._maximizeModule);

			if (!this.noCloseWindow) {
				this._closeButton = put(buttonsNode, "i" + closeButtonClass);
				this._closeButton.onclick = lang.hitch(this, this._closeModule);
			}
		},

		_minimizeModule: function() {

			this._resizeAfterMinimizeToggle();

			this._minimizeButton.onclick = lang.hitch(this, this._minimizeModuleReturn);

			domStyle.set(this.node, "height", 0);
			domStyle.set(this._windowNode.parentNode, "height", this.titleHeight + "px");
		},

		_minimizeModuleReturn: function() {

			this._resizeAfterMinimizeToggle();

			this._minimizeButton.onclick = lang.hitch(this, this._minimizeModule);

			domStyle.set(this.node, "height", "calc(100% - " + this.titleHeight + "px)");
			domStyle.set(this._windowNode.parentNode, "height", "");
		},

		_resizeAfterMinimizeToggle: function() {

			if (this._minimizeDfd) {
				this._minimizeDfd.reject();
			}

			this._minimizeDfd = new Deferred();
			this._minimizeDfd.then(lang.hitch(this, this._emitResize), function() {});
		},

		_maximizeModule: function() {

			this._resizeAfterMaximizeToggle();

			this._maximizeButton.onclick = lang.hitch(this, this._maximizeModuleReturn);
			this._updateMaximizeButtonIcon();

			this._previousWidth = domAttr.get(this._windowNode.parentNode, "data-cols");
			domAttr.set(this._windowNode.parentNode, "data-cols", this.maxWidthCols);

			this._minimizeModuleReturn();
		},

		_maximizeModuleReturn: function() {

			this._resizeAfterMaximizeToggle();

			this._maximizeButton.onclick = lang.hitch(this, this._maximizeModule);
			this._updateMaximizeButtonIcon();

			domAttr.set(this._windowNode.parentNode, "data-cols", this._previousWidth);
		},

		_resizeAfterMaximizeToggle: function() {

			if (this._maximizeDfd) {
				this._maximizeDfd.reject();
			}

			this._maximizeDfd = new Deferred();
			this._maximizeDfd.then(lang.hitch(this, this._emitResize), function() {});
		},

		_updateMaximizeButtonIcon: function() {

			domClass.toggle(this._maximizeButton, this.maximizeButtonClass);
			domClass.toggle(this._maximizeButton, this.restoreButtonClass);
		},

		_disableMaximize: function() {

			domClass.add(this._maximizeButton, this.hiddenClass);
		},

		_enableMaximize: function() {

			domClass.remove(this._maximizeButton, this.hiddenClass);
		},

		_closeModule: function() {

			domStyle.set(this._windowNode.parentNode, "display", "none");

			this._emitResize();
		},

		_emitResize: function() {

			if (!this.node) {
				return;
			}

			this._autoMaximizeOnLowWidth();

			// TODO esto debería ser responsabilidad de _Show, y emitirlo siempre cuando acabe
			// de hacer el _resize (quizá con un dfd de retorno??). Pensar
			this._emitEvt('RESIZE', {
				width: this.node.offsetWidth,
				height: this.node.offsetHeight
			});
		},

		_autoMaximizeOnLowWidth: function() {

			if (!this.node.offsetWidth || this.node.offsetWidth >= this.minWidth) {
				return;
			}

			this._updateMaximizeButtonIcon();
			this._disableMaximize();

			if (!this._getAutoMaximized()) {
				this._setAutoMaximized(true);
				this._maximizeModule();
			}
		},

		_resize: function() {

			this._autoMaximizeReturnOnEnoughWidth();
			this._emitResize();

			this.inherited(arguments);
		},

		_autoMaximizeReturnOnEnoughWidth: function() {

			if (!this._getAutoMaximized() || this.node.offsetWidth < this.minWidth) {
				return;
			}

			this._setAutoMaximized(false);
			this._updateMaximizeButtonIcon();
			this._enableMaximize();
		},

		_getAutoMaximized: function() {

			return this.statusFlags.autoMaximized;
		},

		_setAutoMaximized: function(value) {

			this.statusFlags.autoMaximized = value;
		},

		_hide: function(req) {

			this._removeNodeListeners();
			put(this._windowNode, "!");

			this.inherited(arguments);
		}
	};
});
