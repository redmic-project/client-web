define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'redmic/modules/base/_ListenQueryParams'
	, 'redmic/modules/base/_Selection'
], function(
	declare
	, lang
	, aspect
	, _ListenQueryParams
	, _Selection
) {

	return declare([_Selection, _ListenQueryParams], {
		//	summary:
		//		Reconoce un identificador de settings para aplicarlos a la vista actual.

		constructor: function(args) {

			this.config = {
				settingsHandlerActions: {
					CLONE_SELECTION: 'cloneSelection'
				},
				settingsHandlerEvents: {
					CLONE_SELECTION: 'cloneSelection'
				}
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, '_mixEventsAndActions', this._mixSettingsHandlerEventsAndActionsView);
			aspect.after(this, '_definePublications', this._defineSettingsHandlerPublications);
		},

		_mixSettingsHandlerEventsAndActionsView: function() {

			lang.mixin(this.events, this.settingsHandlerEvents);
			lang.mixin(this.actions, this.settingsHandlerActions);
			delete this.settingsHandlerEvents;
			delete this.settingsHandlerActions;
		},

		_defineSettingsHandlerPublications: function() {

			this.publicationsConfig.push({
				event: 'CLONE_SELECTION',
				channel: this._buildChannel(this.selectorChannel, this.actions.CLONE_SELECTION)
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._emitEvt('GET_QUERY_PARAMS');
		},

		_gotQueryParam: function(param, value) {

			if (param === 'settings-id') {
				this._onSettingsIdReceived(value);
			}
		},

		_onSettingsIdReceived: function(settingsId) {

			this._emitEvt('CLEAR_SELECTION', {
				omitPersistence: true
			});

			this._emitEvt('CLONE_SELECTION', {
				target: this.selectionTarget || this.target,
				id: settingsId
			});
		}
	});
});
