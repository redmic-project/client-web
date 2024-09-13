define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, 'put-selector/put'
	, "src/component/components/Keypad/TrizoneKeypadImpl"
	, "src/component/form/_BaseCreateKeypad"
], function(
	declare
	, lang
	, aspect
	, put
	, TrizoneKeypadImpl
	, _BaseCreateKeypad
) {

	return declare(_BaseCreateKeypad, {
		//	summary:
		//		Extensión del módulo Form para que adjunte un Keypad.
		//	description:
		//		Permite añadir botones para controlar al formulario y para publicar cambios.

		constructor: function(args) {

			this.config = {
				containerClass: 'formContainerWithKeypad',
				buttons: {
					cancel: {
						zone: 'left',
						props: {
							'class': 'danger',
							iconClass: 'fa fa-close',
							label: this.i18n.cancel,
							showLabel: false
						}
					},
					reset: {
						zone: 'right',
						props: {
							'class': 'primary',
							iconClass: 'fa fa-undo',
							label: this.i18n.reset,
							showLabel: false
						}
					},
					clear: {
						zone: 'left',
						props: {
							'class': 'warning',
							iconClass: 'fa fa-trash',
							label: this.i18n.clear,
							showLabel: false
						}
					},
					submit: {
						zone: 'right',
						props: {
							'class': 'success',
							iconClass: 'fa fa-save',
							label: this.i18n.submit,
							showLabel: false
						}
					}
				}
			};

			aspect.before(this, "_initialize", lang.hitch(this, this._initializeCreateKeypad));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineCreateKeypadSubscriptions));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineCreateKeypadPublications));
			aspect.after(this, "postCreate", lang.hitch(this, this._postCreateCreateKeypad));
			aspect.after(this, "getNodeToShow", lang.hitch(this, this._getNodeToShowCreateKeypadAfter));

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

			if (this.containerClass) {
				this.containerClass = this.containerClass.replace(/\ /g, '.');
			}

			this.formAndKeypadContainer = put('div.' + this.containerClass);
			this.keypadNode = put(this.formAndKeypadContainer, 'div');
		},

		_getNodeToShowCreateKeypadAfter: function() {

			put(this.formAndKeypadContainer, this.domNode);

			this._publish(this.keypad.getChannel("SHOW"), {
				node: this.keypadNode
			});

			return this.formAndKeypadContainer;
		},

		_subKeypadInput: function(req) {

			if (req.inputKey === "submit") {
				this._submit();
			} else if (req.inputKey === "cancel") {
				this._cancel();
			} else if (req.inputKey === "clear") {
				this._clear();
			} else if (req.inputKey === "reset") {
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
