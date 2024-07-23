define([
	"app/designs/textSearchFacetsList/main/Taxon"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "./_AddCompositeTaxon"
], function(
	TaxonMain
	, declare
	, lang
	, _AddCompositeTaxon
){
	return declare([TaxonMain, _AddCompositeTaxon], {
		// summary:
		// 		Vista para familias de especies.

		constructor: function (args) {

			this.config = {
				target: this.services.family,
				title: this.i18n.family
			};

			lang.mixin(this, this.config, args);
		}
	});
});
