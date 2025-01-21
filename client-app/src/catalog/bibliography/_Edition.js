define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'app/base/views/extensions/_EditionWizardView'
	, 'RWidgets/Button'
], function(
	declare
	, lang
	, aspect
	, _EditionWizardView
	, Button
) {

	return declare(_EditionWizardView, {
		//	summary:
		//		Extensión de vista de catálogo de documentos (bibliografía) para añadir funcionalidad relativa a la
		// 		edición de registros.

		constructor: function(args) {

			this.config = {
				addPath: this.viewPaths.bibliographyAdd,
				loadPath: this.viewPaths.bibliographyLoad
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, '_afterSetConfigurations', lang.hitch(this, this._setBibliographyEditionConfigurations));
			aspect.before(this, '_setBrowserButtons', lang.hitch(this, this._setBibliographyEditionBrowserButtons));
		},

		_setBibliographyEditionConfigurations: function() {

			this.browserConfig = this._merge([{
				rowConfig: {
					shownOptionTemplate: {
						code: true
					}
				}
			}, this.browserConfig || {}]);
		},

		_setBibliographyEditionBrowserButtons: function() {

			if (!this.listButtonsEdition) {
				console.warn('Tried to add bibliography edition buttons, but edition buttons config was not found!');
				return;
			}

			var findIndexCallback = lang.hitch(this, function(button) {

				return button.groupId && button.groupId === this._editionGroupId;
			});

			var editionButtonIndex = this.listButtonsEdition.findIndex(findIndexCallback);

			if (editionButtonIndex !== -1) {
				this.listButtonsEdition[editionButtonIndex].icons.push({
					icon: 'fa-edit',
					btnId: 'edit',
					title: 'edit',
					option: 'default',
					href: this.viewPaths.bibliographyEdit
				},{
					icon: 'fa-copy',
					btnId: 'copy',
					title: 'copy',
					href: this.viewPaths.bibliographyAdd
				});
			} else {
				console.warn('Tried to add bibliography edition buttons, but edition button group config was not found!');
			}
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
