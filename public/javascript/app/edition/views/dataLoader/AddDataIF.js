define([
	"app/base/views/_View"
	, "app/components/steps/AddGeomSiteStep"
	, "app/components/steps/MainDataStep"
	, "app/components/viewCustomization/addGeomSite/views/Point"
	, "app/designs/edition/Controller"
	, "app/designs/edition/Layout"
	, "app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function(
	_View
	, AddGeomSiteStep
	, MainDataStep
	, Point
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
){
	return declare([_View, Layout, Controller], {
		//	summary:
		//		Edición para actividades de categoría IF.
		//	description:
		//

		constructor: function(args) {

			this.config = {
				idPropertySave: 'uuid',
				target: lang.replace(redmicConfig.services.infrastructureByActivity, {
					id: '{activityid}'
				})
			};

			lang.mixin(this, this.config, args);

			this.target = lang.replace(this.target, this.pathVariableId);
		},

		_setConfigurations: function() {

			this.editorConfig = this._merge([{
				title: this.i18n.addInfrastructure,
				editionTitle: {
					primary: this.i18n.editLoadDataToActivity,
					secondary: "{properties.name}"
				},
				modelTarget: this.target,
				steps: [{
					definition: MainDataStep,
					props: {
						formTemplate: "components/viewCustomization/describeSite/views/templates/IF",
						label: this.i18n.info
					}
				},{
					definition: AddGeomSiteStep,
					props: {
						type: Point
					}
				}]
			}, this.editorConfig || {}]);
		}
	});
});