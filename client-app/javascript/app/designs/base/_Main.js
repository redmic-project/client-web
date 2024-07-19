define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "./_MainItfc"
], function (
	declare
	, lang
	, aspect
	, _MainItfc
){
	return declare(_MainItfc, {
		//	summary:
		//		Base para los main.

		constructor: function(args) {

			this.config = {
				mainEvents: {},
				mainActions: {}
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_afterSetConfigurations", lang.hitch(this, this._setMainConfigurations));
			aspect.after(this, "_beforeInitialize", lang.hitch(this, this._initializeMain));
			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixMainEventsAndActions));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineMainSubscriptions));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineMainPublications));
			aspect.before(this, "_doEvtFacade", lang.hitch(this, this._doMainEvtFacade));
			aspect.before(this, "_setOwnCallbacksForEvents", lang.hitch(this,
				this._setMainOwnCallbacksForEvents));
		},

		_mixMainEventsAndActions: function () {

			lang.mixin(this.events, this.mainEvents);
			lang.mixin(this.actions, this.mainActions);

			delete this.mainEvents;
			delete this.mainActions;
		}
	});
});