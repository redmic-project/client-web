define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
], function(
	declare
	, lang
	, aspect
) {

	return declare(null, {
		//	summary:
		//		Gestiona la publicación de meta tags de la vista actual, preparando lo necesario para trabajar con
		//		ellas.

		constructor: function(args) {

			this.config = {
				metaTagsHandlerActions: {
					PUT_META_TAGS: 'putMetaTags'
				},
				metaTagsHandlerEvents: {
					PUT_META_TAGS: 'putMetaTags'
				}
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, '_mixEventsAndActions', this._mixMetaTagsHandlerEventsAndActionsView);
			aspect.after(this, '_definePublications', this._defineMetaTagsHandlerPublications);
			aspect.before(this, '_afterShow', this._afterShowMetaTagsHandler);
		},

		_mixMetaTagsHandlerEventsAndActionsView: function() {

			lang.mixin(this.events, this.metaTagsHandlerEvents);
			lang.mixin(this.actions, this.metaTagsHandlerActions);
			delete this.metaTagsHandlerEvents;
			delete this.metaTagsHandlerActions;
		},

		_defineMetaTagsHandlerPublications: function() {

			this.publicationsConfig.push({
				event: 'PUT_META_TAGS',
				channel: this._buildChannel(this.metaTagsChannel, 'PUT_META_TAGS')
			});
		},

		_afterShowMetaTagsHandler: function() {

			var callback = this._putMetaTags || this._putDefaultMetaTags;

			lang.hitch(this, callback)();
		},

		_putDefaultMetaTags: function() {
			//	summary:
			//		Manda a publicar la información necesaria para que se generen las meta-tags
			//		de la vista actual. Debe ejecutarse después del show de la vista, ya que este
			//		indica mediante el flag 'metaTags' si debe o no generarse.
			//		*** Función por defecto (posibilidad de sobreescribir para enviar más datos) ***
			//	tags:
			//		private

			if (!this.metaTags) {
				return;
			}

			this._emitEvt('PUT_META_TAGS', {
				view: this.ownChannel
			});
		}
	});
});
