define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "dojo/Deferred"
	, "./row/_Buttons"
], function(
	declare
	, lang
	, aspect
	, Deferred
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
				},

				_dfdChangeButtonClass: {},
				pathSeparator: '.'
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixButtonsInRowEventsAndActions));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineButtonsInRowSubscriptions));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineButtonsInRowPublications));
			aspect.after(this, "_definitionRow", lang.hitch(this, this._definitionButtonsRow));
			aspect.after(this, '_addRow', lang.hitch(this, this._buttonsInRowAddRow));
			aspect.after(this, '_clear', lang.hitch(this, this._buttonsInRowClear));
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

			this._changeRowButtonClass(req, 'CHANGE_ROW_BUTTON_TO_MAIN_CLASS');
		},

		_subChangeRowButtonToAltClass: function(req) {

			this._changeRowButtonClass(req, 'CHANGE_ROW_BUTTON_TO_ALT_CLASS');
		},

		_changeRowButtonClass: function(req, action) {

			var idProperty = req.idProperty;

			if (!this._isIdProperty(idProperty)) {
				return;
			}

			var instance = this._getRowInstance(idProperty);

			if (instance) {
				this._publishChangeButtonClass(instance, action, req);

				return;
			}

			var layerId = idProperty.split(this.pathSeparator).pop(),
				dfd = this._dfdChangeButtonClass[layerId];

			if (dfd && !dfd.isFulfilled()) {
				return;
			}

			dfd = this._dfdChangeButtonClass[layerId] = new Deferred();
			dfd.then(lang.hitch(this, function(originalReq, dfdInstance) {

				this._publishChangeButtonClass(dfdInstance, action, originalReq);
			}, req));
		},

		_publishChangeButtonClass: function(instance, action, req) {

			this._publish(instance.getChildChannel('buttons', action), req);
		},

		_definitionButtonsRow: function() {

			this._defRow.push(_Buttons);
		},

		_buttonsInRowAddRow: function(retValue, args) {

			var idProperty = args[0];

			if (!idProperty) {
				return;
			}

			if (typeof idProperty === 'number') {
				idProperty = idProperty.toString();
			}

			var instance = this._rows[idProperty].instance,
				layerId = idProperty.split(this.pathSeparator).pop(),
				dfd = this._dfdChangeButtonClass[layerId];

			if (dfd && instance) {
				this._once(instance.getChannel('SHOWN'), lang.hitch(this, function(changeButtonClassDfd, rowInstance) {

					changeButtonClassDfd.resolve(rowInstance);
				}, dfd, instance));
			}
		},

		_buttonsInRowClear: function() {

			this._dfdChangeButtonClass = {};
		}
	});
});
