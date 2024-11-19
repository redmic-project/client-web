define([
	'dijit/layout/ContentPane'
	, 'dijit/layout/TabContainer'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/query'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
], function(
	ContentPane
	, TabContainer
	, declare
	, lang
	, query
	, _Module
	, _Show
) {

	return declare([_Module, _Show], {
		//	summary:
		//		Visualizador de contenido por pestañas. Recibe publicaciones de módulos que desean mostrarse como una
		//		nueva pestaña.

		constructor: function(args) {

			this.config = {
				ownChannel: 'tabsDisplayer',
				actions: {
					'ADD_TAB': 'addTab',
					'SHOW_TAB': 'showTab'
				},

				_tabContainerClass: 'fWidth fHeight softSolidContainer borderRadiusBottomTabContainer',
				_tabHandlerQueryDefinition: 'div.dijitTabInner.dijitTabContent.dijitTab',
				_tabNodesByChannel: {}
			};

			lang.mixin(this, this.config, args);
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.getChannel('ADD_TAB'),
				callback: '_subAddTab'
			},{
				channel : this.getChannel('SHOW_TAB'),
				callback: '_subShowTab'
			});
		},

		_initialize: function() {

			this._container = new TabContainer({
				'class': this._tabContainerClass
			});

			this._observeTabs();
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('RESIZE', lang.hitch(this, this._onMeOrAncestorResized));
			this._onEvt('ME_OR_ANCESTOR_SHOWN', lang.hitch(this, this._onMeOrAncestorShown));
		},

		postCreate: function() {

			this._container.startup();
		},

		_observeTabs: function() {

			var childTabsContainer = this._container.domNode.lastElementChild,
				mutationObserver = new MutationObserver(lang.hitch(this, this._onTabContainerMutation));

			mutationObserver.observe(childTabsContainer, { childList: true });
		},

		_onTabContainerMutation: function(_mutations, observer) {

			observer.disconnect();
			this._resizeTabs();
		},

		_subAddTab: function(req) {

			var childContainer = this._getTabNode(req),
				childChannel = req.channel,
				childShowChannel = this._buildChannel(childChannel, this.actions.SHOW);

			this._publish(childShowChannel, {
				node: childContainer
			});

			this._tabNodesByChannel[childChannel] = childContainer;
		},

		_getTabNode: function(req) {

			var props = this._getTabProps(req),
				node = new ContentPane(props);

			this._container.addChild(node);

			this._customizeTab(props);

			return node;
		},

		_getTabProps: function(req) {

			var props = {
				region: 'center'
			};

			props.title = req.title;
			props.iconClass = req.iconClass;
			props.tooltip = req.tooltip || props.title;
			props.showTitle = req.showTitle || !props.iconClass;

			return props;
		},

		_customizeTab: function(props) {

			if (props.iconClass) {
				this._addTooltipToIcon(props.tooltip);
			}
		},

		_addTooltipToIcon: function(tooltipValue) {

			var tabHandlers = query(this._tabHandlerQueryDefinition, this._container.domNode);

			tabHandlers.forEach(lang.hitch(this, function(tabTooltip, tabHandler) {

				var tabHandlerIcon = tabHandler.firstElementChild,
					tabHandlerTitle = tabHandlerIcon.nextElementSibling;

				if (tabHandlerTitle.title === tabTooltip) {
					tabHandlerIcon.title = tabTooltip;
				}
			}, tooltipValue));
		},

		_subShowTab: function(req) {

			var childChannel = req.channel,
				tabNode = this._tabNodesByChannel[childChannel];

			if (!tabNode) {
				console.error('Tab with channel "%s" not found at module "%s"', childChannel, this.getChannel());
				return;
			}

			this._container.selectChild(tabNode);
		},

		_onMeOrAncestorResized: function(req) {

			this._resizeTabs();
		},

		_onMeOrAncestorShown: function(req) {

			this._resizeTabs();
		},

		_afterShow: function() {

			this._resizeTabs();
		},

		_resizeTabs: function() {

			this._container.resize();
		},

		getNodeToShow: function() {

			return this._container.domNode;
		}
	});
});
