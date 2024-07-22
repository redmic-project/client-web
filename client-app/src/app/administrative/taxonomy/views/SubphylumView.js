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
		// 		Vista para subfilum de especies.

		constructor: function (args) {

			this.config = {
				target: this.services.subphylum,
				title: this.i18n.subphylum
			};

			lang.mixin(this, this.config, args);
		}
	});
});
