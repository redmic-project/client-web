define([
	"app/designs/embeddedContentWithTopbar/layout/TopAndCenterContent"
	, "app/designs/embeddedContentWithTopbar/Controller"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function (
	TopAndCenterContent
	, Controller
	, declare
	, lang
){
	return declare([TopAndCenterContent, Controller], {
		//	summary:
		//		Main EmbeddedContentSelectionInTopbar.

		constructor: function(args) {

			this.config = {
				ownChannel: "embeddedContentSelectionInTopbar"
			};

			lang.mixin(this, this.config, args);
		}
	});
});