define([
	"app/designs/base/_Controller"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/Deferred"
	, "redmic/modules/components/Keypad/IconKeypadImpl"
], function (
	_Controller
	, declare
	, lang
	, Deferred
	, IconKeypadImpl
){
	return declare(_Controller, {
		//	summary:
		//		Controlador para diseño de componentes con contenido incrustado y topbar.

		constructor: function(args) {

			this.config = {
				controllerEvents: {
					ENABLE_BUTTON: "enableButton",
					DISABLE_BUTTON: "disableButton",
					SELECT_BUTTON: "selectButton",
					DESELECT_BUTTON: "deselectButton",
					CHANGE_EMBEDDED_CONTENT: "changeEmbeddedContent"
				},
				controllerActions: {
				},

				embeddedButtons: {}
			};

			lang.mixin(this, this.config, args);
		},

		_initializeController: function() {

			this.iconKeypad = new IconKeypadImpl({
				parentChannel: this.getChannel(),
				items: this.embeddedButtons
			});
		},

		_defineControllerSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel: this.iconKeypad.getChannel("KEYPAD_INPUT"),
				callback: "_subKeypadInput"
			});
		},

		_defineControllerPublications: function() {

			this.publicationsConfig.push({
				event: "SELECT_BUTTON",
				channel: this.iconKeypad.getChannel("SELECT_BUTTON")
			},{
				event: "DESELECT_BUTTON",
				channel: this.iconKeypad.getChannel("DESELECT_BUTTON")
			},{
				event: "ENABLE_BUTTON",
				channel: this.iconKeypad.getChannel("ENABLE_BUTTON")
			},{
				event: "DISABLE_BUTTON",
				channel: this.iconKeypad.getChannel("DISABLE_BUTTON")
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._publish(this.iconKeypad.getChannel("SHOW"), {
				node: this._getButtonsNode()
			});
		},

		_subKeypadInput: function(evt) {

			var inputKey = evt.inputKey;

			if (this._getCurrentContentKey() !== inputKey) {
				this._emitEvt("CHANGE_EMBEDDED_CONTENT", evt);
				//this._emitEvt("RESIZE_VIEW");
			}
		},

		_embedModule: function(module, /*String*/ buttonKey, /*Object?*/ pubObj) {

			this._emitEvt("LOADING");
			this._hideLastEmbeddedModule().then(
				lang.hitch(this, this._showNewEmbeddedModule, module, buttonKey, pubObj));
		},

		_hideLastEmbeddedModule: function() {

			var dfd = new Deferred();

			if (!this._lastModuleEmbedded) {
				dfd.resolve();
			} else {
				this._once(this._lastModuleEmbedded.getChannel("HIDDEN"), dfd.resolve);
				this._publish(this._lastModuleEmbedded.getChannel("HIDE"));
			}

			return dfd;
		},

		_showNewEmbeddedModule: function(module, buttonKey, pubObj) {

			this._lastModuleEmbedded = module;

			this._once(module.getChannel("SHOWN"), lang.hitch(this, this._onModuleEmbedded, buttonKey));

			if (!pubObj || typeof pubObj !== "object") {
				pubObj = {};
			}

			pubObj.node = this.centerContent;

			for (var key in this.embeddedButtons) {
				this._emitForPublishToKeypad("DISABLE_BUTTON", key);
			}

			this._publish(module.getChannel("SHOW"), pubObj);
		},

		_onModuleEmbedded: function(buttonKey) {

			this._emitEvt("LOADED");
			this.centerContent.resize();

			for (var key in this.embeddedButtons) {
				// TODO solo si no estaba disabled previamente
				this._emitForPublishToKeypad("ENABLE_BUTTON", key);
			}

			buttonKey && this._emitForPublishToKeypad("SELECT_BUTTON", buttonKey);
			this._currentEmbeddedContentKey = buttonKey;
		},

		_emitForPublishToKeypad: function(evt, key) {

			this._emitEvt(evt, { key: key });
		},

		_getButtonsNode: function() {

			return this.buttonsNode;
		},

		_getCurrentContentKey: function() {

			return this._currentEmbeddedContentKey;
		}
	});
});
