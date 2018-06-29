define([
	"app/base/views/_View"
	, "app/designs/base/_Controller"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, 'draggabilly/draggabilly.pkgd.min'
	, 'packery/packery.pkgd.min'
	, "put-selector/put"
	, "redmic/modules/base/_Store"
	, "redmic/modules/base/_Window"
	, "./_ControllerItfc"
], function (
	_View
	, _Controller
	, declare
	, lang
	, aspect
	, draggabilly
	, packery
	, put
	, _Store
	, _Window
	, _ControllerItfc
){
	return declare([_View, _ControllerItfc, _Controller, _Store], {
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
				noScroll: false,

				_relativeRowsClass: "data-percentage-rows",
				_fixedRowsClass: "data-rows",
				_updateInteractiveTimeout: 100,

				_widgets: {},
				_widgetsShowWindows: {},
				_nodes: {}
			};

			lang.mixin(this, this.config, args);
		},

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
			this._onEvt('RESIZE', lang.hitch(this, this._subParentResized));
			this._onEvt('LAYOUT_COMPLETE', lang.hitch(this, this._onLayoutComplete));
			this._onEvt('BUTTON_EVENT', lang.hitch(this, this._onButtonEvent));
		},

		_afterControllerShow: function() {

			if (!this._widgetsAlreadyGenerated) {
				this._generateWidgets();
				this._buildVisualization();
			}
		},

		_generateWidgets: function() {

			for (var key in this.widgetConfigs) {
				this._widgetsAlreadyGenerated = true;
				var config = this.widgetConfigs[key];
				this._createWidget(key, config);
			}
		},

		_buildVisualization: function() {

			this._windowContainersAlreadyShown = null;

			this._classRow = this.noScroll ? this._relativeRowsClass : this._fixedRowsClass;

			for (var key in this.widgetConfigs) {
				var config = this.widgetConfigs[key],
					noCreate = true;

				if (this._nodes[key]) {
					noCreate = false;
				}

				noCreate && this._createBox(key, config);

				noCreate && this._showWidget(key, config);

				noCreate && this._makeNodeInteractive(this._nodes[key]);
			}

			this._updateInteractive();
		},

		_subParentResized: function() {

			this._getShown() && this._updateInteractive();
		},

		_onButtonEvent: function(evt) {

			var methodName = "_" + evt + "Clicked";
			this[methodName] && this[methodName](evt);
		},

		_onControllerShown: function() {

			this._clearModules();
			this._refreshModules();
		},

		_checkPathVariableId: function() {

			if (!this.pathVariableId) {
				this._goTo404();
			}
		},

		_onControllerMeOrAncestorShown: function() {

			this._emitEvt("RESIZE");
			this._updateInteractive();
		},

		_getModuleRootNode: function() {

			return this.containerNode;
		},

		_getModuleMainNode: function() {

			return this.centerNode;
		},

		_insertIcon: function(config, node) {

			if (config.condition && this._evaluateCondition(config.condition)) {
				return;
			}

			var iconNode = put(node, (config.href ? 'a' : 'i') + ".iconList." + config.icon.split("-")[0] + "." + config.icon);

			if (config.title) {
				iconNode.setAttribute("title", config.title);
			}

			if (config.href) {
				iconNode.setAttribute('href', lang.replace(config.href, this.data));
				iconNode.setAttribute('d-state-url', true);
			}

			if (config.btnId) {
				iconNode.onclick = lang.hitch(this, this._emitEvt, 'BUTTON_EVENT', config.btnId);
			}
		},

		_evaluateCondition: function(condition) {

			if (typeof condition === "function") {
				return condition(this.data);
			}

			return condition && !!this.data[condition];
		},

		_createWidget: function(key, config) {

			if (this._widgets[key]) {
				return;
			}

			if (!config.props) {
				config.props = {};
			}

			config.props = this._merge([this.propsWidget || {}, config.props]);

			config.props.ownChannel = key;
			config.props.parentChannel = this.getChannel();

			var module = this._widgets[key] = new declare(config.type).extend(_Window)(config.props);

			this._listenModule(module);
		},

		_listenModule: function(module) {

			this._setSubscription({
				channel: module.getChannel("RESIZED"),
				callback: "_subModuleResized"
			});
		},

		_createBox: function(key, config) {

			var node = this._nodes[key] = put("div." + this.hiddenClass + "[" + this._classRow + "=" +
				config.height + "][data-cols=" + config.width + "]");

			put(this.centerNode, node);
		},

		_showWidget: function(key, config) {

			var module = this._widgets[key],
				node = this._nodes[key];

			this._publish(module.getChannel("SHOW"), {
				node: node
			});

			put(node, "!hidden");
		},

		_showWidgets: function() {

			for (var key in this._widgets) {
				this._showWidget(key);
			}
		},

		_connectAndShowWidgetAndWindow: function(key) {

			this._connectWidget(key);
			this._showWidget(key);
			this._showWindow(key);
		},

		_hideWidget: function(key) {

			var module = this._widgets[key],
				node = this._nodes[key];

			this._publish(module.getChannel("HIDE"), {
				node: node
			});

			put(node, ".hidden");
		},

		_hideWidgets: function() {

			for (var key in this._widgets) {
				this._hideWidget(key);
			}
		},

		_hideAndDisconnectWidget: function(key) {

			this._hideWidget(key);
			this._disconnectWidget(key);
		},

		_connectWidget: function(key) {

			var module = this._widgets[key];

			this._publish(module.getChannel("CONNECT"));
		},

		_disconnectWidget: function(key) {

			var module = this._widgets[key];

			this._publish(module.getChannel("DISCONNECT"));
		},

		_makeNodeInteractive: function(node) {

			put(node, '!' + this.hiddenClass);

			this.packery.addItems(node);

			var widthStep = this.centerNode.offsetWidth * (1 / 6) - 2.555,
				draggie = new draggabilly(node, {
					handle: ".windowTitle",
					grid: [ widthStep, 100 ]
				});

			draggie.on("dragStart", lang.hitch(this, function() {

				this._dragStart = true;
			}));

			draggie.on("dragEnd", lang.hitch(this, this._updateInteractive));

			this.packery.bindDraggabillyEvents(draggie);
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

			if (!this._windowContainersAlreadyShown) {
				this._showWindowContainers();
			}

			var totalHeight = this.centerNode.scrollHeight,
				totalWidth = this.centerNode.scrollWidth;

			if (this._dragStart || this._oldTotalHeight !== totalHeight || this._oldTotalWidth !== totalWidth) {
				this._dragStart = false;
				this._updateInteractive();
				this._emitEvt("RESIZE");
			}

			this._oldTotalWidth = totalWidth;
			this._oldTotalHeight = totalHeight;

			this._emitEvt("LOADED");
		},

		_showWindowContainers: function() {

			this._windowContainersAlreadyShown = true;

			for (var key in this._widgets) {
				if (!this._widgetsShowWindows[key]) {
					this._widgetsShowWindows[key] = true;
					this._showWindow(key);
				}
			}
		},

		_showWindow: function(key, config) {

			var module = this._widgets[key];

			this._publish(module.getChannel('SHOW_WINDOW'));
		},

		_reportClicked: function() {

			this._publish(this._buildChannel(this.taskChannel, this.actions.GET_REPORT), {
				target: this.selectionTarget ? this.selectionTarget : this.target,
				serviceTag: this.reportService,
				format: "pdf",
				id: parseInt(this.pathVariableId, 10)
			});
		}
	});
});
