define([
	"app/designs/base/_Controller"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "dojo/Deferred"
	, "dojo/promise/all"
	, 'draggabilly/draggabilly.pkgd.min'
	, 'packery/packery.pkgd.min'
	, "put-selector/put"
	, "src/component/base/_Store"
	, "src/component/base/_Window"
	, 'src/util/Credentials'
	, 'src/util/GuestChecker'
	, "./_ControllerItfc"
], function(
	_Controller
	, declare
	, lang
	, aspect
	, Deferred
	, all
	, draggabilly
	, packery
	, put
	, _Store
	, _Window
	, Credentials
	, GuestChecker
	, _ControllerItfc
) {

	return declare([_ControllerItfc, _Controller, _Store], {
		//	summary:
		//		Controller para vistas de detalle, que dividen la información a mostrar en cajitas independientes.
		//		El usuario puede interactuar con ellas para adaptar la representación a su gusto.

		constructor: function(args) {

			this.config = {
				controllerEvents: {
					LAYOUT_COMPLETE: "layoutComplete",
					BUTTON_EVENT: "btnEvent" // TODO esto es específico, reubicar
				},
				controllerActions: {
					GET_REPORT: "getReport" // TODO esto es específico, reubicar
				},

				idProperty: "id",
				hiddenClass: "hidden",

				_heightFitContentValue: 'fitContent',
				_rowsParameterName: "data-rows",
				_colsParameterName: "data-cols",
				_updateInteractiveTimeout: 100,

				_widgets: {},
				_nodes: {},
				_nodesHandlers: {}
			};

			lang.mixin(this, this.config, args);
		},

		// TODO: este método es más propio de vista que de diseño, el diseño puede usarse a nivel más bajo que una vista
		_putMetaTags: function() {
			//	summary:
			//		Manda a publicar la información necesaria para que se generen las meta-tags
			//		de la vista actual. Debe ejecutarse después del show de la vista, ya que este
			//		indica mediante el flag "metaTags" si debe o no generarse.
			//		*** Función que sobreescribe a la de _View para enviar más datos  ***
			//	tags:
			//		private

			aspect.after(this, "_itemAvailable", lang.hitch(this, function(item, args) {

				if (this.target instanceof Array && this.target[0] !== args[1].target) {
					return;
				}

				if (this.metaTags) {
					this._emitEvt('PUT_META_TAGS', {
						view: this.getOwnChannel(),
						data: args[0].data
					});
				}
			}));
		},

		_initializeController: function() {

			this.packery = new packery(this.centerNode, {
				isInitLayout: false
			});
		},

		_doControllerEvtFacade: function() {

			this.packery.on("layoutComplete", lang.hitch(this, this._groupEventArgs, 'LAYOUT_COMPLETE'));
		},

		_setControllerOwnCallbacksForEvents: function() {

			this._onEvt('ME_OR_ANCESTOR_SHOWN', lang.hitch(this, this._onControllerMeOrAncestorShown));
			this._onEvt('ME_OR_ANCESTOR_HIDDEN', lang.hitch(this, this._onControllerMeOrAncestorHidden));
			this._onEvt('RESIZE', lang.hitch(this, this._onControllerResize));
			this._onEvt('LAYOUT_COMPLETE', lang.hitch(this, this._onLayoutComplete));
			this._onEvt('BUTTON_EVENT', lang.hitch(this, this._onButtonEvent)); // TODO esto es específico, reubicar
		},

		_afterControllerShow: function() {

			if (!this._widgetsAlreadyGenerated) {
				this._generateWidgets();
				this._buildVisualization().then(lang.hitch(this, this._updateInteractive));
			}
		},

		_generateWidgets: function() {

			for (var key in this.widgetConfigs) {
				var config = this.widgetConfigs[key] || {};
				this._createWidget(key, config);
			}

			this._widgetsAlreadyGenerated = true;
		},

		_buildVisualization: function() {

			var dfds = [];
			for (var key in this.widgetConfigs) {
				dfds.push(this._buildWidgetVisualization(key));
			}

			return all(dfds);
		},

		_buildWidgetVisualization: function(key) {

			var config = this.widgetConfigs[key];

			if (this._nodes[key]) {
				return;
			}

			this._createWidgetNode(key, config);

			if (config.hidden) {
				var dfd = new Deferred();
				dfd.resolve();
				return dfd;
			}

			return this._showWidget(key, true);
		},

		_onControllerResize: function() {

			this._getShown() && this._updateInteractive();
		},

		_onButtonEvent: function(evt) {
			// TODO: eso es para casos concretos, debería separarse

			var methodName = "_" + evt + "Clicked";
			this[methodName] && this[methodName](evt);
		},

		/*_onControllerShown: function() {

			if (this._getShown()) {
				this._reloadInteractive();
				this._updateInteractive();
			}

			this._clearModules();
			this._refreshModules();
		},*/

		_reloadInteractive: function() {

			this.packery.layout();
			this.packery.reloadItems();
		},

		_checkPathVariableId: function() {
			// TODO: este método es más propio de vista que de diseño, el diseño puede usarse a nivel más bajo que una vista

			if (!this.pathVariableId) {
				this._goTo404();
			}
		},

		_onControllerMeOrAncestorShown: function(res) {

			if (this._getShown()) {
				this._reloadInteractive();
				this._updateInteractive();
			}

			this._clearModules();
			this._refreshModules();
		},

		_onControllerMeOrAncestorHidden: function(res) {

			this._clearModules();
		},

		/*_getModuleRootNode: function() {

			return this.containerNode;
		},

		_getModuleMainNode: function() {

			return this.centerNode;
		},*/

		_evaluateCondition: function(condition) {
			// TODO: eso es para casos concretos (botones), debería separarse

			if (typeof condition === "function") {
				return condition(this.data);
			}

			return condition && !!this.data[condition];
		},

		_getWidgetInstance: function(key) {

			return this._widgets[key];
		},

		_addWidget: function(key, config) {

			this._createWidget(key, config);
			this._createWidgetNode(key, config);
			this._showWidget(key);
		},

		_createWidget: function(key, config) {

			if (this._getWidgetInstance(key)) {
				return;
			}

			var moduleProps = this._merge([
				this.propsWidget || {},
				config.props || {},
				{
					ownChannel: key,
					parentChannel: this.getChannel(),
					windowTitle: key,
					fitHeightToContent: config.height === this._heightFitContentValue
				}
			]);

			var moduleType = config.type,
				WidgetDefinition = declare(moduleType).extend(_Window),
				widgetInstance = new WidgetDefinition(moduleProps);

			this._widgets[key] = widgetInstance;
			this._listenWidget(widgetInstance);
		},

		_listenWidget: function(widgetInstance) {

			this._setSubscription({
				channel: widgetInstance.getChannel("RESIZED"),
				callback: "_subModuleResized"
			});
		},

		_createWidgetNode: function(key, config) {

			var rows = config.height || 1,
				cols = config.width || 1,
				rowsParam = '[' + this._rowsParameterName + '=' + rows + ']',
				colsParam = '[' + this._colsParameterName + '=' + cols + ']',
				nodeDefinition = 'div.' + this.hiddenClass + rowsParam + colsParam;

			this._nodes[key] = put(this.centerNode, nodeDefinition);
		},

		_removeWidgetNode: function(key) {

			var widgetNode = this._nodes[key];

			this._removeWidgetInteractivity(key);
			widgetNode && put('!', widgetNode);
		},

		_showWidget: function(key, omitReload) {

			var instance = this._getWidgetInstance(key),
				node = this._nodes[key];

			if (!instance || !node) {
				console.error('Tried to show non-existent widget "%s" or node was missing', key);
				return;
			}

			var dfd = new Deferred();

			this._once(instance.getChannel("SHOWN"), lang.hitch(this, function(args) {

				put(args.node, "!" + this.hiddenClass);
				this._addWidgetInteractivity(args.key);
				args.dfd.resolve();
				if (!args.omitReload) {
					this._reloadInteractive();
				}
			}, {
				key: key,
				node: node,
				dfd: dfd,
				omitReload: omitReload
			}));

			this._publish(instance.getChannel("SHOW"), {
				node: node
			});

			return dfd;
		},

		_hideWidget: function(key, omitReload) {

			var instance = this._getWidgetInstance(key),
				node = this._nodes[key];

			if (!instance || !node) {
				console.error('Tried to hide non-existent widget "%s" or node was missing', key);
				return;
			}

			this._once(instance.getChannel("HIDDEN"), lang.hitch(this, function(args) {

				put(args.node, "." + this.hiddenClass);
				this._removeWidgetInteractivity(args.key);
				if (!args.omitReload) {
					this._reloadInteractive();
				}
			}, {
				key: key,
				node: node,
				omitReload: omitReload
			}));

			this._publish(instance.getChannel("HIDE"), {
				node: node
			});
		},

		_connectWidget: function(key) {

			var instance = this._getWidgetInstance(key);

			if (!instance) {
				console.error('Tried to connect non-existent widget "%s"', key);
				return;
			}

			this._publish(instance.getChannel("CONNECT"));
		},

		_disconnectWidget: function(key) {

			var instance = this._getWidgetInstance(key);

			if (!instance) {
				console.error('Tried to disconnect non-existent widget "%s"', key);
				return;
			}

			this._publish(instance.getChannel("DISCONNECT"));
		},

		_destroyWidget: function(key) {

			var instance = this._getWidgetInstance(key);

			if (!instance) {
				console.error('Tried to destroy non-existent widget "%s"', key);
				return;
			}

			this._removeWidgetNode(key);
			this._publish(instance.getChannel('DESTROY'));
			delete this._widgets[key];
		},

		_addWidgetInteractivity: function(key) {

			if (this._nodesHandlers[key]) {
				return;
			}

			var widgetNode = this._nodes[key];
			if (widgetNode) {
				this._nodesHandlers[key] = this._addNodeInteractivity(widgetNode);
			}
		},

		_addNodeInteractivity: function(node) {

			this.packery.addItems(node);

			var widthStep = this.centerNode.offsetWidth * (1 / 6),
				draggie = new draggabilly(node, {
					handle: ".windowTitle",
					grid: [ widthStep, 100 ]
				});

			draggie.on("dragEnd", lang.hitch(this, this._updateInteractive));

			this.packery.bindDraggabillyEvents(draggie);

			return draggie;
		},

		_removeWidgetInteractivity: function(key) {

			delete this._nodesHandlers[key];
		},

		_subModuleResized: function() {

			this._updateInteractive();
		},

		_updateInteractive: function() {

			clearTimeout(this._updateInteractiveTimeoutHandler);
			this._updateInteractiveTimeoutHandler = setTimeout(lang.hitch(this.packery, this.packery.layout),
				this._updateInteractiveTimeout);
		},

		_onLayoutComplete: function(laidOutItems) {

			var totalHeight = this.centerNode.scrollHeight,
				totalWidth = this.centerNode.scrollWidth,
				sizeHasChanged = this._oldTotalHeight !== totalHeight || this._oldTotalWidth !== totalWidth;

			this._oldTotalWidth = totalWidth;
			this._oldTotalHeight = totalHeight;

			if (sizeHasChanged) {
				this._emitEvt("RESIZE");
			}

			//this._emitEvt("LOADED");
		},

		_reportClicked: function() {
			// TODO: eso es para casos concretos, debería separarse

			// TODO abstraer para hacerlo implícitamente
			if (Credentials.userIsGuest()) {
				GuestChecker.protectFromGuests();
				return;
			}

			this._publish(this._buildChannel(this.taskChannel, this.actions.GET_REPORT), {
				target: this.selectionTarget ? this.selectionTarget : this.target,
				serviceTag: this.reportService,
				format: "pdf",
				id: parseInt(this.pathVariableId, 10)
			});
		}
	});
});
