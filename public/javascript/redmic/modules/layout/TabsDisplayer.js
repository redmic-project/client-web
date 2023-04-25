define([
	'dijit/layout/ContentPane'
	, 'dijit/layout/TabContainer'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'redmic/modules/base/_Module'
	, 'redmic/modules/base/_Show'
], function(
	ContentPane
	, TabContainer
	, declare
	, lang
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
					'ADD_TAB': 'addTab'
				},

				_tabContainerClass: 'softSolidContainer borderRadiusBottomTabContainer'
			};

			lang.mixin(this, this.config, args);
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.getChannel("ADD_TAB"),
				callback: "_subAddTab"
			});
		},

		_initialize: function() {

			this._container = new TabContainer({
				'class': this._tabContainerClass
			});
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('RESIZE', lang.hitch(this, this._onMeOrAncestorResized));
		},

		postCreate: function() {

			this._container.startup();
		},

		_subAddTab: function(req) {

			var childContainer = this._getTabContainer(req.title),
				childShowChannel = this._buildChannel(req.channel, this.actions.SHOW);

			this._publish(childShowChannel, {
				node: childContainer
			});
		},

		_getTabContainer: function(title) {

			var node = new ContentPane({
				title: title,
				region: 'center'
			});

			this._container.addChild(node);

			return node;
		},

		_onMeOrAncestorResized: function(req) {

			this._resizeTabs();
		},

		_afterShow: function() {

			this._resizeTabs();
		},

		_resizeTabs: function() {

			this._container.resize();
		},

		_getNodeToShow: function() {

			return this._container.domNode;
		}
	});
});
