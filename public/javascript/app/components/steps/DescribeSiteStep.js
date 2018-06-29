define([
	"app/base/views/extensions/_AddSelectionHandlerKeypad"
	, "app/components/steps/_MainData"
	, "app/components/viewCustomization/describeSite/views/_AdditionalKeyGetter"
	, "app/components/viewCustomization/describeSite/views/SelectStationByActivity"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_ShowInPopup"
	, "redmic/modules/base/_Store"
	, "redmic/modules/components/Keypad/TrizoneKeypadImpl"
	, "redmic/modules/form/FormContainerImpl"
	, "RWidgets/Utilities"
	, "put-selector/put"
], function (
	_AddSelectionHandlerKeypad
	, _MainData
	, _AdditionalKeyGetter
	, SelectStationByActivity
	, redmicConfig
	, declare
	, lang
	, _ShowInPopup
	, _Store
	, TrizoneKeypadImpl
	, FormContainerImpl
	, Utilities
	, put
){
	return declare([_MainData, _Store], {
		//	summary:
		//		Step de describeSite

		constructor: function (args) {

			this.config = {
				label: this.i18n.info,
				copy: SelectStationByActivity,

				ownChannel: "describeSite"
			};

			lang.mixin(this, this.config, args);

			this.replaceTarget = this._getTarget();
		},

		_initialize: function() {

			this.containerTopNode = put(this.containerNode, 'div');
			this.containerFormNode = put(this.containerNode, 'div');

			this.keypad = new TrizoneKeypadImpl({
				parentChannel: this.getChannel(),
				'class': 'backgroundNone',
				items: {
					copy: {
						zone: "right",
						props: {
							"class": "primary",
							label: this.i18n.copy
						}
					}
				}
			});

			this.formConfig = this._merge([{
				storeChannel: this.getChannel(),
				target: this._getTarget(),
				modelChannel: this.modelChannel,
				template: "components/viewCustomization/describeSite/views/templates/DescribeSite"
			}, this.formConfig || {}]);

			this._createForm(this.formConfig);

			this.inherited(arguments);

			this._deleteContentDialog();
			this._createContentDialog();

			if (this._dataToForm) {
				this._emitEvt('SET_DATA', {
					data: this._dataToForm
				});
			}
		},

		_defineSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.keypad.getChannel("KEYPAD_INPUT"),
				callback: "_subKeypadInput"
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._emitEvt("SHOW_FORM", {
				node: this._getNodeForm()
			});
		},

		_subKeypadInput: function(req) {

			if (req.inputKey === "copy") {
				this._copy();
			}
		},

		_deleteContentDialog: function() {

			if (!this.popupView) {
				return;
			}

			this._removeSubscription(this._popupViewSubscription);

			delete this.popupView;
		},

		_createContentDialog: function() {

			if (!this.copyConfig) {
				return;
			}

			this._publish(this.keypad.getChannel("SHOW"), {
				node: this.containerTopNode
			});

			var config = this._merge([{
				parentChannel: this.getChannel(),
				title: this.i18n.selectStation,
				width: 6,
				height: "md",
				keypadConfig: {
					items: {
						confirm: {
							props: {
								label: this.i18n.copy
							}
						}
					}
				}
			}, this.copyConfig || {}]);

			this.popupView = new declare([this.copy, _AddSelectionHandlerKeypad,
				_AdditionalKeyGetter]).extend(_ShowInPopup)(config);

			this._popupViewSubscription = this._setSubscription({
				channel: this.popupView.getChannel("SELECTED_CONFIRM"),
				callback: "_subSelectedConfirm"
			});
		},

		_subSelectedConfirm: function(res) {

			this._copyActive = true;

			this._newIdStation = res.id;

			this._publish(this.getChannel('UPDATE_TARGET'), {
				target: lang.replace(this.replaceTarget, res),
				refresh: true
			});
		},

		_updateTarget: function(obj) {

			this._emitEvt('GET', {
				target: this._getTarget(),
				requesterId: this.getOwnChannel(),
				id: this._newIdStation
			});
		},

		_itemAvailable: function(response) {

			var item = response.data;

			if (item) {

				item.properties.measurements = [];

				this._publish(this.form.getChannel("SET_DATA"), {
					data: item
				});
			}
		},

		_copy: function() {

			this.popupView && this._publish(this.popupView.getChannel("SHOW"));
		},

		_getNextStepId: function(currentStep, stepResults) {

			if (!this._copyActive) {
				return this.inherited(arguments);
			}

			return 2;
		},

		_createFormDefinition: function() {

			return FormContainerImpl;
		},

		_getNodeForm: function() {

			return this.containerFormNode;
		}
	});
});
