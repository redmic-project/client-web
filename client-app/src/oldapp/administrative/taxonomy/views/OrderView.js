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
		// 		Vista para ordenes de especies.

		constructor: function (args) {

			this.config = {
				target: this.services.order,
				title: this.i18n.order
			};

			lang.mixin(this, this.config, args);
		}
	});
});
