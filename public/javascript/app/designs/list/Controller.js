define([
	"app/base/views/_View"
	, "app/designs/base/_Browser"
	, "app/designs/base/_Controller"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function (
	_View
	, _Browser
	, _Controller
	, declare
	, lang
){
	return declare([_View, _Controller, _Browser], {
		//	summary:
		//		Layout para vistas que contienen un buscador de texto y un listado.

		constructor: function() {

			this.config = {};

			lang.mixin(this, this.config);
		},

		_defineControllerSubscriptions: function() {

			this.subscriptionsConfig.push({
				channel : this.getChannel("UPDATE_TARGET"),
				callback: "_subUpdateTarget"
			});
		},

		_subUpdateTarget: function(req) {

			this._emitEvt("UPDATE_TARGET", req);
		}
	});
});
