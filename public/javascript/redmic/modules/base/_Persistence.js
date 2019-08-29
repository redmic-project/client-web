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
				channel: this._buildChannel(this.storeChannel, this.actions.SAVE)/*,
				callback: '_pubSave'*/
			},{
				event: 'REMOVE',
				channel: this._buildChannel(this.storeChannel, this.actions.REMOVE)
			});

			this._deleteDuplicatedChannels(this.publicationsConfig);
		},

		/*_pubSave: function(channel, obj) {

			var target = this._getTarget(obj.target);
			//var target = this._getPersistenceTarget(obj.target);

			this._publish(channel, {
				idInTarget: obj.idInTarget,
				target: target,
				item: obj.data || {},
				idProperty: obj.idProperty || this.idPropertySave || this.idProperty
			});
		},

		_getTarget: function(target) {
		//_getPersistenceTarget: function(target) {

			console.debug('JAMAS DE LOS JAMASES')
			if (target) {
				return target;
			}

			if (this.baseTarget) {
				return this.baseTarget;
			}

			if (this.editionTarget instanceof Array) {
				return this.editionTarget[0];
			}

			if (this.target instanceof Array) {
				return this.target[0];
			}

			return this.editionTarget || this.target;
		},*/

		_subSaved: function(resWrapper) {

			var response = resWrapper.res,
				status = response.status;

			if (!this.omitRefreshAfterSuccess) {
				this._emitEvt('REFRESH');
			}

			if (status >= 200 && status < 400) {
				var savedObj = this._getSavedObjToPublish(response) || response;
				this._emitEvt('SAVED', response);

				this._afterSaved(response, resWrapper);
			} else {
				this._afterSaveError(response.error, status, resWrapper);
			}
		},

		_subRemoved: function(result) {

			if (!this.omitRefreshAfterSuccess) {
				this._emitEvt('REFRESH');
			}

			var removedObj = this._getRemovedObjToPublish(result) || result;
			this._emitEvt('REMOVED', removedObj);

			this._afterRemoved(result);
		}
	});
});
