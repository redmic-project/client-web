define([
	"dijit/layout/LayoutContainer"
	, "dijit/layout/ContentPane"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "src/component/components/Keypad/TrizoneKeypadImpl"
], function(
	LayoutContainer
	, ContentPane
	, declare
	, lang
	, aspect
	, TrizoneKeypadImpl
){
	return declare(null, {
		//	summary:
		//
		//	description:
		//

		constructor: function(args) {

			this.config = {

				eventsAddConfirmSelectionButton: {
					SELECT_CONFIRM: 'selectConfirm'
				},

				actionsAddConfirmSelectionButton: {
					SELECTED_CONFIRM: 'selectedConfirm'
				}
			};

			lang.mixin(this, this.config);

			aspect.after(this, "_mixEventsAndActions", lang.hitch(this, this._mixAddConfirmSelectionButtonEventsAndActions));
			aspect.after(this, "_setConfigurations", lang.hitch(this, this._setAddConfirmSelectionButtonConfigurations));
			aspect.after(this, "_beforeInitialize", lang.hitch(this, this._initializeAddConfirmSelectionButton));
			aspect.after(this, "_definePublications",
				lang.hitch(this, this._defineAddConfirmSelectionButtonPublications));
			aspect.after(this, "_defineSubscriptions",
				lang.hitch(this, this._defineAddConfirmSelectionButtonSubscriptions));
		},

		_setAddConfirmSelectionButtonConfigurations: function() {

			this.keypadConfig = this._merge([{
				parentChannel: this.getChannel(),
				items: {
					cancel: {
						zone: "right",
						props: {
							"class": "danger",
							label: this.i18n.cancel
						}
					},
					confirm: {
						zone: "right",
						props: {
							"class": "success",
							label: this.i18n.confirm
						}
					}
				}
			}, this.keypadConfig || {}]);
		},

		_initializeAddConfirmSelectionButton: function() {

			this.keypad = new TrizoneKeypadImpl(this.keypadConfig);
		},

		_mixAddConfirmSelectionButtonEventsAndActions: function () {

			lang.mixin(this.events, this.eventsAddConfirmSelectionButton);
			lang.mixin(this.actions, this.actionsAddConfirmSelectionButton);

			delete this.actionsAddConfirmSelectionButton;
			delete this.eventsAddConfirmSelectionButton;
		},

		_defineAddConfirmSelectionButtonPublications: function() {

			this.publicationsConfig.push({
				event: 'SELECT_CONFIRM',
				channel: this.getChannel("SELECTED_CONFIRM")
			});
		},

		_defineAddConfirmSelectionButtonSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.keypad.getChannel("KEYPAD_INPUT"),
				callback: "_subKeypadInput"
			});
		},

		postCreate: function() {

			var border = new LayoutContainer();

			this.buttonContentPane = new ContentPane({
				region: "bottom"
			});

			border.addChild(this);
			border.addChild(this.buttonContentPane);

			this.contentView = new ContentPane({

			});

			this.contentView.addChild(border);

			this._publish(this.keypad.getChannel("SHOW"), {
				node: this.buttonContentPane
			});

			this._publish(this.keypad.getChannel('DISABLE_BUTTON'), {
				key: "confirm"
			});

			this.inherited(arguments);
		},

		_subKeypadInput: function(req) {

			if (req.inputKey === "confirm") {
				this._confirm();
			} else if (req.inputKey === "cancel") {
				this._publish(this.getChannel("HIDE"));
			}
		},

		_confirm: function() {

			this._publish(this.getChannel("HIDE"));

			var obj = this._getAdditionalKeys ? this._getAdditionalKeys() : {};

			obj[this.idProperty] = this._itemSelected;

			this._emitEvt("SELECT_CONFIRM", obj);
		},

		_getNodeToShow: function() {

			return this.contentView.domNode;
		},

		_localSelected: function(item) {

			this._publish(this.keypad.getChannel('ENABLE_BUTTON'), {
				key: "confirm"
			});

			if (item.ids instanceof Array) {
				this._itemSelected = item.ids[0];
			} else {
				this._itemSelected = item.ids;
			}

			this.inherited(arguments);
		},

		_localDeselected: function(obj) {

			this._publish(this.keypad.getChannel('DISABLE_BUTTON'), {
				key: "confirm"
			});

			this._itemSelected = null;

			this.inherited(arguments);
		},

		_localSelectionCleared: function(obj) {

			this._publish(this.keypad.getChannel('DISABLE_BUTTON'), {
				key: "confirm"
			});

			this._itemSelected = null;

			this.inherited(arguments);
		}
	});
});
