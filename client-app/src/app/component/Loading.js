define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/query'
	, 'put-selector/put'
	, 'src/component/base/_Module'
	, 'templates/LoadingArrows'
], function(
	declare
	, lang
	, query
	, put
	, _Module
	, LoadingTemplate
) {

	return declare(_Module, {
		//	summary:
		//		Módulo para representar cuando otros módulos están esperando a que ocurra algo.
		//	description:
		//		Escucha las peticiones de 'cargando' y 'cargado' de todos los módulos.

		constructor: function(args) {

			this.config = {
				ownChannel: 'loading',
				events: {
					LOADING_DRAWN: 'loadingDrawn',
					LOADED: 'loaded'
				},
				actions: {
					LOADING: 'loading',
					LOADING_DRAWN: 'loadingDrawn',
					LOADED: 'loaded',
					LOAD_FINISHED: 'loadFinished',
					ABORT_ALL_LOADING: 'abortAllLoading'
				},

				_activeGlobalLoadings: 0,

				globalNode: null,
				loadingClass: 'loadingWrapper',
				globalLoadingClass: 'loadingWrapperGlobal',
				instantLoadingClass: 'instantLoading',
				loadingAttr: 'loading'
			};

			lang.mixin(this, this.config, args);
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel('LOADING'),
				callback: '_subLoading'
			},{
				channel : this.getChannel('LOADED'),
				callback: '_subLoaded'
			},{
				channel : this.getChannel('ABORT_ALL_LOADING'),
				callback: '_subAbortAllLoading'
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'LOADING_DRAWN',
				channel: this.getChannel('LOADING_DRAWN')
			},{
				event: 'LOADED',
				channel: this.getChannel('LOAD_FINISHED')
			});
		},

		_subLoading: function(req) {

			var localNode = req.node,
				moduleChannel = req.moduleChannel,
				instant = req.instant,
				loadingClassNames = this.loadingClass;

			if (instant) {
				loadingClassNames += '.' + this.instantLoadingClass;
			}

			if (localNode) {
				this._localLoading({
					node: localNode,
					loadingClassNames: loadingClassNames
				});
			} else {
				this._globalLoading(loadingClassNames);
			}
		},

		_localLoading: function(args) {

			var node = args.node,
				loadingClassNames = args.loadingClassNames;

			this._applyLoadingAttr(node);

			var loadingElement = this._getLoadingElement(loadingClassNames);
			this._insertLoadingNode(node, loadingElement);
		},

		_globalLoading: function(loadingClassNames) {

			if (!this._activeGlobalLoadings && this.globalNode) {
				this._applyLoadingAttr(this.globalNode);

				var globalLoadingClass = loadingClassNames + '.' + this.globalLoadingClass,
					loadingElement = this._getLoadingElement(globalLoadingClass);

				this._insertLoadingNode(this.globalNode, loadingElement);
			}

			this._activeGlobalLoadings++;
		},

		_insertLoadingNode: function(parentNode, loadingNode) {

			var onLoadingShown = lang.hitch(this, this._emitEvt, 'LOADING_DRAWN'),
				mutationObserver = new MutationObserver(lang.partial(this._evaluateLoadingNodeMutation, {
					loadingNode: loadingNode,
					desiredNodes: 'addedNodes',
					callback: onLoadingShown
				}));

			mutationObserver.observe(parentNode, { childList: true });

			put(parentNode, loadingNode);
		},

		_applyLoadingAttr: function(node) {

			put(node, '[' + this.loadingAttr + '=true]');
		},

		_removeLoadingAttr: function(node) {

			put(node, '[!' + this.loadingAttr + ']');
		},

		_getLoadingElement: function(nodeClass) {

			var node = put('div.' + nodeClass);
			node.innerHTML = LoadingTemplate();

			return node;
		},

		_subLoaded: function(req) {

			var localNode = req.node,
				moduleChannel = req.moduleChannel;

			if (localNode) {
				this._localLoaded(localNode);
			} else {
				this._globalLoaded();
			}
		},

		_localLoaded: function(node) {

			this._hideLoading(node, this.loadingClass);
		},

		_globalLoaded: function() {

			if (this._activeGlobalLoadings && this.globalNode) {
				this._activeGlobalLoadings--;
				!this._activeGlobalLoadings && this._hideLoading(this.globalNode, this.globalLoadingClass);
			}
		},

		_hideLoading: function(node, loadingClass) {

			var loadingNode = this._findLoadingNode(node, loadingClass),
				onLoadingHidden = lang.hitch(this, this._confirmLoadingHiding, node);

			if (!loadingNode) {
				console.error('Loading node not found when tried to hide it. Queried from node "%O" and found "%O"',
					node, loadingNode);

				onLoadingHidden();
				return;
			}

			var mutationObserver = new MutationObserver(lang.partial(this._evaluateLoadingNodeMutation, {
				loadingNode: loadingNode,
				desiredNodes: 'removedNodes',
				callback: onLoadingHidden
			}));

			mutationObserver.observe(node, { childList: true });

			put('!', loadingNode);
		},

		_evaluateLoadingNodeMutation: function(args, mutations) {

			var loadingNode = args.loadingNode,
				desiredNodes = args.desiredNodes,
				callback = args.callback;

			for (var i = 0; i < mutations.length; i++) {
				var mutation = mutations[i],
					nodes = mutation[desiredNodes];

				for (var j = 0; j < nodes.length; j++) {
					var node = nodes[j];
					if (node === loadingNode) {
						this.disconnect();
						callback();
					}
				}
			}
		},

		_findLoadingNode: function(node, loadingClass) {

			var children = node.children;

			for (var i = 0; i < children.length; i++) {
				var child = children[i],
					classList = child.classList;

				if (classList.contains(loadingClass)) {
					return child;
				}
			}
		},

		_confirmLoadingHiding: function(node) {

			this._removeLoadingAttr(node);
			this._emitEvt('LOADED');
		},

		_subAbortAllLoading: function() {

			this._hideAllLoadingNodes();
		},

		_hideAllLoadingNodes: function() {

			if (!this.globalNode) {
				return;
			}

			var loadingParentNodes = query('[' + this.loadingAttr + ']');

			for (var i = 0; i < loadingParentNodes.length; i++) {
				var loadingParentNode = loadingParentNodes[i];

				if (loadingParentNode === this.globalNode) {
					this._globalLoaded();
				} else {
					this._localLoaded(loadingParentNode);
				}
			}
		}
	});
});
