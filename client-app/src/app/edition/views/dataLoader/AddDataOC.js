define([
	"app/components/steps/AddGeomSiteStep"
	, "app/components/steps/DataDefinitionSetStep"
	, "app/components/steps/DescribeSiteStep"
	, "app/components/viewCustomization/addGeomSite/views/Line"
	, "app/designs/edition/Controller"
	, "app/designs/edition/Layout"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function(
	AddGeomSiteStep
	, DataDefinitionSetStep
	, DescribeSiteStep
	, Line
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
){
	return declare([Layout, Controller], {
		//	summary:
		//		Edición para actividades de categoría FT.
		//	description:
		//

		constructor: function(args) {

			this.config = {
				idPropertySave: "uuid",
				replaceTarget: redmicConfig.services.activityObjectCollectingSeriesStations,
				propsToClean: [
					"id", "uuid", "geometry.coordinates", "properties.site.name", "properties.site.code",
					"properties.site.description", "properties.site.dashboard",
					"properties.measurements.{i}.dataDefinition.id", "properties.measurements.{i}.dataDefinition.path",
					"properties.measurements.{i}.parameter.path"
				]
			};

			lang.mixin(this, this.config, args);

			this.target = lang.replace(this.replaceTarget, this.pathVariableId);
		},

		_setConfigurations: function() {

			this.editorConfig = this._merge([{
				title: this.i18n.addObjectCollection,
				editionTitle: {
					primary: this.i18n.editLoadDataToActivity,
					secondary: "{properties.site.name}"
				},
				modelTarget: this.target,
				steps: [{
					definition: DescribeSiteStep,
					props: {
						target: this.replaceTarget,
						copyConfig: {
							browserConfig: {
								target: this.replaceTarget
							},
							filteringConfig: {
								inputProps: {
									target: redmicConfig.services.objectCollectingSeriesActivities
								}
							}
						}
					}
				},{
					definition: AddGeomSiteStep,
					props: {
						type: Line
					}
				},{
					definition: DataDefinitionSetStep,
					props: {
						items: {
							parameter: {
								target: redmicConfig.services.parameter
							},
							unit: {
								target: redmicConfig.services.unit
							},
							"dataDefinition.device": {
								target: redmicConfig.services.device,
								required: false
							},
							"dataDefinition.contact": {
								target: redmicConfig.services.contact,
								required: false
							},
							"dataDefinition.contactRole": {
								target: redmicConfig.services.contactRole,
								required: false
							}
						},

						formConfig: {
							template: "components/viewCustomization/parameter/views/templates/OC"
						}
					}
				}]
			}, this.editorConfig || {}]);
		}
	});
});
