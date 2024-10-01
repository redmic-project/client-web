define([
	'app/designs/textSearchFacetsList/main/Bibliography'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'src/catalog/_GenerateReport'
	, 'src/redmicConfig'
], function (
	BibliographyMain
	, declare
	, lang
	, _GenerateReport
	, redmicConfig
) {

	return declare([BibliographyMain, _GenerateReport], {
		//	summary:
		//		Vista de Bibliography.

		//	title: String
		//		Título de la vista.

		constructor: function (args) {

			this.config = {
				reportService: 'document',
				target: redmicConfig.services.document,
				ownChannel: 'bibliography'
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							icon: 'fa-external-link',
							btnId: 'url',
							condition: this._urlCondition,
							href: '{url}'
						},{
							icon: 'fa-info-circle',
							btnId: 'details',
							title: 'info',
							href: this.viewPaths.bibliographyDetails
						}]
					}
				}
			}, this.browserConfig || {}]);
		}
	});
});
