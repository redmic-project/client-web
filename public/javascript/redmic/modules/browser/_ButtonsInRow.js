define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "./row/_Buttons"
], function(
	declare
	, lang
	, aspect
	, _Buttons
){
	return declare(null, {
		//	summary:
		//
		//	description:
		//

		constructor: function(args) {

			this.config = {
				buttonsInRowEvents: {
					BUTTON_EVENT: "btnEvent"
				},
				buttonsInRowActions: {
					BUTTON_EVENT_ROW: "btnEventRow",
					BUTTON_EVENT: "btnEvent",
					CHANGE_ROW_BUTTON_TO_MAIN_CLASS: "changeRowButtonToMainClass",
					CHANGE_ROW_BUTTON_TO_ALT_CLASS: "changeRowButtonToAltClass"
				}
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixButtonsInRowEventsAndActions));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineButtonsInRowSubscriptions));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineButtonsInRowPublications));

			aspect.after(this, "_definitionRow", lang.hitch(this, this._definitionButtonsRow));
		},

		_mixButtonsInRowEventsAndActions: function () {

			lang.mixin(this.events, this.buttonsInRowEvents);
			lang.mixin(this.actions, this.buttonsInRowActions);

			delete this.buttonsInRowEvents;
			delete this.buttonsInRowActions;
		},

		_defineButtonsInRowSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("BUTTON_EVENT_ROW"),
				callback: "_subButtonEventRow"
			},{
				channel : this.getChannel("CHANGE_ROW_BUTTON_TO_MAIN_CLASS"),
				callback: "_subChangeRowButtonToMainClass"
			},{
				channel : this.getChannel("CHANGE_ROW_BUTTON_TO_ALT_CLASS"),
				callback: "_subChangeRowButtonToAltClass"
			});
		},

		_defineButtonsInRowPublications: function() {

			this.publicationsConfig.push({
				event: 'BUTTON_EVENT',
				channel: this.getChannel("BUTTON_EVENT")
			});
		},

		_subButtonEventRow: function(req) {

			this._buttonEventRow(req);
		},

		_buttonEventRow: function(req) {

			var callback = req.callback,
				idProperty = req[this.idProperty];

			if (callback && this[callback]) {
				this[callback](idProperty, req);
				delete req.callback;
			}

			this._emitEvt('BUTTON_EVENT', req);
		},

		_subChangeRowButtonToMainClass: function(req) {

			var idProperty = req.idProperty;

			if (!this._isIdProperty(idProperty)) {
				return;
			}

			var instance = this._getRowInstance(idProperty);

			if (!instance) {
				return;
			}

			this._publish(instance.getChildChannel('buttons', 'CHANGE_ROW_BUTTON_TO_MAIN_CLASS'), req);
		},

		_subChangeRowButtonToAltClass: function(req) {

			var idProperty = req.idProperty;

			if (!this._isIdProperty(idProperty)) {
				return;
			}

			var instance = this._getRowInstance(idProperty);

			if (!instance) {
				return;
			}

			this._publish(instance.getChildChannel('buttons', 'CHANGE_ROW_BUTTON_TO_ALT_CLASS'), req);
		},

		_definitionButtonsRow: function() {

			this._defRow.push(_Buttons);
		}
	});
});
