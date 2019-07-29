define([
	"dijit/layout/ContentPane"
	, "dijit/layout/TabContainer"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Show"
], function(
	ContentPane
	, TabContainer
	, declare
	, lang
	, _Module
	, _Show
){
	return declare([_Module, _Show], {
		//	summary:
		//		Visualizador de contenido por pestañas.

		constructor: function(args) {

			this.config = {
				ownChannel: "tabsDisplayer",
				childTabs: [],
				childInstances: []
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			this._container = new TabContainer({
				'class': "softSolidContainer borderRadiusBottomTabContainer"
			});

			for (var i = 0; i < this.childTabs.length; i++) {
				var childTabConfig = this.childTabs[i],
					title = childTabConfig.title,
					instance = this._createChildInstance(childTabConfig);

				this.childInstances.push(instance);
				this._createTab(title, instance);
			}
		},

		_setOwnCallbacksForEvents: function() {

			this._onEvt('RESIZE', lang.hitch(this, this._onMeOrAncestorResized));
		},

		postCreate: function() {

			this._container.startup();
		},

		_createChildInstance: function(childTabConfig) {

			var type = childTabConfig.type,
				props = childTabConfig.props;

			props.parentChannel = this.getChannel();

			return new type(props);
		},

		_createTab: function(title, instance) {

			var node = new ContentPane({
				title: title,
				region: "center"
			});

			this._container.addChild(node);

			this._publish(instance.getChannel("SHOW"), {
				node: node
			});
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
