define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
	, "redmic/modules/components/Keypad/TrizoneKeypadImpl"
], function(
	declare
	, lang
	, put
	, TrizoneKeypadImpl
){
	return {
		//	summary:
		//		Extensión de Wizard para poder navegar entre los pasos.
		//	description:
		//		Añade un Keypad para poder cambiar entre pasos directamente.


		stepNavigationEvents: {
			SHOW_BUTTON: "showButton",
			HIDE_BUTTON: "hideButton",
			ENABLE_BUTTON: "enableButton",
			DISABLE_BUTTON: "disableButton"
		},

		stepNavigationActions: {
		},

		navigationClass: "wizardNavigation",


		_mixEventsAndActions: function () {

			this.inherited(arguments);

			lang.mixin(this.events, this.stepNavigationEvents);
			lang.mixin(this.actions, this.stepNavigationActions);
			delete this.stepNavigationEvents;
			delete this.stepNavigationActions;
		},

		_initialize: function() {

			this.inherited(arguments);

			this.keypad = new TrizoneKeypadImpl({
				parentChannel: this.getChannel(),
				items: {
					prev: {
						zone: "right",
						props: {
							"class": "primary",
							//iconClass: "fa-chevron-left",
							label: this.i18n.prevStep
						}
					},
					next: {
						zone: "right",
						props: {
							"class": "primary",
							//iconClass: "fa-chevron-right",
							label: this.i18n.nextStep
						}
					},
					confirm: {
						zone: "right",
						props: {
							"class": "success",
							//iconClass: "fa-check",
							label: this.i18n.confirm
						}
					},
					cancel: {
						zone: "left",
						props: {
							"class": "danger",
							//iconClass: "fa-check",
							label: this.i18n.cancel
						}
					},
					clear: {
						zone: "left",
						props: {
							"class": "warning",
							//iconClass: "fa-check",
							label: this.i18n.clear
						}
					},
					reset: {
						zone: "left",
						props: {
							"class": "primary",
							//iconClass: "fa-check",
							label: this.i18n.reset
						}
					}
				}
			});
		},

		_defineSubscriptions: function() {

			this.inherited(arguments);

			this.subscriptionsConfig.push({
				channel : this.keypad.getChannel("KEYPAD_INPUT"),
				callback: "_subKeypadInput"
			});

			this._deleteDuplicatedChannels(this.publicationsConfig);
		},

		_definePublications: function () {

			this.inherited(arguments);

			this.publicationsConfig.push({
				event: 'SHOW_BUTTON',
				channel: this.keypad.getChannel("SHOW_BUTTON")
			},{
				event: 'HIDE_BUTTON',
				channel: this.keypad.getChannel("HIDE_BUTTON")
			},{
				event: 'ENABLE_BUTTON',
				channel: this.keypad.getChannel("ENABLE_BUTTON")
			},{
				event: 'DISABLE_BUTTON',
				channel: this.keypad.getChannel("DISABLE_BUTTON")
			});

			this._deleteDuplicatedChannels(this.publicationsConfig);
		},

		postCreate: function() {

			this.inherited(arguments);

			this.keypadNode = put(this.wizardContentNode, "div." + this.navigationClass);

			this._publish(this.keypad.getChannel("SHOW"), {
				node: this.keypadNode
			});
		},

		_showStep: function(stepId) {

			this.inherited(arguments);

			this._evaluateButtonsStatus();
		},

		_evaluateButtonsStatus: function() {

			if (!this.notCancel) {
				this._seeButton("cancel");
			} else {
				this._noSeeButton("cancel");
			}

			this._noSeeButton("next");
			this._noSeeButton("prev");
			this._noSeeButton("confirm");

			if (!this.steps || !Object.keys(this.steps).length) {
				return;
			}

			this._evaluateButtonStatus("next", lang.hitch(this, this._nextStepIsAllowed));

			this._evaluateButtonStatus("prev", lang.hitch(this, this._prevStepIsAllowed));

			this._evaluateButtonConfirm();
		},

		_evaluateButtonConfirm: function() {

			if (this._allStepsDone()) {
				this._seeButton("confirm");
			} else {
				this._noSeeButton("confirm");
			}
		},

		_onModelWasChanged: function(res) {

			this._evaluateButtonConfirm();
		},

		_evaluateButtonStatus: function(btnId, checkCallback) {

			var check = checkCallback();

			if (!check) {

				this._noSeeButton(btnId);
			} else {

				if (check && !check.then) {

					this._seeButton(btnId);
				} else {

					check.then(lang.hitch(this, function(btnId, value) {

						if (value) {

							this._seeButton(btnId);
						} else {
							this._noSeeButton(btnId);
						}
					}, btnId));
				}
			}
		},

		_subKeypadInput: function(req) {

			switch (req.inputKey) {
				case "next":
					this._goToNextStep();
					break;
				case "prev":
					this._goToPrevStep();
					break;
				case "confirm":
					this._confirmSteps();
					break;
				case "cancel":
					this._publish(this.getChannel("HIDE"));
					break;
				case "clear":
					this._clearStep(this.currentStep);
					break;
				case "reset":
					this._resetStep(this.currentStep);
					break;
			}
		},

		_setStepStatus: function(stepId, status) {

			this.inherited(arguments);
			this._evaluateButtonsStatus();
		},

		_confirmSteps: function() {

			this.inherited(arguments);
			this._noSeeButton("confirm");
		},

		_seeButton: function(btnId) {

			this._emitEvt("ENABLE_BUTTON", {
				key: btnId
			});
		},

		_noSeeButton: function(btnId) {

			this._emitEvt("DISABLE_BUTTON", {
				key: btnId
			});
		}
	};
});
