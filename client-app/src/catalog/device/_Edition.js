define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'app/base/views/extensions/_EditionWizardView'
], function(
	declare
	, lang
	, aspect
	, _EditionWizardView
) {

	return declare(_EditionWizardView, {
		//	summary:
		//		Extensión de vista de catálogo de dispositivos para añadir funcionalidad relativa a la edición de
		//		registros.

		constructor: function(args) {

			this.config = {
				addPath: this.viewPaths.deviceAdd
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, '_setBrowserButtons', lang.hitch(this, this._setDeviceEditionBrowserButtons));
		},

		_setDeviceEditionBrowserButtons: function() {

			if (!this.listButtonsEdition) {
				console.warn('Tried to add device edition buttons, but edition buttons config was not found!');
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
					href: this.viewPaths.deviceEdit
				});
			} else {
				console.warn('Tried to add device edition buttons, but edition button group config was not found!');
			}
		}
	});
});
