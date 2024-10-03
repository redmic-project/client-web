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
		minWidth: 300,

		widthByColsAttr: 'data-cols',
		minWidthCols: 1,
		maxWidthCols: 6,

		_heightFitContentValue: 'fitContent',
		heightByRowsAttr: 'data-rows',
		maxHeightRows: 6,

		resizableBottomPadding: 15,
		resizableActionableThreshold: 15,

		scrollMargin: 10,

		omitTitleBar: false,
		omitTitleButtons: false,
		omitTitleCloseButton: false,
		resizable: true,
		scrollSensitive: true,
		fitHeightToContent: false,

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

			if (this._getShown()) {
				return this.inherited(arguments);
			}

			if (this._getPreviouslyShown()) {
				this._removeNodeListeners();
			}

			var node;

			if (req && req.node) {
				node = req.node.domNode || req.node;
			} else {
				node = this._moduleOwnNode;
			}

			if (node) {
				this._originalWidthByCols = domAttr.get(node, this.widthByColsAttr);
				this._originalHeightByRows = domAttr.get(node, this.heightByRowsAttr);
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

			var idParam = '[id="' + this._getWindowTitleIdValue() + '"]';
			this._windowNode = put(node, 'div.' + containerClass + idParam);

			if (this.resizable) {
				this._limitMaxHeightToAvailableHeight();
			}

			if (!this.omitTitleBar) {
				this._createWindowTitle();
				this._decorateTitleNode();
			}

			this._createWindowContent();
			this._addNodeListeners();
		},

		_limitMaxHeightToAvailableHeight: function() {

			if (this.fitHeightToContent) {
				return;
			}

			var currMaxHeight = globalThis.innerHeight;

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

			var contentClass = this.windowContentClass;

			if (this.omitTitleBar) {
				contentClass += '.' + this.windowWithoutTitleContentClass;
			}

			if (this.classWindowContent) {
				contentClass += '.' + this.classWindowContent;
			}

			this._windowContentNode = put(this._windowNode, 'div.' + contentClass);

			domStyle.set(this._windowContentNode, 'height', this._getWindowContentHeight());
		},

		_getWindowContentHeight: function() {

			var contentHeightReduction = this.omitTitleBar ? 0 : this.titleHeight;

			return 'calc(100% - ' + contentHeightReduction + 'rem)';
		},

		_addNodeListeners: function() {

			var listenerOpts = { passive: true };

			if (!this._transitionEndCallback) {
				this._transitionEndCallback = lang.hitch(this, this._onWindowTransitionEnd);
			}

			this._windowContentNode.addEventListener('transitionend', this._transitionEndCallback, listenerOpts);
			this._windowNode.parentNode.addEventListener('transitionend', this._transitionEndCallback, listenerOpts);

			if (this.scrollSensitive) {
				this._windowNode.parentNode.parentNode.addEventListener('scrollend', lang.hitch(this,
					this._onGrandParentScroll), listenerOpts);
			}

			if (this.resizable) {
				var startCallback = lang.hitch(this, this._onWindowUserResizeStart);
				this._windowNode.addEventListener('mousedown', startCallback, listenerOpts);
				this._windowNode.addEventListener('touchstart', startCallback, listenerOpts);
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

			if ((propName === 'width' || propName === 'transform') && this._maximizeDfd) {
				this._maximizeDfd.resolve();
			}
		},

		_onGrandParentScroll: function(evt) {

			if (!this._getShown()) {
				return;
			}

			var gParent = evt.target,
				gParentVisibleTop = gParent.scrollTop - this.scrollMargin,
				gParentVisibleBottom = gParent.scrollTop + gParent.offsetHeight + this.scrollMargin,

				parent = this._windowNode.parentNode,
				windowTop = domStyle.get(parent, 'top'),
				windowBottom = windowTop + parent.offsetHeight,

				windowTopAboveVisibleBottom = gParentVisibleBottom >= windowTop,
				windowBottomUnderVisibleTop = gParentVisibleTop <= windowBottom,
				windowIsVisible = windowBottomUnderVisibleTop && windowTopAboveVisibleBottom;

			this._setVisibleIntoParent(windowIsVisible);
		},

		_unsetWindowParentNodeSize: function() {

			this._unsetNodeSize(this._windowNode.parentNode);
		},

		_unsetWindowNodeSize: function() {

			this._unsetNodeSize(this._windowNode);
		},

		_unsetNodeSize: function(node) {

			domStyle.set(node, 'width', null);
			domStyle.set(node, 'height', null);
		},

		_onWindowUserResizeStart: function(evt) {

			if (!this._checkEventAtBottomRightCorner(evt)) {
				return;
			}

			if (!this._windowMutationObserver) {
				this._windowMutationObserver = new MutationObserver(lang.partial(this._onWindowResizeProgress, this));

				var endCallback = lang.hitch(this, this._onWindowUserResizeEnd);
				this._mouseResizeEndListener = on.once(window, 'mouseup', endCallback);
				this._touchEndResizeEndListener = on.once(window, 'touchend', endCallback);
				this._touchLeaveResizeEndListener = on.once(window, 'touchleave', endCallback);
			}

			this._windowMutationObserver.observe(this._windowNode, {
				attributes: true,
				attributeFilter: ['style']
			});
		},

		_checkEventAtBottomRightCorner: function(evt) {

			var boundingRect = this._windowNode.getBoundingClientRect(),
				isMouseEvent = evt.type === 'mousedown',
				evtSource = isMouseEvent ? evt : evt.touches[0],
				localX = evtSource.clientX - boundingRect.left,
				localY = evtSource.clientY - boundingRect.top,
				localWidth = boundingRect.width - this.resizableActionableThreshold,
				localHeight = boundingRect.height - this.resizableActionableThreshold;

			return localX >= localWidth && localY >= localHeight;
		},

		_onWindowResizeProgress: function(self) {

			if (!this.isNotFirstIteration) {
				this.isNotFirstIteration = true;
				lang.hitch(self, self._onWindowResizeProgressFirstUpdate)();
			}

			clearTimeout(self._userResizeTimeoutHandler);
			self._userResizeTimeoutHandler = setTimeout(lang.hitch(self, self._prepareToResizeModuleWindow),
				self._userResizeTimeout);
		},

		_onWindowResizeProgressFirstUpdate: function() {

			domClass.add(this._windowNode.parentNode, this.windowResizedParentClass);

			this._setResizedByUser(true);
			this._unsetWindowParentNodeSize();

			if (!this.omitTitleBar && !this.omitTitleButtons) {
				this._prepareMaximizeForUndoUserResize();
			}
		},

		_onWindowUserResizeEnd: function() {

			this._windowMutationObserver.disconnect();
			delete this._windowMutationObserver;

			this._mouseResizeEndListener.remove();
			this._touchEndResizeEndListener.remove();
			this._touchLeaveResizeEndListener.remove();

			this._setWindowParentNodeSize();
		},

		_setWindowParentNodeSize: function() {

			var windowWidth = this._windowNode.clientWidth + 'px',
				windowHeight = this._windowNode.clientHeight + 'px';

			domStyle.set(this._windowNode.parentNode, 'width', windowWidth);
			domStyle.set(this._windowNode.parentNode, 'height', windowHeight);
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

				if (this._moduleOwnNode && this._moduleOwnNode.offsetWidth) {
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

			var titleTextValue = this._getWindowTitleTextValue(),
				titleAttr = '[title="' + titleTextValue + '"]';

			this._windowTitleTextNode = put(this._windowTitleNode, 'div.' + this.windowTitleValueClass + titleAttr,
				titleTextValue);

			if (!this.omitTitleButtons) {
				this._createWindowButtons();
			}
		},

		_getWindowTitleIdValue: function() {

			return this.windowId || this.getOwnChannel();
		},

		_getWindowTitleTextValue: function(newValue) {

			var windowTitle = newValue || this.windowTitle || this.title || this._getWindowTitleIdValue();

			this.windowTitle = this.i18n[windowTitle] || windowTitle;

			return this.windowTitle;
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

			this._prevMinimizeWindowHeight = this._windowNode.clientHeight;

			domStyle.set(this._windowContentNode, 'height', 0);
			domStyle.set(this._windowNode.parentNode, 'height', this.titleHeight + 'rem');
		},

		_minimizeModuleReturn: function() {

			this._resizeAfterMinimizeToggle();

			if (this._minimizeButton) {
				this._minimizeButton.onclick = lang.hitch(this, this._minimizeModule);
			}

			domStyle.set(this._windowContentNode, 'height', this._getWindowContentHeight());

			var prevHeight = this._prevMinimizeWindowHeight ? this._prevMinimizeWindowHeight + 'px' : null;
			domStyle.set(this._windowNode.parentNode, 'height', prevHeight);
		},

		_resizeAfterMinimizeToggle: function() {

			if (this._minimizeDfd) {
				this._minimizeDfd.reject();
			}

			this._minimizeDfd = new Deferred();
			this._minimizeDfd.then(lang.hitch(this, this._prepareToResizeModuleWindow),
				lang.hitch(this, this._cancelResizeModuleWindow));
		},

		_maximizeModule: function() {

			this._resizeAfterMaximizeToggle();

			if (this._maximizeButton) {
				this._maximizeButton.onclick = lang.hitch(this, this._maximizeModuleReturn);
				this._updateMaximizeButtonIcon(true);
			}

			this._setWindowParentNodeAttrsToMaximize();

			this._unsetWindowParentNodeSize();
			this._unsetWindowNodeSize();

			this._undoMinimizeModule();
		},

		_setWindowParentNodeAttrsToMaximize: function() {

			var node = this._windowNode.parentNode;

			domAttr.set(node, this.widthByColsAttr, this.maxWidthCols);

			if (domAttr.get(node, this.heightByRowsAttr) !== this._heightFitContentValue) {
				domAttr.set(node, this.heightByRowsAttr, this.maxHeightRows);
			}
		},

		_maximizeModuleReturn: function() {

			this._resizeAfterMaximizeToggle();

			if (this._maximizeButton) {
				this._maximizeButton.onclick = lang.hitch(this, this._maximizeModule);
				this._updateMaximizeButtonIcon(false);
			}

			this._setWindowParentNodeAttrsToUndoMaximize();

			this._undoMinimizeModule();
		},

		_setWindowParentNodeAttrsToUndoMaximize: function() {

			var node = this._windowNode.parentNode;

			domAttr.set(node, this.widthByColsAttr, this._originalWidthByCols);

			if (this._originalHeightByRows !== this._heightFitContentValue) {
				domAttr.set(node, this.heightByRowsAttr, this._originalHeightByRows);
			}
		},

		_prepareMaximizeForUndoUserResize: function() {

			if (!this._maximizeButton) {
				return;
			}

			this._maximizeButton.onclick = lang.hitch(this, this._undoUserResize);
			this._updateMaximizeButtonIcon(true);

			this._undoMinimizeModule();
		},

		_undoMinimizeModule: function() {

			delete this._prevMinimizeWindowHeight;
			this._minimizeModuleReturn();
		},

		_undoUserResize: function() {

			this._unsetWindowParentNodeSize();
			this._unsetWindowNodeSize();

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
			this._maximizeDfd.then(lang.hitch(this, this._prepareToResizeModuleWindow),
				lang.hitch(this, this._cancelResizeModuleWindow));
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

			this._moduleWindowResizeTimeoutHandler = setTimeout(lang.hitch(this, this._moduleShowResize),
				this._moduleWindowResizeTimeout);
		},

		_cancelResizeModuleWindow: function() {

			// TODO
		},

		_resizeModuleWindow: function() {

			if (this._windowNode) {
				this._limitMaxHeightToAvailableHeight();
			}

			if (this._moduleOwnNode && !this._getResizedByUser()) {
				this._autoMaximizeOnLowWidth();
			}
		},

		_autoMaximizeOnLowWidth: function() {

			if (!this._moduleOwnNode.offsetWidth || (this.resizable &&
				this._moduleOwnNode.offsetWidth === this._resizableForcedMinWidth)) {

				return;
			}

			if (this._moduleOwnNode.offsetWidth < this.minWidth) {
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
		},

		_onTitlePropSet: function() {

			this._updateWindowTitleValue(this.title);
		},

		_updateWindowTitleValue: function(newValue) {

			var titleTextValue = this._getWindowTitleTextValue(newValue);

			if (this.omitTitleBar) {
				return;
			}

			domAttr.set(this._windowTitleTextNode, 'title', titleTextValue);
			this._windowTitleTextNode.innerHTML = titleTextValue;
		}
	};
});
