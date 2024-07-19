define([
	"app/components/steps/MainDataStep"
	, "app/components/steps/AccessSetStep"
	, "app/designs/edition/Controller"
	, "app/designs/edition/Layout"
	, "app/maintenance/models/PermissionsModel"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function(
	MainDataStep
	, AccessSetStep
	, Controller
	, Layout
	, Model
	, redmicConfig
	, declare
	, lang
){
	return declare([Layout, Controller], {
		//	summary:
		//		Vista de edición de Unit.
		//	description:
		//		Muestra el wizard para la edición de una Unidad
		//
		//	propsToClean: Array
		// 		Lista de propiedades a limpiar cuando se realiza una copia.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.users,
				propsToClean: ["code", "id"]
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.editorConfig = this._merge([{
				title: this.i18n.newPermissions,
				editionTitle: this.i18n.editPermissions,
				model: Model,
				steps: [{
					definition: MainDataStep,
					props: {
						formTemplate: "maintenance/views/templates/forms/Permissions",
						target: redmicConfig.services.users,
						label: this.i18n.permissions
					}
				},{
					definition: AccessSetStep,
					props: {
						propertyName: 'accesses'
					},
					skippable: true
				}]
			}, this.editorConfig || {}]);
		}

	});
});
