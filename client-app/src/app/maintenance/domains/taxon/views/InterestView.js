define([
	"app/designs/textSearchList/main/Domain"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function(
	DomainMain
	, declare
	, lang
){
	return declare(DomainMain, {
		// summary:
		// 	Vista de Interest.
		// description:
		// 	Muestra la información.

		constructor: function(args) {

			this.config = {
				title: this.i18n.interest,
				target: this.services.interest
			};

			lang.mixin(this, this.config, args);
		}
	});
});
