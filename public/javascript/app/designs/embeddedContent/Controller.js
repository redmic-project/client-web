define([
	'app/designs/base/_Controller'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'redmic/modules/base/_Store'
	, 'redmic/modules/layout/templateDisplayer/TemplateDisplayer'
	, 'templates/DefaultEmbeddedContent'
], function (
	_Controller
	, declare
	, lang
	, _Store
	, TemplateDisplayer
	, EmbeddedContentTemplate
) {

	return declare([_Controller, _Store], {
		//	summary:
		//		Controlador de diseño para incrustar contenido.

		constructor: function(args) {

			this.config = {
				controllerEvents: {
				},
				controllerActions: {
				},

				embeddedContentType: 'text/html',
				embeddedContentClass: 'embeddedContent',
				embeddedContentUrl: null,

				_templateDisplayerTarget: 'embeddedContentTarget'
			};

			lang.mixin(this, this.config, args);
		},

		_initializeController: function() {

			this._templateDisplayer = new TemplateDisplayer({
				parentChannel: this.getChannel(),
				template: EmbeddedContentTemplate,
				target: this._templateDisplayerTarget
			});
		},

		postCreate: function() {

			this.inherited(arguments);

			this._publish(this._templateDisplayer.getChannel('SHOW'), {
				node: this._getNodeToShow()
			});

			this._updateEmbeddedContent(this.embeddedContentUrl);
		},

		_updateEmbeddedContent: function(embeddedContentUrl) {

			this._emitEvt('INJECT_ITEM', {
				data: {
					objectType: this.embeddedContentType,
					url: embeddedContentUrl,
					className: this.embeddedContentClass
				},
				target: this._templateDisplayerTarget
			});
		},

	});
});
