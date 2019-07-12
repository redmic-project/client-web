define([
	'dojo/_base/lang'
	, 'dojo/Deferred'
	, 'dojo/dom-attr'
	, 'dojo/dom-class'
	, 'dojo/dom-style'
	, 'dojo/on'
	, 'put-selector/put'
], function(
	lang
	, Deferred
	, domAttr
	, domClass
	, domStyle
	, on
	, put
) {

	return {
		//	summary:
		//		Extensión para asignar una ventana a los módulos con visualización.
		//	description:
		//		Añade al módulo una barra de título con controles.

		windowResizedParentClass: 'resizedByUser',
		windowResizableClass: 'resizable',
		windowContainerClass: 'moduleWindow',
		resizeHandleClass: 'resizeHandle',

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

		titleHeight: 2,
		minWidth: 200,

		widthByColsAttr: 'data-cols',
		minWidthCols: 1,
		maxWidthCols: 6,

		resizableBottomPadding: 15,
		resizableBottomMargin: 0.2,

		scrollMargin: 10,

		omitTitleBar: false,
		omitTitleButtons: false,
		omitTitleCloseButton: false,
		resizable: true,
		scrollSensitive: true,

		_resizableForcedMinWidth: 100,
		_validSizeInterval: 100,
		_userResizeTimeout: 100,
		_moduleWindowResizeTimeout: 100,


		_setShowOwnCallbacksForEvents: function () {

			this.inherited(arguments);

			this._onEvt('ANCESTOR_SHOW', lang.hitch(this, this._onWindowAncestorShown));
		},

		_onWindowAncestorShown: function() {

			this._prepareToResizeModuleWindow();
		},

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
				this._originalWidthByCols = domAttr.get(node, this.widthByColsAttr);
				this._createWindow(node);
			}

			return this.inherited(arguments);
		},

		_createWindow: function(node) {

			this._emitEvt('LOADING');

			var containerClass = this.windowContainerClass;

			if (this.resizable) {
				containerClass += '.' + this.windowResizableClass;
			}

			this._windowNode = put(node, 'div.' + containerClass);

			if (this.resizable) {
				this._createWindowResizeComponents();
			}

			if (!this.omitTitleBar) {
				this._createWindowTitle();
				this._decorateTitleNode();
			}

			this._createWindowContent();
			this._addNodeListeners();
		},

		_createWindowResizeComponents: function() {

			this._limitMaxHeightToAvailableHeight();

			this._resizeHandleNode = put('i.' + this.resizeHandleClass);
			put(this._windowNode, this._resizeHandleNode);
		},

		_limitMaxHeightToAvailableHeight: function() {

			var currMaxHeight = window.innerHeight;

			if (this._lastMaxHeight !== currMaxHeight) {
				this._lastMaxHeight = currMaxHeight;
				domStyle.set(this._windowNode, 'max-height', (currMaxHeight + this.resizableBottomPadding) + 'px');
			}
		},

		_createWindowTitle: function() {

			this._windowTitleNode = put(this._windowNode, 'div.' + this.windowTitleClass);

			domStyle.set(this._windowTitleNode, 'height', this.titleHeight + 'rem');
		},

		_createWindowContent: function() {

			var contentClass = this.windowContentClass,
				contentHeightReduction = this.titleHeight;

			if (this.resizable) {
				contentHeightReduction += this.resizableBottomMargin;
			}

			if (this.omitTitleBar) {
				contentClass += '.' + this.windowWithoutTitleContentClass;
				contentHeightReduction = 0;
			}

			if (this.classWindowContent) {
				contentClass += '.' + this.classWindowContent;
			}

			this._windowContentNode = put(this._windowNode, 'div.' + contentClass);

			var contentHeight = 'calc(100% - ' + contentHeightReduction + 'rem)';
			domStyle.set(this._windowContentNode, 'height', contentHeight);
		},

		_addNodeListeners: function() {

			if (!this._transitionEndCallback) {
				this._transitionEndCallback = lang.hitch(this, this._onWindowTransitionEnd);
			}

			this._windowContentNode.addEventListener('transitionend', this._transitionEndCallback);
			this._windowNode.parentNode.addEventListener('transitionend', this._transitionEndCallback);

			if (this.scrollSensitive) {
				this._windowNode.parentNode.parentNode.addEventListener('scroll', lang.hitch(this,
					this._onGrandParentScroll));
			}

			if (this.resizable) {
				this._windowNode.addEventListener('mousedown', lang.hitch(this, this._onWindowUserResizeStart));
			}
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

		_onGrandParentScroll: function(evt) {

			var gParent = evt.target,
				gParentVisibleTop = gParent.scrollTop - this.scrollMargin,
				gParentVisibleBottom = gParent.scrollTop + gParent.offsetHeight + this.scrollMargin,

				parent = this._windowNode.parentNode,
				windowTop = domStyle.get(parent, 'top'),
				windowBottom = windowTop + parent.offsetHeight,

				windowTopAboveVisibleBottom = gParentVisibleBottom >= windowTop,
				windowBottomUnderVisibleTop = gParentVisibleTop <= windowBottom;

			if (windowBottomUnderVisibleTop && windowTopAboveVisibleBottom) {
				this._setVisibleIntoParent(true);
			} else {
				this._setVisibleIntoParent(false);
			}
		},

		_onWindowUserResizeStart: function(evt) {

			on.once(window, 'mouseup', lang.hitch(this, this._onWindowUserResizeEnd));

			if (!this._windowMutationObserver) {
				this._windowMutationObserver = new MutationObserver(lang.partial(this._onWindowResizeProgress, this));
			}

			this._windowMutationObserver.observe(this._windowNode, {
				attributes: true,
				attributeFilter: ['style']
			});
		},

		_onWindowResizeProgress: function(self, mutations) {

			if (!self._resizeMutationHandler) {
				lang.hitch(self, self._onWindowResizeProgressFirstUpdate)();
				self._resizeMutationHandler = this;
			}

			clearTimeout(self._userResizeTimeoutHandler);
			self._userResizeTimeoutHandler = setTimeout(lang.hitch(self, self._prepareToResizeModuleWindow),
				self._userResizeTimeout);
		},

		_onWindowResizeProgressFirstUpdate: function() {

			// TODO sería mejor que esta clase la colocase el propio padre (details) cuando este lo pida
			domClass.add(this._windowNode.parentNode, this.windowResizedParentClass);

			this._setResizedByUser(true);
			if (!this.omitTitleBar && !this.omitTitleButtons) {
				this._prepareMaximizeForUndoUserResize();
			}
		},

		_onWindowUserResizeEnd: function(evt) {

			this._resizeMutationHandler && this._resizeMutationHandler.disconnect();
			delete this._resizeMutationHandler;
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
			}, validSizeDfd), this._validSizeInterval);
		},

		_onWindowValidSize: function() {

			this._emitEvt('LOADED');
			this._prepareToResizeModuleWindow();
		},

		_decorateTitleNode: function() {

			var windowTitle = this.windowTitle || this.getOwnChannel(),
				titleTextValue = this.i18n[windowTitle] || this.title || this.getOwnChannel();

			put(this._windowTitleNode, '[id="' + windowTitle + '"]');

			put(this._windowTitleNode, 'div.' + this.windowTitleValueClass, titleTextValue);

			if (!this.omitTitleButtons) {
				this._createWindowButtons();
			}
		},

		_createWindowButtons: function() {

			var	buttonsNode = put(this._windowTitleNode, 'div.' + this.windowButtonContainerClass),
				minimizeButtonClass = '.' + this.buttonPrefixClass + '.' + this.minimizeButtonClass,
				maximizeButtonClass = '.' + this.buttonPrefixClass + '.' + this.maximizeButtonClass,
				closeButtonClass = '.' + this.buttonPrefixClass + '.' + this.closeButtonClass;

			this._minimizeButton = put(buttonsNode, 'i' + minimizeButtonClass);
			this._minimizeButton.onclick = lang.hitch(this, this._minimizeModule);

			this._maximizeButton = put(buttonsNode, 'i' + maximizeButtonClass);
			this._maximizeButton.onclick = lang.hitch(this, this._maximizeModule);

			if (!this.omitTitleCloseButton) {
				this._closeButton = put(buttonsNode, 'i' + closeButtonClass);
				this._closeButton.onclick = lang.hitch(this, this._closeModule);
			}
		},

		_minimizeModule: function() {

			this._resizeAfterMinimizeToggle();

			if (this._minimizeButton) {
				this._minimizeButton.onclick = lang.hitch(this, this._minimizeModuleReturn);
			}

			if (this.resizable) {
				domClass.add(this._resizeHandleNode, this.hiddenClass);
			}

			domStyle.set(this.node, 'height', 0);
			domStyle.set(this._windowNode.parentNode, 'height', this.titleHeight + 'rem');
		},

		_minimizeModuleReturn: function() {

			this._resizeAfterMinimizeToggle();

			if (this._minimizeButton) {
				this._minimizeButton.onclick = lang.hitch(this, this._minimizeModule);
			}

			var contentHeightReduction = this.titleHeight;

			if (this.resizable) {
				domClass.remove(this._resizeHandleNode, this.hiddenClass);
				contentHeightReduction += this.resizableBottomMargin;
			}

			domStyle.set(this.node, 'height', 'calc(100% - ' + contentHeightReduction + 'rem)');
			domStyle.set(this._windowNode.parentNode, 'height', '');
		},

		_resizeAfterMinimizeToggle: function() {

			if (this._minimizeDfd) {
				this._minimizeDfd.reject();
			}

			this._minimizeDfd = new Deferred();
			this._minimizeDfd.then(lang.hitch(this, this._prepareToResizeModuleWindow), function() {});
		},

		_maximizeModule: function() {

			this._resizeAfterMaximizeToggle();

			if (this._maximizeButton) {
				this._maximizeButton.onclick = lang.hitch(this, this._maximizeModuleReturn);
				this._updateMaximizeButtonIcon(true);
			}

			domAttr.set(this._windowNode.parentNode, this.widthByColsAttr, this.maxWidthCols);

			this._minimizeModuleReturn();
		},

		_maximizeModuleReturn: function() {

			this._resizeAfterMaximizeToggle();

			if (this._maximizeButton) {
				this._maximizeButton.onclick = lang.hitch(this, this._maximizeModule);
				this._updateMaximizeButtonIcon(false);
			}

			domAttr.set(this._windowNode.parentNode, this.widthByColsAttr, this._originalWidthByCols);
		},

		_prepareMaximizeForUndoUserResize: function() {

			if (!this._maximizeButton) {
				return;
			}

			this._maximizeButton.onclick = lang.hitch(this, this._undoUserResize);
			this._updateMaximizeButtonIcon(true);
		},

		_undoUserResize: function() {

			domStyle.set(this._windowNode, 'width', null);
			domStyle.set(this._windowNode, 'height', null);
			// TODO sería mejor que esta clase la colocase el propio padre (details) cuando este lo pida
			domClass.remove(this._windowNode.parentNode, this.windowResizedParentClass);

			this._setResizedByUser(false);
			this._prepareToResizeModuleWindow();

			this._maximizeModuleReturn();
		},

		_resizeAfterMaximizeToggle: function() {

			if (this._maximizeDfd) {
				this._maximizeDfd.reject();
			}

			this._maximizeDfd = new Deferred();
			this._maximizeDfd.then(lang.hitch(this, this._prepareToResizeModuleWindow), function() {});
		},

		_updateMaximizeButtonIcon: function(/*Boolean*/ altIcon) {

			var classToAdd, classToRemove;

			if (altIcon) {
				classToAdd = this.restoreButtonClass;
				classToRemove = this.maximizeButtonClass;
			} else {
				classToAdd = this.maximizeButtonClass;
				classToRemove = this.restoreButtonClass;
			}

			domClass.add(this._maximizeButton, classToAdd);
			domClass.remove(this._maximizeButton, classToRemove);
		},

		_closeModule: function() {

			domStyle.set(this._windowNode.parentNode, 'display', 'none');

			this._prepareToResizeModuleWindow();
		},

		_resize: function() {

			this._resizeModuleWindow();

			this.inherited(arguments);
		},

		_prepareToResizeModuleWindow: function() {

			clearTimeout(this._moduleWindowResizeTimeoutHandler);

			this._moduleWindowResizeTimeoutHandler = setTimeout(lang.hitch(this, this._resizeWrapper),
				this._moduleWindowResizeTimeout);
		},

		_resizeModuleWindow: function() {

			this._limitMaxHeightToAvailableHeight();

			if (this.node && !this._getResizedByUser()) {
				this._autoMaximizeOnLowWidth();
			}
		},

		_autoMaximizeOnLowWidth: function() {

			if (!this.node.offsetWidth || (this.resizable && this.node.offsetWidth === this._resizableForcedMinWidth)) {
				return;
			}

			if (this.node.offsetWidth < this.minWidth) {
				this._setAutoMaximized(true);
				this._maximizeModule();
			} else if (this._getAutoMaximized()) {
				this._setAutoMaximized(false);
			}
		},

		_getAutoMaximized: function() {

			return this.statusFlags.autoMaximized;
		},

		_setAutoMaximized: function(value) {

			this.statusFlags.autoMaximized = value;
		},

		_getResizedByUser: function() {

			return this.statusFlags.resizedByUser;
		},

		_setResizedByUser: function(value) {

			this.statusFlags.resizedByUser = value;
		},

		_getVisibleIntoParent: function() {

			return this.statusFlags.visibleIntoParent;
		},

		_setVisibleIntoParent: function(value) {

			this.statusFlags.visibleIntoParent = value;
		},

		_hide: function(req) {

			this._removeNodeListeners();
			put(this._windowNode, '!');

			this.inherited(arguments);
		}
	};
});
