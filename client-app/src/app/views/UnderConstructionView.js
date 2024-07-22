define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
], function(
	declare
	, lang
	, put
){
	return declare(null, {
		//	summary:
		//		Placeholder para vistas pendientes por hacer.

		//	title: String
		//		Título de la vista.

		constructor: function(args) {

			this.config = {
				title: this.i18n.underConstruction,
				'class': "underConstructionContainer"
			};

			lang.mixin(this, this.config, args);
		},

		postCreate: function() {

			put(this.domNode, "span.fa.fa-wrench.hatchElement");
			put(this.domNode, "span.expandingOpenElement", this.i18n.underConstruction);
		}

	});
});
