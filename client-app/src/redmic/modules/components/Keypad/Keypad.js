define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "redmic/modules/base/_Module"
	, "redmic/modules/base/_Show"
	, "./_KeypadItfc"
], function(
	declare
	, lang
	, _Module
	, _Show
	, _KeypadItfc
){
	return declare([_Module, _KeypadItfc, _Show], {
		//	summary:
		//		Botonera genérica.
		//	description:
		//		Agrupa un conjunto de botones y publica las acciones que tienen lugar.

		//	config: Object
		//		Opciones por defecto.


		constructor: function(args) {

			this.config = {
				events: {
					KEYPAD_INPUT: "keypadInput"
				},
				actions: {
					KEYPAD_INPUT: "keypadInput",
					ENABLE_BUTTON: "enableButton",
					DISABLE_BUTTON: "disableButton",
					SHOW_BUTTON: "showButton",
					HIDE_BUTTON: "hideButton",
					SELECT_BUTTON: "selectButton",
					DESELECT_BUTTON: "deselectButton",
					SET_BUTTONS_PROPS: "setButtonsProps"
				},
				ownChannel: "keypad"
			};

			lang.mixin(this, this.config, args);
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("ENABLE_BUTTON"),
				callback: "_subEnableButton"
			},{
				channel : this.getChannel("DISABLE_BUTTON"),
				callback: "_subDisableButton"
			},{
				channel : this.getChannel("SHOW_BUTTON"),
				callback: "_subShowButton"
			},{
				channel : this.getChannel("HIDE_BUTTON"),
				callback: "_subHideButton"
			},{
				channel : this.getChannel("SELECT_BUTTON"),
				callback: "_subSelectButton"
			},{
				channel : this.getChannel("DESELECT_BUTTON"),
				callback: "_subDeselectButton"
			},{
				channel : this.getChannel("SET_BUTTONS_PROPS"),
				callback: "_subSetButtonsProps"
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'KEYPAD_INPUT',
				channel: this.getChannel("KEYPAD_INPUT")
			});
		},

		_subEnableButton: function(req) {

			this._enableButton(req.key);
		},

		_subDisableButton: function(req) {

			this._disableButton(req.key);
		},

		_subShowButton: function(req) {

			this._showButton(req.key);
		},

		_subHideButton: function(req) {

			this._hideButton(req.key);
		},

		_subSelectButton: function(req) {

			this._selectButton(req.key);
		},

		_subDeselectButton: function(req) {

			this._deselectButton(req.key);
		},

		_subSetButtonsProps: function(req) {

			for (var key in req) {
				this._setButtonProps(key, req[key]);
			}
		}
	});
});
