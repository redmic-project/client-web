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
	, "redmic/modules/base/_Store"
	, "redmic/modules/base/_Window"
	, "./_ControllerItfc"
], function (
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
	, _ControllerItfc
){
	return declare([_ControllerItfc, _Controller, _Store], {
		//	summary:
		//		Controller para vistas de detalle, que dividen la información a mostrar en cajitas independientes.
		//		El usuario puede interactuar con ellas para adaptar la representación a su gusto.

		constructor: function(args) {

			this.config = {
				controllerEvents: {
					LAYOUT_COMPLETE: "layoutComplete",
					BUTTON_EVENT: "btnEvent"
				},
				controllerActions: {
					GET_REPORT: "getReport"
				},

				idProperty: "id",
				hiddenClass: "hidden",

				_rowsParameterName: "data-rows",
				_colsParameterName: "data-cols",
				_updateInteractiveTimeout: 100,

				_widgets: {},
				_widgetsShowWindows: {},
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

				if (this.target instanceof Array && this.target[0] !== args[0].target) {
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
			this._onEvt('RESIZE', lang.hitch(this, this._onControllerResize));
			this._onEvt('LAYOUT_COMPLETE', lang.hitch(this, this._onLayoutComplete));
			this._onEvt('BUTTON_EVENT', lang.hitch(this, this._onButtonEvent));
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

			return this._showWidget(key);
		},

		_onControllerResize: function() {

			this._getShown() && this._updateInteractive();
		},

		_onButtonEvent: function(evt) {
			// TODO: eso es para casos concretos, debería separarse

			var methodName = "_" + evt + "Clicked";
			this[methodName] && this[methodName](evt);
		},

		_onControllerShown: function() {

			if (this._getShown()) {
				this.packery.reloadItems();
				this._updateInteractive();
			}

			this._clearModules();
			this._refreshModules();
		},

		_checkPathVariableId: function() {
			// TODO: este método es más propio de vista que de diseño, el diseño puede usarse a nivel más bajo que una vista

			if (!this.pathVariableId) {
				this._goTo404();
			}
		},

		_onControllerMeOrAncestorShown: function(res) {

			this._updateInteractive();
		},

		_getModuleRootNode: function() {

			return this.containerNode;
		},

		_getModuleMainNode: function() {

			return this.centerNode;
		},

		_evaluateCondition: function(condition) {

			if (typeof condition === "function") {
				return condition(this.data);
			}

			return condition && !!this.data[condition];
		},

		_getWidgetInstance: function(key) {

			return this._widgets[key];
		},

		_createWidget: function(key, config) {

			if (this._getWidgetInstance(key)) {
				return;
			}

			var moduleProps = this._merge([this.propsWidget || {}, config.props || {}]);
			moduleProps.ownChannel = key;
			moduleProps.parentChannel = this.getChannel();

			var moduleType = config.type,
				moduleDefinition = declare(moduleType).extend(_Window),
				moduleInstance = new moduleDefinition(moduleProps);

			this._widgets[key] = moduleInstance;
			this._listenModule(moduleInstance);
		},

		_listenModule: function(moduleInstance) {

			this._setSubscription({
				channel: moduleInstance.getChannel("RESIZED"),
				callback: "_subModuleResized"
			});
		},

		_createWidgetNode: function(key, config) {

			var rows = config.height || 1,
				cols = config.width || 1,
				showInitially = config.showInitially || false,
				nodeParams = '[' + this._rowsParameterName + '=' + rows + '][' + this._colsParameterName + '=' + cols +
					']',
				node = put('div' + nodeParams);

			if (!showInitially) {
				put(node, '.' + this.hiddenClass);
			}
			this._nodes[key] = node;

			put(this.centerNode, node);
		},

		_showWidget: function(key) {

			var instance = this._getWidgetInstance(key),
				node = this._nodes[key];

			if (!instance || !node) {
				return;
			}

			var dfd = new Deferred();

			this._once(instance.getChannel("SHOWN"), lang.hitch(this, function(args) {

				put(args.node, "!" + this.hiddenClass);
				this._addWidgetInteractivity(args.key);
				args.dfd.resolve();
			}, {
				key: key,
				node: node,
				dfd: dfd
			}));

			this._publish(instance.getChannel("SHOW"), {
				node: node
			});

			return dfd;
		},

		_hideWidget: function(key) {

			var instance = this._getWidgetInstance(key),
				node = this._nodes[key];

			if (!instance || !node) {
				return;
			}

			this._once(instance.getChannel("HIDDEN"), lang.hitch(this, function(node) {

				put(node, "." + this.hiddenClass);
			}, node));

			this._publish(instance.getChannel("HIDE"), {
				node: node
			});
		},

		_connectWidget: function(key) {

			var instance = this._getWidgetInstance(key);

			this._publish(instance.getChannel("CONNECT"));
		},

		_disconnectWidget: function(key) {

			var instance = this._getWidgetInstance(key);

			this._publish(instance.getChannel("DISCONNECT"));
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

			var widthStep = this.centerNode.offsetWidth * (1 / 6),// - 2.555,
				draggie = new draggabilly(node, {
					handle: ".windowTitle",
					grid: [ widthStep, 100 ]
				});

			draggie.on("dragEnd", lang.hitch(this, this._updateInteractive));

			this.packery.bindDraggabillyEvents(draggie);

			return draggie;
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

			if (sizeHasChanged) {
				this._emitEvt("RESIZE");
			}

			this._oldTotalWidth = totalWidth;
			this._oldTotalHeight = totalHeight;

			this._emitEvt("LOADED");
		},

		_reportClicked: function() {
			// TODO: eso es para casos concretos, debería separarse

			this._publish(this._buildChannel(this.taskChannel, this.actions.GET_REPORT), {
				target: this.selectionTarget ? this.selectionTarget : this.target,
				serviceTag: this.reportService,
				format: "pdf",
				id: parseInt(this.pathVariableId, 10)
			});
		}
	});
});
