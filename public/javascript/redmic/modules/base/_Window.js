define([
	"dojo/_base/lang"
	, "dojo/dom-attr"
	, "dojo/dom-class"
	, "dojo/dom-style"
	, "put-selector/put"
], function(
	lang
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

		titleHeight: 30,

		minWidth: 200,

		postCreate: function() {

			if (this.noTitleWindow) {
				this.noTitleWindow = true;
				this.noCloseWindow = true;
				this.titleHeight = 0;
			}

			this.inherited(arguments);
		},

		_beforeShow: function(req) {

			if (req && req.node) {
				var node = req.node.domNode || req.node;
				this._createWindow(node);
			}

			return this.inherited(arguments);
		},

		_createWindow: function(node) {

			this._windowNode = put(node, "div.moduleWindow");

			if (this.classModule) {
				put(this._windowNode, "." + this.classModule);
			}

			this._createWindowTitle();
			this._createWindowContent();

			this._emitEvt('LOADING');

			this._decorateTitleNode();
			this._decorateContentNode();
		},

		_createWindowTitle: function() {

			this._windowTitleNode = put(this._windowNode, "div.windowTitle");

			domStyle.set(this._windowTitleNode, "height", this.titleHeight + "px");
		},

		_createWindowContent: function() {

			var classWindowContent = '.windowContent';

			if (!this.titleHeight) {
				classWindowContent += '.windowContenNoTitle';
			}

			this._windowContentNode = put(this._windowNode, "div" + classWindowContent);

			if (this.classWindowContent) {
				put(this._windowContentNode, "." + this.classWindowContent);
			}

			domStyle.set(this._windowContentNode, "height", "calc(100% - " + this.titleHeight + "px)");
		},

		_show: function(req) {

			if (req && req.node) {
				req.node = this._windowContentNode;
			}

			this.inherited(arguments);
		},

		_afterShow: function() {

			var originalRet = this.inherited(arguments);

			if (originalRet && originalRet.then) {
				originalRet.then(lang.hitch(this, this._onWindowShown));
			} else {
				this._onWindowShown();
			}

			return originalRet;
		},

		_onWindowShown: function() {

			this._emitEvt('LOADED');
			this._emitResize();
		},

		_decorateTitleNode: function() {

			var titleTextValue = this.title || this.getOwnChannel(),
				titleTextNode = put(this._windowTitleNode, "div.title", titleTextValue);

			if (this.noButtonsWindow) {
				return;
			}

			var	buttonsNode = put(this._windowTitleNode, "div.buttons");

			this._minimizeButton = put(buttonsNode, "i.fa.fa-minus");
			this._maximizeButton = put(buttonsNode, "i.fa.fa-square-o");

			if (!this.noCloseWindow) {
				this._closeButton = put(buttonsNode, "i.fa.fa-close");
			}

			this._minimizeButton.onclick = lang.hitch(this, this._minimizeModule);
			this._maximizeButton.onclick = lang.hitch(this, this._maximizeModule);

			if (!this.noCloseWindow) {
				this._closeButton.onclick = lang.hitch(this, this._closeModule);
			}
		},

		_decorateContentNode: function() {

			domStyle.set(this._windowContentNode, "border-top-left-radius", 0);
			domStyle.set(this._windowContentNode, "border-top-right-radius", 0);
			domStyle.set(this._windowContentNode, "border-bottom-left-radius", "5px");
			domStyle.set(this._windowContentNode, "border-bottom-right-radius", "5px");
		},

		_minimizeModule: function() {

			domStyle.set(this.node, "height", 0);
			domStyle.set(this._windowNode.parentNode, "height", this.titleHeight + "px");

			this._minimizeButton.onclick = lang.hitch(this, this._minimizeModuleReturn);

			this._emitResize();
		},

		_minimizeModuleReturn: function() {

			domStyle.set(this.node, "height", "calc(100% - " + this.titleHeight + "px)");
			domStyle.set(this._windowNode.parentNode, "height", "");

			this._minimizeButton.onclick = lang.hitch(this, this._minimizeModule);

			this._emitResize();
		},

		_maximizeModule: function() {

			this._previousWidth = domAttr.get(this._windowNode.parentNode, "data-cols");
			domAttr.set(this._windowNode.parentNode, "data-cols", "6");

			this._maximizeButton.onclick = lang.hitch(this, this._maximizeModuleReturn);

			this._minimizeModuleReturn();
		},

		_maximizeModuleReturn: function() {

			domAttr.set(this._windowNode.parentNode, "data-cols", this._previousWidth);

			this._maximizeButton.onclick = lang.hitch(this, this._maximizeModule);

			this._emitResize();
		},

		_disableMaximize: function() {

			domClass.add(this._maximizeButton, "hidden");
		},

		_closeModule: function() {

			domStyle.set(this._windowNode.parentNode, "display", "none");

			this._emitResize();
		},

		_emitResize: function() {

			setTimeout(lang.hitch(this, function() {
				if (this.node && this.node.offsetWidth && this.node.offsetWidth < this.minWidth) {
					this._maximizeModule();
					this._disableMaximize();
				}

				// TODO esto debería ser responsabilidad de _Show, y emitirlo siempre cuando acabe
				// de hacer el _resize (quizá con un dfd de retorno??). Pensar
				if (this.node) {
					this._emitEvt('RESIZE', {
						width: this.node.offsetWidth,
						height: this.node.offsetHeight
					});
				}
			}), 300);
		},

		_hide: function(req) {

			put(this._windowNode, "!");

			this.inherited(arguments);
		}
	};
});
