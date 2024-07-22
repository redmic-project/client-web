define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/Deferred"
	, "redmic/dialog/_DialogComplexItfc"
	, "redmic/layout/DialogComplex"
], function(
	declare
	, lang
	, Deferred
	, _DialogComplexItfc
	, DialogComplex
){
	return declare(_DialogComplexItfc, {
		//	summary:
		//		Implementación de popup bloqueante.

		//	config: Object
		//		Opciones por defecto.

		constructor: function(args) {

			this.config = {
				dialog: null,
				dialogPromiseShow: null,
				dialogPromiseHide: null,
				ownEvents: {
					HIDE: "hide",
					CHANGECONTENT: "changeContent"
				}
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			this.dialog = new DialogComplex({
				width: this.width || 6,
				height: this.height || "lg"
			});

			this.dialog.on(this.ownEvents.HIDE, lang.hitch(this, this._groupEventArgs, 'HIDE'));
			this.on(this.ownEvents.CHANGECONTENT, lang.hitch(this, this._setCenterContent));
		},

		_showContent: function(/*Object*/ content, /*String*/ evt) {

			if (content && content.bottomContent && content.centerContent) {
				this._setBottomContent(content.bottomContent);
				this._setCenterContent(content.centerContent);
			} else if (content && content.fullContent) {
				this._setFullContent(content.fullContent);
			}

			this._show().then(lang.hitch(this, function() {
				this.emit(evt);
			}));
		},

		_show: function() {

			this.dialog.set("title", this.title);

			if (!this.dialogPromiseHide || (this.dialogPromiseHide && this.dialogPromiseHide.isFulfilled())) {
				this.dialogPromiseShow = this.dialog.show();
				return this.dialogPromiseShow;
			} else {
				return this.dialogPromiseHide.always(lang.hitch(this, function() {
					this.dialogPromiseShow = this.dialog.show();
					return this.dialogPromiseShow;
				}));
			}
		},

		_hideContent: function(/*String*/ evt) {

			this._hide().then(lang.hitch(this, function() {
				this.emit(evt);
			}));
		},

		_hide: function() {

			if (!this.dialogPromiseShow || (this.dialogPromiseShow && this.dialogPromiseShow.isFulfilled())) {
				this.dialogPromiseHide = this.dialog.hide();
				return this.dialogPromiseHide;
			} else {
				return this.dialogPromiseShow.always(lang.hitch(this, function() {
					this.dialogPromiseHide = this.dialog.hide();
					return this.dialogPromiseHide;
				}));
			}
		},

		_setCenterContent: function(centerContent) {

			this.dialog.set("centerContent", centerContent);
		},

		_setBottomContent: function(bottomContent) {

			this.dialog.set("bottomContent", bottomContent);
		},

		_setFullContent: function(fullContent) {

			this.dialog.set("fullContent", fullContent);
		}
	});
});
