define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "redmic/modules/store/Persistence"
], function(
	declare
	, lang
	, aspect
	, Persistence
) {

	return declare(null, {
		//	summary:
		//		Permite a los módulos realizar persistencia de datos, comunicándose con RestManager.

		persistenceEvents: {
			SAVE: "save",
			SAVED: "saved"
		},

		persistenceActions: {},

		constructor: function(args) {

			this.config = {
				idProperty: "id"
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_initialize", this._initializePersistence);
			aspect.after(this, "_mixEventsAndActions", lang.hitch(this, this._mixEventsAndActionsPersistence));
			aspect.after(this, "_defineSubscriptions",
				lang.hitch(this, this._definePersistenceSubscriptions));

			aspect.after(this, "_definePublications",
				lang.hitch(this, this._definePersistencePublications));
		},

		_mixEventsAndActionsPersistence: function () {

			lang.mixin(this.events, this.persistenceEvents);
			lang.mixin(this.actions, this.persistenceActions);
			delete this.persistenceEvents;
			delete this.persistenceActions;
		},

		_definePersistenceSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel: this.persistence.getChannel("SAVED"),
				callback: "_subSaved"
			});

			this._deleteDuplicatedChannels(this.subscriptionsConfig);
		},

		_definePersistencePublications: function () {

			this.publicationsConfig.push({
				event: 'SAVE',
				channel: this.persistence.getChannel("SAVE")/*,
				callback: "_pubSave"*/
			});

			this._deleteDuplicatedChannels(this.publicationsConfig);
		},

		_initializePersistence: function() {

			this.persistence = new Persistence({
				parentChannel: this.getChannel(),
				notificationSuccess: this.notificationSuccess
			});
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

		_subSaved: function(result) {

			this._emitEvt('REFRESH');

			var savedObj = this._getSavedObjToPublish ? this._getSavedObjToPublish(result) : result;
			this._emitEvt('SAVED', savedObj);

			this._afterSaved && this._afterSaved(result);
		}
	});
});
