define([
	"app/components/steps/AreaClassificationsSetStep"
	, "app/components/steps/MainDataStep"
	, "app/designs/edition/Controller"
	, "app/designs/edition/Layout"
	, 'src/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
], function(
	AreaClassificationsSetStep
	, MainDataStep
	, Controller
	, Layout
	, redmicConfig
	, declare
	, lang
){
	return declare([Layout, Controller], {
		//	summary:
		//		Edición para actividades de categoría AR.
		//	description:
		//

		constructor: function(args) {

			this.config = {
				idPropertySave: 'uuid',
				target: redmicConfig.services.areasPropertiesByActivity
			};

			lang.mixin(this, this.config, args);

			this.target = lang.replace(this.target, this.pathVariableId);
		},

		_setConfigurations: function() {

			this.editorConfig = this._merge([{
				editionTitle: {
					primary: this.i18n.editLoadDataToActivity,
					secondary: "{name}"
				},
				modelTarget: this.target,
				steps: [{
					definition: MainDataStep,
					props: {
						formTemplate: "components/viewCustomization/describeSite/views/templates/AR",
						label: this.i18n.info
					}
				},{
					definition: AreaClassificationsSetStep,
					props: {
						propertyName: 'areaClassification'
					},
					skippable: true
				}]
			}, this.editorConfig || {}]);
		},

		_emitShowForm: function(item) {

			item.geometry = null;

			this.inherited(arguments);
		},

		_wizardComplete: function(response) {

			this._onEvt('SAVED', this._editionSuccessDfd.resolve);

			this._emitEvt('SAVE', {
				target: this.target,
				id: this.pathVariableId.id,
				data: response.data
			});
		}
	});
});
