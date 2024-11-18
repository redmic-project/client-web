define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
], function(
	declare
	, lang
){
	return declare(null, {
		//	summary:
		//		Extensión del módulo Form para que escuche los cambios en el modelo.
		//	description:
		//		Permite la publicación y escucha del hasChanged del modelo.
		//		Si se han producido cambios actua cambiando el estado.

		constructor: function(args) {

			this.config = {
				listenModelHasChangedEvents: {
					HAS_CHANGED: "hasChanged"
				},

				listenModelHasChangedActions: {
					HAS_CHANGED: "hasChanged",
					WAS_CHANGED: "wasChanged"
				}
			};

			lang.mixin(this, this.config, args);
		},

		_mixEventsAndActions: function () {

			this.inherited(arguments);

			lang.mixin(this.events, this.listenModelHasChangedEvents);
			lang.mixin(this.actions, this.listenModelHasChangedActions);

			delete this.listenModelHasChangedEvents;
			delete this.listenModelHasChangedActions;
		},

		_defineSubscriptions: function () {

			this.inherited(arguments);

			this.subscriptionsConfig.push({
				channel: this._buildChannel(this.modelChannel, this.actions.WAS_CHANGED),
				callback: "_subWasChanged"
			});
		},

		_definePublications: function () {

			this.inherited(arguments);

			this.publicationsConfig.push({
				event: 'HAS_CHANGED',
				channel: this._buildChannel(this.modelChannel, this.actions.HAS_CHANGED)
			});
		},

		_subWasChanged: function(res) {

			this._emitEvt('GOT_IS_VALID_STATUS', {
				"isValid": this.status && res.hasChanged
			});
		},

		_checkIsValidStatus: function() {

			this.inherited(arguments);

			this._emitEvt('HAS_CHANGED');
		}
	});
});