define([
	"app/designs/base/_Controller"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/components/Sidebar/Sidebar"
], function (
	_Controller
	, declare
	, lang
	, Sidebar
){
	return declare(_Controller, {
		//	summary:
		//		Controlador para vistas.

		constructor: function(args) {

			this.config = {
				"class": "sidebarAndContent",
				ownChannel: "sidebarAndContent"
			};

			lang.mixin(this, this.config, args);
		},

		_setControllerConfigurations: function() {

			this.sidebarConfig = this._merge([{
				parentChannel: this.getChannel()
			}, this.sidebarConfig || {}]);
		},

		_initializeController: function() {

			this.sidebar = new Sidebar(this.sidebarConfig);
		},

		_defineControllerSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.sidebar.getChannel("ITEM_CLICKED"),
				callback: "_subItemClickedInSidebar"
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._publish(this.sidebar.getChannel("SHOW"), {
				node: this.sidebarNode
			});

			this.labelActiveDefault && this._itemLabelInSidebar(this.labelActiveDefault);
		},

		_subItemClickedInSidebar: function(res) {

			this._itemLabelInSidebar(res.label);
		},

		_getNodeToShow: function() {

			return this.domNode;
		},

		_itemLabelInSidebar: function(label) {

			var callback = '_' + label + 'Callback';

			if (this[callback])
				this._changeInstanceShown(this[callback]());
		},

		_changeInstanceShown: function(obj) {

			var instance = obj.instance,
				data = obj.data;

			if (!instance)
				return;

			if (this._lastContentInstance)
				this._publish(this._lastContentInstance.instance.getChannel("HIDE"));

			this._lastContentInstance = obj;

			var objToShow = {
				node: this.centerNode
			};

			if (data)
				objToShow.data = data;

			this._publish(instance.getChannel("SHOW"), objToShow);
		}
	});
});