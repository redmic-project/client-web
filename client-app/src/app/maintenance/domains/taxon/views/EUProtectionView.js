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
		// 	Vista de EUProtection.
		// description:
		// 	Muestra la información.

		constructor: function(args) {

			this.config = {
				title: this.i18n.euProtection,
				target: this.services.euProtection
			};

			lang.mixin(this, this.config, args);
		}
	});
});
