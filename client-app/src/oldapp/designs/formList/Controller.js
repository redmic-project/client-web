define([
	"app/base/views/extensions/_AddForm"
	, "app/designs/base/_Controller"
	, "app/designs/formList/_ControllerItfc"
	, "app/designs/list/Controller"
	, "app/designs/list/layout/Layout"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "src/component/base/_Show"
	, "src/component/base/_Store"
], function (
	_AddForm
	, _Controller
	, _ControllerItfc
	, ListController
	, ListLayout
	, declare
	, lang
	, _Show
	, _Store
){
	return declare([_AddForm, _Controller, _ControllerItfc, _Show, _Store], {
		//	summary:
		//		Controlador para las vistas que usen el layout Form_List.

		constructor: function (args) {

			this.config = {
				_createFormInitial: true,
				target: "formList"
			};

			lang.mixin(this, this.config, args);

			if (!this.propToRead) {
				this.propToRead = this.propertyName;
			}
		},

		_setControllerConfigurations: function() {

			this.browserConfig = this._merge([{
				parentChannel: this.getChannel(),
				//idProperty: this.idProperty,
				title: this.title,
				browserConfig: {
					//idProperty: this.idProperty,
					target: this.getChannel(),
					noDataMessage: null
				}
			}, this.browserConfig || {}]);

			this.formConfig = this._merge([{
				modelConfig: {
					props: {
						serializeAdditionalProperties: true
					}
				}
			}, this.formConfig || {}]);
		},

		_initializeController: function() {

			this.browser = new declare([ListLayout, ListController])(this.browserConfig);

			this._createFormInitial && this._createForm();
		},

		_defineControllerSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.browser.getChildChannel("browser", "DATA_ADDED"),
				callback: "_subListDataAdded"
			},{
				channel : this.browser.getChildChannel("browser", "DATA_REMOVED"),
				callback: "_subListDataRemoved"
			},{
				channel : this.browser.getChildChannel("browser", "BUTTON_EVENT"),
				callback: "_subListBtnEvent"
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._publish(this.browser.getChannel("SHOW"), {
				node: this.centerRightNode
			});

			this._emitEvt("SHOW_FORM", {
				node: this.formNode
			});
		},

		_subListDataAdded: function(response) {

			this._listDataAdded(response);
		},

		_subListDataRemoved: function(response) {

			this._listDataRemoved(response);
		},

		_formStatus: function(response) {

			if (response.isValid) {
				this._emitEvt('ENABLE_BUTTON', {
					key: "submit"
				});
			} else {
				this._emitEvt('DISABLE_BUTTON', {
					key: "submit"
				});
			}
		},

		_subListBtnEvent: function(evt) {

			var callback = "_" + evt.btnId + "Callback";
			this[callback] && this[callback](evt);
		}
	});
});
