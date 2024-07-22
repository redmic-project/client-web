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
		// 	Vista de trophicRegime.
		// description:
		// 	Muestra la información.

		constructor: function(args) {

			this.config = {
				title: this.i18n['trophic-regime'],
				target: this.services.trophicRegime
			};

			lang.mixin(this, this.config, args);
		}
	});
});
