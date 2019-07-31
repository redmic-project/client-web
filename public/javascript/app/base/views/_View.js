define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "app/base/views/_ListenRequestError"
	, "app/base/views/_ViewHandle"	// QUITAR
], function(
	declare
	, lang
	, aspect
	, _ListenRequestError
	, _ViewHandle	// QUITAR
){
	return declare([_ListenRequestError, _ViewHandle], {
		//	summary:
		//		Base común para todas los módulos usados como vistas.

		//	region: String
		//		Región del ContentPane.
		//	baseClass: String
		//		Clase base del ContentPane.

		constructor: function(args) {

			this.config = {
				title: 'View',
				ownChannel: "view",
				region: "center",
				baseClass: "",
				viewActions: {
					PUT_META_TAGS: "putMetaTags"
				},
				viewEvents: {
					PUT_META_TAGS: "putMetaTags"
				}
			};

			lang.mixin(this, this.config, args);

			this._initializeView && aspect.before(this, "_initialize", this._initializeView);
			this._mixEventsAndActionsView &&
				aspect.before(this, "_mixEventsAndActions", this._mixEventsAndActionsView);
			this._doEvtFacadeView &&
				aspect.before(this, "_doEvtFacade", this._doEvtFacadeView);
			this._setOwnCallbacksForEventsView &&
				aspect.before(this, "_setOwnCallbacksForEvents", this._setOwnCallbacksForEventsView);
			this._defineViewSubscriptions &&
				aspect.after(this, "_defineSubscriptions", this._defineViewSubscriptions);
			this._defineViewPublications &&
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

			//this.startup();
			//this.resize();
			//this._publish(this._buildChannel(this.loadingChannel, this.actions.LOADED));
			this._putMetaTags();
		},

		_putMetaTags: function() {
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

		_getNodeToShow: function() {

			return this.containerNode;
		},

		_goTo404: function() {

			window.location.href = "/404";
		}
	});
});
