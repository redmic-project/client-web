define([
	"app/designs/textSearchFacetsList/main/Domain"
	, "app/base/views/extensions/_EditionWizardView"
	, 'app/redmicConfig'
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "templates/ConditionList"
], function(
	DomainMain
	, _EditionWizardView
	, redmicConfig
	, declare
	, lang
	, templateList
){
	return declare([DomainMain, _EditionWizardView], {
		// summary:
		// 	Vista de Conditio.
		// description:
		// 	Muestra la información.

		// config: Object
		// 	Opciones y asignaciones por defecto.
		// title: String
		// 	Título de la vista.

		constructor: function (args) {

			this.config = {
				addPath: this.viewPaths.metricsDefinitionAdd,
				target: this.services.metricsDefinition,
				title: this.i18n.metricsDefinition
			};

			lang.mixin(this, this.config, args);
		},

		_setConfigurations: function() {

			this.browserConfig = this._merge([{
				rowConfig: {
					buttonsConfig: {
					template: templateList,
						listButton: [{
							groupId: "edition",
							icons: [{
								icon: "fa-edit",
								btnId: "edit",
								title: "edit",
								option: "default",
								href: this.viewPaths.metricsDefinitionAdd
							}]
						}]
					}
				},
				orderConfig: {
					options: [
						{value: "acronym"}/*,
						{value: "updated"}*/
					]
				}
			}, this.browserConfig || {}]);

			this.facetsConfig = this._merge([{
				aggs: redmicConfig.aggregations.metricsDefinition,
			}, this.facetsConfig || {}]);
		}
	});
});
