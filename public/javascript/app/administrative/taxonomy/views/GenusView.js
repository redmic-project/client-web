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
		// 		Vista para géneros de especies.

		constructor: function (args) {

			this.config = {
				target: this.services.genus,
				title: this.i18n.genus
			};

			lang.mixin(this, this.config, args);
		}
	});
});
