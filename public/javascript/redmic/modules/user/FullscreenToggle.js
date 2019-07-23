define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/on'
	, 'put-selector/put'
	, 'redmic/modules/base/_Module'
	, 'redmic/modules/base/_Show'
], function(
	declare
	, lang
	, on
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
				'class': 'fullscreenToggle',
				enableClass: 'fa-expand',
				disableClass: 'fa-compress',

				_fullscreenStatus: false
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.inherited(arguments);

			put(this.domNode, '[title=$]', this.i18n.fullscreen);
			this.buttonNode = put(this.domNode, 'i.fa.' + this.enableClass);

			on(this.domNode, 'click', lang.hitch(this, this._fullscreenOnClick));

			var fullscreenEvents = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange'];
			on(this.ownerDocument, fullscreenEvents, lang.hitch(this, this._fullscreenOnChange));
		},

		_fullscreenOnClick: function(evt) {

			if (this._fullscreenStatus) {
				put(this.buttonNode, '.' + this.enableClass);
				put(this.buttonNode, '!' + this.disableClass);

				this._disableFullscreen();
			} else {
				put(this.buttonNode, '!' + this.enableClass);
				put(this.buttonNode, '.' + this.disableClass);

				this._enableFullscreen();
			}
		},

		_enableFullscreen: function() {

			var reqFullscreenMethodName;

			if (this.ownerDocumentBody.webkitRequestFullscreen) {
				reqFullscreenMethodName = 'webkitRequestFullscreen';
			} else if (this.ownerDocumentBody.mozRequestFullscreen) {
				reqFullscreenMethodName = 'mozRequestFullscreen';
			} else if (this.ownerDocumentBody.requestFullscreen) {
				reqFullscreenMethodName = 'requestFullscreen';
			}

			reqFullscreenMethodName && this.ownerDocumentBody[reqFullscreenMethodName]();
		},

		_disableFullscreen: function() {

			var exitFullscreenMethodName;

			if (this.ownerDocument.webkitExitFullscreen) {
				exitFullscreenMethodName = 'webkitExitFullscreen';
			} else if (this.ownerDocument.mozExitFullscreen) {
				exitFullscreenMethodName = 'mozExitFullscreen';
			} else if (this.ownerDocument.exitFullscreen) {
				exitFullscreenMethodName = 'exitFullscreen';
			}

			exitFullscreenMethodName && this.ownerDocument[exitFullscreenMethodName]();
		},

		_fullscreenOnChange: function(evt) {

			this._fullscreenStatus = !this._fullscreenStatus;
		},

		_getNodeToShow: function() {

			return this.domNode;
		}
	});
});
