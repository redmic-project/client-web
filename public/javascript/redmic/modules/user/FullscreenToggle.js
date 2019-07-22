define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector/put'
	, 'redmic/modules/base/_Module'
	, 'redmic/modules/base/_Show'
], function(
	declare
	, lang
	, put
	, _Module
	, _Show
) {

	return declare([_Module, _Show], {
		//	summary:
		//		Módulo habilitador de pantalla completa.
		//	description:
		//		Cambia entre pantalla completa y modo normal.

		constructor: function(args) {

			this.config = {
				ownChannel: 'fullscreenToggle',
				'class': 'fullscreenToggle'
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);

			put(this.domNode, '[title=$]', this.i18n.fullscreen);

			this.iconNode = put(this.domNode, 'i');

			this.domNode.onclick = lang.hitch(this, this._fullscreenOnClick);
		},

		_fullscreenOnClick: function(evt) {

			if (this.ownerDocument.fullscreenElement) {
				this.ownerDocument.exitFullscreen();
			} else {
				this.ownerDocumentBody.requestFullscreen();
			}
		},

		_getNodeToShow: function() {

			return this.domNode;
		}
	});
});
