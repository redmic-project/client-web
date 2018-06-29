define([
	"dijit/layout/BorderContainer"
	, "dijit/layout/ContentPane"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/components/Keypad/TrizoneKeypadImpl"
	, "redmic/modules/form/_BaseCreateKeypad"
], function(
	BorderContainer
	, ContentPane
	, declare
	, lang
	, aspect
	, TrizoneKeypadImpl
	, _BaseCreateKeypad
){
	return declare(_BaseCreateKeypad, {
		//	summary:
		//		Extensión del módulo Form para que adjunte un Keypad.
		//	description:
		//		Permite añadir botones para controlar al formulario y para publicar cambios.

		constructor: function(args) {

			this.config = {
				buttons: {
					cancel: {
						zone: "right",
						props: {
							"class": "danger",
							label: this.i18n.cancel
						}
					},
					reset: {
						noActive: true,
						zone: "left",
						props: {
							"class": "primary",
							label: this.i18n.reset
						}
					},
					clear: {
						zone: "left",
						props: {
							"class": "warning",
							label: this.i18n.clear
						}
					},
					submit: {
						zone: "right",
						props: {
							"class": "success",
							label: this.i18n.submit
						}
					}
				}
			};

			aspect.before(this, "_initialize", lang.hitch(this, this._initializeCreateKeypad));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineCreateKeypadSubscriptions));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineCreateKeypadPublications));
			aspect.after(this, "postCreate", lang.hitch(this, this._postCreateCreateKeypad));
			aspect.before(this, "_getNodeToShow", lang.hitch(this, this._getNodeToShowCreateKeypadBefore));
			aspect.after(this, "_getNodeToShow", lang.hitch(this, this._getNodeToShowCreateKeypadAfter));

			lang.mixin(this, this.config, args);
		},

		_initializeCreateKeypad: function() {

			this.buttons = this._merge([this.buttons, this.buttonsConfig || {}]);

			this.keypad = new TrizoneKeypadImpl({
				parentChannel: this.getChannel(),
				items: this.buttons
			});
		},

		_defineCreateKeypadSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.keypad.getChannel("KEYPAD_INPUT"),
				callback: "_subKeypadInput"
			});

			this._deleteDuplicatedChannels(this.publicationsConfig);
		},

		_defineCreateKeypadPublications: function () {

			this.publicationsConfig.push({
				event: 'ENABLE_BUTTON',
				channel: this.keypad.getChannel("ENABLE_BUTTON"),
				callback: "_pubEnableOrDisableButton"
			},{
				event: 'DISABLE_BUTTON',
				channel: this.keypad.getChannel("DISABLE_BUTTON"),
				callback: "_pubEnableOrDisableButton"
			});

			this._deleteDuplicatedChannels(this.publicationsConfig);
		},

		_postCreateCreateKeypad: function() {

			this._placeKeypad();
		},

		_placeKeypad: function() {

			this.formAndKeypadContainer = new BorderContainer({
				'class': this['class']
			});

			this.keypadNode = new ContentPane({
				region: "bottom"
			});

			this.formAndKeypadContainer.addChild(this.keypadNode);
		},

		_getNodeToShowCreateKeypadBefore: function() {

			this.form && this.formAndKeypadContainer.removeChild(this.form);
		},

		_getNodeToShowCreateKeypadAfter: function() {

			this.formAndKeypadContainer.addChild(this.form);

			this._publish(this.keypad.getChannel("SHOW"), {
				node: this.keypadNode.domNode
			});

			return this.formAndKeypadContainer.domNode;
		},

		_subKeypadInput: function(req) {

			if (req.inputKey === "submit") {
				this._submit();
			}

			else if (req.inputKey === "cancel") {
				this._cancel();
			}

			else if (req.inputKey === "clear") {
				this._clear();
			}

			else if (req.inputKey === "reset") {
				this._reset();
			}
		},

		_pubEnableOrDisableButton: function(channel, buttonKey) {

			this._publish(channel, {
				key: buttonKey
			});
		}
	});
});
