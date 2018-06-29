define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
	, "redmic/modules/base/_Module"
], function(
	declare
	, lang
	, put
	, _Module
){
	return declare(_Module, {
		//	summary:
		//		Vista base de Profile User.
		//	description:
		//		Muestra la información.


		constructor: function (args) {

			this.config = {
				icon: "fa-cog",
				type: null
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			var title = put(this.domNode, "div.titleProfile.fWidth");
			put(title, "i.fa." + this.icon + ".iconUser");
			put(title, "span.titleWindows", this.i18n[this.type]);
		}
	});
});
