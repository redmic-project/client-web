define([
	"app/designs/base/_Controller"
	, "app/designs/list/Controller"
	, "app/designs/list/layout/Layout"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Store"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Show"
	, "redmic/modules/browser/bars/Total"
	, "app/base/views/extensions/_LocalSelectionView"
], function (
	_Controller
	, Controller
	, Layout
	, declare
	, lang
	, _Store
	, _Module
	, _Show
	, Total
	, _LocalSelectionView
){
	return declare([_Module, _Controller, _Show, _LocalSelectionView, _Store], {
		//	summary:
		//		Controlador para vistas.

		constructor: function(args) {

			this.config = {
				controllerEvents: {
					ADDITEM: "addItem"
				}
			};

			lang.mixin(this, this.config, args);
		},

		_setControllerConfigurations: function() {

			this.browserConfig = this._merge([{
				parentChannel: this.getChannel(),
				idProperty: this.idProperty,
				browserConfig: {
					bars: [{
						instance: Total
					}]
				}
			}, this.browserConfig || {}], {
				arrayMergingStrategy: 'concatenate'
			});

			this.browserLeftConfig = this._merge([this.browserConfig, {
				title: this.title,
				browserConfig: {
					noDataMessage: null
				}
			}, this.browserLeftConfig || {}]);

			this.browserLeftTarget = this.browserLeftConfig.browserConfig.target;

			this.browserRightConfig = this._merge([this.browserConfig, {
				title: this.title2,
				browserConfig: {
					noDataMessage: null
				}
			}, this.browserRightConfig || {}]);

			this.browserRightTarget = this.browserRightConfig.browserConfig.target;
		},

		_initializeController: function() {

			this.browserLeft = new declare([Layout, Controller])(this.browserLeftConfig);

			this.browserRight = new declare([Layout, Controller])(this.browserRightConfig);
		},

		_defineControllerSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.browserLeft.getChildChannel("browser", "BUTTON_EVENT"),
				callback: "_subListBtnEvent"
			},{
				channel : this.browserRight.getChildChannel("browser", "BUTTON_EVENT"),
				callback: "_subListBtnEvent"
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._publish(this.browserLeft.getChannel("SHOW"), {
				node: this.leftNode
			});

			this._publish(this.browserLeft.getChildChannel("browser", "CLEAR"));

			this._publish(this.browserRight.getChannel("SHOW"), {
				node: this.rightNode
			});

			this._publish(this.browserRight.getChildChannel("browser", "CLEAR"));
		},

		_subListBtnEvent: function(evt) {

			var callback = "_" + evt.btnId + "Callback";
			this[callback] && this[callback](evt);
		},

		_updateCompletedStatus: function() {

			this._isCompleted = !!this._totalSelected;
			this._emitEvt('REFRESH_STATUS');
		}
	});
});
