define([
	'dojo/_base/declare'
	, 'src/redmicConfig'
], function(
	declare
	, redmicConfig
) {

	return declare(null, {
		//	summary:
		//		Extensión de vista de detalle de especies para añadir funcionalidad relativa a la edición de
		//		registros.

		_afterSetConfigurations: function() {

			this.inherited(arguments);

			if (!this._titleRightButtonsList) {
				this._titleRightButtonsList = [];
			}

			this._titleRightButtonsList.push({
				icon: 'fa-edit',
				href: redmicConfig.viewPaths.speciesEdit,
				title: this.i18n.edit
			});
		}
	});
});
