define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'app/administrative/taxonomy/views/_AddCompositeTaxon'
	, 'app/base/views/extensions/_EditionWizardView'
], function(
	declare
	, lang
	, aspect
	, _AddCompositeTaxon
	, _EditionWizardView
) {

	return declare([_AddCompositeTaxon, _EditionWizardView], {
		//	summary:
		//		Extensión de vista de catálogo de especies para añadir funcionalidad relativa a la edición de
		//		registros.

		constructor: function(args) {

			this.config = {
				addPath: this.viewPaths.speciesAdd
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, '_setBrowserButtons', lang.hitch(this, this._setSpeciesEditionBrowserButtons));
		},

		_setSpeciesEditionBrowserButtons: function() {

			if (!this.listButtonsEdition) {
				console.warn('Tried to add species edition buttons, but edition buttons config was not found!');
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
					href: this.viewPaths.speciesEdit
				});
			} else {
				console.warn('Tried to add species edition buttons, but edition button group config was not found!');
			}
		}
	});
});
