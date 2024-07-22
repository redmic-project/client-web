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
		// 	Vista de Sex.
		// description:
		// 	Muestra la información.

		constructor: function(args) {

			this.config = {
				title: this.i18n.sex,
				target: this.services.sex
			};

			lang.mixin(this, this.config, args);
		}
	});
});
