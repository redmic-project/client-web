define([
	"app/base/views/extensions/_AddAtlasCategory"
	, 'app/components/steps/ActivitySetStep'
	, "app/components/steps/MainDataStep"
	//, "app/components/steps/MapSelectAreaStep"
	, "app/components/steps/DownloadsSetStep"
	, "app/components/steps/ProtocolsSetStep"
	, "app/components/steps/SelectLayerStep"
	, "app/designs/edition/Controller"
	, "app/designs/edition/Layout"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function(
	_AddAtlasCategory
	, ActivitySetStep
	, MainDataStep
	//, MapSelectAreaStep
	, DownloadsSetStep
	, ProtocolsSetStep
	, SelectLayerStep
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
){
	return declare([Layout, Controller], {
		//	summary:
		//		Vista de edición de.
		//	description:
		//		Muestra el wizard para la edición de
		//
		//	propsToClean: Array
		// 		Lista de propiedades a limpiar cuando se realiza una copia.

		constructor: function(args) {

			this.config = {
				target: redmicConfig.services.atlasLayer,
				editionTarget: redmicConfig.services.atlasLayerEdition,
				propsToClean: ["id"]
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.editorConfig = this._merge([{
				title: this.i18n.newServiceOGC,
				editionTitle: {
					primary: this.i18n.editServiceOGC,
					secondary: "{title}"
				},
				modelTarget: this.editionTarget,
				steps: [{
					definition: SelectLayerStep,
					noEditable: true,
					props: {
						propertyName: 'name'
					}
				},{
					definition: declare([MainDataStep, _AddAtlasCategory]),
					props: {
						formTemplate: "maintenance/views/templates/forms/ServiceOGC",
						editionTarget: redmicConfig.services.atlasCategoryEdition,
						label: this.i18n.info
					}
				/*},{
					definition: MapSelectAreaStep,
					props: {
						target: this.target,
						propertyName: "latLonBoundsImage",
						skippable: true,
						label: this.i18n.layerImage
					}*/
				},{
					definition: ProtocolsSetStep,
					props: {
						propertyName: 'protocols'
					}
				},{
					definition: DownloadsSetStep,
					skippable: true,
					props: {
						propertyName: 'downloads'
					}
				},{
					definition: ActivitySetStep,
					skippable: true,
					props: {
						propertyName: 'relatedActivities'
					}
				}]
			}, this.editorConfig || {}]);
		}
	});
});
