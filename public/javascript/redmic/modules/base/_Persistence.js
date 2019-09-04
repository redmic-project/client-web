define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, './_PersistenceItfc'
], function(
	declare
	, lang
	, aspect
	, _PersistenceItfc
) {

	return declare(_PersistenceItfc, {
		//	summary:
		//		Permite a los módulos realizar persistencia de datos, comunicándose con RestManager.

		persistenceEvents: {
			SAVE: 'save',
			SAVED: 'saved',
			REMOVE: 'remove',
			REMOVED: 'removed'
		},

		persistenceActions: {
			SAVE: 'save',
			SAVED: 'saved',
			REMOVE: 'remove',
			REMOVED: 'removed'
		},

		constructor: function(args) {

			this.config = {
				idProperty: 'id',
				omitRefreshAfterSuccess: false
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, '_mixEventsAndActions', lang.hitch(this, this._mixPersistenceEventsAndActions));
			aspect.after(this, '_defineSubscriptions',
				lang.hitch(this, this._definePersistenceSubscriptions));

			aspect.after(this, '_definePublications',
				lang.hitch(this, this._definePersistencePublications));
		},

		_mixPersistenceEventsAndActions: function () {

			lang.mixin(this.events, this.persistenceEvents);
			lang.mixin(this.actions, this.persistenceActions);
			delete this.persistenceEvents;
			delete this.persistenceActions;
		},

		_definePersistenceSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel: this._buildChannel(this.storeChannel, this.actions.SAVED),
				callback: '_subSaved'
			},{
				channel: this._buildChannel(this.storeChannel, this.actions.REMOVED),
				callback: '_subRemoved'
			});

			this._deleteDuplicatedChannels(this.subscriptionsConfig);
		},

		_definePersistencePublications: function () {

			this.publicationsConfig.push({
				event: 'SAVE',
				channel: this._buildChannel(this.storeChannel, this.actions.SAVE)
			},{
				event: 'REMOVE',
				channel: this._buildChannel(this.storeChannel, this.actions.REMOVE)
			});

			this._deleteDuplicatedChannels(this.publicationsConfig);
		},

		_subSaved: function(resWrapper) {

			var response = resWrapper.res,
				status = response.status;

			if (!this.omitRefreshAfterSuccess) {
				this._tryToEmitEvt('REFRESH');
			}

			if (this._chkSuccessfulStatus(status)) {
				var savedObj = this._getSavedObjToPublish(response) || response;
				this._emitEvt('SAVED', savedObj);

				this._afterSaved(response, resWrapper);
			} else {
				this._afterSaveError(response.error, status, resWrapper);
			}
		},

		_subRemoved: function(resWrapper) {

			var response = resWrapper.res,
				status = response.status;

			if (!this.omitRefreshAfterSuccess) {
				this._tryToEmitEvt('REFRESH');
			}

			if (this._chkSuccessfulStatus(status)) {
				var removedObj = this._getRemovedObjToPublish(response) || response;
				this._emitEvt('REMOVED', removedObj);

				this._afterRemoved(response, resWrapper);
			} else {
				this._afterRemoveError(response.error, status, resWrapper);
			}
		}
	});
});
