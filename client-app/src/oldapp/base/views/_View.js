define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "app/base/views/_ListenRequestError"
	,'./_SettingsHandler'
], function(
	declare
	, lang
	, aspect
	, _ListenRequestError
	, _SettingsHandler
) {

	return declare([_ListenRequestError, _SettingsHandler], {
		//	summary:
		//		Extensión común para todas los módulos usados como vistas. Se adjunta automáticamente cuando la
		//		navegación a través de la app requiere un módulo como contenido principal a mostrar.

		constructor: function(args) {

			this.config = {
				viewActions: {
					PUT_META_TAGS: "putMetaTags"
				},
				viewEvents: {
					PUT_META_TAGS: "putMetaTags"
				}
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_mixEventsAndActions", this._mixEventsAndActionsView);

			this._doEvtFacadeView &&
				aspect.before(this, "_doEvtFacade", this._doEvtFacadeView);
			this._setOwnCallbacksForEventsView &&
				aspect.before(this, "_setOwnCallbacksForEvents", this._setOwnCallbacksForEventsView);

			this._initializeView && aspect.before(this, "_initialize", this._initializeView);
			aspect.after(this, "_definePublications", this._defineViewPublications);
			aspect.before(this, "_beforeShow", this._beforeShowView);
			aspect.before(this, "_afterShow", this._afterShowView);
		},

		_mixEventsAndActionsView: function() {

			lang.mixin(this.events, this.viewEvents);
			lang.mixin(this.actions, this.viewActions);
			delete this.viewEvents;
			delete this.viewActions;
		},

		_defineViewPublications: function() {

			this.publicationsConfig.push({
				event: 'PUT_META_TAGS',
				channel: this._buildChannel(this.metaTagsChannel, this.actions.PUT_META_TAGS)
			});
		},

		_beforeShowView: function(request) {

		},

		_afterShowView: function(request) {

			var callback = this._putMetaTags || this._putDefaultMetaTags;
			lang.hitch(this, callback)();
		},

		_putDefaultMetaTags: function() {
			//	summary:
			//		Manda a publicar la información necesaria para que se generen las meta-tags
			//		de la vista actual. Debe ejecutarse después del show de la vista, ya que este
			//		indica mediante el flag "metaTags" si debe o no generarse.
			//		*** Función por defecto (posibilidad de sobreescribir para enviar más datos) ***
			//	tags:
			//		private

			if (this.metaTags) {
				this._emitEvt('PUT_META_TAGS', {
					view: this.ownChannel
				});
			}
		},

		_goTo404: function() {

			globalThis.location.href = "/404";
		}
	});
});
