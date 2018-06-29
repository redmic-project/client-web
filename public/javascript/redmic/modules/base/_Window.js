define([
	"dojo/_base/lang"
	, "dojo/Deferred"
	, "dojo/dom-attr"
	, "dojo/dom-class"
	, "dojo/dom-style"
	, "dojo/promise/all"
	, "put-selector/put"
	, "templates/LoadingArrows"
], function(
	lang
	, Deferred
	, domAttr
	, domClass
	, domStyle
	, all
	, put
	, LoadingTemplate
){
	return {
		//	summary:
		//		Extensión para asignar una ventana a los módulos con visualización.
		//	description:
		//		Añade al módulo una barra de título con controles.

		titleHeight: 30,

		minWidth: 200,

		loadingClass: "loadingWrapper",
		loadingAttr: "loading",

		windowActions: {
			SHOW_WINDOW: "showWindow"
		},

		postCreate: function() {

			if (this.noTitleWindow) {
				this.noTitleWindow = true;
				this.noCloseWindow = true;
				this.titleHeight = 0;
			}

			this.inherited(arguments);
		},

		_mixEventsAndActions: function () {

			this.inherited(arguments);

			lang.mixin(this.actions, this.windowActions);
			delete this.windowActions;
		},

		_defineSubscriptions: function () {

			this.inherited(arguments);

			this.subscriptionsConfig.push({
				channel : this.getChannel("SHOW_WINDOW"),
				callback: "_subShowWindow",
				options: {
					predicate: lang.hitch(this, this._chkShowWindow)
				}
			});
		},

		_beforeShow: function(req) {

			var originalRet = this.inherited(arguments),
				dfdWindow = new Deferred();

			this._dfdWindow = dfdWindow;

			req && req.node && this._createWindow(req.node.domNode || req.node);

			if (originalRet && originalRet.resolve && !originalRet.isFulfilled()) {
				return all([originalRet, dfdWindow]);
			}

			return dfdWindow;
		},

		_createWindow: function(node) {

			this._windowNode = put(node, "div.moduleWindow");

			if (this.classModule) {
				put(this._windowNode, "." + this.classModule);
			}

			this._createWindowTitle();
			this._createWindowContent();

			this._loadWindowContent();

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

		_chkShowWindow: function(req) {

			return !!(this._dfdWindow && this._dfdWindow.resolve);
		},

		_subShowWindow: function(req) {

			this._loadedWindowContent();

			if (this._dfdWindow.isFulfilled()) {
				console.error("Deferred is already fulfilled at module '%s'", this.getChannel());
			} else {
				this._dfdWindow.resolve();
			}
		},

		_show: function(req) {

			if (req && req.node) {
				req.node = this._windowContentNode;
			}

			this.inherited(arguments);
		},

		_afterShow: function() {

			var originalRet = this.inherited(arguments);

			if (originalRet && originalRet.resolve && !originalRet.isFulfilled()) {
				originalRet.then(lang.hitch(this, this._emitResize));
			} else {
				this._emitResize();
			}

			return originalRet;
		},

		_decorateTitleNode: function() {

			var titleTextNode = put(this._windowTitleNode, "div.title", this.title || this.ownChannel);

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
				this._emitEvt('RESIZE', {
					width: this.node.offsetWidth,
					height: this.node.offsetHeight
				});
			}), 300);
		},

		// TODO estos métodos son copias de Loading. Cambiarlo para que se encargue Loading de hacerlo, o bien abstraerlo en
		// una zona común a ambos!!!!!
		_loadWindowContent: function() {

			var node = this._windowContentNode;

			this._loadingWindowContentNode = this._getLoadingElement(this.loadingClass);

			put(node, this._loadingWindowContentNode);
			put(node, "[" + this.loadingAttr + "=true]");

			domStyle.set(this._loadingWindowContentNode, "position", "relative");
		},

		// TODO estos métodos son copias de Loading. Cambiarlo para que se encargue Loading de hacerlo, o bien abstraerlo en
		// una zona común a ambos!!!!!
		_getLoadingElement: function(nodeClass) {

			var node = put("div." + nodeClass);
			node.innerHTML = LoadingTemplate();

			return node;
		},

		// TODO estos métodos son copias de Loading. Cambiarlo para que se encargue Loading de hacerlo, o bien abstraerlo en
		// una zona común a ambos!!!!!
		_loadedWindowContent: function() {

			if (!this._loadingWindowContentNode) {
				console.error("Loading node not found when tried to hide it, at module '%s'", this.getChannel());
				return;
			}

			put(this._windowContentNode, "[!" + this.loadingAttr + "]");
			put(this._loadingWindowContentNode, "!");
			this._loadingWindowContentNode = null;
		},

		_hide: function(req) {

			put(this._windowNode, "!");

			this.inherited(arguments);
		}
	};
});
