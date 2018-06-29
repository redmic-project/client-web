define([
	"app/designs/textSearchFacetsList/main/Taxon"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function(
	TaxonMain
	, declare
	, lang
){
	return declare([TaxonMain], {
		// summary:
		// 		Vista para reinos de especies.

		constructor: function (args) {

			this.config = {
				target: this.services.kingdom,
				title: this.i18n.kingdom
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.formConfig = this._merge([{
				template: "administrative/taxonomy/views/templates/forms/Kingdom"
			}, this.formConfig || {}]);
		}
	});
});


