define([
	'app/designs/textSearchFacetsList/main/Bibliography'
	, 'src/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
], function (
	BibliographyMain
	, redmicConfig
	, declare
	, lang
) {

	return declare(BibliographyMain, {
		//	summary:
		//		Vista de Bibliography.

		//	title: String
		//		Título de la vista.

		constructor: function (args) {

			this.config = {
				mask: {'download':{}},
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
