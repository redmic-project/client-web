define([
	"app/dataLoader/sightings/models/SightingsModel"
	, "app/designs/mapWithSideContent/main/GeographicEditor"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
],
function(
	modelSchema
	, GeographicEditor
	, redmicConfig
	, declare
	, lang
){
	return declare(GeographicEditor, {
		//	summary:
		//		Vista de Sightings.
		//	description:
		//		Permite editar los avistamientos.

		//	config: Object
		//		Opciones y asignaciones por defecto.
		//	title: String
		//		Título de la vista.


		constructor: function (args) {

			this.config = {
				title: this.i18n.sightings,

				idProperty: "id",
				propsToClean: ["geometry.coordinates", "id"],

				target: redmicConfig.services.citationByActivity,
				//target: redmicConfig.services.sightings,

				ownChannel: "sightings"
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				pagination: true,
				props: {
					listButton: [{
						groupId: "edition",
						icons: [{
							icon: "fa-copy",
							btnId: "copy",
							title: "copy"
						}]
					}]
				}
			}, this.browserConfig || {}]);

			this.formConfig = this._merge([{
				modelSchema: modelSchema,
				template: "dataLoader/sightings/views/templates/Sightings"
			}, this.formConfig || {}]);
		}
	});
});
