define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
], function(
	declare
	, lang
	, aspect
){
	return declare(null, {
		//	summary:
		//		Base de extensiones del módulo Form para adjuntar botoneras.

		constructor: function(args) {

			this.config = {
				baseCreateKeypadEvents: {
					ENABLE_BUTTON: "enableButton",
					DISABLE_BUTTON: "disableButton"
				},

				baseCreateKeypadActions: {
					ENABLE_BUTTON: "enableButton",
					DISABLE_BUTTON: "disableButton"
				}
			};

			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixBaseCreateKeypadEventsAndActions));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineBaseCreateKeypadSubscriptions));
			aspect.after(this, "_setOwnCallbacksForEvents",
				lang.hitch(this, this._setBaseCreateKeypadOwnCallbacksForEvents));

			lang.mixin(this, this.config, args);
		},

		_mixBaseCreateKeypadEventsAndActions: function () {

			lang.mixin(this.events, this.baseCreateKeypadEvents);
			lang.mixin(this.actions, this.baseCreateKeypadActions);
			delete this.baseCreateKeypadEvents;
			delete this.baseCreateKeypadActions;
		},

		_defineBaseCreateKeypadSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.getChannel("ENABLE_BUTTON"),
				callback: "_subEnableButton"
			},{
				channel : this.getChannel("DISABLE_BUTTON"),
				callback: "_subDisableButton"
			});

			this._deleteDuplicatedChannels(this.publicationsConfig);
		},

		_setBaseCreateKeypadOwnCallbacksForEvents: function() {

			this._onEvt('ENABLE_BUTTONS', lang.hitch(this, this._enableButtons));
			this._onEvt('DISABLE_BUTTONS', lang.hitch(this, this._disableButtons));
			this._onEvt('GOT_IS_VALID_STATUS', lang.hitch(this, this._refreshButtons));
		},

		_subEnableButton: function(req) {

			this._checkActiveButton(req.key) && this._emitEvt('ENABLE_BUTTON', req.key);
		},

		_checkActiveButton: function(key) {

			return !this.buttons[key].disable;
		},

		_subDisableButton: function(req) {

			this._checkActiveButton(req.key) && this._emitEvt('DISABLE_BUTTON', req.key);
		},

		_enableButtons: function() {

			for (var buttonKey in this.buttons) {
				this._checkActiveButton(buttonKey) && this._emitEvt('ENABLE_BUTTON', buttonKey);
			}
		},

		_disableButtons: function() {

			for (var buttonKey in this.buttons) {
				this._checkActiveButton(buttonKey) && this._emitEvt('DISABLE_BUTTON', buttonKey);
			}
		},

		_refreshButtons: function(status) {

			if (status.isValid) {
				this._emitEvt('ENABLE_BUTTON', "submit");
			} else {
				this._emitEvt('DISABLE_BUTTON', "submit");
			}
		}
	});
});
