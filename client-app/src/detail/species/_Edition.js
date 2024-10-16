define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/aspect'
	, 'src/redmicConfig'
], function(
	declare
	, lang
	, aspect
	, redmicConfig
) {

	return declare(null, {
		//	summary:
		//		Extensión de vista de detalle de especies para añadir funcionalidad relativa a la edición de
		//		registros.

		constructor: function(args) {

			this.config = {
			};

			lang.mixin(this, this.config, args);

			aspect.after(this, '_setConfigurations', lang.hitch(this, this._setSpeciesEditionConfigurations));
		},

		_setSpeciesEditionConfigurations: function() {

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
