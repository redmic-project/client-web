define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "dojo/Deferred"
	, "dojo/query"
	, "put-selector/put"
	, "redmic/modules/base/_ShowItfc"
], function(
	declare
	, lang
	, aspect
	, Deferred
	, query
	, put
	, _ShowItfc
){
	return declare(_ShowItfc, {
		//	summary:
		//		Base común para todos los módulos con visualización.
		//	description:
		//		Aporta la funcionalidad de mostrarse al módulo que extiende de él.

		showEvents: {
			SHOW: "show",
			HIDE: "hide",
			ANCESTOR_SHOW: "ancestorShow",
			ANCESTOR_HIDE: "ancestorHide",
			LOADING: "loading",
			LOADED: "loaded",
			RESIZE: "resize",
			RESIZE_VIEW: "resizeView",
			ME_OR_ANCESTOR_SHOWN: "meOrAncestorShown",
			ME_OR_ANCESTOR_HIDDEN: "meOrAncestorHidden",
			STARTED_UP: "startedUp"
		},

		showActions: {
			SHOW: "show",
			SHOWN: "shown",
			HIDE: "hide",
			HIDDEN: "hidden",
			ANCESTOR_SHOWN: "ancestorShown",
			ANCESTOR_HIDDEN: "ancestorHidden",
			LOADING: "loading",
			LOADED: "loaded",
			RESIZE: "resize",
			RESIZED: "resized",
			TOGGLE_SHOW: "toggleShow",
			LOCK: "lock",
			UNLOCK: "unlock",
			TOGGLE_LOCK: "toggleLock",
			WINDOW_RESIZE: "windowResize",
			RESIZE_VIEW: "resizeView",
			STARTED_UP: "startedUp"
		},

		lockedClass: "lockedWrapper",

		animationSafetyTimeout: 2000,
		additionalResizeTimeout: 500,
		lowWidthValue: 800,


		constructor: function(args) {

			this._setShown(false);
			this._setPreviouslyShown(false);
			this._setStartupStatus(false);
			this._setLowWidth(window.innerWidth < this.lowWidthValue);

			aspect.after(this, "_mixEventsAndActions", lang.hitch(this, this._mixShowEventsAndActions));
			aspect.before(this, "_setOwnCallbacksForEvents", lang.hitch(this, this._setShowOwnCallbacksForEvents));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineShowSubscriptions));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineShowPublications));
			aspect.before(this, "postCreate", lang.hitch(this, this._showBeforePostCreate));
			aspect.after(this, "postCreate", lang.hitch(this, this._showAfterPostCreate));
		},

		_mixShowEventsAndActions: function () {

			lang.mixin(this.events, this.showEvents);
			lang.mixin(this.actions, this.showActions);
			delete this.showEvents;
			delete this.showActions;
		},

		_defineShowSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel: this.getChannel("SHOW"),
				callback: "_subShow",
				options: {
					predicate: lang.hitch(this, this._chkModuleCanShow)
				}
			},{
				channel: this.getChannel("HIDE"),
				callback: "_subHide",
				options: {
					predicate: lang.hitch(this, this._chkModuleCanHide)
				}
			},{
				channel: this.getChannel('ANCESTOR_SHOWN'),
				callback: "_subAncestorShown"
			},{
				channel: this.getChannel('ANCESTOR_HIDDEN'),
				callback: "_subAncestorHidden"
			},{
				channel: this.getChannel('RESIZE'),
				callback: "_subResize"
			},{
				channel: this.getChannel("TOGGLE_SHOW"),
				callback: "_subToggleShow"
			},{
				channel: this.getChannel("LOCK"),
				callback: "_subLock",
				options: {
					predicate: function() {
						return !this._chkContainerIsLocked();
					}
				}
			},{
				channel: this.getChannel("UNLOCK"),
				callback: "_subUnlock",
				options: {
					predicate: function() {
						return this._chkContainerIsLocked();
					}
				}
			},{
				channel: this.getChannel("TOGGLE_LOCK"),
				callback: "_subToggleLock"
			},{
				channel: this._buildChannel(this.rootChannel, this.actions.WINDOW_RESIZE),
				callback: "_subWindowResize"
			});

			this._deleteDuplicatedChannels(this.subscriptionsConfig);
		},

		_defineShowPublications: function () {

			this.publicationsConfig.push({
				event: 'SHOW',
				channel: this.getChannel("SHOWN")
			},{
				event: 'HIDE',
				channel: this.getChannel("HIDDEN")
			},{
				event: 'LOADING',
				channel: this._buildChannel(this.loadingChannel, this.actions.LOADING),
				callback: "_pubLoading"
			},{
				event: 'LOADED',
				channel: this._buildChannel(this.loadingChannel, this.actions.LOADED),
				callback: "_pubLoaded"
			},{
				event: 'RESIZE',
				channel: this.getChannel("RESIZED")
			},{
				event: 'RESIZE_VIEW',
				channel: this._buildChannel(this.rootChannel, this.actions.RESIZE_VIEW)
			},{
				event: 'STARTED_UP',
				channel: this.getChannel("STARTED_UP")
			});

			this._deleteDuplicatedChannels(this.publicationsConfig);
		},

		_setShowOwnCallbacksForEvents: function () {

			this._onEvt('SHOW', lang.hitch(this, this._onModuleShow));
			this._onEvt('HIDE', lang.hitch(this, this._onModuleHide));
			this._onEvt('ANCESTOR_SHOW', lang.hitch(this, this._prepareOnMeOrAncestorShown));
			this._onEvt('ANCESTOR_HIDE', lang.hitch(this, this._restoreOnMeOrAncestorShown));
			this._onEvt('RESIZE', lang.hitch(this, this._onModuleResize));
		},

		_showBeforePostCreate: function() {

			this._prepareChildrenPlacingListening();
		},

		_prepareChildrenPlacingListening: function() {

			var rootNodeGetter = lang.hitch(this, this._getModuleRootNode),
				mainNodeGetter = lang.hitch(this, this._getModuleMainNode),
				callback = lang.hitch(this, this._startupWhenNodesAreReady);

			this._listenChildrenPlacing(rootNodeGetter, mainNodeGetter, callback);
		},

		_listenChildrenPlacing: function(containerToListenGetter, expectedChildGetter, callback) {
			//	summary:
			//		Escucha cuando en un nodo padre se reciben nuevos hijos, para saber cuando
			//		se han añadido de manera efectiva.
			//	containerToListenGetter: function
			//		Callback para obtener el nodo padre al que queremos escuchar.
			//	expectedChildGetter: function
			//		Callback para obtener el nodo que esperamos que sea añadido al padre.
			//	callback: function
			//		Se ejecuta cuando se ha encontrado el hijo esperado dentro del padre.

			var containerToListen = containerToListenGetter();

			if (!containerToListen) {
				return;
			}

			var mutationObserver = new MutationObserver(
				lang.partial(function(self, expectedChildGetter, callback, mutations) {

				var expectedChild = expectedChildGetter(),
					beforeCallback = lang.hitch(this, this.disconnect);

				expectedChild && mutations.forEach(lang.hitch(self,
					self._evaluateMutation, expectedChild, callback, beforeCallback));
			}, this, expectedChildGetter, callback));

			mutationObserver.observe(containerToListen, { childList: true });
		},

		_evaluateMutation: function(expectedChild, callback, beforeCallback, mutation) {

			if (!this._getStartupStatus() && mutation.addedNodes.length &&
				mutation.addedNodes[0] === expectedChild) {

				beforeCallback();
				callback();
			}
		},

		_startupWhenNodesAreReady: function() {

			this._startup();
			this._setStartupStatus(true);
			this._emitEvt("STARTED_UP");
		},

		_showAfterPostCreate: function() {

			this._placeChildren();
		},

		_placeChildren: function() {

			var moduleRootNode = this._getModuleRootNode(),
				moduleMainNode = this._getModuleMainNode();

			if (moduleRootNode && moduleMainNode) {
				put(moduleRootNode, moduleMainNode);
			}
		},

		_prepareOnMeOrAncestorShown: function(response) {

			if (this._meOrAncestorShownAlreadyFired) {
				return;
			}

			this._meOrAncestorShownAlreadyFired = true;

			this._emitEvt('ME_OR_ANCESTOR_SHOWN', response);
		},

		_restoreOnMeOrAncestorShown: function(response) {

			//this._activeLoadingsPendding();

			this._meOrAncestorShownAlreadyFired = false;

			this._emitEvt('ME_OR_ANCESTOR_HIDDEN');
		},

		// TODO este método se salta a la torera la acumulación de cargas, no es una solución sino una chapuza
		// TODO si se detecta alguna carga no resuelta, el problema lo tiene el módulo concreto y habrá que solucionarlo
		/*_activeLoadingsPendding: function() {

			if (this._activeLoadings) {
				var counts = this._activeLoadings;
				for (var i = 0; i < counts; i++) {
					this._emitEvt('LOADED');
				}
			}
		},*/

		_addClass: function(className) {

			this._changeNodeClasses(this.node, className, ".");
		},

		_removeClass: function(className) {

			this._changeNodeClasses(this.node, className, "!");
		},

		_changeNodeClasses: function(node, className, modifier) {

			if (className && node && node.firstChild) {
				var classes = className.split(" ").join(modifier);
				put(node.firstChild, modifier + classes);
			}
		},

		_subShow: function(req) {

			this._showWrapper(req);
		},

		_showWrapper: function(req) {

			var beforeShowDfd = this._beforeShow(req),
				continueShow = lang.hitch(this, this._continueShow, req);

			if (beforeShowDfd && beforeShowDfd.then) {
				beforeShowDfd.then(continueShow);
			} else {
				continueShow();
			}
		},

		_continueShow: function(req) {

			this._show(req);

			var animationObj = req ? req.animation : null,
				doAfterShow = lang.hitch(this, this._afterShowAnimation, req),
				dfdAnimationEnd;

			if (animationObj) {
				this._showAnimation = animationObj.showAnimation;
				this._hideAnimation = animationObj.hideAnimation;
			}

			if (this._showAnimation) {
				dfdAnimationEnd = this._animateNode(this._showAnimation, this._hideAnimation);
			} else if (this._hideAnimation) {
				this._removeClass(this._hideAnimation);
			}

			if (dfdAnimationEnd) {
				dfdAnimationEnd.then(doAfterShow);
			} else {
				doAfterShow();
			}
		},

		_show: function(req) {

			var node = req ? req.node : null,
				data = req ? req.data : null,
				inFront = req ? req.inFront : null;

			// Si no le pasamos nodo, utiliza el último
			if (node) {
				this.currentNode = node;
			} else {
				node = this.currentNode;
			}

			if (!node) {
				return;
			}

			// Guardamos si debe enviar metaTags
			// TODO creo que esto no debería ir aquí, hablarlo
			this.metaTags = req ? req.metaTags : null;

			if (data) {
				this.currentData = data;
			} else {
				this.currentData = null;
			}

			var nodeToShow = this._getNodeToShow();
			if (!nodeToShow) {
				return;
			}

			if (node.domNode) {
				var parentNodeGetter = function() { return node.domNode; },
					childNodeGetter = function() { return nodeToShow; },
					callback = lang.hitch(this, this._emitEvt, 'RESIZE_VIEW');

				this._listenChildrenPlacing(parentNodeGetter, childNodeGetter, callback);

				this._addToNode(node.domNode, nodeToShow, inFront);
			} else {
				this._addToNode(node, nodeToShow, inFront);
			}
		},

		_addToNode: function(node, nodeToShow, inFront) {

			if (inFront && node.firstChild) {
				this.node = put(node.firstChild, "-", nodeToShow);
			} else {
				this.node = put(node, nodeToShow);
			}
		},

		_chkModuleCanShow: function(req) {

			var node = req ? req.node : null,
				data = req ? req.data : null;

			var chkData = function(data) {
				if (data) {
					if (data !== this.currentData) {
						return true;
					}
				}
				return false;
			};

			if (node) {
				if (node !== this.currentNode) {
					return true;
				} else {
					if (!this._getShown()) {
						return true;
					} else {
						return chkData(data);
					}
				}
			} else {
				if (this.currentNode) {
					if (!this._getShown()) {
						return true;
					} else {
						return chkData(data);
					}
				}
			}

			return false;
		},

		_animateNode: function(currentAnimationClass, previousAnimationClass) {
			//TODO es posible que haya que separarlo en 2, uno para show y otro para hide
			// para que cada uno tenga su this._afterAnimationCallback y demás. Pensar con calma.

			var dfd = new Deferred();

			this._removeClass(previousAnimationClass);

			if (this._afterAnimationCallback) {
				this.node.firstChild.removeEventListener('animationend',
					this._afterAnimationCallback);
			}
			this._afterAnimationCallback = lang.hitch(this, function(dfd) {
				clearTimeout(this._animationSafetyHandler);
				dfd.resolve();
			}, dfd);

			// Seguro para cuando la animación es nula
			this._animationSafetyHandler = setTimeout(lang.hitch(this, function() {
				console.error("Animation error at module '", this.getChannel(), "'");
				dfd.resolve();
			}), this.animationSafetyTimeout);

			this.node.firstChild.addEventListener('animationend', this._afterAnimationCallback);

			this._addClass(currentAnimationClass);

			return dfd;
		},

		_afterShowAnimation: function(req) {

			var emitShow = lang.hitch(this, this._emitEvt, 'SHOW', this._getShownOrHiddenResponseObject()),
				dfdAfterShow = this._afterShow(req);

			if (dfdAfterShow && dfdAfterShow.then) {
				dfdAfterShow.then(emitShow);
			} else {
				emitShow();
			}
		},

		_subHide: function(req) {

			this._hideWrapper(req);
		},

		_hideWrapper: function(req) {

			var beforeHideDfd = this._beforeHide(req),
				continueHide = lang.hitch(this, this._continueHide, req);

			if (beforeHideDfd && beforeHideDfd.then) {
				beforeHideDfd.then(continueHide);
			} else {
				continueHide();
			}
		},

		_continueHide: function(req) {

			if (!this.node) {
				return;
			}

			var doHide = lang.hitch(this, this._hide, req),
				dfdAnimationEnd;

			if (this._hideAnimation) {
				if (req.omitAnimation) {
					this._removeClass(this._showAnimation);
					this._removeClass(this._hideAnimation);
				} else {
					dfdAnimationEnd = this._animateNode(this._hideAnimation, this._showAnimation);
				}
			}

			if (dfdAnimationEnd) {
				dfdAnimationEnd.then(doHide);
			} else {
				doHide();
			}
		},

		_hide: function(req) {

			if (!this.node) {
				return;
			}

			//TODO revisar la manera de guardar el nodo padre y el propio, se esta duplicando en dos variables el del padre

			var node = this._getNodeToShow();
			if (node) {
				put(node.domNode || node, "!");
			}

			this._destroyNode();
			this._emitHideEventWhenAfterHideIsDone(req);
		},

		_emitHideEventWhenAfterHideIsDone: function(req) {

			var emitHide = lang.hitch(this, this._emitEvt, 'HIDE', this._getShownOrHiddenResponseObject()),
				dfdAfterHide = this._afterHide(req);

			if (dfdAfterHide && dfdAfterHide.then) {
				dfdAfterHide.then(emitHide);
			} else {
				emitHide();
			}
		},

		_destroyNode: function() {

			//this.node.destroy && this.node.destroy();
			this.node = null;
		},

		_chkModuleCanHide: function(req) {

			return this._getShown();
		},

		_subToggleShow: function(req) {

			if (this._getShown()) {
				this._chkModuleCanHide(req) && this._hide(req);
			} else {
				this._chkModuleCanShow(req) && this._showWrapper(req);
			}
		},

		_subAncestorShown: function(req) {

			this._emitEvt('ANCESTOR_SHOW', req);
			this._propagateActionToChildren('ANCESTOR_SHOWN', req);
		},

		_subAncestorHidden: function(req) {

			this._emitEvt('ANCESTOR_HIDE', req);
			this._propagateActionToChildren('ANCESTOR_HIDDEN', req);
		},

		_subResize: function(req) {

			this._emitEvt('RESIZE', req);
			this._propagateActionToChildren('RESIZE', req);
		},

		_subLock: function() {

			this._lock();
		},

		_lock: function() {

			if (!this._lockedContainer) {
				this._lockedContainer = this._getNodeToShow();
			}

			this._setLockStatus(true);
			put(this._lockedContainer, this._getLockerElement(this.lockedClass));
		},

		_subUnlock: function() {

			this._unlock();
		},

		_unlock: function() {

			this._hideLocker(this._lockedContainer);
			this._setLockStatus(false);
		},

		_getLockStatus: function() {

			return this.statusFlags.locked;
		},

		_setLockStatus: function(value) {

			this.statusFlags.locked = value;
		},

		_chkContainerIsLocked: function() {

			return !!this._getLockStatus();
		},

		_getLockerElement: function(nodeClass) {

			return put("div." + nodeClass);
		},

		_hideLocker: function(node) {

			var selector = "#" + node.id + " > " + "." + this.lockedClass,
				lockedNode = query(selector, node.parentElement)[0];

			lockedNode && put("!", lockedNode);
		},

		_subToggleLock: function(req) {

			if (this._getLockStatus()) {
				this._unlock();
			} else {
				this._lock();
			}
		},

		_subWindowResize: function(res) {

			this._prepareResize(res);
		},

		_prepareResize: function(res) {

			clearTimeout(this._additionalResizeHandler);
			this._additionalResizeHandler = setTimeout(lang.hitch(this, this._doShowResize, res),
				this.additionalResizeTimeout);

			// TODO en _Window hay una funcionalidad de emitir el evento RESIZE, que debería usarse
			// aqui para todos. Generalizar lo que se encuentra en _Window y compatibilizar
		},

		_doShowResize: function(res) {

			this._setLowWidth(window.innerWidth < this.lowWidthValue);

			this._resize(res);
		},

		_getShownOrHiddenResponseObject: function() {

			return {
				success: true
			};
		},

		_pubLoading: function(channel, evt) {

			var isGlobalLoading = evt ? evt.global : false,
				objToPub = {
					moduleChannel: this.getChannel()
				};

			if (!isGlobalLoading) {
				if (this._activeLoadings) {
					this._activeLoadings++;
					return;
				}

				this._activeLoadings = 1;

				if (!this._loadingContainer) {
					this._loadingContainer = this._getNodeToShowLoading() || this._getNodeToShow();
				}

				objToPub.node = this._loadingContainer;
			} else {
				this._activeGlobalLoading = true;
			}

			this._setLoadingStatus(true);
			this._publish(channel, objToPub);
		},

		_pubLoaded: function(channel, evt) {

			if (!this._getLoadingStatus()) {
				return;
			}

			var objToPub = {
				moduleChannel: this.getChannel()
			};

			if (this._activeLoadings > 1) {
				this._activeLoadings--;
				return;
			}

			if (this._activeLoadings) {
				this._activeLoadings = 0;
				objToPub.node = this._loadingContainer;
			} else {
				this._activeGlobalLoading = false;
			}

			this._publish(channel, objToPub);

			if (!this._activeGlobalLoading && !this._activeLoadings) {
				this._setLoadingStatus(false);
			}
		},

		_getPreviouslyShown: function() {

			return this.statusFlags.previouslyShown;
		},

		_getShown: function() {

			return this.statusFlags.shown;
		},

		_setPreviouslyShown: function(value) {

			this.statusFlags.previouslyShown = value;
		},

		_setShown: function(value) {

			this.statusFlags.shown = value;
		},

		_onModuleShow: function() {

			this._setShown(true);
			!this._getPreviouslyShown() && this._setPreviouslyShown(true);

			var response = {
				moduleChannel: this.getChannel()
			};

			this._prepareOnMeOrAncestorShown(response);
			this._propagateActionToChildren('ANCESTOR_SHOWN', response);
		},

		_onModuleHide: function() {

			//this._activeLoadingsPendding();

			this._setShown(false);

			var response = {
				moduleChannel: this.getChannel()
			};

			this._restoreOnMeOrAncestorShown(response);
			this._propagateActionToChildren('ANCESTOR_HIDDEN', response);
		},

		_onModuleResize: function(evt) {

			if (this.layout) {
				this.layout();
			}
		},

		_getStartupStatus: function() {

			return this.statusFlags.started;
		},

		_setStartupStatus: function(value) {

			this.statusFlags.started = value;
		},

		_getLoadingStatus: function() {

			return this.statusFlags.loading;
		},

		_setLoadingStatus: function(value) {

			this.statusFlags.loading = value;
		},

		_getLowWidth: function() {

			return this.statusFlags.lowWidth;
		},

		_setLowWidth: function(value) {

			this.statusFlags.lowWidth = value;
		}
	});
});
