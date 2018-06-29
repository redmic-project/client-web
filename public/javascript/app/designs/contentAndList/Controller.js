define([
	"app/designs/list/_AddFilter"
	, "app/designs/list/Controller"
	, "app/designs/list/layout/NoTitle"
	, "app/designs/base/_Controller"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Show"
], function (
	_AddFilter
	, Controller
	, Layout
	, _Controller
	, declare
	, lang
	, _Module
	, _Show
){
	return declare([_Module, _Controller, _Show], {
		//	summary:
		//		Controlador para vistas.

		constructor: function(args) {

			this.config = {
				region: "center"
			};

			lang.mixin(this, this.config, args);
		},

		_setControllerConfigurations: function() {

			this.browserConfig = this._merge([{
				parentChannel: this.getChannel(),
				target: this.target,
				idProperty: this.idProperty,
				noDataMessage: null
			}, this.browserConfig || {}]);

			this.browserTarget = this.browserConfig.browserConfig.target;
		},

		_initializeController: function() {

			this.browser = new declare([Layout, Controller, _AddFilter])(this.browserConfig);
		},

		_defineControllerSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.browser.getChildChannel("browser", "BUTTON_EVENT"),
				callback: "_subListBtnEvent"
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._publish(this.browser.getChannel("SHOW"), {
				node: this.centerNode.domNode
			});

			this._publish(this.browser.getChildChannel("browser", "CLEAR"));
		},

		_subListBtnEvent: function(evt) {

			var callback = "_" + evt.btnId + "Callback";
			this[callback] && this[callback](evt);
		},

		_getNodeToShow: function() {

			return this.containerNode;
		},

		_updateCompletedStatus: function() {

			this._isCompleted = !!this._totalSelected;
			this._emitEvt('REFRESH_STATUS');
		}
	});
});
