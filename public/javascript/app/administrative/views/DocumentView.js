define([
	'app/base/views/extensions/_EditionWizardView'
	, 'app/designs/textSearchFacetsList/main/Bibliography'
	, 'app/redmicConfig'
	, 'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'RWidgets/Button'
], function (
	_EditionWizardView
	, BibliographyMain
	, redmicConfig
	, declare
	, lang
	, Button
) {

	return declare([BibliographyMain, _EditionWizardView], {
		//	summary:
		//		Vista de Document.
		//	description:
		//		Permite trabajar con los documentos.

		//	config: Object
		//		Opciones y asignaciones por defecto.
		//	title: String
		//		Título de la vista.

		constructor: function (args) {

			this.config = {
				addPath: this.viewPaths.documentAdd,
				loadPath: this.viewPaths.documentLoad,
				target: redmicConfig.services.document,
				perms: null,
				title: this.i18n.documents
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				rowConfig: {
					buttonsConfig: {
						listButton: [{
							groupId: 'edition',
							icons: [{
								icon: 'fa-edit',
								btnId: 'edit',
								title: 'edit',
								option: 'default',
								href: this.viewPaths.documentEdit
							},{
								icon: 'fa-copy',
								btnId: 'copy',
								title: 'copy',
								href: this.viewPaths.documentAdd
							}]
						},{
							icon: 'fa-external-link',
							btnId: 'url',
							condition: this._urlCondition,
							href: '{url}'
						},{
							icon: 'fa-info-circle',
							btnId: 'details',
							title: 'info',
							href: this.viewPaths.documentDetails
						}]
					},
					shownOptionTemplate: {
						code: true
					}
				}
			}, this.browserConfig || {}]);
		},

		postCreate: function() {

			this.inherited(arguments);

			this.loadButton = new Button({
				iconClass: 'fa fa-upload',
				'class': 'warning',
				'title': this.i18n.loadDocument,
				'href': this.loadPath
			}).placeAt(this.buttonsNode);
		}
	});
});
