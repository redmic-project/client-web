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
		// 	Vista de Toponym type.
		// description:
		// 	Muestra la información.

		constructor: function(args) {

			this.config = {
				title: this.i18n.toponymType,
				target: this.services.toponymType
			};

			lang.mixin(this, this.config, args);
		}
	});
});
